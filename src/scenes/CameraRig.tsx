import { useFrame } from '@react-three/fiber';
import { liveRefs, useDirectorStore } from '../director/directorStore';
import { clampZoom, zoomRadius } from '../director/fx';
import { CAMERA_POSITION } from '../stageConfig';

const BASE_RADIUS = CAMERA_POSITION[2];

export function CameraRig() {
  useFrame(({ camera }, delta) => {
    const target = useDirectorStore.getState().zoomTarget;
    const safeDelta = Math.max(0, Math.min(0.1, delta));
    const t = 1 - Math.exp(-6 * safeDelta);
    liveRefs.zoom = clampZoom(liveRefs.zoom + (target - liveRefs.zoom) * t);

    const radius = zoomRadius(BASE_RADIUS, liveRefs.zoom);
    const az = liveRefs.azimuth;
    const el = liveRefs.elevation;
    camera.position.set(
      radius * Math.sin(az) * Math.cos(el),
      radius * Math.sin(el),
      radius * Math.cos(az) * Math.cos(el),
    );
    camera.lookAt(0, 0, 0);
    camera.rotateZ(liveRefs.roll);
  });
  return null;
}
