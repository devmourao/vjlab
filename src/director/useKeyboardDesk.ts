import { useEffect } from 'react';
import { buildKeymap } from './actionRegistry';

const keymap = buildKeymap();

export function useKeyboardDesk() {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      // Shortcuts must not fire while typing in a field.
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
      if (!action) return;
      if (action.preventDefault) event.preventDefault();
      action.run();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);
}
