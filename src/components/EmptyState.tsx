import type { AudioEngineApi } from '../audio/useAudioEngine';
import { useDirectorStore } from '../director/directorStore';
import './EmptyState.css';
import { TrackCard } from './TrackCard';

export function EmptyState({ engine }: { engine: AudioEngineApi }) {
  const panelMode = useDirectorStore((s) => s.panelMode);
  if (engine.fileName || panelMode === 'hidden') return null;

  return (
    <div className="empty-wrap" data-testid="empty-state">
      <div className="empty-card">
        <strong>Drop your .mp3 to start</strong>
        <TrackCard
          track={null}
          isPlaying={false}
          variant="hero"
          onLoadFile={(file) => engine.loadFile(file)}
        />
        <button
          type="button"
          className="empty-guide"
          onClick={() => useDirectorStore.getState().setHelpOpen(true)}
        >
          Open guide
        </button>
      </div>
    </div>
  );
}
