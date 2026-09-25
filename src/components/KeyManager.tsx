import { useEffect, useState } from 'react';
import { ACTIONS, type ActionCategory } from '../director/actionRegistry';
import { findConflict, keyCapture, resolveCode } from '../director/bindings';
import { useDirectorStore } from '../director/directorStore';
import { firstPressedButton, padButtonName } from '../director/gamepad';
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
  const padBindings = useDirectorStore((s) => s.padBindings);
  const [listening, setListening] = useState<string | null>(null);
  const [listeningPad, setListeningPad] = useState<string | null>(null);
  const [conflict, setConflict] = useState<{
    actionId: string;
    code: string;
    takenBy: string;
  } | null>(null);
  const [padConflict, setPadConflict] = useState<{
    actionId: string;
    button: number;
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

  useEffect(() => {
    if (!listeningPad) return;
    keyCapture.active = true;
    let raf = 0;
    const cancel = (event: KeyboardEvent) => {
      if (event.code === 'Escape') setListeningPad(null);
    };
    const tick = () => {
      const pressed = firstPressedButton();
      if (pressed !== null) {
        const store = useDirectorStore.getState();
        const taken = ACTIONS.find(
          (action) =>
            action.id !== listeningPad &&
            store.padBindings[action.id] === pressed,
        );
        if (taken) {
          setPadConflict({ actionId: listeningPad, button: pressed, takenBy: taken.id });
        } else {
          store.setPadBinding(listeningPad, pressed);
          setListeningPad(null);
        }
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener('keydown', cancel);
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('keydown', cancel);
      cancelAnimationFrame(raf);
      keyCapture.active = false;
    };
  }, [listeningPad]);

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
        Pick an action, press a key — or arm the pad cap and press a
        controller button (standard layout).
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
                      setListeningPad(null);
                      setListening(action.id);
                    }}
                  >
                    {listening === action.id
                      ? 'Press a key…'
                      : prettyKey(resolveCode(action, bindings))}
                  </button>
                  <button
                    type="button"
                    className={listeningPad === action.id ? 'key-cap listening' : 'key-cap pad'}
                    title="Map a gamepad button"
                    onClick={() => {
                      setPadConflict(null);
                      setListening(null);
                      setListeningPad(action.id);
                    }}
                  >
                    {listeningPad === action.id
                      ? 'Press pad…'
                      : (padBindings[action.id] !== undefined
                        ? padButtonName(padBindings[action.id])
                        : '—')}
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
      {padConflict && (
        <div className="key-conflict" role="alert">
          <span>
            Pad {padButtonName(padConflict.button)} is bound to “
            {byId.get(padConflict.takenBy)?.label}”. Swap them?
          </span>
          <button
            type="button"
            onClick={() => {
              const current = padBindings[padConflict.actionId];
              store.setPadBinding(padConflict.actionId, padConflict.button);
              if (current !== undefined) {
                store.setPadBinding(padConflict.takenBy, current);
              } else {
                store.clearPadBinding(padConflict.takenBy);
              }
              setPadConflict(null);
              setListeningPad(null);
            }}
          >
            Swap
          </button>
          <button
            type="button"
            onClick={() => {
              setPadConflict(null);
              setListeningPad(null);
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
