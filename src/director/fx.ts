import type { ScenePalette } from '../scenes/presets';

export const ZOOM_MIN = 0.5;
export const ZOOM_MAX = 2.5;

export const ZOOM_STEP = 0.15;

export const MIX_STEP = 0.1;

export type FxSlot =
  | 'bloom'
  | 'vignette'
  | 'strobe'
  | 'master'
  | 'saturation'
  | 'contrast';

export const FX_SLOTS: FxSlot[] = [
  'saturation',
  'contrast',
  'bloom',
  'vignette',
  'strobe',
  'master',
];

export function clampMix(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

export function clampZoom(value: number): number {
  if (Number.isNaN(value)) return 1;
  return Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, value));
}

export const CONTRAST_MIN = -0.5;

export const CONTRAST_MAX = 0.5;

export const CONTRAST_DEFAULT = 0;

export const SATURATION_MAX = 0.6;

export const SATURATION_DEFAULT = 0;

export function clampSaturation(value: number): number {
  if (Number.isNaN(value)) return SATURATION_DEFAULT;
  return Math.max(0, Math.min(SATURATION_MAX, value));
}

export function clampContrast(value: number): number {
  if (Number.isNaN(value)) return CONTRAST_DEFAULT;
  return Math.max(CONTRAST_MIN, Math.min(CONTRAST_MAX, value));
}

export type StrobeMode = 'white' | 'black' | 'color';

export const STROBE_MODES: StrobeMode[] = ['white', 'black', 'color'];

export function nextStrobeMode(current: StrobeMode): StrobeMode {
  return STROBE_MODES[(STROBE_MODES.indexOf(current) + 1) % STROBE_MODES.length];
}

/** Forward steps from one strobe mode to another (radio without a setter). */
export function strobeStepsTo(current: StrobeMode, target: StrobeMode): number {
  const from = STROBE_MODES.indexOf(current);
  const to = STROBE_MODES.indexOf(target);
  if (from === -1 || to === -1) return 0;
  return (to - from + STROBE_MODES.length) % STROBE_MODES.length;
}

/** Effective amount of an effect after its own mix and the master fader. */
export function applyMix(base: number, mix: number, master: number): number {
  return base * clampMix(mix) * clampMix(master);
}

/** Camera distance for a zoom factor (zoom > 1 moves closer). */
export function zoomRadius(baseRadius: number, zoom: number): number {
  return baseRadius / clampZoom(zoom);
}

export function nextFxSlot(current: FxSlot): FxSlot {
  return FX_SLOTS[(FX_SLOTS.indexOf(current) + 1) % FX_SLOTS.length];
}

export const STROBE_MIN_HZ = 1;

export const STROBE_MAX_HZ = 12;

export const STROBE_DEFAULT_HZ = 4;

export function clampStrobeHz(value: number): number {
  if (Number.isNaN(value)) return STROBE_DEFAULT_HZ;
  return Math.max(STROBE_MIN_HZ, Math.min(STROBE_MAX_HZ, Math.round(value)));
}

/** Half-cycle interval for a toggle-based strobe at the given rate. */
export function strobeIntervalMs(rateHz: number): number {
  return 1000 / (clampStrobeHz(rateHz) * 2);
}

/** Relative luminance of a #rrggbb color per WCAG (0 for black, 1 for white). */
export function relativeLuminance(hex: string): number {
  const match = /^#([0-9a-fA-F]{6})$/.exec(hex.trim());
  if (!match) return Number.NaN;
  const channels = [0, 2, 4].map((offset) => {
    const srgb = parseInt(match[1].slice(offset, offset + 2), 16) / 255;
    return srgb <= 0.04045 ? srgb / 12.92 : Math.pow((srgb + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

/**
 * Primaries lighter than this veil saturated scenes white, so the flash
 * falls back to the deep emissive tone of the same palette.
 */
export const BEAT_FLASH_LUMINANCE_CUTOFF = 0.4;

/**
 * Flash color for the beat overlay. Light primaries resolve to the palette
 * emissive tone (a colored pulse instead of a white wash); dark primaries
 * and malformed values keep the legacy primary behavior.
 */
export function beatFlashColor(palette: ScenePalette): string {
  const luminance = relativeLuminance(palette.primary);
  if (Number.isNaN(luminance) || luminance <= BEAT_FLASH_LUMINANCE_CUTOFF) {
    return palette.primary;
  }
  return palette.emissive;
}

/**
 * Chromatic aberration offsets. OFF is a zero vector (a visual no-op), so
 * toggling swaps a live uniform instead of mounting a new composer pass
 * mid-performance.
 */
export const CHROMATIC_OFFSET_ON: [number, number] = [0.004, 0.002];

export const CHROMATIC_OFFSET_OFF: [number, number] = [0, 0];

/**
 * VHS glitch timing in seconds. Hoisted to module scope so the effect props
 * keep stable values across renders.
 */
export const GLITCH_DELAY: [number, number] = [1.5, 3.5];

export const GLITCH_DURATION: [number, number] = [0.2, 0.6];

export const GLITCH_STRENGTH: [number, number] = [0.2, 0.5];

/**
 * Slider bounds per effect slot. Contrast and saturation use their own
 * ranges; every other slot mixes dry/wet from 0 to 1.
 */
export function slotRange(slot: FxSlot): { min: number; max: number; step: number } {
  if (slot === 'contrast')
    return { min: CONTRAST_MIN, max: CONTRAST_MAX, step: 0.01 };
  if (slot === 'saturation') return { min: 0, max: SATURATION_MAX, step: 0.01 };
  return { min: 0, max: 1, step: 0.01 };
}

/** Fill fraction (0–1) for slot value bars. */
export function slotFraction(slot: FxSlot, value: number): number {
  const { min, max } = slotRange(slot);
  if (max === min) return 0;
  return Math.max(0, Math.min(1, (value - min) / (max - min)));
}
