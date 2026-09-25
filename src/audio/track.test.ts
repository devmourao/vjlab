import { describe, expect, it } from 'vitest';
import { createTrack, formatQueueLabel, formatTrackTime } from './track';

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

  it('formats track times as minutes and seconds', () => {
    expect(formatTrackTime(0)).toBe('0:00');
    expect(formatTrackTime(65.7)).toBe('1:05');
    expect(formatTrackTime(NaN)).toBe('0:00');
    expect(formatTrackTime(-3)).toBe('0:00');
  });
});
