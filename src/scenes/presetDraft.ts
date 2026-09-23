import type { BaseInstance, ScenePreset } from './presets';

export interface PresetDraft {
  name: string;
  primary: string;
  emissive: string;
  background: string;
  gain: number;
  speed: number;
  instances: BaseInstance[];
}

const HEX_PATTERN = /^#[0-9a-f]{6}$/i;

/**
 * Pure draft validation shared by visual builders. Returns the preset
 * payload or a human-readable error — never throws, never touches state.
 */
export function draftToPreset(
  draft: PresetDraft,
): { preset: Omit<ScenePreset, 'id'> } | { error: string } {
  if (!draft.name.trim()) return { error: 'Name must not be empty' };
  if (
    !HEX_PATTERN.test(draft.primary) ||
    !HEX_PATTERN.test(draft.emissive) ||
    !HEX_PATTERN.test(draft.background)
  ) {
    return { error: 'Colors must be #rrggbb' };
  }
  if (draft.instances.length === 0) return { error: 'Add at least one base' };
  return {
    preset: {
      name: draft.name.trim(),
      palette: { primary: draft.primary, emissive: draft.emissive },
      background: draft.background,
      gain: draft.gain,
      speed: draft.speed,
      scene: 0 as const,
      instances: draft.instances.map((inst) => {
        const params = { ...(inst.params ?? {}) };
        return Object.keys(params).length > 0 ? { base: inst.base, params } : { base: inst.base };
      }),
    },
  };
}
