import { afterEach, describe, expect, it } from 'vitest';
import {
  cueWindows,
  liveRefs,
  selectActivePlaylist,
  transitionRef,
  useDirectorStore,
} from './directorStore';
import {
  cueIndexAt,
  elapsedSec,
  pilotOwnsScene,
  pilotTick,
  rebaseToElapsed,
  resetAnchor,
  setAudioTimeSource,
  showNowSec,
} from './showClock';

/** Anchor `secondsAgo` in the past, ticking continuously (no seek). */
function pastAnchor(secondsAgo: number): void {
  liveRefs.showAnchor = {
    source: 'wall',
    baseTimeSec: performance.now() / 1000 - secondsAgo,
    elapsedBaseSec: 0,
  };
  liveRefs.showLastElapsedSec = Math.max(0, secondsAgo - 0.1);
}

afterEach(() => {
  transitionRef.active = false;
  liveRefs.showPilotDriving = false;
  resetAnchor();
  setAudioTimeSource(null);
});

describe('showClock', () => {
  it('reads wall time when no audio source is registered', () => {
    expect(showNowSec().source).toBe('wall');
    setAudioTimeSource(() => 12.5);
    expect(showNowSec()).toEqual({ source: 'audio', timeSec: 12.5 });
    setAudioTimeSource(() => null);
    expect(showNowSec().source).toBe('wall');
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

  it('rebases the anchor onto cue starts', () => {
    const windows = cueWindows([
      { key: 'a', sceneId: 0, durationSec: 30, follow: 'manual' },
      { key: 'b', sceneId: 1, durationSec: 30, follow: 'manual' },
    ]);
    rebaseToElapsed(windows, 1);
    expect(elapsedSec()).toBeCloseTo(30, 0);
  });

  it('advances expired auto cues and holds manual ones', () => {
    const api = useDirectorStore.getState();
    const previousActive = api.activePlaylistId;
    api.createPlaylist('Pilot test');
    api.addSceneToPlaylist(useDirectorStore.getState().activePlaylistId, 0);
    api.addSceneToPlaylist(useDirectorStore.getState().activePlaylistId, 1);
    api.addSceneToPlaylist(useDirectorStore.getState().activePlaylistId, 2);
    let entries = selectActivePlaylist(useDirectorStore.getState()).entries;
    api.setCueTiming(entries[0].key, { durationSec: 30, follow: 'auto' });
    entries = selectActivePlaylist(useDirectorStore.getState()).entries;
    api.setPreset(entries[0].sceneId, entries[0].key);

    // Pilot owns progression while the current cue is auto.
    expect(pilotOwnsScene(useDirectorStore.getState())).toBe(true);

    pastAnchor(45);
    expect(pilotTick()).toBe('advanced');
    expect(transitionRef.to).toBe(entries[1].sceneId);
    expect(transitionRef.toKey).toBe(entries[1].key);
    transitionRef.active = false;

    // Landed cue is manual: the pilot holds mid-show, before the end.
    api.setPreset(entries[1].sceneId, entries[1].key);
    liveRefs.showPilotDriving = false;
    expect(pilotOwnsScene(useDirectorStore.getState())).toBe(false);
    pastAnchor(50);
    expect(pilotTick()).toBe('held');
    expect(transitionRef.active).toBe(false);

    api.deletePlaylist(useDirectorStore.getState().activePlaylistId);
    expect(useDirectorStore.getState().activePlaylistId).toBe(previousActive);
  });

  it('holds the last cue instead of looping the show', () => {
    const api = useDirectorStore.getState();
    const previousActive = api.activePlaylistId;
    api.createPlaylist('End test');
    api.addSceneToPlaylist(useDirectorStore.getState().activePlaylistId, 2);
    const entries = selectActivePlaylist(useDirectorStore.getState()).entries;
    api.setCueTiming(entries[0].key, { durationSec: 10, follow: 'auto' });
    api.setPreset(entries[0].sceneId, entries[0].key);
    pastAnchor(500);
    expect(pilotTick()).toBe('held');
    expect(transitionRef.active).toBe(false);
    api.deletePlaylist(useDirectorStore.getState().activePlaylistId);
    expect(useDirectorStore.getState().activePlaylistId).toBe(previousActive);
  });

  it('treats discontinuities as seeks and jumps to the cue below the playhead', () => {
    const api = useDirectorStore.getState();
    const previousActive = api.activePlaylistId;
    api.createPlaylist('Seek test');
    api.addSceneToPlaylist(useDirectorStore.getState().activePlaylistId, 0);
    api.addSceneToPlaylist(useDirectorStore.getState().activePlaylistId, 1);
    api.addSceneToPlaylist(useDirectorStore.getState().activePlaylistId, 2);
    const entries = selectActivePlaylist(useDirectorStore.getState()).entries;
    for (const entry of entries) {
      api.setCueTiming(entry.key, { durationSec: 30 });
    }
    api.setPreset(entries[0].sceneId, entries[0].key);

    // Fresh anchor: first tick only synchronizes.
    expect(pilotTick()).toBe('idle');
    // A sudden jump reads as a seek past manual holds (lands mid-show).
    if (liveRefs.showAnchor) {
      liveRefs.showAnchor.baseTimeSec -= 70;
    }
    expect(pilotTick()).toBe('seek');
    expect(transitionRef.to).toBe(entries[2].sceneId);
    expect(transitionRef.toKey).toBe(entries[2].key);
    transitionRef.active = false;

    api.deletePlaylist(useDirectorStore.getState().activePlaylistId);
    expect(useDirectorStore.getState().activePlaylistId).toBe(previousActive);
  });
});
