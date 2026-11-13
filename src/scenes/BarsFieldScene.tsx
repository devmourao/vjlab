import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { readBands } from '../audio/audioBus';
import { liveRefs } from '../director/directorStore';
import { BASE_CAPABILITIES } from './bases';
import { decayBurst } from './sceneMath';

const BAR_COUNT = 32;

/**
 * Form base: classic spectrum bars — bass left, treble right.
 * Layers cleanly under covers/tunnels for Winamp-style stacks.
 */
export function BarsFieldScene({
  color = '#fbbf24',
  emissive = '#f59e0b',
  gain = 1,
  speed = 1,
}: {
  color?: string;
  emissive?: string;
  gain?: number;
  speed?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const heights = useRef(new Float32Array(BAR_COUNT));
  const meshes = useRef<(THREE.Mesh | null)[]>(
    Array.from({ length: BAR_COUNT }, () => null),
  );
  const materials = useRef<(THREE.MeshStandardMaterial | null)[]>(
    Array.from({ length: BAR_COUNT }, () => null),
  );

  const layout = useMemo(() => {
    const span = 5.2;
    const step = span / (BAR_COUNT - 1);
    return Array.from({ length: BAR_COUNT }, (_, i) => ({
      x: -span / 2 + i * step,
      band: i < BAR_COUNT / 3 ? 0 : i < (2 * BAR_COUNT) / 3 ? 1 : 2,
      phase: (i / BAR_COUNT) * Math.PI * 2,
    }));
  }, []);

  useFrame(({ clock }, delta) => {
    const group = groupRef.current;
    if (!group) return;
    const { bass, mids, treble } = readBands();
    liveRefs.boost = decayBurst(liveRefs.boost, delta);
    const time = clock.elapsedTime * speed;
    const burst = liveRefs.boost * BASE_CAPABILITIES.bars.burst.peak;

    for (let i = 0; i < BAR_COUNT; i += 1) {
      const slot = layout[i];
      const drive =
        slot.band === 0 ? bass : slot.band === 1 ? mids : treble;
      const wave = 0.35 + 0.65 * Math.abs(Math.sin(time * 1.8 + slot.phase));
      const target =
        (0.2 + drive * 2.4 * gain + burst * 0.55) * wave;
      heights.current[i] += (target - heights.current[i]) * Math.min(1, delta * 14);

      const mesh = meshes.current[i];
      if (!mesh) continue;
      const h = Math.max(0.08, heights.current[i]);
      mesh.scale.set(1, h, 1);
      mesh.position.set(slot.x, h * 0.5 - 1.1, 0);

      const mat = materials.current[i];
      if (mat) {
        mat.emissiveIntensity = 0.55 + drive * 1.2 + burst * 0.4;
      }
    }

    group.rotation.y = Math.sin(time * 0.25) * 0.08;
  });

  return (
    <group ref={groupRef}>
      {layout.map((slot, i) => (
        <mesh
          key={slot.x}
          ref={(node) => {
            meshes.current[i] = node;
          }}
          position={[slot.x, -1.1, 0]}
        >
          <boxGeometry args={[0.12, 1, 0.12]} />
          <meshStandardMaterial
            ref={(node) => {
              materials.current[i] = node;
            }}
            color={color}
            emissive={emissive}
            emissiveIntensity={0.7}
            roughness={0.35}
            metalness={0.2}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}
