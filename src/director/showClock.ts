import {
  bodyEntries,
  cueTiming,
  cueWindows,
  isPoolIndex,
  liveRefs,
  selectActivePlaylist,
  transitionRef,
  useDirectorStore,
  type CueWindow,
  type PlaylistEntry,
  type ScenePlaylist,
} from './directorStore';

/**
 * Show Clock (Sprint 36): track-anchored timeline with an interrupt pool.
 *
 * - Audio mode: show elapsed IS the track position. Play-from-start lands
 *   on the first body cue, play-from-middle on the cue of that timestamp,
 *   pause freezes with the audio, seek lands correctly — no anchor.
 * - Wall mode (no track): the anchor maps wall time onto show elapsed.
 * - Pool (first DECK_SIZE positions): manual-only overlays off the
 *   timeline. Body (11+): the timed show from track 0:00.
 * - A discontinuity larger than SEEK_JUMP_SEC is a seek — the show jumps
 *   to the cue under the playhead.
 */

export type ClockSource = 'audio' | 'wall';

export const PILOT_INTERVAL_MS = 250;
export const SEEK_JUMP_SEC = 2;

type AudioTimeSource = () => number | null;

let audioTimeSource: AudioTimeSource | null = null;

/** Registered by the surface owning the audio element; null unregisters. */
export function setAudioTimeSource(source: AudioTimeSource | null): void {
  audioTimeSource = source;
}

export function readAudioTime(): number | null {
  if (!audioTimeSource) return null;
  try {
    const value = audioTimeSource();
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
  } catch {
    return null;
  }
}

/** Current clock reading; audio wins when a track is loaded. */
export function showNowSec(): { source: ClockSource; timeSec: number } {
  const audio = readAudioTime();
  if (audio !== null) return { source: 'audio', timeSec: audio };
  return { source: 'wall', timeSec: performance.now() / 1000 };
}

/**
 * Show elapsed seconds. Audio mode reads the track position directly;
 * wall mode runs the anchor math.
 */
export function elapsedSec(): number {
  const now = showNowSec();
  if (now.source === 'audio') return Math.max(0, now.timeSec);
  const anchor = liveRefs.showAnchor;
  if (!anchor) return 0;
  return Math.max(0, now.timeSec - anchor.baseTimeSec + anchor.elapsedBaseSec);
}

/** Alias read by queue UX: the single show-time value. */
export function showElapsedSec(): number {
  return elapsedSec();
}

/** Anchor so the show elapsed time equals the start of cue `index`. */
export function rebaseToElapsed(windows: CueWindow[], index: number): void {
  const now = showNowSec();
  const start = windows[index]?.startSec ?? 0;
  liveRefs.showAnchor = {
    source: now.source,
    baseTimeSec: now.timeSec,
    elapsedBaseSec: start,
  };
  liveRefs.showLastElapsedSec = start;
}

export function resetAnchor(): void {
  liveRefs.showAnchor = null;
  liveRefs.showLastElapsedSec = 0;
  liveRefs.showInterrupt = null;
}

/** Window index holding `elapsed`; clamps to the last cue (end holds). */
export function cueIndexAt(windows: CueWindow[], elapsed: number): number {
  if (windows.length === 0) return -1;
  let index = 0;
  for (let i = 0; i < windows.length; i += 1) {
    if (elapsed >= windows[i].startSec) index = i;
  }
  return index;
}

/** Body windows of the active playlist (pool excluded, from track 0:00). */
export function activeBodyWindows(state: PilotState): CueWindow[] {
  return cueWindows(bodyEntries(selectActivePlaylist(state).entries));
}

export interface PilotState {
  playlists: ScenePlaylist[];
  activePlaylistId: string;
  sceneOrder: number[];
  activeEntryKey: string | null;
}

function bodyCue(
  state: PilotState,
): { window: CueWindow; index: number } | null {
  const windows = activeBodyWindows(state);
  const index = windows.findIndex(
    (window) => window.key === state.activeEntryKey,
  );
  return index >= 0 ? { window: windows[index], index } : null;
}

