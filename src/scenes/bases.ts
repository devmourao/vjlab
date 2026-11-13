import type { BaseId } from './presets';

/**
 * Native base capability registry: the single source describing which
 * params each base honors. Only honored params are listed — the editor,
 * the pack validator and the tests all read this table, so a param that
 * no component consumes cannot be advertised.
 */
/** Global behavior family (Show Timeline contract). Untagged = peculiar to the base. */
export type ParamFamily = 'transport' | 'modulation' | 'color' | 'spatial';

export interface BaseParamSchema {
  name: string;
  type: 'number' | 'image' | 'color' | 'toggle';
  /** preset = shared by the scene, instance = owned per base instance. */
  scope: 'preset' | 'instance';
  /** Global family; absent means base-specific (peculiar) param. */
  family?: ParamFamily;
  /** Short UI label; falls back to name when absent. */
  label?: string;
  min?: number;
  max?: number;
  default: number | string | null;
}

/**
 * Declared Fire-burst response (v1): the peak boost contribution on the
 * primary target. Values moved verbatim from the scene implementations,
 * so the feel is byte-identical and tunable tomorrow. Decay stays global
 * (decayBurst); decaySec reserves a per-base override slot.
 */
export interface BurstResponse {
  /** Human-readable targets, e.g. 'scale', 'morph + zoom'. */
  targets: string;
  peak: number;
  decaySec: number | null;
}

/** Catalog category for Compose UI and Unity pack browsing. */
export type BaseCategory = 'field' | 'form' | 'media' | 'fx';

/** Portable reaction verbs (see unity-port-contract.md §6). */
export type BaseMechanic = 'pulse' | 'orbit' | 'displace' | 'scroll' | 'morph';

export interface BaseCapability {
  base: BaseId;
  label: string;
  description: string;
  category: BaseCategory;
  mechanics: BaseMechanic[];
  params: BaseParamSchema[];
  burst: BurstResponse;
}

/**
 * Host-level params applied by the scene host around every instance.
 * Placement + lock let Compose treat bases as puzzle pieces on stage.
 */
