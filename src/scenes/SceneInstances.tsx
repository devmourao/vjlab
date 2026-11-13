import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { liveRefs } from '../director/directorStore';
import { BarsFieldScene } from './BarsFieldScene';
import { DeformableMeshScene } from './DeformableMeshScene';
import { FogFieldScene } from './FogFieldScene';
import { FractalScene } from './FractalScene';
import { GridLedScene } from './GridLedScene';
import { ParticleFieldScene } from './ParticleFieldScene';
import { RingOrbitScene } from './RingOrbitScene';
import { TunnelFieldScene } from './TunnelFieldScene';
import type { BaseInstance, ScenePalette } from './presets';

/**
 * Per-piece transform host: camera follow, world pin, and self-spin are
 * independent — industry pattern (layer transform ≠ generator animation).
 */
function ParallaxGroup({
  sensitivity,
  zoom,
  position,
  rotation,
  spin,
  children,
}: {
  sensitivity: number;
  zoom?: number;
  position: [number, number, number];
  rotation: [number, number, number];
  spin: [number, number, number];
  children: React.ReactNode;
}) {
  const ref = useRef<THREE.Group>(null);
  const spinAccum = useRef([0, 0, 0]);
  useFrame((_, delta) => {
    const g = ref.current;
    if (!g) return;
    spinAccum.current[0] += spin[0] * delta;
    spinAccum.current[1] += spin[1] * delta;
    spinAccum.current[2] += spin[2] * delta;
    g.rotation.x =
      rotation[0] + spinAccum.current[0] + liveRefs.elevation * sensitivity;
    g.rotation.y =
      rotation[1] + spinAccum.current[1] + liveRefs.azimuth * sensitivity;
    g.rotation.z = rotation[2] + spinAccum.current[2];
    if (zoom !== undefined) g.scale.setScalar(zoom);
  });
  return (
    <group ref={ref} position={position} rotation={rotation} scale={zoom ?? 1}>
      {children}
    </group>
  );
}

function resolveColor(
  override: unknown,
  fallback: string,
): string {
  return typeof override === 'string' && /^#[0-9a-f]{6}$/i.test(override)
    ? override
    : fallback;
}

function renderBase(
  instance: BaseInstance,
  palette: ScenePalette,
  gain: number,
  speed: number,
  mapUrl: string | null,
) {
  const color = resolveColor(instance.params?.['primary'], palette.primary);
  const emissive = resolveColor(
    instance.params?.['emissive'],
    palette.emissive,
  );

  if (instance.base === 'mesh')
    return (
      <DeformableMeshScene
        color={color}
        emissive={emissive}
        gain={gain}
        mapUrl={mapUrl}
        coverMode={Number(instance.params?.['cover'] ?? 0) >= 0.5}
      />
    );
  if (instance.base === 'tunnel')
    return (
      <TunnelFieldScene
        color={color}
        emissive={emissive}
        gain={gain}
        speed={speed}
      />
    );
  if (instance.base === 'fractal')
    return (
      <FractalScene
        color={color}
        emissive={emissive}
        gain={gain}
        speed={speed}
        orientation={Number(instance.params?.['orientation'] ?? 0)}
      />
    );
  if (instance.base === 'bars')
    return (
      <BarsFieldScene
        color={color}
        emissive={emissive}
        gain={gain}
        speed={speed}
      />
    );
  if (instance.base === 'rings')
    return (
      <RingOrbitScene
        color={color}
        emissive={emissive}
        gain={gain}
        speed={speed}
      />
    );
  if (instance.base === 'grid')
    return (
      <GridLedScene
        color={color}
        emissive={emissive}
        gain={gain}
        speed={speed}
      />
    );
  if (instance.base === 'fog')
    return (
      <FogFieldScene
        color={color}
        emissive={emissive}
        gain={gain}
        speed={speed}
      />
    );
  return (
    <ParticleFieldScene
      color={color}
      emissive={emissive}
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
        // Pin in world = ignore camera only (animation/spin keep running).
        const pinned = Number(inst.params?.['lockMotion'] ?? 0) >= 0.5;
        const sens = pinned
          ? 0
          : ((inst.params?.['cameraSensitivity'] as number | undefined) ?? 1);
        const zoom = inst.params?.['zoom'] as number | undefined;
        const position: [number, number, number] = [
          Number(inst.params?.['posX'] ?? 0),
          Number(inst.params?.['posY'] ?? 0),
          Number(inst.params?.['posZ'] ?? 0),
        ];
        const rotation: [number, number, number] = [
          Number(inst.params?.['rotX'] ?? 0),
          Number(inst.params?.['rotY'] ?? 0),
          Number(inst.params?.['rotZ'] ?? 0),
        ];
        const spin: [number, number, number] = [
          Number(inst.params?.['spinX'] ?? 0),
          Number(inst.params?.['spinY'] ?? 0),
          Number(inst.params?.['spinZ'] ?? 0),
        ];
        const mapUrl =
          inst.base === 'mesh' ? (getMapUrl?.(inst.base, idx) ?? null) : null;
        const mapKey =
          typeof mapUrl === 'string'
            ? `${mapUrl.length}:${mapUrl.slice(0, 24)}:${mapUrl.slice(-24)}`
            : 'nomap';
        return (
          <ParallaxGroup
            key={`${groupKey}-${inst.base}-${idx}-${mapKey}`}
            sensitivity={sens}
            zoom={zoom}
            position={position}
            rotation={rotation}
            spin={spin}
          >
            {renderBase(inst, palette, gain, speed, mapUrl)}
          </ParallaxGroup>
        );
      })}
    </group>
  );
}
