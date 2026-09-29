/** Player states the show answers (VJLAB-82). */
export type AudioStatus = 'empty' | 'pre' | 'playing' | 'paused' | 'ended';

/**
 * Derive the status from engine readings. Ended requires the playhead
 * at the duration (pause is everything else idle); pre is loaded-idle
 * at position zero.
 */
export function deriveAudioStatus(args: {
  fileName: string | null;
  isPlaying: boolean;
  position: number;
  duration: number;
}): AudioStatus {
  if (!args.fileName) return 'empty';
  if (args.isPlaying) return 'playing';
  if (args.duration > 0 && args.position >= args.duration - 0.25) {
    return 'ended';
  }
  if (args.position <= 0.25) return 'pre';
  return 'paused';
}
