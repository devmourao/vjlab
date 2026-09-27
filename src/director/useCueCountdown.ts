import { useEffect, useReducer } from 'react';
import {
  cueWindows,
  selectActivePlaylist,
  useDirectorStore,
} from './directorStore';
import { countdownAt, elapsedSec, type CueCountdown } from './showClock';

const COUNTDOWN_INTERVAL_MS = 1000;

/**
 * Live countdown for the cue under the playhead. Ticks at 1 Hz with no
 * per-frame React state — the strip re-renders once per second only.
 */
export function useCueCountdown(): CueCountdown | null {
  const [, force] = useReducer((value: number) => value + 1, 0);

  useEffect(() => {
    const id = window.setInterval(force, COUNTDOWN_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, []);

  const state = useDirectorStore.getState();
  const windows = cueWindows(selectActivePlaylist(state).entries);
  return countdownAt(windows, elapsedSec());
}
