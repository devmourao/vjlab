export const PARTICLE_COUNT = 320;

export const RING_COUNT = 24;

export const RING_SPACING = 1.1;

export const SCENE_NAMES = ['Particles', 'Mesh', 'Tunnel'] as const;

export function particleScale(treble: number): number {
  const t = Math.max(0, Math.min(1, treble));
  return 0.35 + t * 1.1;
}

export function meshDisplacement(
  bass: number,
  mids: number,
  x: number,
  y: number,
  z: number,
  time: number,
): number {
  const b = Math.max(0, Math.min(1, bass));
  const m = Math.max(0, Math.min(1, mids));
  return (
    b * 0.35 * Math.sin(time * 3 + x * 4 + y * 4) +
    m * 0.1 * Math.sin(time * 5 + z * 6)
  );
}

export function wrapRingZ(z: number): number {
  const span = RING_COUNT * RING_SPACING;
  const farZ = -(RING_COUNT * RING_SPACING);
  let wrapped = z % span;
  if (wrapped > 0) wrapped -= span;
  if (wrapped < farZ) wrapped += span;
  return wrapped;
}

export const BURST_DECAY_RATE = 3;

/** Frame-rate independent decay for the live burst impulse. */
export function decayBurst(value: number, delta: number): number {
  const safeDelta = Math.max(0, Math.min(0.1, delta));
  return value * Math.exp(-BURST_DECAY_RATE * safeDelta);
}
