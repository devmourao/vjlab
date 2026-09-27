import { useEffect, useRef } from 'react';
import { liveRefs, useDirectorStore } from './directorStore';
import { PILOT_INTERVAL_MS, noteManualCue, pilotTick } from './showClock';

/**
 * Show pilot: drives timed auto-advance on the shared Clock and rebases
 * onto manual moves (takeover = redirect). No React state per tick —
 * all timing lives in liveRefs, like the existing auto-pilot tour.
 */
export function useShowPilot() {
  const activeEntryKey = useDirectorStore((s) => s.activeEntryKey);
  const keyRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    if (keyRef.current === undefined) {
      keyRef.current = activeEntryKey;
      return;
    }
    if (keyRef.current === activeEntryKey) return;
    keyRef.current = activeEntryKey;
    if (liveRefs.showPilotDriving) {
      liveRefs.showPilotDriving = false;
      return;
    }
    noteManualCue(useDirectorStore.getState(), activeEntryKey);
  }, [activeEntryKey]);

  useEffect(() => {
    const id = window.setInterval(pilotTick, PILOT_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, []);
}
