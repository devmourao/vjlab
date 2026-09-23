import { describe, expect, it } from 'vitest';
import { draftToPreset } from './presetDraft';

const DRAFT = {
  name: 'Built',
  primary: '#ff0000',
  emissive: '#00ff00',
  background: '#000000',
  gain: 1.2,
  speed: 0.8,
  instances: [{ base: 'tunnel' as const }],
};

describe('presetDraft', () => {
  it('builds a preset payload from a valid draft', () => {
    const result = draftToPreset(DRAFT);
    expect('preset' in result).toBe(true);
    if ('preset' in result) {
      expect(result.preset.name).toBe('Built');
      expect(result.preset.instances).toEqual([{ base: 'tunnel' }]);
    }
  });

  it('rejects empty names, bad colors and missing bases', () => {
    expect(draftToPreset({ ...DRAFT, name: '  ' })).toEqual({
      error: 'Name must not be empty',
    });
    expect(draftToPreset({ ...DRAFT, primary: 'red' })).toEqual({
      error: 'Colors must be #rrggbb',
    });
    expect(draftToPreset({ ...DRAFT, instances: [] })).toEqual({
      error: 'Add at least one base',
    });
  });
});
