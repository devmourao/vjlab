import { useFrame } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { readBands } from '../audio/audioBus';
import { liveRefs } from '../director/directorStore';
import { BASE_CAPABILITIES } from './bases';
import { PARTICLE_COUNT, decayBurst, particleScale } from './sceneMath';

export function ParticleFieldScene({
  color = '#7dd3fc',
  emissive = '#0ea5e9',
  gain = 1,
  speed = 1,
}: {
  color?: string;
  emissive?: string;
  gain?: number;
  speed?: number;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const primary = useMemo(() => new THREE.Color(color), [color]);
  const glow = useMemo(() => new THREE.Color(emissive), [emissive]);
  const scratch = useMemo(() => new THREE.Color(), []);
  const seeds = useMemo(
    () =>
      Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
        radius: 2.0 + ((i * 37) % 100) / 100 * 3.8,
        angle: ((i * 137.5) % 360) * (Math.PI / 180),
        height: (((i * 53) % 100) / 100 - 0.5) * 5.4,
        speed: 0.12 + (((i * 29) % 100) / 100) * 0.55,
        phase: ((i * 19) % 100) / 100 * Math.PI * 2,
        band: i % 3,
      })),
    [],
  );
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    // Enable per-instance tint once; colors update every frame from audio.
    if (!mesh.instanceColor) {
      mesh.instanceColor = new THREE.InstancedBufferAttribute(
        new Float32Array(PARTICLE_COUNT * 3),
        3,
      );
    }
  }, []);

  useFrame(({ clock }, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const { bass, mids, treble } = readBands();
    liveRefs.boost = decayBurst(liveRefs.boost, delta);
    const time = clock.elapsedTime;
    const groupPulse =
      1 + bass * 0.42 * gain + liveRefs.boost * BASE_CAPABILITIES.particles.burst.peak;
    const size = particleScale(treble);
    const swirl = 0.4 + mids * 1.15;

    for (let i = 0; i < PARTICLE_COUNT; i += 1) {
      const s = seeds[i];
      const bandDrive =
        s.band === 0 ? bass : s.band === 1 ? mids : treble;
      const angle = s.angle + time * s.speed * speed * swirl;
      const breathe =
        Math.sin(time * 1.35 + s.phase) * 0.42 * (0.35 + mids + bandDrive * 0.5);
      const radialKick = 1 + bandDrive * 0.18 * gain + liveRefs.boost * 0.08;
      dummy.position.set(
        Math.cos(angle) * s.radius * groupPulse * radialKick,
        s.height + breathe + Math.sin(time * 0.55 + s.phase) * bass * 0.55,
        Math.sin(angle) * s.radius * groupPulse * radialKick,
      );
      const pulseScale =
        size *
        (0.55 + 0.45 * Math.sin(time * 2.1 + s.phase)) *
        (0.85 + bandDrive * 0.55 + liveRefs.boost * 0.25);
      dummy.scale.setScalar(pulseScale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);

      scratch.copy(primary).lerp(glow, 0.25 + bandDrive * 0.55 + bass * 0.2);
      mesh.setColorAt(i, scratch);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, PARTICLE_COUNT]}
      frustumCulled={false}
    >
      <sphereGeometry args={[0.055, 10, 10]} />
      <meshStandardMaterial
        color={color}
        emissive={emissive}
        emissiveIntensity={2.1}
        roughness={0.28}
        metalness={0.2}
        transparent
        opacity={0.95}
        toneMapped={false}
        vertexColors
      />
    </instancedMesh>
  );
}
