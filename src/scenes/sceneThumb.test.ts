import { describe, expect, it } from 'vitest';
import { getPreset } from './presets';
import { sceneThumbModel } from './sceneThumb';

describe('sceneThumbModel', () => {
  it('marks DJ Cover as media with placeholder art', () => {
    const thumb = sceneThumbModel(getPreset(6));
    expect(thumb.isCover).toBe(true);
    expect(thumb.coverUrl).toBe('/cover-placeholder.svg');
    expect(thumb.bases).toEqual(['mesh', 'particles']);
  });

  it('keeps field scenes without cover art', () => {
    const thumb = sceneThumbModel(getPreset(0));
    expect(thumb.isCover).toBe(false);
    expect(thumb.coverUrl).toBeNull();
    expect(thumb.bases).toEqual(['particles']);
    expect(thumb.primary).toMatch(/^#/);
  });
});
