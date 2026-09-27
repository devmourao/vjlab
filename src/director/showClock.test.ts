import { afterEach, describe, expect, it } from 'vitest';
import {
  DECK_SIZE,
  bodyEntries,
  cueTiming,
  cueWindows,
  isPoolIndex,
  liveRefs,
  selectActivePlaylist,
  transitionRef,
  useDirectorStore,
} from './directorStore';
import {
  activeInterrupt,
  countdownAt,
  coverageStatus,
  cueIndexAt,
  elapsedSec,
  liveCountdown,
  noteManualCue,
  pilotOwnsScene,
  pilotTick,
  rebaseToElapsed,
  resetAnchor,
  resumeShow,
  setAudioTimeSource,
  showElapsedSec,
  showNowSec,
} from './showClock';

let audioTime = 0;

function useAudioTime(): void {
  setAudioTimeSource(() => audioTime);
}

/** Anchor `secondsAgo` in the past, ticking continuously (no seek). */
function pastAnchor(secondsAgo: number): void {
  liveRefs.showAnchor = {
    source: 'wall',
    baseTimeSec: performance.now() / 1000 - secondsAgo,
    elapsedBaseSec: 0,
  };
  liveRefs.showLastElapsedSec = Math.max(0, secondsAgo - 0.1);
}

/** Continuous audio ticking at `time` (no seek). */
function atAudioTime(time: number): void {
  audioTime = time;
  liveRefs.showLastElapsedSec = Math.max(0, time - 0.1);
}

afterEach(() => {
  transitionRef.active = false;
  liveRefs.showPilotDriving = false;
  resetAnchor();
  setAudioTimeSource(null);
  audioTime = 0;
});

/** Playlist with a full pool plus `body` timed body cues. */
function buildShow(
  body: Array<{ sceneId: number; durationSec: number; follow?: 'manual' | 'auto' }>,
): void {
  const api = useDirectorStore.getState();
  api.createPlaylist('Anchored test');
  const id = useDirectorStore.getState().activePlaylistId;
  for (let i = 0; i < DECK_SIZE; i += 1) {
    api.addSceneToPlaylist(id, i % 6);
  }
  for (const cue of body) {
    api.addSceneToPlaylist(id, cue.sceneId);
  }
  const entries = selectActivePlaylist(useDirectorStore.getState()).entries;
  entries.slice(DECK_SIZE).forEach((entry, i) => {
    api.setCueTiming(entry.key, {
      durationSec: body[i].durationSec,
      follow: body[i].follow ?? 'manual',
    });
  });
}

function cleanupShow(previousActive: string): void {
  const api = useDirectorStore.getState();
  api.deletePlaylist(useDirectorStore.getState().activePlaylistId);
  expect(useDirectorStore.getState().activePlaylistId).toBe(previousActive);
}

