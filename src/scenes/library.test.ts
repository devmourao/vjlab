import { describe, expect, it } from 'vitest';
import {
  buildLibrary,
  favoriteEntries,
  reorderEntries,
  setlistOrder,
  toggleFavoriteEntry,
} from './library';

describe('library', () => {
  it('builds ordered entries with the first presets as favorites', () => {
    const entries = buildLibrary([0, 1, 2], 2);
    expect(entries).toHaveLength(3);
    expect(entries[0]).toMatchObject({
      presetId: 0,
      position: 0,
      favorite: true,
    });
    expect(entries[2]).toMatchObject({ favorite: false });
  });

  it('reorders entries and keeps positions dense', () => {
    const entries = buildLibrary([0, 1, 2]);
    const moved = reorderEntries(entries, 0, 2);
    expect(setlistOrder(moved)).toEqual([1, 2, 0]);
    expect(moved.map((entry) => entry.position)).toEqual([0, 1, 2]);
    expect(setlistOrder(reorderEntries(entries, -1, 5))).toEqual([0, 1, 2]);
  });

  it('toggles and selects favorites', () => {
    const entries = buildLibrary([0, 1, 2], 1);
    const toggled = toggleFavoriteEntry(entries, 2);
    expect(favoriteEntries(toggled).map((entry) => entry.presetId)).toEqual([
      0, 2,
    ]);
  });
});
