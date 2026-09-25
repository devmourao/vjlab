import { useMemo } from 'react';
import type { AudioEngineApi } from '../audio/useAudioEngine';
import { createTrack } from '../audio/track';
import { useDirectorStore } from '../director/directorStore';
import { MediaQueue } from './MediaQueue';
import { TrackCard } from './TrackCard';

export function AudioPanel({ engine }: { engine: AudioEngineApi }) {
  const mediaQueue = useDirectorStore((s) => s.mediaQueue);
  const mediaIndex = useDirectorStore((s) => s.mediaIndex);
  // Queue transport: stepping loads the target track URL into the engine.
  // Uploads live in MediaQueue below, not in the player card.
  const stepTrack = (delta: 1 | -1) => {
    const next = useDirectorStore.getState().stepMedia(delta);
    if (next?.url) engine.loadUrl(next.url, next.name);
  };
  const track = useMemo(
    () => (engine.fileName ? createTrack(engine.fileName) : null),
    [engine.fileName],
  );
  return (
    <div className="audio-panel">
      <TrackCard
        track={track}
        isPlaying={engine.isPlaying}
        variant="row"
        position={engine.position}
        duration={engine.duration}
        canPrev={mediaIndex !== null && mediaIndex > 0}
        canNext={mediaIndex !== null && mediaIndex < mediaQueue.length - 1}
        onTogglePlayback={() => void engine.toggle()}
        onSeek={(seconds) => engine.seekTo(seconds)}
        onSkip={(delta) => engine.skipBy(delta)}
        onPrev={() => stepTrack(-1)}
        onNext={() => stepTrack(1)}
      />
      <MediaQueue engine={engine} />
      {engine.error ? <p className="audio-error">{engine.error}</p> : null}
      <div className="spectrum-bars" data-testid="spectrum-bars">
        <div className="spectrum-row">
          <span>BASS</span>
          <div className="mix-track">
            <div
              className="mix-fill"
              style={{ width: `${Math.round(engine.spectrum.bass * 100)}%` }}
            />
          </div>
        </div>
        <div className="spectrum-row">
          <span>MIDS</span>
          <div className="mix-track">
            <div
              className="mix-fill"
              style={{ width: `${Math.round(engine.spectrum.mids * 100)}%` }}
            />
          </div>
        </div>
        <div className="spectrum-row">
          <span>TREBLE</span>
          <div className="mix-track">
            <div
              className="mix-fill"
              style={{ width: `${Math.round(engine.spectrum.treble * 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
