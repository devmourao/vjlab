import { useDirectorStore } from '../director/directorStore';
import { instanceKey } from './bases';
import { getPreset, PRESETS, resolveInstances, type BaseInstance } from './presets';
import { SceneInstances } from './SceneInstances';

function instanceMapUrl(
  presetId: number,
  instance: BaseInstance,
  index: number,
  sessionMaps: Record<string, string | null>,
): string | null {
  const declared = instance.params?.['map'];
  if (typeof declared === 'string' && declared.length > 0) return declared;
  return sessionMaps[instanceKey(presetId, instance.base, index)] ?? null;
}

export function SceneHost() {
  const activePresetId = useDirectorStore((s) => s.activePresetId);
  const sessionMaps = useDirectorStore((s) => s.instanceMaps);
  const customPresets = useDirectorStore((s) => s.customPresets);
  const preset =
    [...PRESETS, ...customPresets].find((entry) => entry.id === activePresetId) ??
    getPreset(activePresetId);
  const instances = resolveInstances(preset);

  return (
    <SceneInstances
      groupKey={preset.id}
      instances={instances}
      palette={preset.palette}
      gain={preset.gain}
      speed={preset.speed}
      getMapUrl={(_base, index) => {
        const inst = instances[index];
        if (!inst || inst.base !== 'mesh') return null;
        return instanceMapUrl(preset.id, inst, index, sessionMaps);
      }}
    />
  );
}
