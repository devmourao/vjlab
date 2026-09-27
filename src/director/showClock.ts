import {
  cueWindows,
  liveRefs,
  selectActivePlaylist,
  transitionRef,
  useDirectorStore,
  type CueWindow,
  type PlaylistEntry,
  type ScenePlaylist,
} from './directorStore';

/**
 * Show Clock (Sprint 33): the single time abstraction driving auto-advance
 * today and recorded events tomorrow. Two sources, one elapsed timeline:
 * audio position when a track plays (pause comes free), wall clock when
 * the show runs standalone. A discontinuity larger than SEEK_JUMP_SEC is a
 * seek — the show rebases to the cue under the playhead.
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

function readAudioTime(): number | null {
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

/** Show elapsed seconds. Migrates the anchor across source flips. */
export function elapsedSec(): number {
  const now = showNowSec();
  const anchor = liveRefs.showAnchor;
  if (!anchor) return 0;
  if (anchor.source !== now.source) {
    const elapsed = Math.max(
      0,
      now.timeSec - anchor.baseTimeSec + anchor.elapsedBaseSec,
    );
    liveRefs.showAnchor = {
      source: now.source,
      baseTimeSec: now.timeSec,
      elapsedBaseSec: elapsed,
    };
    return elapsed;
  }
  return Math.max(0, now.timeSec - anchor.baseTimeSec + anchor.elapsedBaseSec);
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

export interface PilotState {
  playlists: ScenePlaylist[];
  activePlaylistId: string;
  sceneOrder: number[];
  activeEntryKey: string | null;
}

function activeCue(
  state: PilotState,
): { window: CueWindow; index: number } | null {
  const windows = cueWindows(selectActivePlaylist(state).entries);
  const index = windows.findIndex(
    (window) => window.key === state.activeEntryKey,
  );
  return index >= 0 ? { window: windows[index], index } : null;
}

/** True when the pilot owns scene progression (current cue is auto). */
export function pilotOwnsScene(state: PilotState): boolean {
  return activeCue(state)?.window.follow === 'auto';
}

/**
 * Manual move (takeover = redirect): rebase the show onto the taken cue.
 * Unknown keys (playlist switch mid-flight) reset the anchor.
 */
export function noteManualCue(
  state: PilotState,
  key: string | null,
): void {
  const windows = cueWindows(selectActivePlaylist(state).entries);
  const index = windows.findIndex((window) => window.key === key);
  if (index >= 0) rebaseToElapsed(windows, index);
  else resetAnchor();
}

function driveTo(
  state: ReturnType<typeof useDirectorStore.getState>,
  windows: CueWindow[],
  index: number,
): void {
  const next = windows[index];
  liveRefs.showPilotDriving = true;
  rebaseToElapsed(windows, index);
  if (next.sceneId === state.activePresetId) {
    // Same scene, next occurrence: move the cursor without a visual cut.
    state.setPreset(next.sceneId, next.key);
    liveRefs.showPilotDriving = false;
  } else {
    state.requestDissolve(next.sceneId, next.key);
  }
}

export type PilotOutcome = 'advanced' | 'seek' | 'held' | 'idle';

/**
 * One pilot step. Natural expiry advances auto cues only (manual cues
 * hold); any discontinuity is a seek and jumps to the cue under the
 * playhead; the show end holds on the last cue.
 */
export function pilotTick(): PilotOutcome {
  const state = useDirectorStore.getState();
  if (transitionRef.active) return 'idle';
  const windows = cueWindows(selectActivePlaylist(state).entries);
  if (windows.length === 0) return 'idle';
  if (!liveRefs.showAnchor) {
    const at = Math.max(
      0,
      windows.findIndex((window) => window.key === state.activeEntryKey),
    );
    rebaseToElapsed(windows, at);
    return 'idle';
  }
  const elapsed = elapsedSec();
  const jumped =
    Math.abs(elapsed - liveRefs.showLastElapsedSec) > SEEK_JUMP_SEC;
  liveRefs.showLastElapsedSec = elapsed;
  const index = cueIndexAt(windows, elapsed);
  const current = windows[index];
  if (index >= windows.length - 1 && elapsed >= current.endSec) {
    return 'held';
  }
  // Already on the cue under the playhead (or a seek inside it): hold.
  if (state.activeEntryKey === current.key) return 'held';
  if (!jumped) {
    // Natural crossing: advance only past an expired auto cue.
    const active = activeCue(state);
    if (!active || active.window.follow !== 'auto') return 'held';
    if (elapsed < active.window.endSec) return 'held';
  }
  driveTo(state, windows, index);
  return jumped ? 'seek' : 'advanced';
}

/** Timed entries of the active playlist (Sprint 34 queue UX reads this). */
export function activeCueEntries(state: PilotState): PlaylistEntry[] {
  return selectActivePlaylist(state).entries;
}

export interface CueCountdown {
  key: string;
  remainingSec: number;
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
  return { key: current.key, remainingSec: current.endSec - elapsed };
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
