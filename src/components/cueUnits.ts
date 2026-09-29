/**
 * Compressive cue-unit height: grows with duration without going literal
 * (8 s ≈ 141 px, 35 s ≈ 174 px, capped at 248 px), so long cues read
 * taller while short ones never vanish.
 */
export function cueUnitHeight(durationSec: number): number {
  const height = 88 + 24 * Math.log(1 + Math.max(0, durationSec));
  return Math.min(248, Math.round(height));
}