/** True when the pilot owns scene progression (current body cue is auto). */
export function pilotOwnsScene(state: PilotState): boolean {
  return bodyCue(state)?.window.follow === 'auto';
}

/**
 * True when the show owns the stage: a track is loaded and the active
 * playlist has a timed body. The ambient tour yields entirely then —
 * with default manual cues it would otherwise yank a new scene (plus
 * hue/zoom drift) every few seconds, fighting the track sync.
 */
export function showDrivesScenes(state: PilotState): boolean {
  return readAudioTime() !== null && activeBodyWindows(state).length > 0;
}

/** Live interrupt record when the stage holds a pool cue. */
export function activeInterrupt(state: PilotState): {
  key: string;
  startElapsedSec: number;
  durationSec: number;
} | null {
  const record = liveRefs.showInterrupt;
  if (!record || record.key !== state.activeEntryKey) return null;
  const entries = selectActivePlaylist(state).entries;
  const index = entries.findIndex((entry) => entry.key === record.key);
  if (!isPoolIndex(index)) return null;
  return record;
}

/**
 * Manual move (takeover = redirect). Pool keys open a timed interrupt
 * over the running body; body keys redirect within the timeline (wall
 * mode rebases, audio mode already reads the track). Unknown keys reset.
 */
export function noteManualCue(
  state: PilotState,
  key: string | null,
): void {
  const entries = selectActivePlaylist(state).entries;
  const index = entries.findIndex((entry) => entry.key === key);
  if (index < 0) {
    resetAnchor();
    return;
  }
  if (isPoolIndex(index)) {
    const timing = cueTiming(entries[index]);
    liveRefs.showInterrupt = {
      key: entries[index].key,
      startElapsedSec: showElapsedSec(),
      durationSec: timing.durationSec,
    };
    return;
  }
  liveRefs.showInterrupt = null;
  if (readAudioTime() === null) {
    const windows = cueWindows(bodyEntries(entries));
    const bodyIndex = windows.findIndex((window) => window.key === key);
    if (bodyIndex >= 0) rebaseToElapsed(windows, bodyIndex);
  }
}

function driveTo(
  state: ReturnType<typeof useDirectorStore.getState>,
  windows: CueWindow[],
  index: number,
): void {
  const next = windows[index];
  liveRefs.showPilotDriving = true;
  liveRefs.showInterrupt = null;
  rebaseToElapsed(windows, index);
  if (next.sceneId === state.activePresetId) {
    // Same scene, next occurrence: move the cursor without a visual cut.
    state.setPreset(next.sceneId, next.key);
    liveRefs.showPilotDriving = false;
  } else {
    state.requestDissolve(next.sceneId, next.key);
  }
}

/**
 * Resume gesture (Z): dissolve to the body cue under the playhead and
 * clear interrupts. Safe anytime — doubles as a re-sync.
 */
export function resumeShow(): boolean {
  const state = useDirectorStore.getState();
  if (transitionRef.active) return false;
  const windows = activeBodyWindows(state);
  if (windows.length === 0) return false;
  const elapsed = showElapsedSec();
  const index = cueIndexAt(windows, elapsed);
  if (state.activeEntryKey === windows[index].key) {
    liveRefs.showInterrupt = null;
    return false;
  }
  driveTo(state, windows, index);
  return true;
}

export type PilotOutcome = 'advanced' | 'seek' | 'held' | 'idle';

/**
 * One pilot step. Body auto cues advance on expiry; pool cues are never
 * auto-targeted; an auto interrupt returns to the track point on expiry
 * while a manual one holds; discontinuities seek; the end holds.
 */
