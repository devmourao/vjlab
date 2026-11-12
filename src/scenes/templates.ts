import {
  BASE_CAPABILITIES,
  HOST_PARAM_SCHEMAS,
  type BaseCategory,
} from './bases';
import type { BaseId, BaseInstance, ScenePalette } from './presets';

/** Portable template id — stable across web and future Unity packs. */
export type SceneTemplateId = 'dj-cover' | 'pure-field' | 'tunnel-run' | 'blank';

export interface SceneTemplate {
  id: SceneTemplateId;
  name: string;
  /** One-line intent for the picker (Winamp-style visualization recipe). */
  blurb: string;
  /** Primary category the template showcases. */
  category: BaseCategory;
  palette: ScenePalette;
  background: string;
  gain: number;
  speed: number;
  instances: BaseInstance[];
  /**
   * Friendly slots the composer should fill first (e.g. album art).
   * Paths are `instanceIndex.paramName`.
   */
  slots?: Array<{
    path: string;
    label: string;
    kind: 'image';
  }>;
}

function hostDefaults(): Record<string, unknown> {
  return Object.fromEntries(
    HOST_PARAM_SCHEMAS.map((schema) => [schema.name, schema.default]),
  );
}

function baseDefaults(base: BaseId): Record<string, unknown> {
  return BASE_CAPABILITIES[base].params.reduce(
    (acc: Record<string, unknown>, schema) => {
      if (schema.default !== null) acc[schema.name] = schema.default;
      return acc;
    },
    {} as Record<string, unknown>,
  );
}

export function instanceDefaults(
  base: BaseId,
  overrides: Record<string, unknown> = {},
): BaseInstance {
  return {
    base,
    params: { ...hostDefaults(), ...baseDefaults(base), ...overrides },
  };
}

/**
 * Starter recipes for Compose mode. Saving materializes a normal scene;
 * templates are not a runtime type (see unity-port-contract.md §4).
 */
export const SCENE_TEMPLATES: SceneTemplate[] = [
  {
    id: 'dj-cover',
    name: 'DJ Cover',
    blurb: 'Album/track art in the center with a reactive particle aura.',
    category: 'media',
    palette: { primary: '#7dd3fc', emissive: '#38bdf8' },
    background: '#020617',
    gain: 1.2,
    speed: 1,
    instances: [
      instanceDefaults('mesh', {
        cameraSensitivity: 1,
        zoom: 1,
        map: null,
      }),
      instanceDefaults('particles', {
        cameraSensitivity: 0.08,
        zoom: 1.35,
      }),
    ],
    slots: [{ path: '0.map', label: 'Album / track image', kind: 'image' }],
  },
  {
    id: 'pure-field',
    name: 'Pure Field',
    blurb: 'Particle cloud only — classic ambient visualizer.',
    category: 'field',
    palette: { primary: '#7dd3fc', emissive: '#0ea5e9' },
    background: '#010409',
    gain: 1,
    speed: 1,
    instances: [instanceDefaults('particles')],
  },
  {
    id: 'tunnel-run',
    name: 'Tunnel Run',
    blurb: 'Depth rings racing on mids — club tunnel energy.',
    category: 'field',
    palette: { primary: '#22d3ee', emissive: '#0e7490' },
    background: '#01090d',
    gain: 1.1,
    speed: 1.2,
    instances: [instanceDefaults('tunnel')],
  },
  {
    id: 'blank',
    name: 'Blank',
    blurb: 'Empty composition — add bases manually.',
    category: 'form',
    palette: { primary: '#ffffff', emissive: '#64748b' },
    background: '#000000',
    gain: 1,
    speed: 1,
    instances: [],
  },
];

export function getTemplate(id: SceneTemplateId): SceneTemplate {
  const found = SCENE_TEMPLATES.find((entry) => entry.id === id);
  if (!found) throw new Error(`Unknown scene template: ${id}`);
  return found;
}

/** Deep-clone template fields into an editable builder draft seed. */
export function materializeTemplate(id: SceneTemplateId): {
  name: string;
  primary: string;
  emissive: string;
  background: string;
  gain: number;
  speed: number;
  instances: BaseInstance[];
  templateId: SceneTemplateId;
} {
  const template = getTemplate(id);
  return {
    name: template.name,
    primary: template.palette.primary,
    emissive: template.palette.emissive,
    background: template.background,
    gain: template.gain,
    speed: template.speed,
    templateId: template.id,
    instances: template.instances.map((inst) => ({
      base: inst.base,
      params: { ...(inst.params ?? {}) },
    })),
  };
}

export function parseSlotPath(
  path: string,
): { instanceIndex: number; param: string } | null {
  const match = /^(\d+)\.([A-Za-z_][\w]*)$/.exec(path);
  if (!match) return null;
  return { instanceIndex: Number(match[1]), param: match[2] };
}
