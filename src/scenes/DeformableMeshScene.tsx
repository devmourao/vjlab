import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { readBands } from '../audio/audioBus';
import { liveRefs } from '../director/directorStore';
import { BASE_CAPABILITIES } from './bases';
import { decayBurst, meshDisplacement } from './sceneMath';

const COVER_SIZE = 2.7;
const COVER_FRAME = 2.95;

/**
 * Form base: deformable wireframe sphere, or album-cover plate when
 * `coverMode` is on (DJ Cover template). Cover keeps the art readable —
 * pulse/scale only, no vertex warp.
 */
export function DeformableMeshScene({
  color = '#f0abfc',
  emissive = '#a21caf',
  gain = 1,
  mapUrl = null,
  coverMode = false,
}: {
  color?: string;
  emissive?: string;
  gain?: number;
  mapUrl?: string | null;
  coverMode?: boolean;
}) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const frameMatRef = useRef<THREE.MeshStandardMaterial>(null);

  useEffect(() => {
    let cancelled = false;

    if (!mapUrl) {
      setTexture((previous) => {
        previous?.dispose();
        return null;
      });
      return;
    }

    const applyTexture = (loaded: THREE.Texture) => {
      if (cancelled) {
        loaded.dispose();
        return;
      }
      loaded.colorSpace = THREE.SRGBColorSpace;
      loaded.anisotropy = 8;
      loaded.needsUpdate = true;
      setTexture((previous) => {
        previous?.dispose();
        return loaded;
      });
    };

    const isRemote = /^https?:/i.test(mapUrl);
    const loader = new THREE.TextureLoader();
    // crossOrigin on data: / blob: URLs can make the decode fail.
    if (isRemote) loader.setCrossOrigin('anonymous');
    loader.load(
      mapUrl,
      applyTexture,
      undefined,
      (error) => {
        if (cancelled) return;
        console.error('[texture] failed to load image', error);
        const image = new Image();
        if (isRemote) image.crossOrigin = 'anonymous';
        image.onload = () => {
          if (cancelled) return;
          applyTexture(new THREE.Texture(image));
        };
        image.onerror = () => {
          if (cancelled) return;
          setTexture((previous) => {
            previous?.dispose();
            return null;
          });
        };
        image.src = mapUrl;
      },
    );
    return () => {
      cancelled = true;
    };
  }, [mapUrl]);

  const { base, normals } = useMemo(() => {
    const geometry = new THREE.SphereGeometry(1.2, 48, 48);
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
    const { bass, mids, treble } = readBands();
    liveRefs.boost = decayBurst(liveRefs.boost, delta);
    const time = clock.elapsedTime;

    if (coverMode) {
      const group = groupRef.current;
      if (!group) return;
      const pulse =
        1 +
        bass * 0.12 * gain +
        liveRefs.boost * BASE_CAPABILITIES.mesh.burst.peak * 0.55;
      group.scale.setScalar(pulse);
      group.rotation.y = Math.sin(time * 0.35) * 0.18 + mids * 0.08;
      group.rotation.x = Math.sin(time * 0.22) * 0.06 + bass * 0.04;
      if (frameMatRef.current) {
        frameMatRef.current.emissiveIntensity =
          0.55 + bass * 1.4 + liveRefs.boost * 0.9 + treble * 0.25;
      }
      return;
    }

    const mesh = meshRef.current;
    if (!mesh) return;
    const geometry = mesh.geometry as THREE.BufferGeometry;
    const position = geometry.attributes.position as THREE.BufferAttribute;

    for (let i = 0; i < position.count; i += 1) {
      const x = base[i * 3];
      const y = base[i * 3 + 1];
      const z = base[i * 3 + 2];
      const offset =
        meshDisplacement(bass, mids, x, y, z, time) * gain +
        liveRefs.boost * BASE_CAPABILITIES.mesh.burst.peak;
      position.setXYZ(
        i,
        x + normals[i * 3] * offset,
        y + normals[i * 3 + 1] * offset,
        z + normals[i * 3 + 2] * offset,
      );
    }
    position.needsUpdate = true;
    geometry.computeVertexNormals();

    mesh.rotation.y += delta * (0.12 + mids * 0.35);
    mesh.rotation.x = Math.sin(time * 0.35) * 0.08 + bass * 0.06;
    if (materialRef.current) {
      materialRef.current.emissiveIntensity =
        0.75 + bass * 1.15 + liveRefs.boost * 0.7 + treble * 0.25;
    }
  });

  if (coverMode) {
    const hasArt = Boolean(mapUrl && texture);
    return (
      <group ref={groupRef}>
        {/* Soft back plate / frame glow */}
        <mesh position={[0, 0, -0.04]}>
          <planeGeometry args={[COVER_FRAME, COVER_FRAME]} />
          <meshStandardMaterial
            ref={frameMatRef}
            color={color}
            emissive={emissive}
            emissiveIntensity={1.35}
            roughness={0.35}
            metalness={0.25}
            toneMapped={false}
          />
        </mesh>
        {/* Album face — remount when the map fingerprint changes */}
        <mesh
          key={
            mapUrl
              ? `${mapUrl.length}:${mapUrl.slice(0, 16)}:${mapUrl.slice(-16)}`
              : 'cover-empty'
          }
          position={[0, 0, 0.02]}
        >
          <planeGeometry args={[COVER_SIZE, COVER_SIZE]} />
          {hasArt ? (
            <meshBasicMaterial map={texture} toneMapped={false} />
          ) : (
            <meshStandardMaterial
              color={color}
              emissive={emissive}
              emissiveIntensity={0.95}
              roughness={0.45}
              metalness={0.12}
              toneMapped={false}
            />
          )}
        </mesh>
      </group>
    );
  }

  return (
    <mesh ref={meshRef} key={mapUrl ? (texture ? 'textured' : 'loading') : 'flat'}>
      <sphereGeometry args={[1.2, 48, 48]} />
      {mapUrl && texture ? (
        <meshBasicMaterial map={texture} toneMapped={false} />
      ) : (
        <meshStandardMaterial
          ref={materialRef}
          color={color}
          emissive={emissive}
          emissiveIntensity={0.85}
          wireframe
          toneMapped={false}
        />
      )}
    </mesh>
  );
}