describe('showClock', () => {
  it('reads wall time when no audio source is registered', () => {
    expect(showNowSec().source).toBe('wall');
    setAudioTimeSource(() => 12.5);
    expect(showNowSec()).toEqual({ source: 'audio', timeSec: 12.5 });
    expect(showElapsedSec()).toBe(12.5);
    setAudioTimeSource(() => null);
    expect(showNowSec().source).toBe('wall');
  });

  it('splits pool from body at the deck size', () => {
    expect(isPoolIndex(0)).toBe(true);
    expect(isPoolIndex(DECK_SIZE - 1)).toBe(true);
    expect(isPoolIndex(DECK_SIZE)).toBe(false);
    expect(
      bodyEntries([
        { key: 'a', sceneId: 0 },
        { key: 'b', sceneId: 1 },
      ]),
    ).toHaveLength(0);
  });

  it('resolves cue windows by accumulated elapsed time', () => {
    const windows = cueWindows([
      { key: 'a', sceneId: 0, durationSec: 30, follow: 'manual' },
      { key: 'b', sceneId: 1, durationSec: 45, follow: 'auto' },
    ]);
    expect(windows).toEqual([
      { key: 'a', sceneId: 0, follow: 'manual', startSec: 0, endSec: 30 },
      { key: 'b', sceneId: 1, follow: 'auto', startSec: 30, endSec: 75 },
    ]);
    expect(cueIndexAt(windows, 0)).toBe(0);
    expect(cueIndexAt(windows, 29.9)).toBe(0);
    expect(cueIndexAt(windows, 30)).toBe(1);
    expect(cueIndexAt(windows, 999)).toBe(1);
    expect(cueIndexAt([], 10)).toBe(-1);
  });

  it('counts down the cue under the playhead', () => {
    const windows = cueWindows([
      { key: 'a', sceneId: 0, durationSec: 30, follow: 'manual' },
      { key: 'b', sceneId: 1, durationSec: 45, follow: 'auto' },
    ]);
    expect(countdownAt(windows, 10)).toEqual({ key: 'a', remainingSec: 20 });
    expect(countdownAt(windows, 30)).toEqual({ key: 'b', remainingSec: 45 });
    expect(countdownAt(windows, 75)).toBeNull();
    expect(countdownAt([], 5)).toBeNull();
  });

  it('grades coverage with tolerance around the reference', () => {
    expect(coverageStatus(2396, 2400)).toBe('covered');
    expect(coverageStatus(2400, 2400)).toBe('covered');
    expect(coverageStatus(1800, 2400)).toBe('under');
    expect(coverageStatus(2700, 2400)).toBe('over');
  });

  it('rebases the anchor onto cue starts', () => {
    const windows = cueWindows([
      { key: 'a', sceneId: 0, durationSec: 30, follow: 'manual' },
      { key: 'b', sceneId: 1, durationSec: 30, follow: 'manual' },
    ]);
    rebaseToElapsed(windows, 1);
    expect(elapsedSec()).toBeCloseTo(30, 0);
  });

  it('advances expired body cues on the track clock', () => {
    useAudioTime();
    const api = useDirectorStore.getState();
    const previousActive = api.activePlaylistId;
    buildShow([
      { sceneId: 0, durationSec: 30, follow: 'auto' },
      { sceneId: 1, durationSec: 30 },
    ]);
    const body = bodyEntries(
      selectActivePlaylist(useDirectorStore.getState()).entries,
    );
    api.setPreset(body[0].sceneId, body[0].key);
    expect(pilotOwnsScene(useDirectorStore.getState())).toBe(true);

    atAudioTime(10);
    expect(pilotTick()).toBe('held');
    atAudioTime(35);
    expect(pilotTick()).toBe('advanced');
    expect(transitionRef.to).toBe(body[1].sceneId);
    expect(transitionRef.toKey).toBe(body[1].key);
    transitionRef.active = false;

    // Landed body cue is manual: holds mid-show, before the end.
    api.setPreset(body[1].sceneId, body[1].key);
    liveRefs.showPilotDriving = false;
    expect(pilotOwnsScene(useDirectorStore.getState())).toBe(false);
    atAudioTime(50);
    expect(pilotTick()).toBe('held');
    expect(transitionRef.active).toBe(false);

    cleanupShow(previousActive);
  });

  it('returns auto interrupts to the track point on expiry', () => {
    useAudioTime();
    const api = useDirectorStore.getState();
    const previousActive = api.activePlaylistId;
    buildShow([
      { sceneId: 0, durationSec: 30, follow: 'auto' },
      { sceneId: 1, durationSec: 30, follow: 'auto' },
      { sceneId: 2, durationSec: 30, follow: 'auto' },
    ]);
    const entries = selectActivePlaylist(useDirectorStore.getState()).entries;
    const poolKey = entries[2].key;
    api.setCueTiming(poolKey, { durationSec: 20, follow: 'auto' });

    // Play from the middle joins the body cue of that timestamp.
    atAudioTime(65);
    expect(pilotTick()).toBe('advanced');
    transitionRef.active = false;
    liveRefs.showPilotDriving = false;
    const body = bodyEntries(
      selectActivePlaylist(useDirectorStore.getState()).entries,
    );
    api.setPreset(body[2].sceneId, body[2].key);

    // Fire the pool interrupt at track 65: held, counting down.
    noteManualCue(useDirectorStore.getState(), poolKey);
    api.setPreset(entries[2].sceneId, poolKey);
    expect(activeInterrupt(useDirectorStore.getState())?.key).toBe(poolKey);
    atAudioTime(70);
    expect(pilotTick()).toBe('held');
    expect(
      liveCountdown(useDirectorStore.getState()),
    ).toMatchObject({ key: poolKey });
    expect(
      liveCountdown(useDirectorStore.getState())?.remainingSec,
    ).toBeCloseTo(15, 0);

    // Expiry returns to the body cue under the track point (65+20=85 lands in body[2]).
    atAudioTime(86);
    expect(pilotTick()).toBe('advanced');
    expect(transitionRef.toKey).toBe(body[2].key);
    transitionRef.active = false;

    cleanupShow(previousActive);
  });

  it('treats audio jumps as seeks to the cue below the playhead', () => {
    useAudioTime();
    const api = useDirectorStore.getState();
    const previousActive = api.activePlaylistId;
    buildShow([
      { sceneId: 0, durationSec: 30, follow: 'auto' },
      { sceneId: 1, durationSec: 30, follow: 'auto' },
      { sceneId: 2, durationSec: 30, follow: 'auto' },
    ]);
    const body = bodyEntries(
      selectActivePlaylist(useDirectorStore.getState()).entries,
    );
    api.setPreset(body[2].sceneId, body[2].key);
    atAudioTime(65);
    expect(pilotTick()).toBe('held');
    // Discontinuous jump backward reads as a seek (last tick was 65).
    audioTime = 40;
    expect(pilotTick()).toBe('seek');
    expect(transitionRef.toKey).toBe(body[1].key);
    transitionRef.active = false;
    cleanupShow(previousActive);
  });

  it('holds manual interrupts until Resume', () => {
    useAudioTime();
    const api = useDirectorStore.getState();
    const previousActive = api.activePlaylistId;
    buildShow([
      { sceneId: 0, durationSec: 30, follow: 'auto' },
      { sceneId: 1, durationSec: 30, follow: 'auto' },
    ]);
    const entries = selectActivePlaylist(useDirectorStore.getState()).entries;
    const poolKey = entries[3].key;
    const body = bodyEntries(entries);

    atAudioTime(10);
    noteManualCue(useDirectorStore.getState(), poolKey);
    api.setPreset(entries[3].sceneId, poolKey);
    atAudioTime(500);
    expect(pilotTick()).toBe('held');
    expect(transitionRef.active).toBe(false);
    expect(liveCountdown(useDirectorStore.getState())).toMatchObject({
      key: poolKey,
      held: true,
    });

    // Resume dissolves to the body cue under the playhead and clears.
    atAudioTime(45);
    expect(resumeShow()).toBe(true);
    expect(transitionRef.toKey).toBe(body[1].key);
    expect(liveRefs.showInterrupt).toBeNull();
    transitionRef.active = false;

    cleanupShow(previousActive);
  });

  it('holds the last body cue instead of looping', () => {
    useAudioTime();
    const api = useDirectorStore.getState();
    const previousActive = api.activePlaylistId;
    buildShow([{ sceneId: 2, durationSec: 10, follow: 'auto' }]);
    const body = bodyEntries(
      selectActivePlaylist(useDirectorStore.getState()).entries,
    );
    api.setPreset(body[0].sceneId, body[0].key);
    atAudioTime(500);
    expect(pilotTick()).toBe('held');
    expect(transitionRef.active).toBe(false);
    cleanupShow(previousActive);
  });

  it('keeps wall mode working without a track', () => {
    const api = useDirectorStore.getState();
    const previousActive = api.activePlaylistId;
    buildShow([
      { sceneId: 0, durationSec: 30, follow: 'auto' },
      { sceneId: 1, durationSec: 30 },
    ]);
    const body = bodyEntries(
      selectActivePlaylist(useDirectorStore.getState()).entries,
    );
    api.setPreset(body[0].sceneId, body[0].key);
    expect(pilotTick()).toBe('idle');
    pastAnchor(45);
    expect(pilotTick()).toBe('advanced');
    expect(transitionRef.toKey).toBe(body[1].key);
    transitionRef.active = false;
    cleanupShow(previousActive);
  });

  it('stays pure manual with ten or fewer cues', () => {
    useAudioTime();
    const api = useDirectorStore.getState();
    const previousActive = api.activePlaylistId;
    api.createPlaylist('Pool only');
    const id = useDirectorStore.getState().activePlaylistId;
    api.addSceneToPlaylist(id, 0);
    api.addSceneToPlaylist(id, 1);
    const entries = selectActivePlaylist(useDirectorStore.getState()).entries;
    api.setPreset(entries[0].sceneId, entries[0].key);
    atAudioTime(300);
    expect(pilotTick()).toBe('held');
    expect(transitionRef.active).toBe(false);
    expect(cueTiming(entries[0]).follow).toBe('manual');
    cleanupShow(previousActive);
  });
});
