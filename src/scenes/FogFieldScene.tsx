import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { readBands } from '../audio/audioBus';
import { liveRefs } from '../director/directorStore';
import { BASE_CAPABILITIES } from './bases';
import { decayBurst } from './sceneMath';

const SHEETS = 5;

/**
 * FX base: soft translucent sheets drifting on audio — atmosphere /
 * haze layer that sits behind forms without stealing focus.
 */
export function FogFieldScene({
  color = '#94a3b8',
  emissive = '#64748b',
  gain = 1,
  speed = 1,
}: {
  color?: string;
  emissive?: string;
  gain?: number;
  speed?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const mats = useRef<(THREE.MeshStandardMaterial | null)[]>(
    Array.from({ length: SHEETS }, () => null),
  );
  const primary = useMemo(() => new THREE.Color(color), [color]);
  const glow = useMemo(() => new THREE.Color(emissive), [emissive]);

  useFrame(({ clock }, delta) => {
    const group = groupRef.current;
    if (!group) return;
    const { bass, mids, treble } = readBands();
    liveRefs.boost = decayBurst(liveRefs.boost, delta);
    const time = clock.elapsedTime * speed;
    const burst = liveRefs.boost * BASE_CAPABILITIES.fog.burst.peak;

    group.children.forEach((child, i) => {
      const mesh = child as THREE.Mesh;
      const phase = i / SHEETS;
      mesh.position.x = Math.sin(time * 0.25 + phase * 4) * (0.4 + mids * 0.5);
      mesh.position.y = Math.cos(time * 0.2 + phase * 3) * 0.25 + bass * 0.15;
      mesh.rotation.z = Math.sin(time * 0.15 + phase) * 0.2;
      const mat = mats.current[i];
      if (mat) {
        mat.opacity = Math.min(
          0.55,
          0.12 + treble * 0.2 * gain + burst * 0.15 + bass * 0.08,
        );
        mat.emissiveIntensity = 0.35 + mids * 0.5 + burst * 0.3;
        mat.color.copy(primary);
        mat.emissive.copy(glow);
      }
    });
  });

  return (
    <group ref={groupRef}>
      {Array.from({ length: SHEETS }, (_, i) => (
        <mesh
          key={i}
          position={[0, (i - 2) * 0.35, -1.2 - i * 0.35]}
          scale={[5.5 - i * 0.3, 2.8 - i * 0.15, 1]}
        >
          <planeGeometry args={[1, 1]} />
          <meshStandardMaterial
            ref={(node) => {
              mats.current[i] = node;
            }}
            color={color}
            emissive={emissive}
            transparent
            opacity={0.18}
            depthWrite={false}
            toneMapped={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}
