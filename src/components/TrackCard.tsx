import type { ChangeEvent } from 'react';
import { formatTrackTime, type Track } from '../audio/track';
import './TrackCard.css';

export type TrackCardVariant = 'hero' | 'row' | 'status';

interface TrackCardProps {
  track: Track | null;
  isPlaying: boolean;
  variant: TrackCardVariant;
  queueLabel?: string | null;
  position?: number;
  duration?: number;
  onTogglePlayback?: () => void;
  onLoadFile?: (file: File) => void;
  onSeek?: (seconds: number) => void;
  onSkip?: (delta: number) => void;
}

export function TrackCard({
  track,
  isPlaying,
  variant,
  queueLabel,
  position,
  duration,
  onTogglePlayback,
  onLoadFile,
  onSeek,
  onSkip,
}: TrackCardProps) {
  const onFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onLoadFile) onLoadFile(file);
    event.target.value = '';
  };
  const hasTimeline =
    track !== null &&
    position !== undefined &&
    duration !== undefined &&
    duration > 0;

  return (
    <div className={`track-card ${variant}`} data-testid="track-card">
      <div className="track-info">
        <strong className="track-name">
          {track ? track.name : 'No track loaded'}
        </strong>
        <span className="track-meta">
          {queueLabel ? `${queueLabel} · ` : ''}
          {track ? (isPlaying ? 'Playing' : 'Paused') : 'Local files only'}
        </span>
      </div>
      <div className="track-actions">
        {track && onTogglePlayback && (
          <button
            type="button"
            className="track-button"
            data-testid="track-toggle"
            onClick={onTogglePlayback}
          >
            {isPlaying ? 'Pause' : 'Play'}
          </button>
        )}
        {onLoadFile && (
          <label className="track-button upload">
            Add
            <input
              type="file"
              accept=".mp3,audio/*"
              onChange={onFile}
              hidden
            />
          </label>
        )}
      </div>
      {hasTimeline && (
        <div className="track-timeline">
          {onSkip && (
            <button
              type="button"
              className="track-button small"
              aria-label="Back 10 seconds"
              onClick={() => onSkip(-10)}
            >
              −10s
            </button>
          )}
          <span className="track-time">{formatTrackTime(position)}</span>
          {onSeek && (
            <input
              type="range"
              className="track-scrub"
              min={0}
              max={duration}
              step={0.1}
              value={Math.min(position, duration)}
              aria-label="Seek in track"
              onChange={(event) => onSeek(Number(event.target.value))}
            />
          )}
          <span className="track-time">{formatTrackTime(duration)}</span>
          {onSkip && (
            <button
              type="button"
              className="track-button small"
              aria-label="Forward 10 seconds"
              onClick={() => onSkip(10)}
            >
              +10s
            </button>
          )}
        </div>
      )}
    </div>
  );
}
