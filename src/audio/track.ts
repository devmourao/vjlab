/**
 * Queue-ready track identity.
 *
 * The player reads local files today, but every surface renders this
 * model instead of raw file names so a future track queue plugs in
 * without UI rewrites. No playlist UI lives here.
 */
export interface Track {
  id: string;
  name: string;
  source: 'local';
  url?: string | null;
}

let counter = 0;

function nextId(): string {
  counter += 1;
  try {
    if (
      typeof crypto !== 'undefined' &&
      typeof crypto.randomUUID === 'function'
    ) {
      return crypto.randomUUID();
    }
  } catch {
    // Fall through to the deterministic fallback below.
  }
  return `track-${Date.now().toString(36)}-${counter}`;
}

export function createTrack(name: string, url?: string | null): Track {
  return { id: nextId(), name, source: 'local', url: url ?? null };
}

export function formatQueueLabel(
  index: number | null,
  total: number | null,
): string | null {
  if (index === null || total === null) return null;
  return `${index + 1}/${total}`;
}
