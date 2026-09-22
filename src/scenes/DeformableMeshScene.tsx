import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { readBands } from '../audio/audioBus';
import { liveRefs, useDirectorStore } from '../director/directorStore';
import { decayBurst, meshDisplacement } from './sceneMath';

export function DeformableMeshScene({
  color = '#f0abfc',
  emissive = '#a21caf',
  gain = 1,
  mapUrl = null,
}: {
  color?: string;
  emissive?: string;
  gain?: number;
  mapUrl?: string | null;
}) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  // Textured mode is unlit (tone mapping off) so uploaded images keep
  // their original colors. Flat mode keeps the lit wireframe look.
  // The map belongs to this instance only — never to global state.
  useEffect(() => {
    if (!mapUrl) return;
    const store = useDirectorStore.getState();
    const loader = new THREE.TextureLoader();
    let cancelled = false;
    loader.load(
      mapUrl,
      (loaded) => {
        if (cancelled) return;
        loaded.colorSpace = THREE.SRGBColorSpace;
        console.info(`[texture] loaded ${loaded.image.width}x${loaded.image.height}`);
        setTexture((previous) => {
          previous?.dispose();
          return loaded;
        });
        store.setMeshTextureStatus('ready');
      },
      undefined,
      (error) => {
        if (cancelled) return;
        console.error('[texture] failed to load image', error);
        setTexture(null);
        store.setMeshTextureStatus('error');
      },
    );
    return () => {
      cancelled = true;
    };
  }, [mapUrl]);
  const meshRef = useRef<THREE.Mesh>(null);
  const { base, normals } = useMemo(() => {
    const geometry = new THREE.SphereGeometry(1.2, 40, 40);
    const positions = geometry.attributes.position.array.slice();
    const directions = new Float32Array(positions.length);
    const v = new THREE.Vector3();
    for (let i = 0; i < positions.length; i += 3) {
      v.set(positions[i], positions[i + 1], positions[i + 2]).normalize();
      directions[i] = v.x;
      directions[i + 1] = v.y;
      directions[i + 2] = v.z;
    }
    geometry.dispose();
    return { base: positions, normals: directions };
  }, []);

  useFrame(({ clock }, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const geometry = mesh.geometry as THREE.BufferGeometry;
    const position = geometry.attributes.position as THREE.BufferAttribute;
    const { bass, mids } = readBands();
    liveRefs.boost = decayBurst(liveRefs.boost, delta);
    const time = clock.elapsedTime;

    for (let i = 0; i < position.count; i += 1) {
      const x = base[i * 3];
      const y = base[i * 3 + 1];
      const z = base[i * 3 + 2];
      const offset =
        meshDisplacement(bass, mids, x, y, z, time) * gain +
        liveRefs.boost * 0.3;
      position.setXYZ(
        i,
        x + normals[i * 3] * offset,
        y + normals[i * 3 + 1] * offset,
        z + normals[i * 3 + 2] * offset,
      );
    }
    position.needsUpdate = true;
    geometry.computeVertexNormals();
  });

  return (
    <mesh ref={meshRef} key={mapUrl ? (texture ? 'textured' : 'loading') : 'flat'}>
      <sphereGeometry args={[1.2, 40, 40]} />
      {mapUrl && texture ? (
        <meshBasicMaterial map={texture} toneMapped={false} />
      ) : (
        <meshStandardMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={0.7}
          wireframe
        />
      )}
    </mesh>
  );
}
