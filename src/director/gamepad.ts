import { useEffect, useRef } from 'react';

/**
 * Gamepad input: standard-layout buttons fire registry actions.
 * No default bindings ship (explicit opt-in from the Keys tab), axes
 * stay reserved for a continuous-controls pass.
 */

/** Overrides only: actionId -> standard button index. */
export type PadBindings = Record<string, number>;

const PAD_BINDINGS_KEY = 'vjlab.padBindings.v1';

/** W3C standard button indices, for docs and capture display. */
export const PAD_BUTTONS = [
  'Bottom',
  'Right',
  'Left',
  'Top',
  'LB',
  'RB',
  'LT',
  'RT',
  'Select',
  'Start',
  'L3',
  'R3',
  'Up',
  'Down',
  'Left',
  'Right',
  'Center',
] as const;

export function padButtonName(index: number): string {
  return PAD_BUTTONS[index] ?? `B${index}`;
}

/** Newly pressed buttons since the previous poll (edge detection). */
export function pressedEdges(prev: boolean[], curr: boolean[]): number[] {
  const edges: number[] = [];
  for (let index = 0; index < curr.length; index += 1) {
    if (curr[index] && !prev[index]) edges.push(index);
  }
  return edges;
}

function readPadButtons(): boolean[] | null {
  try {
    if (typeof navigator === 'undefined' || !navigator.getGamepads) return null;
    const pads = navigator.getGamepads();
    for (const pad of pads) {
      if (pad && pad.connected) {
        return pad.buttons.map((button) => button.pressed);
      }
    }
    return null;
  } catch {
    return null;
  }
}

export function readPadBindings(): PadBindings {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return {};
    const raw = window.localStorage.getItem(PAD_BINDINGS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (typeof parsed !== 'object' || parsed === null) return {};
    const clean: PadBindings = {};
    for (const [id, button] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof button === 'number' && button >= 0 && button < 32) {
        clean[id] = button;
      }
    }
    return clean;
  } catch {
    return {};
  }
}

export function writePadBindings(bindings: PadBindings): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    window.localStorage.setItem(PAD_BINDINGS_KEY, JSON.stringify(bindings));
  } catch {
    // Ignore
  }
}

/** First pressed button on any connected pad, for capture mode. */
export function firstPressedButton(): number | null {
  try {
    if (typeof navigator === 'undefined' || !navigator.getGamepads) return null;
    const pads = navigator.getGamepads();
    for (const pad of pads) {
      if (pad && pad.connected) {
        const index = pad.buttons.findIndex((button) => button.pressed);
        if (index >= 0) return index;
      }
    }
    return null;
  } catch {
    return null;
  }
}

/** Polls the first connected pad; fires once per button press. */
export function useGamepadPoll(onButton: (index: number) => void) {
  const handler = useRef(onButton);
  const prev = useRef<boolean[]>([]);

  useEffect(() => {
    handler.current = onButton;
  });

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      if (typeof document === 'undefined' || document.hasFocus()) {
        const curr = readPadButtons();
        if (curr) {
          for (const index of pressedEdges(prev.current, curr)) {
            handler.current(index);
          }
          prev.current = curr;
        } else {
          prev.current = [];
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
}
