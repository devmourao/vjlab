import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { readBands } from '../audio/audioBus';
import { liveRefs } from '../director/directorStore';
import { BASE_CAPABILITIES } from './bases';
import { decayBurst } from './sceneMath';

const DOT_COUNT = 48;

/**
 * Field base: orbiting ring of dots — pairs well under covers or
 * tunnels as a second motion layer without filling the frame.
 */
export function RingOrbitScene({
  color = '#a78bfa',
  emissive = '#7c3aed',
  gain = 1,
  speed = 1,
}: {
  color?: string;
  emissive?: string;
  gain?: number;
  speed?: number;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const primary = useMemo(() => new THREE.Color(color), [color]);
  const glow = useMemo(() => new THREE.Color(emissive), [emissive]);
  const scratch = useMemo(() => new THREE.Color(), []);

  useFrame(({ clock }, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const { bass, mids, treble } = readBands();
    liveRefs.boost = decayBurst(liveRefs.boost, delta);
    const time = clock.elapsedTime * speed;
    const radius = 1.6 + bass * 0.55 * gain + liveRefs.boost * 0.2;
    const tilt = 0.35 + mids * 0.4;

    if (!mesh.instanceColor) {
      mesh.instanceColor = new THREE.InstancedBufferAttribute(
        new Float32Array(DOT_COUNT * 3),
        3,
      );
    }

    for (let i = 0; i < DOT_COUNT; i += 1) {
      const t = (i / DOT_COUNT) * Math.PI * 2 + time * (0.55 + treble * 0.8);
      const wobble = Math.sin(time * 2.2 + i) * 0.12 * mids;
      dummy.position.set(
        Math.cos(t) * radius,
        Math.sin(t * 2) * tilt * 0.35 + wobble,
        Math.sin(t) * radius,
      );
      const s =
        0.08 +
        treble * 0.1 * gain +
        liveRefs.boost * BASE_CAPABILITIES.rings.burst.peak * 0.08;
      dummy.scale.setScalar(s);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      scratch.copy(primary).lerp(glow, 0.35 + treble * 0.45);
      mesh.setColorAt(i, scratch);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.rotation.x = tilt;
    mesh.rotation.z = Math.sin(time * 0.4) * 0.2;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, DOT_COUNT]}>
      <sphereGeometry args={[1, 10, 10]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  );
}
