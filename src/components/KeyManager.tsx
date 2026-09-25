import { useEffect, useState } from 'react';
import { ACTIONS, type ActionCategory } from '../director/actionRegistry';
import { findConflict, keyCapture, resolveCode } from '../director/bindings';
import { useDirectorStore } from '../director/directorStore';
import './KeyManager.css';

const CATEGORIES: ActionCategory[] = [
  'Deck',
  'Scenes',
  'Stage',
  'Strobe',
  'Effects',
  'Flags',
  'Overlay',
  'Library',
  'System',
];

function prettyKey(code: string): string {
  const arrows: Record<string, string> = {
    ArrowLeft: '←',
    ArrowRight: '→',
    ArrowUp: '↑',
    ArrowDown: '↓',
  };
  if (arrows[code]) return arrows[code];
  if (code.startsWith('Key')) return code.slice(3);
  if (code.startsWith('Digit')) return code.slice(5);
  const names: Record<string, string> = {
    Space: 'Space',
    Escape: 'Esc',
    Backslash: '\\',
    BracketLeft: '[',
    BracketRight: ']',
    Comma: ',',
    Period: '.',
    Minus: '-',
    Equal: '=',
    NumpadAdd: 'Num+',
    NumpadSubtract: 'Num−',
  };
  if (code.startsWith('Numpad')) return code.slice(6);
  return names[code] ?? code;
}

/**
 * Library tab for keyboard remapping: pick an action, press a key,
 * resolve conflicts by swapping. Overrides persist locally; popup and
 * gamepad mapping build on the same action ids.
 */
export function KeyManager() {
  const bindings = useDirectorStore((s) => s.bindings);
  const [listening, setListening] = useState<string | null>(null);
  const [conflict, setConflict] = useState<{
    actionId: string;
    code: string;
    takenBy: string;
  } | null>(null);
  const [resetArmed, setResetArmed] = useState(false);

  useEffect(() => {
    if (!listening) return;
    keyCapture.active = true;
    const onCapture = (event: KeyboardEvent) => {
      event.preventDefault();
      event.stopPropagation();
      if (event.code === 'Escape') {
        setListening(null);
        return;
      }
      const store = useDirectorStore.getState();
      const taken = findConflict(ACTIONS, store.bindings, event.code, listening);
      if (taken) {
        setConflict({ actionId: listening, code: event.code, takenBy: taken.id });
      } else {
        store.setBinding(listening, event.code);
        setListening(null);
      }
    };
    window.addEventListener('keydown', onCapture, true);
    return () => {
      window.removeEventListener('keydown', onCapture, true);
      keyCapture.active = false;
    };
  }, [listening]);

  const store = useDirectorStore.getState();
  const byId = new Map(ACTIONS.map((action) => [action.id, action]));

  const swap = () => {
    if (!conflict) return;
    const current = byId.get(conflict.actionId);
    const other = byId.get(conflict.takenBy);
    if (current && other) {
      const oldCode = resolveCode(current, bindings);
      store.setBinding(conflict.actionId, conflict.code);
      store.setBinding(conflict.takenBy, oldCode);
    }
    setConflict(null);
    setListening(null);
  };

  return (
    <div className="key-manager" data-testid="key-manager">
      <p className="key-hint">
        Pick an action, press a key. Gamepad mapping plugs into the same
        actions next.
      </p>
      {CATEGORIES.map((category) => (
        <div key={category} className="key-group">
          <h3>{category}</h3>
          <ul className="key-rows">
            {ACTIONS.filter((action) => action.category === category).map(
              (action) => (
                <li key={action.id} className="key-row">
                  <span className="key-label">{action.label}</span>
                  <button
                    type="button"
                    className={listening === action.id ? 'key-cap listening' : 'key-cap'}
                    onClick={() => {
                      setConflict(null);
                      setListening(action.id);
                    }}
                  >
                    {listening === action.id
                      ? 'Press a key…'
                      : prettyKey(resolveCode(action, bindings))}
                  </button>
                </li>
              ),
            )}
          </ul>
        </div>
      ))}
      {conflict && (
        <div className="key-conflict" role="alert">
          <span>
            {prettyKey(conflict.code)} is bound to “
            {byId.get(conflict.takenBy)?.label}”. Swap them?
          </span>
          <button type="button" onClick={swap}>
            Swap
          </button>
          <button
            type="button"
            onClick={() => {
              setConflict(null);
              setListening(null);
            }}
          >
            Cancel
          </button>
        </div>
      )}
      <button
        type="button"
        className="key-reset"
        onClick={() => {
          if (resetArmed) {
            store.resetBindings();
            setResetArmed(false);
          } else {
            setResetArmed(true);
          }
        }}
      >
        {resetArmed ? 'Click again to confirm reset' : 'Reset all keys'}
      </button>
    </div>
  );
}
