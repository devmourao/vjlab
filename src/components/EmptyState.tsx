import type { ChangeEvent } from 'react';
import type { AudioEngineApi } from '../audio/useAudioEngine';
import { useDirectorStore } from '../director/directorStore';
import './EmptyState.css';

export function EmptyState({ engine }: { engine: AudioEngineApi }) {
  const panelMode = useDirectorStore((s) => s.panelMode);
  if (engine.fileName || panelMode === 'hidden') return null;

  const onFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) engine.loadFile(file);
  };

  return (
    <div className="empty-wrap" data-testid="empty-state">
      <div className="empty-card">
        <strong>Drop your .mp3 to start</strong>
        <span>Local files only — nothing is uploaded.</span>
        <label className="empty-cta">
          Load track
          <input type="file" accept=".mp3,audio/*" onChange={onFile} hidden />
        </label>
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
