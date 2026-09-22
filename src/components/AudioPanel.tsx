import { useMemo, type ChangeEvent } from 'react';
import type { AudioEngineApi } from '../audio/useAudioEngine';
import { createTrack } from '../audio/track';
import { useDirectorStore } from '../director/directorStore';
import { instanceKey } from '../scenes/bases';
import { getPreset, resolveInstances } from '../scenes/presets';
import { TrackCard } from './TrackCard';

function activeMeshKeys(): string[] {
  const { activePresetId } = useDirectorStore.getState();
  const preset = getPreset(activePresetId);
  return resolveInstances(preset)
    .map((inst, index) => ({ inst, index }))
    .filter(({ inst }) => inst.base === 'mesh')
    .map(({ inst, index }) => instanceKey(preset.id, inst.base, index));
}

export function AudioPanel({ engine }: { engine: AudioEngineApi }) {
  const overlayText = useDirectorStore((s) => s.overlayText);
  const activePresetId = useDirectorStore((s) => s.activePresetId);
  const instanceMaps = useDirectorStore((s) => s.instanceMaps);
  const meshTextureStatus = useDirectorStore((s) => s.meshTextureStatus);
  const onFile = (file: File) => {
    engine.loadFile(file);
  };
  const track = useMemo(
    () => (engine.fileName ? createTrack(engine.fileName) : null),
    [engine.fileName],
  );
  const meshKeys = useMemo(
    () =>
      resolveInstances(getPreset(activePresetId))
        .map((inst, index) => ({ inst, index }))
        .filter(({ inst }) => inst.base === 'mesh')
        .map(({ inst, index }) =>
          instanceKey(getPreset(activePresetId).id, inst.base, index),
        ),
    [activePresetId],
  );
  const meshMapUrl = meshKeys
    .map((key) => instanceMaps[key] ?? null)
    .find((url) => url !== null) ?? null;
  const onImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    const store = useDirectorStore.getState();
    const url = URL.createObjectURL(file);
    for (const key of activeMeshKeys()) {
      const previous = store.instanceMaps[key];
      if (previous) URL.revokeObjectURL(previous);
      store.setInstanceMap(key, url);
    }
  };
  const onClearImage = () => {
    const store = useDirectorStore.getState();
    const seen = new Set<string>();
    for (const key of activeMeshKeys()) {
      const previous = store.instanceMaps[key];
      if (previous && !seen.has(previous)) {
        URL.revokeObjectURL(previous);
        seen.add(previous);
      }
      store.setInstanceMap(key, null);
    }
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
        <input
          type="file"
          accept="image/png,image/jpeg"
          onChange={onImage}
          disabled={meshKeys.length === 0}
        />
        {meshKeys.length === 0 ? (
          <span data-testid="texture-status">No mesh instance</span>
        ) : (
          <>
            {meshMapUrl ? (
              <button type="button" onClick={onClearImage}>
                Clear
              </button>
            ) : null}
            {meshMapUrl ? (
              <span data-testid="texture-status">
                {meshTextureStatus === 'ready'
                  ? 'Image applied'
                  : meshTextureStatus === 'error'
                    ? 'Image failed — try PNG/JPG'
                    : 'Loading image…'}
              </span>
            ) : null}
          </>
        )}
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
