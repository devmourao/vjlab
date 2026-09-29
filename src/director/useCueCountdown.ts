import { useEffect, useReducer } from 'react';
import { useDirectorStore } from './directorStore';
import { liveCountdown, type CueCountdown } from './showClock';

const COUNTDOWN_INTERVAL_MS = 1000;

/**
 * Live countdown for the stage: the interrupt clock while a pool cue
 * holds it, else the body cue under the playhead. Ticks at 1 Hz with no
 * per-frame React state.
 */
export function useCueCountdown(): CueCountdown | null {
  const [, force] = useReducer((value: number) => value + 1, 0);

  useEffect(() => {
    const id = window.setInterval(force, COUNTDOWN_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, []);

  return liveCountdown(useDirectorStore.getState());
}
