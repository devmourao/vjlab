import { useDirectorStore } from '../director/directorStore';
import { getPreset, PRESETS, resolveInstances, type BaseInstance } from './presets';
import { SceneInstances } from './SceneInstances';

// The map belongs to the instance declaration (editor/builder image
// param) — there is no global texture path anymore.
function instanceMapUrl(instance: BaseInstance): string | null {
  const declared = instance.params?.['map'];
  if (typeof declared === 'string' && declared.length > 0) return declared;
  return null;
}

export function SceneHost() {
  const activePresetId = useDirectorStore((s) => s.activePresetId);
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
        return instanceMapUrl(inst);
      }}
    />
  );
}
