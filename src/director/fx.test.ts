import { describe, expect, it } from 'vitest';
import { PRESETS } from '../scenes/presets';
import {
  applyMix,
  beatFlashColor,
  CHROMATIC_OFFSET_OFF,
  CHROMATIC_OFFSET_ON,
  clampContrast,
  clampMix,
  clampSaturation,
  clampStrobeHz,
  clampZoom,
  GLITCH_DELAY,
  GLITCH_DURATION,
  GLITCH_STRENGTH,
  nextFxSlot,
  nextStrobeMode,
  relativeLuminance,
  slotFraction,
  slotRange,
  strobeIntervalMs,
  zoomRadius,
} from './fx';

describe('fx mixes', () => {
  it('clamps mixes and zoom to safe ranges', () => {
    expect(clampMix(1.5)).toBe(1);
    expect(clampMix(-0.2)).toBe(0);
    expect(clampZoom(10)).toBe(2.5);
    expect(clampZoom(0.1)).toBe(0.5);
  });

  it('scales effects by mix and master', () => {
    expect(applyMix(0.6, 1, 1)).toBeCloseTo(0.6);
    expect(applyMix(0.6, 0.5, 1)).toBeCloseTo(0.3);
    expect(applyMix(0.6, 1, 0)).toBe(0);
  });

  it('moves the camera closer when zoom grows', () => {
    expect(zoomRadius(5, 2)).toBeLessThan(zoomRadius(5, 1));
  });

  it('cycles fx slots', () => {
    expect(nextFxSlot('bloom')).toBe('vignette');
    expect(nextFxSlot('master')).toBe('saturation');
  });

  it('clamps strobe rate and derives the half-cycle interval', () => {
    expect(clampStrobeHz(99)).toBe(12);
    expect(clampStrobeHz(0)).toBe(1);
    expect(strobeIntervalMs(4)).toBeCloseTo(125);
  });

  it('cycles strobe modes and clamps contrast', () => {
    expect(nextStrobeMode('white')).toBe('black');
    expect(nextStrobeMode('black')).toBe('color');
    expect(nextStrobeMode('color')).toBe('white');
    expect(clampContrast(9)).toBe(0.5);
    expect(clampContrast(-9)).toBe(-0.5);
    expect(clampContrast(0)).toBe(0);
  });

  it('clamps saturation to the usable vivid range', () => {
    expect(clampSaturation(0)).toBe(0);
    expect(clampSaturation(9)).toBe(0.6);
    expect(clampSaturation(-1)).toBe(0);
  });

  it('keeps the original four slots cycling in order', () => {
    expect(nextFxSlot('master')).toBe('saturation');
    expect(nextFxSlot('contrast')).toBe('bloom');
  });
});

describe('beat flash color', () => {
  it('computes WCAG relative luminance', () => {
    expect(relativeLuminance('#ffffff')).toBeCloseTo(1);
    expect(relativeLuminance('#000000')).toBeCloseTo(0);
    expect(relativeLuminance('not-a-color')).toBeNaN();
  });

  it('resolves shipped light primaries to the deep emissive tone', () => {
    for (const preset of PRESETS) {
      expect(beatFlashColor(preset.palette)).toBe(preset.palette.emissive);
    }
  });

  it('keeps dark primaries as-is', () => {
    expect(
      beatFlashColor({ primary: '#0a0618', emissive: '#6d28d9' }),
    ).toBe('#0a0618');
  });

  it('falls back to primary for malformed colors', () => {
    expect(
      beatFlashColor({ primary: 'not-a-color', emissive: '#6d28d9' }),
    ).toBe('not-a-color');
  });
});

describe('post pass stability', () => {
  it('keeps the shipped chromatic aberration tuning', () => {
    expect(CHROMATIC_OFFSET_ON).toEqual([0.004, 0.002]);
    expect(CHROMATIC_OFFSET_OFF).toEqual([0, 0]);
  });

  it('keeps the shipped VHS glitch timing', () => {
    expect(GLITCH_DELAY).toEqual([1.5, 3.5]);
    expect(GLITCH_DURATION).toEqual([0.2, 0.6]);
    expect(GLITCH_STRENGTH).toEqual([0.2, 0.5]);
  });
});

describe('slot ranges', () => {
  it('bounds every slot for sliders and bars', () => {
    expect(slotRange('bloom')).toEqual({ min: 0, max: 1, step: 0.01 });
    expect(slotRange('saturation').max).toBe(0.6);
    expect(slotRange('contrast')).toMatchObject({ min: -0.5, max: 0.5 });
    expect(slotFraction('bloom', 0.5)).toBeCloseTo(0.5);
    expect(slotFraction('contrast', 0)).toBeCloseTo(0.5);
    expect(slotFraction('saturation', 0.6)).toBeCloseTo(1);
  });
});
