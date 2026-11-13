import { describe, expect, it } from 'vitest';
import {
  SCENE_TEMPLATES,
  getTemplate,
  materializeTemplate,
  parseSlotPath,
} from './templates';

describe('scene templates', () => {
  it('ships DJ Cover as mesh media + particle field', () => {
    const dj = getTemplate('dj-cover');
    expect(dj.instances.map((i) => i.base)).toEqual(['mesh', 'particles']);
    expect(dj.slots?.[0]?.path).toBe('0.map');
    expect(dj.category).toBe('media');
    expect(dj.instances[0].params?.['cover']).toBe(1);
    expect(dj.instances[0].params?.['map']).toBe('/cover-placeholder.svg');
  });

  it('materializes an editable clone, not a shared reference', () => {
    const a = materializeTemplate('dj-cover');
    const b = materializeTemplate('dj-cover');
    a.instances[0].params = { ...(a.instances[0].params ?? {}), zoom: 2 };
    expect(b.instances[0].params?.['zoom']).toBe(1);
    expect(a.name).toBe('DJ Cover');
  });

  it('lists stable template ids for pack/Unity mapping', () => {
    expect(SCENE_TEMPLATES.map((t) => t.id)).toEqual([
      'dj-cover',
      'cover-orbit',
      'spectrum-stack',
      'tunnel-dust',
      'floor-bloom',
      'led-haze',
      'pure-field',
      'tunnel-run',
      'blank',
    ]);
  });

  it('includes multi-base recombination recipes', () => {
    expect(getTemplate('spectrum-stack').instances.map((i) => i.base)).toEqual([
      'bars',
      'particles',
    ]);
    expect(getTemplate('cover-orbit').instances.map((i) => i.base)).toEqual([
      'mesh',
      'rings',
    ]);
    expect(getTemplate('tunnel-dust').instances.map((i) => i.base)).toEqual([
      'tunnel',
      'particles',
    ]);
  });

  it('parses slot paths used by the composer', () => {
    expect(parseSlotPath('0.map')).toEqual({
      instanceIndex: 0,
      param: 'map',
    });
    expect(parseSlotPath('bad')).toBeNull();
  });
});
