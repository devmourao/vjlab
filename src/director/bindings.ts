import type { ActionDef } from './actionRegistry';

/** Overrides only: actionId -> event.code. Absent means registry default. */
export type Bindings = Record<string, string>;

/** True while the remap UI captures the next keystroke. */
export const keyCapture = { active: false };

const BINDINGS_KEY = 'vjlab.bindings.v1';

export function resolveCode(action: ActionDef, bindings: Bindings): string {
  return bindings[action.id] ?? action.code;
}

export function resolveKeymap(
  actions: ActionDef[],
  bindings: Bindings,
): Map<string, ActionDef> {
  return new Map(actions.map((action) => [resolveCode(action, bindings), action]));
}

/** Action currently holding the code, excluding the one being rebound. */
export function findConflict(
  actions: ActionDef[],
  bindings: Bindings,
  code: string,
  exceptId: string,
): ActionDef | null {
  return (
    actions.find(
      (action) =>
        action.id !== exceptId && resolveCode(action, bindings) === code,
    ) ?? null
  );
}

export function readBindings(): Bindings {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return {};
    const raw = window.localStorage.getItem(BINDINGS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (typeof parsed !== 'object' || parsed === null) return {};
    const clean: Bindings = {};
    for (const [id, code] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof code === 'string' && code.length > 0) clean[id] = code;
    }
    return clean;
  } catch {
    return {};
  }
}

export function writeBindings(bindings: Bindings): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    window.localStorage.setItem(BINDINGS_KEY, JSON.stringify(bindings));
  } catch {
    // Ignore
  }
}
