import type { BaseId } from './presets';

/**
 * Native base capability registry: the single source describing which
 * params each base honors. Only honored params are listed — the editor,
 * the pack validator and the tests all read this table, so a param that
 * no component consumes cannot be advertised.
 */
export interface BaseParamSchema {
  name: string;
  type: 'number' | 'image';
  /** preset = shared by the scene, instance = owned per base instance. */
  scope: 'preset' | 'instance';
  min?: number;
  max?: number;
  default: number | string | null;
}

export interface BaseCapability {
  base: BaseId;
  label: string;
  description: string;
  params: BaseParamSchema[];
}

/** Host-level params applied by the scene host around every instance. */
export const HOST_PARAM_SCHEMAS: BaseParamSchema[] = [
  {
    name: 'cameraSensitivity',
    type: 'number',
    scope: 'instance',
    min: 0,
    max: 2,
    default: 1,
  },
  {
    name: 'zoom',
    type: 'number',
    scope: 'instance',
    min: 0.5,
    max: 2.5,
    default: 1,
  },
];

export const BASE_CAPABILITIES: Record<BaseId, BaseCapability> = {
  particles: {
    base: 'particles',
    label: 'Particle Field',
    description: 'Audio-reactive point cloud with bass pulse and treble scale.',
    params: [
      { name: 'gain', type: 'number', scope: 'preset', min: 0.4, max: 2, default: 1 },
      { name: 'speed', type: 'number', scope: 'preset', min: 0.5, max: 2, default: 1 },
    ],
  },
  mesh: {
    base: 'mesh',
    label: 'Deformable Mesh',
    description: 'Bass-displaced sphere, flat wireframe or per-instance image.',
    params: [
      { name: 'gain', type: 'number', scope: 'preset', min: 0.4, max: 2, default: 1 },
      { name: 'map', type: 'image', scope: 'instance', default: null },
    ],
  },
  tunnel: {
    base: 'tunnel',
    label: 'Tunnel Field',
    description: 'Ring tunnel advancing with mids and treble travel.',
    params: [
      { name: 'gain', type: 'number', scope: 'preset', min: 0.4, max: 2, default: 1 },
      { name: 'speed', type: 'number', scope: 'preset', min: 0.5, max: 2, default: 1 },
    ],
  },
  fractal: {
    base: 'fractal',
    label: 'Fractal Bloom',
    description: 'Full-screen audio-reactive fractal shader plane.',
    params: [
      { name: 'gain', type: 'number', scope: 'preset', min: 0.4, max: 2, default: 1 },
      { name: 'speed', type: 'number', scope: 'preset', min: 0.5, max: 2, default: 1 },
    ],
  },
};

/** Stable session key for per-instance overrides (never global). */
export function instanceKey(
  presetId: number,
  base: BaseId,
  index: number,
): string {
  return `${presetId}:${base}:${index}`;
}
