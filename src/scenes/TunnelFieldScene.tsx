import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { readBands } from '../audio/audioBus';
import { useDirectorStore, liveRefs } from '../director/directorStore';
import { BASE_CAPABILITIES } from './bases';
import { RING_COUNT, RING_SPACING, decayBurst, wrapRingZ } from './sceneMath';

export function TunnelFieldScene({
  color = '#22d3ee',
  emissive = '#0e7490',
  gain = 1,
  speed = 1,
}: {
  color?: string;
  emissive?: string;
  gain?: number;
  speed?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color,
        emissive,
        emissiveIntensity: 1.4,
      }),
    // Palette applies on preset switch (remount via key in host).
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const offsets = useMemo(
    () => Array.from({ length: RING_COUNT }, (_, i) => -i * RING_SPACING),
    [],
  );

  useFrame(({ clock }, delta) => {
    const group = groupRef.current;
    if (!group) return;
    const { bass, mids, treble } = readBands();
    liveRefs.boost = decayBurst(liveRefs.boost, delta);
    const time = clock.elapsedTime;
    const speedBase = (2 + mids * 7) * speed;
    const span = RING_COUNT * RING_SPACING;
    void delta;

    group.children.forEach((ring, i) => {
      // Each ring may be a group (doubleTri) or mesh
      const target = ring as THREE.Group;
      // Handle doubleTri: ring is a group with two meshes, update its position
      target.position.z = wrapRingZ(offsets[i] + ((time * speedBase) % span));
    });

    group.scale.setScalar(
      1 + bass * 0.3 * gain + liveRefs.boost * BASE_CAPABILITIES.tunnel.burst.peak,
    );
    // Standard rotation on z for Tri (visible), y for Hyper
    const activeId = useDirectorStore.getState().activePresetId;
    const isTriMode = activeId === 3;
    if (isTriMode) group.rotation.z += delta * 0.4 * (0.5 + mids);
    else group.rotation.y += delta * 0.15 * (0.5 + mids);
    material.color.setHSL((0.55 + treble * 0.45 + time * 0.02) % 1, 0.9, 0.6);
    material.emissive.setHSL((0.55 + treble * 0.45) % 1, 0.9, 0.35);
  });

  const activePresetId = useDirectorStore((s) => s.activePresetId);
  const isTri = activePresetId === 3;

  return (
    <group ref={groupRef}>
      {offsets.map((z, i) =>
        isTri ? (
          <group key={i} position={[0, 0, z]}>
            <mesh material={material} rotation={[0, 0, 0]}>
              <torusGeometry args={[2.8, 0.09, 8, 3]} />
            </mesh>
            <mesh material={material} rotation={[0, 0, Math.PI]}>
              <torusGeometry args={[2.8, 0.09, 8, 3]} />
            </mesh>
          </group>
        ) : (
          <mesh key={i} position={[0, 0, z]} material={material}>
            <torusGeometry args={[2.6, 0.045, 8, 64]} />
          </mesh>
        ),
      )}
    </group>
  );
}
