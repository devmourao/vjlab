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

export function formatTrackTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const whole = Math.floor(seconds);
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`;
}

/**
 * Parse stage timestamps: `m:ss`, `mm:ss` or bare seconds (`90`, `90s`).
 * Returns whole seconds or null for garbage (never throws, never NaN).
 */
export function parseMmSs(value: string): number | null {
  const trimmed = value.trim().toLowerCase().replace(/s$/, '');
  if (trimmed === '') return null;
  const parts = trimmed.split(':');
  if (parts.length > 3) return null;
  const numbers = parts.map((part) => {
    if (!/^\d{1,5}$/.test(part)) return NaN;
    return parseInt(part, 10);
  });
  if (numbers.some((entry) => !Number.isFinite(entry))) return null;
  let total: number;
  if (numbers.length === 3) {
    total = numbers[0] * 3600 + numbers[1] * 60 + numbers[2];
  } else if (numbers.length === 2) {
    if (numbers[1] >= 60) return null;
    total = numbers[0] * 60 + numbers[1];
  } else {
    total = numbers[0];
  }
  return total >= 0 ? total : null;
}
