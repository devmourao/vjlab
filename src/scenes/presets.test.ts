import { describe, expect, it } from 'vitest';
import {
  BASE_CAPABILITIES,
  HOST_PARAM_SCHEMAS,
  instanceKey,
} from './bases';
import {
  PLAYLIST,
  PRESETS,
  getPreset,
  nextPresetId,
  prevPresetId,
  resolveInstances,
} from './presets';

describe('presets', () => {
  it('defines six presets on valid scenes', () => {
    expect(PRESETS).toHaveLength(6);
    for (const preset of PRESETS) {
      expect([0, 1, 2, 3]).toContain(preset.scene);
      expect(preset.gain).toBeGreaterThan(0);
    }
  });

  it('covers every preset exactly once in the playlist', () => {
    expect([...PLAYLIST].sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it('gives every preset a dark background', () => {
    for (const preset of PRESETS) {
      expect(preset.background).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it('wraps preset navigation', () => {
    expect(nextPresetId(5)).toBe(0);
    expect(prevPresetId(0)).toBe(5);
    expect(getPreset(-1).id).toBe(5);
  });

  it('resolves every preset through instances', () => {
    const bases = ['particles', 'mesh', 'tunnel', 'tunnel', 'tunnel', 'fractal'];
    for (const preset of PRESETS) {
      const instances = resolveInstances(preset);
      expect(instances.length).toBeGreaterThan(0);
      expect(instances[0].base).toBe(bases[preset.id]);
    }
    expect(resolveInstances({ ...getPreset(0), instances: [] })[0].base).toBe(
      'particles',
    );
  });

  it('declares only honored params on every instance', () => {
    const honored = new Set([
      ...HOST_PARAM_SCHEMAS.map((schema) => schema.name),
      ...Object.values(BASE_CAPABILITIES).flatMap((capability) =>
        capability.params.map((schema) => schema.name),
      ),
    ]);
    for (const preset of PRESETS) {
      for (const instance of resolveInstances(preset)) {
        expect(BASE_CAPABILITIES[instance.base]).toBeDefined();
        for (const name of Object.keys(instance.params ?? {})) {
          expect(honored.has(name)).toBe(true);
        }
      }
    }
    expect(instanceKey(1, 'mesh', 0)).toBe('1:mesh:0');
  });
});
