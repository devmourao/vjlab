import { describe, expect, it } from 'vitest';
import { createTrack, formatQueueLabel, formatTrackTime, parseMmSs } from './track';

describe('track', () => {
  it('creates local tracks with unique ids', () => {
    const first = createTrack('demo.mp3');
    const second = createTrack('demo.mp3');
    expect(first.name).toBe('demo.mp3');
    expect(first.source).toBe('local');
    expect(second.id).not.toBe(first.id);
  });

  it('formats queue positions only when known', () => {
    expect(formatQueueLabel(0, 6)).toBe('1/6');
    expect(formatQueueLabel(null, 6)).toBeNull();
    expect(formatQueueLabel(0, null)).toBeNull();
  });

  it('parses stage timestamps without ever throwing garbage', () => {
    expect(parseMmSs('1:43')).toBe(103);
    expect(parseMmSs('0:05')).toBe(5);
    expect(parseMmSs('1:02:03')).toBe(3723);
    expect(parseMmSs('90')).toBe(90);
    expect(parseMmSs('90s')).toBe(90);
    expect(parseMmSs('')).toBeNull();
    expect(parseMmSs('abc')).toBeNull();
    expect(parseMmSs('1:75')).toBeNull();
    expect(parseMmSs('1:2:3:4')).toBeNull();
    expect(parseMmSs('-5')).toBeNull();
  });

  it('formats track times as minutes and seconds', () => {
    expect(formatTrackTime(0)).toBe('0:00');
    expect(formatTrackTime(65.7)).toBe('1:05');
    expect(formatTrackTime(NaN)).toBe('0:00');
    expect(formatTrackTime(-3)).toBe('0:00');
  });
});
