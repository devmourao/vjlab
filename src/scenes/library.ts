/**
 * Scene library model: every preset belongs to the library, an ordered
 * subset forms the session setlist, and flagged entries act as quick
 * favorites. Only the model ships here — setlist management UI is a
 * later round, and future track queues reuse the same reorder helper
 * shape through their own module.
 */
export interface LibraryEntry {
  presetId: number;
  position: number;
  favorite: boolean;
}

export function buildLibrary(
  presetIds: number[],
  favoriteCount = 6,
): LibraryEntry[] {
  return presetIds.map((presetId, index) => ({
    presetId,
    position: index,
    favorite: index < favoriteCount,
  }));
}

function normalize(entries: LibraryEntry[]): LibraryEntry[] {
  return [...entries]
    .sort((a, b) => a.position - b.position)
    .map((entry, index) => ({ ...entry, position: index }));
}

export function reorderEntries(
  entries: LibraryEntry[],
  from: number,
  to: number,
): LibraryEntry[] {
  const sorted = normalize(entries);
  if (from < 0 || from >= sorted.length || to < 0 || to >= sorted.length) {
    return sorted;
  }
  const [moved] = sorted.splice(from, 1);
  sorted.splice(to, 0, moved);
  return sorted.map((entry, index) => ({ ...entry, position: index }));
}

export function toggleFavoriteEntry(
  entries: LibraryEntry[],
  presetId: number,
): LibraryEntry[] {
  return entries.map((entry) =>
    entry.presetId === presetId
      ? { ...entry, favorite: !entry.favorite }
      : entry,
  );
}

export function favoriteEntries(entries: LibraryEntry[]): LibraryEntry[] {
  return normalize(entries.filter((entry) => entry.favorite));
}

export function setlistOrder(entries: LibraryEntry[]): number[] {
  return normalize(entries).map((entry) => entry.presetId);
}
