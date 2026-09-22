import type { ChangeEvent } from 'react';
import type { Track } from '../audio/track';
import './TrackCard.css';

export type TrackCardVariant = 'hero' | 'row' | 'status';

interface TrackCardProps {
  track: Track | null;
  isPlaying: boolean;
  variant: TrackCardVariant;
  queueLabel?: string | null;
  onTogglePlayback?: () => void;
  onLoadFile?: (file: File) => void;
}

export function TrackCard({
  track,
  isPlaying,
  variant,
  queueLabel,
  onTogglePlayback,
  onLoadFile,
}: TrackCardProps) {
  const onFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onLoadFile) onLoadFile(file);
    event.target.value = '';
  };

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
            {track ? 'Change' : 'Load track'}
            <input
              type="file"
              accept=".mp3,audio/*"
              onChange={onFile}
              hidden
            />
          </label>
        )}
      </div>
    </div>
  );
}