export function pilotTick(): PilotOutcome {
  const state = useDirectorStore.getState();
  if (transitionRef.active) return 'idle';
  const windows = activeBodyWindows(state);
  if (windows.length === 0) return 'held';
  const elapsed = showElapsedSec();
  const jumped =
    Math.abs(elapsed - liveRefs.showLastElapsedSec) > SEEK_JUMP_SEC;
  liveRefs.showLastElapsedSec = elapsed;

  const interrupt = activeInterrupt(state);
  if (interrupt) {
    const entries = selectActivePlaylist(state).entries;
    const record = entries.find((entry) => entry.key === interrupt.key);
    const follow = record ? cueTiming(record).follow : 'manual';
    if (follow !== 'auto') return 'held';
    if (elapsed < interrupt.startElapsedSec + interrupt.durationSec) {
      return 'held';
    }
    const index = cueIndexAt(windows, elapsed);
    if (index >= windows.length - 1 && elapsed >= windows[index].endSec) {
      return 'held';
    }
    driveTo(state, windows, index);
    return 'advanced';
  }

  if (readAudioTime() === null && !liveRefs.showAnchor) {
    const at = Math.max(
      0,
      windows.findIndex((window) => window.key === state.activeEntryKey),
    );
    rebaseToElapsed(windows, at);
    return 'idle';
  }
  const index = cueIndexAt(windows, elapsed);
  const current = windows[index];
  if (index >= windows.length - 1 && elapsed >= current.endSec) {
    return 'held';
  }
  // Already on the cue under the playhead (or a seek inside it): hold.
  if (state.activeEntryKey === current.key) return 'held';
  if (!jumped) {
    // Natural crossing: joining from the pool, or past an expired auto cue.
    const active = bodyCue(state);
    if (active) {
      if (active.window.follow !== 'auto') return 'held';
      if (elapsed < active.window.endSec) return 'held';
    }
  }
  driveTo(state, windows, index);
  return jumped ? 'seek' : 'advanced';
}

/** Timed entries of the active playlist (queue UX reads this). */
export function activeCueEntries(state: PilotState): PlaylistEntry[] {
  return selectActivePlaylist(state).entries;
}

export interface CueCountdown {
  key: string;
  remainingSec: number;
  held?: boolean;
  /** Elapsed share 0..1 of the windows total; drives progress rails. */
  fraction?: number | null;
}

/** Countdown for the cue under `elapsed`; null past the show end. */
export function countdownAt(
  windows: CueWindow[],
  elapsed: number,
): CueCountdown | null {
  if (windows.length === 0) return null;
  const index = cueIndexAt(windows, elapsed);
  const current = windows[index];
  if (elapsed >= current.endSec) return null;
  const total = windows[windows.length - 1].endSec;
  return {
    key: current.key,
    remainingSec: current.endSec - elapsed,
    fraction: total > 0 ? elapsed / total : null,
  };
}

/**
 * Live countdown: the interrupt clock while a pool cue holds the stage,
 * else the body cue under the playhead.
 */
export function liveCountdown(state: PilotState): CueCountdown | null {
  const elapsed = showElapsedSec();
  const body = activeBodyWindows(state);
  const total = body.length > 0 ? body[body.length - 1].endSec : 0;
  const fraction = total > 0 ? Math.min(1, Math.max(0, elapsed / total)) : null;
  const interrupt = activeInterrupt(state);
  if (interrupt) {
    const entries = selectActivePlaylist(state).entries;
    const record = entries.find((entry) => entry.key === interrupt.key);
    if (cueTiming(record ?? { key: '', sceneId: -1 }).follow !== 'auto') {
      return { key: interrupt.key, remainingSec: 0, held: true, fraction };
    }
    return {
      key: interrupt.key,
      remainingSec: Math.max(
        0,
        interrupt.startElapsedSec + interrupt.durationSec - elapsed,
      ),
      fraction,
    };
  }
  const ticking = countdownAt(body, elapsed);
  return ticking ? { ...ticking, fraction } : null;
}

/** Coverage tolerance around the reference to read as "covered". */
export const COVERAGE_TOLERANCE_SEC = 5;

export type CoverageStatus = 'under' | 'covered' | 'over';

/** Show total vs a reference duration (track or manual target). */
export function coverageStatus(
  totalSec: number,
  referenceSec: number,
): CoverageStatus {
  if (totalSec < referenceSec - COVERAGE_TOLERANCE_SEC) return 'under';
  if (totalSec > referenceSec + COVERAGE_TOLERANCE_SEC) return 'over';
  return 'covered';
}
