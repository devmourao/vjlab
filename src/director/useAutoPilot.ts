import { useEffect, useRef } from 'react';
import { liveRefs, useDirectorStore } from './directorStore';
import { PRESETS } from '../scenes/presets';

const TOUR_INTERVAL_MS = 5000;

export function useAutoPilot() {
  const autoPilotOn = useDirectorStore((s) => s.autoPilotOn);
  const tickRef = useRef(0);

  useEffect(() => {
    if (!autoPilotOn) return;

    const id = window.setInterval(() => {
      const store = useDirectorStore.getState();
      const tick = tickRef.current++;

      // 1. Palette tour — always safe, no post pass re-chain.
      store.stepHue();

      // 2. Zoom tour — damped target, oscillates.
      if (tick % 2 === 0) store.zoomIn();
      else store.zoomOut();

      // 3. Camera nudge — subtle orbital drift.
      liveRefs.azimuth += 0.08 * (tick % 2 === 0 ? 1 : -1);

      // 4. Scene tour — every 3rd tick, respect dissolve guardrail.
      if (tick % 3 === 0) {
        const all = [...PRESETS, ...store.customPresets];
        const index = all.findIndex((preset) => preset.id === store.activePresetId);
        const next = all[(index + 1) % all.length].id;
        store.requestDissolve(next);
      }
    }, TOUR_INTERVAL_MS);

    return () => window.clearInterval(id);
  }, [autoPilotOn]);
}
