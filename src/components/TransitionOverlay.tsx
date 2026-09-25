import { useEffect, useRef } from 'react';
import { transitionRef, useDirectorStore } from '../director/directorStore';
import { dissolveState } from '../director/transition';

export function TransitionOverlay() {
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;

    const tick = () => {
      const node = divRef.current;
      if (node) {
        if (transitionRef.active) {
          const store = useDirectorStore.getState();
          const elapsed = (performance.now() - transitionRef.start) / 1000;
          const state = dissolveState(elapsed, store.transitionDuration);
          if (state.shouldSwap && !transitionRef.swapped) {
            transitionRef.swapped = true;
            store.setPreset(transitionRef.to, transitionRef.toKey);
          }
          node.style.opacity = String(state.opacity);
          if (state.finished) {
            transitionRef.active = false;
            transitionRef.swapped = false;
            node.style.opacity = '0';
          }
        } else {
          node.style.opacity = '0';
        }
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return <div className="transition-veil" ref={divRef} />;
}
