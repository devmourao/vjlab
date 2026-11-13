import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { readBands } from '../audio/audioBus';
import { liveRefs } from '../director/directorStore';
import { BASE_CAPABILITIES } from './bases';
import { decayBurst } from './sceneMath';

const COLS = 12;
const ROWS = 8;
const COUNT = COLS * ROWS;

/**
 * Form base: LED-style grid — classic club wall / floor piece that
 * stacks under covers or tunnels.
 */
export function GridLedScene({
  color = '#34d399',
  emissive = '#059669',
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
    const burst = liveRefs.boost * BASE_CAPABILITIES.grid.burst.peak;

    if (!mesh.instanceColor) {
      mesh.instanceColor = new THREE.InstancedBufferAttribute(
        new Float32Array(COUNT * 3),
        3,
      );
    }

    for (let i = 0; i < COUNT; i += 1) {
      const col = i % COLS;
      const row = Math.floor(i / COLS);
      const u = col / (COLS - 1);
      const v = row / (ROWS - 1);
      const band = u < 0.33 ? bass : u < 0.66 ? mids : treble;
      const wave = 0.55 + 0.45 * Math.sin(time * 2.2 + u * 6 + v * 4);
      const h = (band * 1.4 * gain + burst * 0.35) * wave;
      dummy.position.set((u - 0.5) * 4.2, (v - 0.5) * 2.6 + h * 0.15, 0);
      const s = 0.08 + band * 0.1 * gain + treble * 0.04;
      dummy.scale.setScalar(s);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      scratch.copy(primary).lerp(glow, band * 0.7 + burst * 0.2);
      mesh.setColorAt(i, scratch);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  );
}
