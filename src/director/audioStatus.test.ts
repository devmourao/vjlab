import { describe, expect, it } from 'vitest';
import { deriveAudioStatus } from './audioStatus';

describe('deriveAudioStatus', () => {
  it('reads player states without flapping', () => {
    expect(
      deriveAudioStatus({ fileName: null, isPlaying: false, position: 0, duration: 0 }),
    ).toBe('empty');
    expect(
      deriveAudioStatus({ fileName: 'a.mp3', isPlaying: true, position: 12, duration: 240 }),
    ).toBe('playing');
    expect(
      deriveAudioStatus({ fileName: 'a.mp3', isPlaying: false, position: 0, duration: 240 }),
    ).toBe('pre');
    expect(
      deriveAudioStatus({ fileName: 'a.mp3', isPlaying: false, position: 30, duration: 240 }),
    ).toBe('paused');
    expect(
      deriveAudioStatus({ fileName: 'a.mp3', isPlaying: false, position: 240, duration: 240 }),
    ).toBe('ended');
    expect(
      deriveAudioStatus({ fileName: 'a.mp3', isPlaying: false, position: 239.9, duration: 240 }),
    ).toBe('ended');
  });
});
