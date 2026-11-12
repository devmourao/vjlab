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
        emissiveIntensity: 1.55,
        roughness: 0.28,
        metalness: 0.35,
        toneMapped: false,
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
    const speedBase = (2 + mids * 7.5 + bass * 1.2) * speed;
    const span = RING_COUNT * RING_SPACING;
    const isTriMode = useDirectorStore.getState().activePresetId === 3;

    group.children.forEach((ring, i) => {
      const target = ring as THREE.Object3D;
      const z = wrapRingZ(offsets[i] + ((time * speedBase) % span));
      target.position.z = z;
      // Traveling radius wave: rings swell as they approach the camera.
      const depth = THREE.MathUtils.clamp(-z / span, 0, 1);
      const wave =
        1 +
        bass * 0.22 * gain * (1 - depth) +
        Math.sin(time * 2.4 + i * 0.45) * 0.04 * (0.5 + treble) +
        liveRefs.boost * 0.12 * (1 - depth);
      target.scale.setScalar(wave);
    });

    group.scale.setScalar(
      1 + bass * 0.28 * gain + liveRefs.boost * BASE_CAPABILITIES.tunnel.burst.peak,
    );
    if (isTriMode) group.rotation.z += delta * 0.45 * (0.5 + mids);
    else group.rotation.y += delta * 0.18 * (0.5 + mids);

    const hue = (0.52 + treble * 0.4 + time * 0.025 + bass * 0.05) % 1;
    // Mute/unmute glow via HSL lightness — avoids assigning material fields
    // that trip react-hooks/immutability on memoized Three materials.
    material.color.setHSL(hue, 0.85, 0.55 + bass * 0.08 + liveRefs.boost * 0.05);
    material.emissive.setHSL(
      hue,
      0.9,
      0.28 + bass * 0.18 + liveRefs.boost * 0.12 + treble * 0.06,
    );
  });

  const activePresetId = useDirectorStore((s) => s.activePresetId);
  const isTri = activePresetId === 3;

  return (
    <group ref={groupRef}>
      {offsets.map((z, i) =>
        isTri ? (
          <group key={i} position={[0, 0, z]}>
            <mesh material={material} rotation={[0, 0, 0]}>
              <torusGeometry args={[2.8, 0.1, 10, 3]} />
            </mesh>
            <mesh material={material} rotation={[0, 0, Math.PI]}>
              <torusGeometry args={[2.8, 0.1, 10, 3]} />
            </mesh>
          </group>
        ) : (
          <mesh key={i} position={[0, 0, z]} material={material}>
            <torusGeometry args={[2.65, 0.055, 12, 72]} />
          </mesh>
        ),
      )}
    </group>
  );
}
