import {
  BASE_CAPABILITIES,
  HOST_PARAM_SCHEMAS,
  type BaseCategory,
} from './bases';
import type { BaseId, BaseInstance, ScenePalette } from './presets';

/** Portable template id — stable across web and future Unity packs. */
export type SceneTemplateId =
  | 'dj-cover'
  | 'pure-field'
  | 'tunnel-run'
  | 'spectrum-stack'
  | 'cover-orbit'
  | 'tunnel-dust'
  | 'floor-bloom'
  | 'led-haze'
  | 'blank';

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
        cover: 1,
        map: '/cover-placeholder.svg',
      }),
      instanceDefaults('particles', {
        cameraSensitivity: 0.08,
        zoom: 1.45,
      }),
    ],
    slots: [{ path: '0.map', label: 'Album / track image', kind: 'image' }],
  },
  {
    id: 'cover-orbit',
    name: 'Cover Orbit',
    blurb: 'Album plate with orbiting ring — media + motion layer.',
    category: 'media',
    palette: { primary: '#c4b5fd', emissive: '#8b5cf6' },
    background: '#0b0614',
    gain: 1.15,
    speed: 1.05,
    instances: [
      instanceDefaults('mesh', {
        cover: 1,
        map: '/cover-placeholder.svg',
        zoom: 1,
      }),
      instanceDefaults('rings', {
        cameraSensitivity: 0.35,
        zoom: 1.1,
      }),
    ],
    slots: [{ path: '0.map', label: 'Album / track image', kind: 'image' }],
  },
  {
    id: 'spectrum-stack',
    name: 'Spectrum Stack',
    blurb: 'Bars up front, particles behind — classic analyser stack.',
    category: 'form',
    palette: { primary: '#fbbf24', emissive: '#f59e0b' },
    background: '#090601',
    gain: 1.25,
    speed: 1.1,
    instances: [
      instanceDefaults('bars', { zoom: 1.05 }),
      instanceDefaults('particles', {
        cameraSensitivity: 0.12,
        zoom: 1.35,
      }),
    ],
  },
  {
    id: 'tunnel-dust',
    name: 'Tunnel + Dust',
    blurb: 'Depth tunnel with a soft particle veil.',
    category: 'field',
    palette: { primary: '#22d3ee', emissive: '#0e7490' },
    background: '#01090d',
    gain: 1.15,
    speed: 1.15,
    instances: [
      instanceDefaults('tunnel'),
      instanceDefaults('particles', {
        cameraSensitivity: 0.15,
        zoom: 1.25,
      }),
    ],
  },
  {
    id: 'floor-bloom',
    name: 'Floor Bloom',
    blurb: 'Fractal as a locked floor plane with soft fog above.',
    category: 'field',
    palette: { primary: '#ff7aff', emissive: '#00ffff' },
    background: '#05020a',
    gain: 1.2,
    speed: 0.9,
    instances: [
      instanceDefaults('fractal', {
        orientation: 1,
        lockMotion: 1,
        cameraSensitivity: 0,
        zoom: 0.85,
      }),
      instanceDefaults('fog', {
        posY: 0.4,
        cameraSensitivity: 0.2,
      }),
    ],
  },
  {
    id: 'led-haze',
    name: 'LED Haze',
    blurb: 'Grid wall with atmosphere fog — club backdrop stack.',
    category: 'form',
    palette: { primary: '#34d399', emissive: '#059669' },
    background: '#020806',
    gain: 1.15,
    speed: 1,
    instances: [
      instanceDefaults('grid', { posZ: -0.4 }),
      instanceDefaults('fog', {
        posZ: 0.6,
        cameraSensitivity: 0.15,
      }),
    ],
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
