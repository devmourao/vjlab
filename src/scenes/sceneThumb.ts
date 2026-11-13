import type { BaseId, BaseInstance, ScenePreset } from './presets';
import { resolveInstances } from './presets';

/** Portable thumbnail model — Unity can mirror the same fields for list UIs. */
export interface SceneThumbModel {
  title: string;
  background: string;
  primary: string;
  emissive: string;
  /** Album/cover image when the scene carries a media map. */
  coverUrl: string | null;
  bases: BaseId[];
  isCover: boolean;
}

function firstCoverMap(instances: BaseInstance[]): {
  coverUrl: string | null;
  isCover: boolean;
} {
  for (const instance of instances) {
    if (instance.base !== 'mesh') continue;
    const cover = Number(instance.params?.['cover'] ?? 0) >= 0.5;
    const map = instance.params?.['map'];
    const coverUrl =
      typeof map === 'string' && map.length > 0 ? map : null;
    if (cover || coverUrl) {
      return { coverUrl, isCover: cover || Boolean(coverUrl) };
    }
  }
  return { coverUrl: null, isCover: false };
}

/** Derive list/thumbnail visuals from a scene preset (pure, no DOM). */
export function sceneThumbModel(preset: ScenePreset): SceneThumbModel {
  const instances = resolveInstances(preset);
  const { coverUrl, isCover } = firstCoverMap(instances);
  return {
    title: preset.name,
    background: preset.background,
    primary: preset.palette.primary,
    emissive: preset.palette.emissive,
    coverUrl,
    bases: instances.map((entry) => entry.base),
    isCover,
  };
}

export const BASE_THUMB_LABEL: Record<BaseId, string> = {
  particles: 'P',
  mesh: 'M',
  tunnel: 'T',
  fractal: 'F',
  bars: 'B',
  rings: 'R',
  grid: 'G',
  fog: 'A',
};
