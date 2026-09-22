import { useMemo, type ChangeEvent } from 'react';
import type { AudioEngineApi } from '../audio/useAudioEngine';
import { createTrack } from '../audio/track';
import { useDirectorStore } from '../director/directorStore';
import { TrackCard } from './TrackCard';

export function AudioPanel({ engine }: { engine: AudioEngineApi }) {
  const overlayText = useDirectorStore((s) => s.overlayText);
  const meshTextureUrl = useDirectorStore((s) => s.meshTextureUrl);
  const meshTextureStatus = useDirectorStore((s) => s.meshTextureStatus);
  const onFile = (file: File) => {
    engine.loadFile(file);
  };
  const track = useMemo(
    () => (engine.fileName ? createTrack(engine.fileName) : null),
    [engine.fileName],
  );
  const onImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    const previous = useDirectorStore.getState().meshTextureUrl;
    if (previous) URL.revokeObjectURL(previous);
    useDirectorStore.getState().setMeshTexture(URL.createObjectURL(file));
  };

  return (
    <div className="audio-panel">
      <TrackCard
        track={track}
        isPlaying={engine.isPlaying}
        variant="row"
        onTogglePlayback={() => void engine.toggle()}
        onLoadFile={onFile}
      />
      {engine.error ? <p className="audio-error">{engine.error}</p> : null}
      <label className="audio-panel-row">
        <span>Mesh image</span>
        <input type="file" accept="image/png,image/jpeg" onChange={onImage} />
        {meshTextureUrl ? (
          <button
            type="button"
            onClick={() => {
              URL.revokeObjectURL(meshTextureUrl);
              useDirectorStore.getState().setMeshTexture(null);
            }}
          >
            Clear
          </button>
        ) : null}
        {meshTextureUrl ? (
          <span data-testid="texture-status">
            {meshTextureStatus === 'ready'
              ? 'Image applied'
              : meshTextureStatus === 'error'
                ? 'Image failed — try PNG/JPG'
                : 'Loading image…'}
          </span>
        ) : null}
      </label>
      <label className="audio-panel-row">
        <span>Overlay (T)</span>
        <input
          type="text"
          maxLength={60}
          value={overlayText}
          placeholder="VJ LAB"
          onChange={(event) =>
            useDirectorStore.getState().setOverlayText(event.target.value)
          }
        />
      </label>
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
