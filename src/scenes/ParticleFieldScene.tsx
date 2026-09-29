import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
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
  const seeds = useMemo(
    () =>
      Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
        radius: 2.2 + ((i * 37) % 100) / 100 * 3.4,
        angle: ((i * 137.5) % 360) * (Math.PI / 180),
        height: (((i * 53) % 100) / 100 - 0.5) * 5,
        speed: 0.15 + (((i * 29) % 100) / 100) * 0.5,
      })),
    [],
  );
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(({ clock }, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const { bass, mids, treble } = readBands();
    liveRefs.boost = decayBurst(liveRefs.boost, delta);
    const time = clock.elapsedTime;
    const groupPulse =
      1 + bass * 0.35 * gain + liveRefs.boost * BASE_CAPABILITIES.particles.burst.peak;
    const size = particleScale(treble);

    for (let i = 0; i < PARTICLE_COUNT; i += 1) {
      const s = seeds[i];
      const angle = s.angle + time * s.speed * speed * (0.4 + mids);
      dummy.position.set(
        Math.cos(angle) * s.radius * groupPulse,
        s.height + Math.sin(time * 1.5 + i) * 0.35 * (0.3 + mids),
        Math.sin(angle) * s.radius * groupPulse,
      );
      dummy.scale.setScalar(size * (0.6 + 0.4 * Math.sin(time * 2 + i * 1.7)));
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, PARTICLE_COUNT]}
      frustumCulled={false}
    >
      <sphereGeometry args={[0.06, 8, 8]} />
      <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={1.2} />
    </instancedMesh>
  );
}