export const HOST_PARAM_SCHEMAS: BaseParamSchema[] = [
  {
    name: 'primary',
    type: 'color',
    scope: 'instance',
    family: 'color',
    label: 'Primary color',
    default: null,
  },
  {
    name: 'emissive',
    type: 'color',
    scope: 'instance',
    family: 'color',
    label: 'Emissive color',
    default: null,
  },
  {
    name: 'posX',
    type: 'number',
    scope: 'instance',
    family: 'spatial',
    label: 'Position X',
    min: -4,
    max: 4,
    default: 0,
  },
  {
    name: 'posY',
    type: 'number',
    scope: 'instance',
    family: 'spatial',
    label: 'Position Y',
    min: -4,
    max: 4,
    default: 0,
  },
  {
    name: 'posZ',
    type: 'number',
    scope: 'instance',
    family: 'spatial',
    label: 'Position Z',
    min: -6,
    max: 6,
    default: 0,
  },
  {
    name: 'rotX',
    type: 'number',
    scope: 'instance',
    family: 'spatial',
    label: 'Tilt X (rad)',
    min: -3.14,
    max: 3.14,
    default: 0,
  },
  {
    name: 'rotY',
    type: 'number',
    scope: 'instance',
    family: 'spatial',
    label: 'Turn Y (rad)',
    min: -3.14,
    max: 3.14,
    default: 0,
  },
  {
    name: 'rotZ',
    type: 'number',
    scope: 'instance',
    family: 'spatial',
    label: 'Roll Z (rad)',
    min: -3.14,
    max: 3.14,
    default: 0,
  },
  {
    name: 'lockMotion',
    type: 'toggle',
    scope: 'instance',
    family: 'spatial',
    label: 'Lock motion',
    min: 0,
    max: 1,
    default: 0,
  },
  {
    name: 'cameraSensitivity',
    type: 'number',
    scope: 'instance',
    family: 'spatial',
    label: 'Camera follow',
    min: 0,
    max: 2,
    default: 1,
  },
  {
    name: 'zoom',
    type: 'number',
    scope: 'instance',
    family: 'spatial',
    label: 'Zoom',
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
    category: 'field',
    mechanics: ['pulse', 'orbit'],
    burst: { targets: 'scale', peak: 0.6, decaySec: null },
    params: [
      { name: 'gain', type: 'number', scope: 'preset', family: 'modulation', label: 'Gain', min: 0.4, max: 2, default: 1 },
      { name: 'speed', type: 'number', scope: 'preset', family: 'transport', label: 'Speed', min: 0.5, max: 2, default: 1 },
    ],
  },
  mesh: {
    base: 'mesh',
    label: 'Deformable Mesh',
    description:
      'Bass-displaced sphere, or album cover plate when cover=1 (readable art + pulse).',
    category: 'form',
    mechanics: ['displace', 'pulse'],
    burst: { targets: 'displacement', peak: 0.3, decaySec: null },
    params: [
      { name: 'gain', type: 'number', scope: 'preset', family: 'modulation', label: 'Gain', min: 0.4, max: 2, default: 1 },
      { name: 'map', type: 'image', scope: 'instance', label: 'Image map', default: null },
      {
        name: 'cover',
        type: 'number',
        scope: 'instance',
        family: 'spatial',
        label: 'Cover plate',
        min: 0,
        max: 1,
        default: 0,
      },
    ],
  },
  tunnel: {
    base: 'tunnel',
    label: 'Tunnel Field',
    description: 'Ring tunnel advancing with mids and treble travel.',
    category: 'field',
    mechanics: ['scroll', 'pulse', 'orbit'],
    burst: { targets: 'scale', peak: 0.5, decaySec: null },
    params: [
      { name: 'gain', type: 'number', scope: 'preset', family: 'modulation', label: 'Gain', min: 0.4, max: 2, default: 1 },
      { name: 'speed', type: 'number', scope: 'preset', family: 'transport', label: 'Speed', min: 0.5, max: 2, default: 1 },
    ],
  },
  fractal: {
    base: 'fractal',
    label: 'Fractal Bloom',
    description:
      'Audio-reactive fractal plane — orient as wall, floor, or ceiling.',
    category: 'field',
    mechanics: ['morph', 'pulse'],
    burst: { targets: 'morph + zoom', peak: 1.5, decaySec: null },
    params: [
      { name: 'gain', type: 'number', scope: 'preset', family: 'modulation', label: 'Gain', min: 0.4, max: 2, default: 1 },
      { name: 'speed', type: 'number', scope: 'preset', family: 'transport', label: 'Speed', min: 0.5, max: 2, default: 1 },
      {
        name: 'orientation',
        type: 'number',
        scope: 'instance',
        family: 'spatial',
        label: 'Plane (0 wall · 1 floor · 2 ceiling)',
        min: 0,
        max: 2,
        default: 0,
      },
    ],
  },
  bars: {
    base: 'bars',
    label: 'Spectrum Bars',
    description: 'Classic vertical spectrum — bass left, treble right.',
    category: 'form',
    mechanics: ['pulse'],
    burst: { targets: 'height', peak: 0.7, decaySec: null },
    params: [
      { name: 'gain', type: 'number', scope: 'preset', family: 'modulation', label: 'Gain', min: 0.4, max: 2, default: 1 },
      { name: 'speed', type: 'number', scope: 'preset', family: 'transport', label: 'Speed', min: 0.5, max: 2, default: 1 },
    ],
  },
  rings: {
    base: 'rings',
    label: 'Orbit Rings',
    description: 'Orbiting dot ring — light second layer under covers or tunnels.',
    category: 'field',
    mechanics: ['orbit', 'pulse'],
    burst: { targets: 'scale', peak: 0.55, decaySec: null },
    params: [
      { name: 'gain', type: 'number', scope: 'preset', family: 'modulation', label: 'Gain', min: 0.4, max: 2, default: 1 },
      { name: 'speed', type: 'number', scope: 'preset', family: 'transport', label: 'Speed', min: 0.5, max: 2, default: 1 },
    ],
  },
  grid: {
    base: 'grid',
    label: 'Grid LED',
    description: 'LED-style point grid that breathes with bass and treble.',
    category: 'form',
    mechanics: ['pulse', 'morph'],
    burst: { targets: 'scale', peak: 0.65, decaySec: null },
    params: [
      { name: 'gain', type: 'number', scope: 'preset', family: 'modulation', label: 'Gain', min: 0.4, max: 2, default: 1 },
      { name: 'speed', type: 'number', scope: 'preset', family: 'transport', label: 'Speed', min: 0.5, max: 2, default: 1 },
    ],
  },
  fog: {
    base: 'fog',
    label: 'Atmosphere Fog',
    description: 'Soft volumetric sheets — haze layer for depth and mood.',
    category: 'fx',
    mechanics: ['scroll', 'pulse'],
    burst: { targets: 'opacity', peak: 0.4, decaySec: null },
    params: [
      { name: 'gain', type: 'number', scope: 'preset', family: 'modulation', label: 'Gain', min: 0.4, max: 2, default: 1 },
      { name: 'speed', type: 'number', scope: 'preset', family: 'transport', label: 'Speed', min: 0.5, max: 2, default: 1 },
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

export function paramLabel(schema: BaseParamSchema): string {
  return schema.label ?? schema.name;
}
