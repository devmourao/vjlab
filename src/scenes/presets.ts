export interface ScenePalette {
  primary: string;
  emissive: string;
}

export type BaseId = 'particles' | 'mesh' | 'tunnel' | 'fractal';

export interface BaseInstance {
  base: BaseId;
  params?: Record<string, unknown>;
}

export interface ScenePreset {
  id: number;
  name: string;
  scene: 0 | 1 | 2 | 3;
  palette: ScenePalette;
  background: string;
  gain: number;
  speed: number;
  instances?: BaseInstance[];
}

export const PRESETS: ScenePreset[] = [
  {
    id: 0,
    name: 'Nebula Drift',
    scene: 0,
    palette: { primary: '#7dd3fc', emissive: '#0ea5e9' },
    background: '#010409',
    gain: 1,
    speed: 1,
    instances: [{ base: 'particles' }],
  },
  {
    id: 1,
    name: 'Neon Bloom',
    scene: 1,
    palette: { primary: '#f0abfc', emissive: '#a21caf' },
    background: '#0a0310',
    gain: 1,
    speed: 1,
    instances: [{ base: 'mesh' }],
  },
  {
    id: 2,
    name: 'Hyper Tunnel',
    scene: 2,
    palette: { primary: '#22d3ee', emissive: '#0e7490' },
    background: '#01090d',
    gain: 1,
    speed: 1,
    instances: [{ base: 'tunnel' }],
  },
  {
    id: 3,
    name: 'Neon Tri Tunnel',
    scene: 2,
    palette: { primary: '#ff8a8a', emissive: '#ffffff' },
    background: '#050000',
    gain: 1.3,
    speed: 1.6,
    instances: [{ base: 'tunnel' }],
  },
  {
    id: 4,
    name: 'Tunnel + Dust',
    scene: 0,
    palette: { primary: '#f0abfc', emissive: '#a21caf' },
    background: '#080412',
    gain: 1,
    speed: 1,
    instances: [
      { base: 'tunnel', params: { cameraSensitivity: 1, zoom: 1 } },
      { base: 'particles', params: { cameraSensitivity: 0.05, zoom: 1.4 } },
    ],
  },
  {
    id: 5,
    name: 'Fractal Bloom',
    scene: 3,
    palette: { primary: '#ff7aff', emissive: '#00ffff' },
    background: '#020208',
    gain: 1.2,
    speed: 0.8,
    instances: [{ base: 'fractal' }],
  },
];

export const PRESET_COUNT = PRESETS.length;

export const PLAYLIST: number[] = PRESETS.map((p) => p.id);

const LEGACY_SCENE_BASES = ['particles', 'mesh', 'tunnel', 'fractal'] as const;

/**
 * Single composition path: presets carrying instances use them, legacy
 * presets resolve their scene index to one equivalent instance.
 */
export function resolveInstances(preset: ScenePreset): BaseInstance[] {
  if (preset.instances && preset.instances.length > 0) {
    return preset.instances;
  }
  const base = LEGACY_SCENE_BASES[preset.scene] ?? 'particles';
  return [{ base }];
}

export function getPreset(id: number): ScenePreset {
  const normalized = ((Math.floor(id) % PRESETS.length) + PRESETS.length) % PRESETS.length;
  return PRESETS[normalized];
}

export function nextPresetId(currentId: number): number {
  return (currentId + 1) % PRESETS.length;
}

export function prevPresetId(currentId: number): number {
  return (currentId - 1 + PRESETS.length) % PRESETS.length;
}
