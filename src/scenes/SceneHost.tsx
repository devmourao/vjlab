import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { liveRefs, useDirectorStore } from '../director/directorStore';
import { DeformableMeshScene } from './DeformableMeshScene';
import { FractalScene } from './FractalScene';
import { ParticleFieldScene } from './ParticleFieldScene';
import { TunnelFieldScene } from './TunnelFieldScene';
import { instanceKey } from './bases';
import { getPreset, resolveInstances, type BaseInstance } from './presets';

function ParallaxGroup({
  sensitivity,
  zoom,
  children,
}: {
  sensitivity: number;
  zoom?: number;
  children: React.ReactNode;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    const g = ref.current;
    if (!g) return;
    g.rotation.y = liveRefs.azimuth * sensitivity;
    g.rotation.x = liveRefs.elevation * sensitivity;
    if (zoom !== undefined) g.scale.setScalar(zoom);
  });
  if (zoom !== undefined) {
    return (
      <group ref={ref} scale={zoom}>
        {children}
      </group>
    );
  }
  return <group ref={ref}>{children}</group>;
}

function renderBase(
  instance: BaseInstance,
  preset: ReturnType<typeof getPreset>,
  mapUrl: string | null,
) {
  if (instance.base === 'mesh')
    return (
      <DeformableMeshScene
        color={preset.palette.primary}
        emissive={preset.palette.emissive}
        gain={preset.gain}
        mapUrl={mapUrl}
      />
    );
  if (instance.base === 'tunnel')
    return (
      <TunnelFieldScene
        color={preset.palette.primary}
        emissive={preset.palette.emissive}
        gain={preset.gain}
        speed={preset.speed}
      />
    );
  if (instance.base === 'fractal')
    return (
      <FractalScene
        color={preset.palette.primary}
        emissive={preset.palette.emissive}
        gain={preset.gain}
        speed={preset.speed}
      />
    );
  return (
    <ParticleFieldScene
      color={preset.palette.primary}
      emissive={preset.palette.emissive}
      gain={preset.gain}
      speed={preset.speed}
    />
  );
}

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
  const preset = getPreset(activePresetId);
  const instances = resolveInstances(preset);

  return (
    <group key={preset.id}>
      {instances.map((inst, idx) => {
        const sens =
          (inst.params?.['cameraSensitivity'] as number | undefined) ?? 1;
        const zoom = inst.params?.['zoom'] as number | undefined;
        return (
          <ParallaxGroup
            key={`${preset.id}-${inst.base}-${idx}`}
            sensitivity={sens}
            zoom={zoom}
          >
            {renderBase(
              inst,
              preset,
              inst.base === 'mesh'
                ? instanceMapUrl(preset.id, inst, idx, sessionMaps)
                : null,
            )}
          </ParallaxGroup>
        );
      })}
    </group>
  );
}
