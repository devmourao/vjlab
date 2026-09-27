import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { readBands } from '../audio/audioBus';
import { liveRefs, useDirectorStore } from '../director/directorStore';
import { BASE_CAPABILITIES } from './bases';
import { decayBurst } from './sceneMath';

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  varying vec2 vUv;
  uniform float time;
  uniform float morphPhase;
  uniform float zoom;
  uniform float bass;
  uniform float mids;
  uniform float treble;
  uniform float boost;
  uniform float segsOverride;
  uniform float rotOffset;
  uniform float innerScale;
  uniform vec3 color1;
  uniform vec3 color2;

  vec3 paletteFlow(float t) {
    return mix(color1, color2, smoothstep(0.0, 1.0, t + sin(time * 0.07) * 0.1));
  }

  void main() {
    vec2 uv = vUv * 2.0 - 1.0;
    uv.x *= 1.78;
    float z = 1.0 / zoom;
    vec2 p = uv * z * 1.35;

    // Whole-image clock rotation: manual Q/W + idle spin + audio nudge.
    // Rotating p (not just kp) moves mandala + ball + rays together.
    float totalRot = rotOffset + time * 0.25 + mids * 0.4 + boost * 0.8;
    float cr = cos(totalRot);
    float sr = sin(totalRot);
    p = vec2(p.x * cr - p.y * sr, p.x * sr + p.y * cr);

    // Living morph: manual shape as base + continuous wobble + audio.
    // Keeps Arrows identity (10/8/6/5/12) but never freezes.
    float baseSegs = segsOverride > 0.5 ? segsOverride : 10.0;
    float wobble = sin(morphPhase * 0.8) * 1.2 + bass * 0.9 + boost * 1.0;
    float segs = max(3.0, baseSegs + wobble);
    float angle = atan(p.y, p.x);
    float radius = length(p);
    angle = mod(angle, 6.28318 / segs);
    angle = abs(angle - 3.14159 / segs);
    vec2 kp = vec2(cos(angle), sin(angle)) * radius;

    // HD mandala 3 layers with radial color flow and travelling dots — stronger bass
    float outer = 0.0;
    float inner = 0.0;
    float dots = 0.0;
    float innerDyn = innerScale + sin(time * 0.6) * 0.08 + bass * 0.15 + boost * 0.2;
    float lineW = 0.008 + bass * 0.006 + boost * 0.008;
    for(int i=0; i<10; i++) {
      float a = float(i) / 10.0 * 6.28318;
      vec2 dir = vec2(cos(a), sin(a));
      float d1 = abs(dot(kp, dir) - 0.42 / zoom);
      outer += smoothstep(lineW, 0.0, d1) * (1.0 + bass * 0.9 + boost * 0.6);
      vec2 kp2 = kp * innerDyn;
      float d2 = abs(dot(kp2, dir) - 0.42 / zoom);
      inner += smoothstep(lineW, 0.0, d2) * (0.65 + mids * 0.3);
      float travel = sin(time * 1.2 + float(i) * 0.6) * 0.08 * (1.0 + treble * 0.8);
      vec2 tip = dir * (0.42 / zoom + travel);
      float dDot = length(kp - tip);
      dots += smoothstep(0.022, 0.0, dDot) * (0.9 + treble * 0.4 + boost * 0.5);
    }

    // Radial color flow center->border
    float radialT = smoothstep(0.0, 0.7, radius * 1.2);
    vec3 flowCol = paletteFlow(radialT + time * 0.02 * (0.5 + treble * 0.5));
    float brightness = 0.95 + boost * 1.2;
    vec3 outerCol = flowCol * outer * brightness;
    vec3 innerCol = flowCol * inner * brightness * 0.9;
    vec3 dotCol = color2 * dots * (0.9 + boost * 1.0);
    float filigree = smoothstep(0.006, 0.0, abs(fract(angle * 3.14159) - 0.5) * radius * 0.45);
    vec3 col = outerCol + innerCol + dotCol + filigree * color1 * 0.12;
    col += pow(outer + inner, 1.8) * color1 * 0.12;

    // Central ball with propeller rays — color inside->outside
    // Ball breathes idle + pops on bass/boost so audio is visible.
    float ballR = 0.14 + bass * 0.05 + boost * 0.08 + sin(time * 0.8) * 0.01;
    float ball = smoothstep(ballR, 0.0, length(p));
    float rayAngle = atan(p.y, p.x) + time * (0.6 + bass * 0.4 + boost * 0.6);
    float ray = step(0.97, cos(rayAngle * 10.0)) * smoothstep(0.6, 0.1, length(p)) * (0.7 + bass * 0.3);
    // Inside->outside gradient for rays: center magenta -> border cyan
    vec3 rayCol = mix(color1, color2, smoothstep(0.0, 0.6, length(p) * 1.5));
    col += ball * color1 * 0.35;
    col += ray * rayCol * 1.2;

    gl_FragColor = vec4(col, 1.0);
  }
`;

export function FractalScene({
  color = '#ff7aff',
  emissive = '#00ffff',
  gain = 1,
  speed = 1,
}: {
  color?: string;
  emissive?: string;
  gain?: number;
  speed?: number;
}) {
  const liteOn = useDirectorStore((s) => s.liteOn);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      time: { value: 0 },
      morphPhase: { value: 0 },
      zoom: { value: 1 },
      bass: { value: 0 },
      mids: { value: 0 },
      treble: { value: 0 },
      boost: { value: 0 },
      segsOverride: { value: 0 },
      rotOffset: { value: 0 },
      innerScale: { value: 1.9 },
      color1: { value: new THREE.Color(color) },
      color2: { value: new THREE.Color(emissive) },
    }),
    // Palette remounts via key in host
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useFrame(({ clock }, delta) => {
    const { bass, mids, treble } = readBands();
    liveRefs.boost = decayBurst(liveRefs.boost, delta);
    if (!materialRef.current) return;
    const u = materialRef.current.uniforms;
    const smoothBass = THREE.MathUtils.lerp(u.bass.value, bass, 0.18);
    // Idle base 0.35 keeps metamorphosis alive with no audio; audio + boost accelerate.
    const morphSpeed =
      0.35 +
      smoothBass * 0.6 +
      mids * 0.3 +
      liveRefs.boost * BASE_CAPABILITIES.fractal.burst.peak;
    u.morphPhase.value += delta * morphSpeed * speed;
    u.time.value = clock.elapsedTime * speed * 0.6;
    const targetZoom = 1 + Math.sin(clock.elapsedTime * 0.07) * 0.04 + liveRefs.boost * 0.9;
    u.zoom.value = THREE.MathUtils.lerp(u.zoom.value, targetZoom, 0.05);
    u.bass.value = smoothBass;
    u.mids.value = THREE.MathUtils.lerp(u.mids.value, mids, 0.18);
    u.treble.value = THREE.MathUtils.lerp(u.treble.value, treble, 0.18);
    u.boost.value = liveRefs.boost;
    const state = useDirectorStore.getState();
    if (state.activePresetId === 5) {
      const shapes = [10, 8, 6, 5, 12];
      u.segsOverride.value = shapes[state.fractalShape % shapes.length];
      u.rotOffset.value = state.fractalZ;
      u.innerScale.value = state.fractalInner;
    } else {
      u.segsOverride.value = 0;
      u.rotOffset.value = 0;
      u.innerScale.value = 1.9;
    }
    void gain;
    void liteOn;
  });

  return (
    <mesh scale={[1.9, 1.1, 1]}>
      <planeGeometry args={[16, 9]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}
