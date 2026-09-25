/**
 * Console section layout: canonical ids plus a persisted order.
 * Stored as a plain JSON array so a future backend can sync the same
 * shape. Both deck and popup windows share the key; each arranges its
 * own copy.
 */
export const SECTION_IDS = [
  'track',
  'scenes',
  'stage',
  'strobe',
  'effects',
  'flags',
  'overlay',
  'guide',
] as const;

export type SectionId = (typeof SECTION_IDS)[number];

const SECTION_ORDER_KEY = 'vjlab.sectionOrder.v1';

export function readSectionOrder(): string[] {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return [...SECTION_IDS];
    }
    const raw = window.localStorage.getItem(SECTION_ORDER_KEY);
    if (!raw) return [...SECTION_IDS];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [...SECTION_IDS];
    const known = parsed.filter(
      (entry): entry is string =>
        typeof entry === 'string' &&
        (SECTION_IDS as readonly string[]).includes(entry),
    );
    const missing = SECTION_IDS.filter((id) => !known.includes(id));
    return [...new Set([...known, ...missing])];
  } catch {
    return [...SECTION_IDS];
  }
}

export function writeSectionOrder(order: string[]): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    window.localStorage.setItem(SECTION_ORDER_KEY, JSON.stringify(order));
  } catch {
    // Ignore
  }
}

export function moveOrderItem(order: string[], from: number, to: number): string[] {
  if (from < 0 || from >= order.length || to < 0 || to >= order.length) {
    return order;
  }
  const next = [...order];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}
