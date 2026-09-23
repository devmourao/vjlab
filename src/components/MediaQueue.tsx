import { useEffect } from 'react';
import type { AudioEngineApi } from '../audio/useAudioEngine';
import { useDirectorStore } from '../director/directorStore';
import './MediaQueue.css';

// Session memory of the loaded track, shared across component mounts:
// reopening tabs remounts the queue, and reloading the same track would
// restart playback from zero.
let loadedTrack: { id: string; url: string } | null = null;

export function MediaQueue({ engine }: { engine: AudioEngineApi }) {
  const mediaQueue = useDirectorStore((s) => s.mediaQueue);
  const mediaIndex = useDirectorStore((s) => s.mediaIndex);
  const { loadUrl } = engine;

  // Load only when the selected track actually changes: reloading on
  // every queue or engine identity change restarts playback (stutter).
  useEffect(() => {
    if (mediaIndex === null) return;
    const track = mediaQueue[mediaIndex];
    if (!track?.url) return;
    if (
      loadedTrack &&
      loadedTrack.id === track.id &&
      loadedTrack.url === track.url
    ) {
      return;
    }
    loadedTrack = { id: track.id, url: track.url };
    loadUrl(track.url, track.name);
  }, [mediaIndex, mediaQueue, loadUrl]);

  const playNow = (id: string, url: string | null | undefined, name: string) => {
    useDirectorStore.getState().playMedia(id);
    if (url) engine.loadUrl(url, name);
  };

  const onAdd = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    const store = useDirectorStore.getState();
    const wasEmpty = store.mediaQueue.length === 0;
    const [first] = store.addMediaTracks(Array.from(files));
    if (wasEmpty && first) playNow(first.id, first.url, first.name);
    event.target.value = '';
  };

  if (mediaQueue.length === 0) {
    return (
      <div className="media-queue" data-testid="media-queue">
        <p className="media-hint">Session queue — local files only, not saved after reload.</p>
        <label className="media-add">
          Add tracks
          <input type="file" accept=".mp3,audio/*" multiple onChange={onAdd} hidden />
        </label>
      </div>
    );
  }

  return (
    <div className="media-queue" data-testid="media-queue">
      <div className="media-queue-head">
        <strong>Queue {mediaIndex !== null ? `${mediaIndex + 1}/${mediaQueue.length}` : `${mediaQueue.length}`}</strong>
        <label className="media-add small">
          Add
          <input type="file" accept=".mp3,audio/*" multiple onChange={onAdd} hidden />
        </label>
      </div>
      <p className="media-hint">Session only — files stay in memory until reload.</p>
      <ul className="media-list">
        {mediaQueue.map((track, index) => (
          <li key={track.id} className={index === mediaIndex ? 'media-item active' : 'media-item'}>
            <button type="button" className="media-play" onClick={() => playNow(track.id, track.url, track.name)}>
              {index === mediaIndex ? '●' : '▶'} {track.name}
            </button>
            <div className="media-actions">
              <button type="button" disabled={index === 0} onClick={() => useDirectorStore.getState().reorderMedia(index, index - 1)}>
                ↑
              </button>
              <button type="button" disabled={index === mediaQueue.length - 1} onClick={() => useDirectorStore.getState().reorderMedia(index, index + 1)}>
                ↓
              </button>
              <button type="button" onClick={() => useDirectorStore.getState().removeMediaTrack(track.id)}>
                ✕
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
