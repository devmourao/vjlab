import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { liveRefs } from '../director/directorStore';
import { DeformableMeshScene } from './DeformableMeshScene';
import { FractalScene } from './FractalScene';
import { ParticleFieldScene } from './ParticleFieldScene';
import { TunnelFieldScene } from './TunnelFieldScene';
import type { BaseInstance, ScenePalette } from './presets';

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
  palette: ScenePalette,
  gain: number,
  speed: number,
  mapUrl: string | null,
) {
  if (instance.base === 'mesh')
    return (
      <DeformableMeshScene
        color={palette.primary}
        emissive={palette.emissive}
        gain={gain}
        mapUrl={mapUrl}
      />
    );
  if (instance.base === 'tunnel')
    return (
      <TunnelFieldScene
        color={palette.primary}
        emissive={palette.emissive}
        gain={gain}
        speed={speed}
      />
    );
  if (instance.base === 'fractal')
    return (
      <FractalScene
        color={palette.primary}
        emissive={palette.emissive}
        gain={gain}
        speed={speed}
      />
    );
  return (
    <ParticleFieldScene
      color={palette.primary}
      emissive={palette.emissive}
      gain={gain}
      speed={speed}
    />
  );
}

export interface SceneInstancesProps {
  groupKey: string | number;
  instances: BaseInstance[];
  palette: ScenePalette;
  gain: number;
  speed: number;
  getMapUrl?: (base: BaseInstance['base'], index: number) => string | null;
}

/**
 * Shared instance renderer: the live stage and the builder preview mount
 * the same bases with the same contract. Read-only audio, no store writes.
 */
export function SceneInstances({
  groupKey,
  instances,
  palette,
  gain,
  speed,
  getMapUrl,
}: SceneInstancesProps) {
  return (
    <group key={groupKey}>
      {instances.map((inst, idx) => {
        const sens =
          (inst.params?.['cameraSensitivity'] as number | undefined) ?? 1;
        const zoom = inst.params?.['zoom'] as number | undefined;
        return (
          <ParallaxGroup
            key={`${groupKey}-${inst.base}-${idx}`}
            sensitivity={sens}
            zoom={zoom}
          >
            {renderBase(
              inst,
              palette,
              gain,
              speed,
              inst.base === 'mesh' ? (getMapUrl?.(inst.base, idx) ?? null) : null,
            )}
          </ParallaxGroup>
        );
      })}
    </group>
  );
}
