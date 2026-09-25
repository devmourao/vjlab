import { useEffect } from 'react';
import { buildKeymap } from './actionRegistry';
import type { ControlCommand } from './controlChannel';

/**
 * Popup keystrokes: the same registry as deck keys, resolved to remote
 * commands. Fullscreen toggles the popup's own window and detach is
 * meaningless inside the popup; everything else runs on the deck
 * through runAction, preserving deck context (fractal rules, camera).
 */
const POPUP_BLOCKED = new Set(['controls.detach']);

function toggleOwnFullscreen(): void {
  const el = document.documentElement;
  if (!document.fullscreenElement) {
    void el.requestFullscreen().catch(() => {});
  } else {
    void document.exitFullscreen().catch(() => {});
  }
}

export function useControlKeys(send: (command: ControlCommand) => void) {
  useEffect(() => {
    const keymap = buildKeymap();
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT')
      ) {
        return;
      }
      const action = keymap.get(event.code);
      if (!action || POPUP_BLOCKED.has(action.id)) return;
      if (action.id === 'output.fullscreen') {
        event.preventDefault();
        toggleOwnFullscreen();
        return;
      }
      if (action.id === 'output.fullscreen.f11') return;
      if (action.preventDefault) event.preventDefault();
      send({ type: 'runAction', id: action.id });
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [send]);
}
