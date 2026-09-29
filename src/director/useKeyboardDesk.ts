import { useEffect } from 'react';
import { ACTIONS } from './actionRegistry';
import { keyCapture, resolveKeymap } from './bindings';
import { useDirectorStore } from './directorStore';

export function useKeyboardDesk() {
  const bindings = useDirectorStore((s) => s.bindings);

  useEffect(() => {
    const keymap = resolveKeymap(ACTIONS, bindings);
    const onKeyDown = (event: KeyboardEvent) => {
      if (keyCapture.active) return;
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
  }, [bindings]);
}
