import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { readBands } from '../audio/audioBus';
import { liveRefs, useDirectorStore } from '../director/directorStore';
import { getPreset, PRESETS } from './presets';

/**
 * Shared stage depth and light pulse. Fog skips fractal presets so the
 * full-screen shader plane stays crisp; lights still breathe with audio.
 */
export function StageAtmosphere() {
  const keyLight = useRef<THREE.PointLight>(null);
  const rimLight = useRef<THREE.PointLight>(null);
  const fillLight = useRef<THREE.PointLight>(null);
  const activePresetId = useDirectorStore((s) => s.activePresetId);
  const customPresets = useDirectorStore((s) => s.customPresets);
  const preset =
    [...PRESETS, ...customPresets].find((entry) => entry.id === activePresetId) ??
    getPreset(activePresetId);
  const isFractal = preset.scene === 3;

  useFrame(({ clock }) => {
    const { bass, mids, treble } = readBands();
    const t = clock.elapsedTime;
    const breath = 0.55 + Math.sin(t * 0.7) * 0.08;
    const boost = liveRefs.boost;
    if (keyLight.current) {
      keyLight.current.intensity = breath + bass * 1.8 + boost * 1.2;
      keyLight.current.position.x = 3.2 + Math.sin(t * 0.4) * 0.6;
      keyLight.current.position.y = 1.8 + mids * 0.8;
    }
    if (rimLight.current) {
      rimLight.current.intensity = 0.35 + treble * 1.4 + bass * 0.4 + boost * 0.5;
      rimLight.current.position.x = -3.4 - Math.cos(t * 0.35) * 0.5;
    }
    if (fillLight.current) {
      fillLight.current.intensity = 0.25 + mids * 0.9;
    }
  });

  return (
    <>
      {!isFractal && <fog attach="fog" args={[preset.background, 10, 32]} />}
      <pointLight
        ref={keyLight}
        position={[3.2, 1.8, 4]}
        color={preset.palette.primary}
        intensity={0.7}
        distance={28}
        decay={2}
      />
      <pointLight
        ref={rimLight}
        position={[-3.4, 0.6, -2]}
        color={preset.palette.emissive}
        intensity={0.45}
        distance={24}
        decay={2}
      />
      <pointLight
        ref={fillLight}
        position={[0, -2.4, 2]}
        color="#ffffff"
        intensity={0.3}
        distance={18}
        decay={2}
      />
    </>
  );
}
