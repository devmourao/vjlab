import { useState } from 'react';
import type { AudioEngineApi } from '../audio/useAudioEngine';
import {
  bodyEntries,
  selectActivePlaylist,
  useDirectorStore,
} from '../director/directorStore';
import { useCueCountdown } from '../director/useCueCountdown';
import { PRESETS } from '../scenes/presets';
import { BasesExplorer } from './BasesExplorer';
import { KeyManager } from './KeyManager';
import './LibraryOverlay.css';
import { PlaylistManager } from './PlaylistManager';
import { SceneList } from './SceneList';
import { TimelineView } from './TimelineView';

type LibraryTab = 'scenes' | 'playlists' | 'timeline' | 'bases' | 'keys';

const TABS: Array<{ id: LibraryTab; label: string }> = [
  { id: 'scenes', label: 'Scenes' },
  { id: 'playlists', label: 'Setlist' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'bases', label: 'Pieces' },
  { id: 'keys', label: 'Keys' },
];

/**
 * Manage mode: catalog scenes/setlist/pieces above the living Stage.
 * Compose opens as its own fullscreen workbench on top. Closing Manage
 * returns to Perform (the stage).
 */
export function LibraryOverlay({ engine }: { engine?: AudioEngineApi }) {
  const libraryOpen = useDirectorStore((s) => s.libraryOpen);
  const customPresets = useDirectorStore((s) => s.customPresets);
  const activeEntryKey = useDirectorStore((s) => s.activeEntryKey);
  const timelineEntries = useDirectorStore(
    (s) => selectActivePlaylist(s).entries,
  );
  const cueClock = useCueCountdown();
  const [activeTab, setActiveTab] = useState<LibraryTab>('scenes');
  if (!libraryOpen) return null;

  const close = () => useDirectorStore.getState().setLibraryOpen(false);
  const names = new Map(
    [...PRESETS, ...customPresets].map((preset) => [preset.id, preset.name]),
  );

  return (
    <div className="library-veil" data-testid="library-overlay" onClick={close}>
      <div
        className="library-dialog"
        role="dialog"
        aria-label="Manage scenes and setlist"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="library-head">
          <div>
            <span className="library-mode-chip">Manage mode</span>
            <strong>Scenes & setlist</strong>
            <p className="library-subtitle">
              Catalog and cue the show here. Open Compose for the fullscreen
              workbench — then return to the stage to perform.
            </p>
          </div>
          <button
            type="button"
            className="library-close"
            data-testid="library-close"
            onClick={close}
          >
            Back to stage
          </button>
        </div>
        <div className="library-tabs" role="tablist" aria-label="Library sections">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              className={activeTab === tab.id ? 'library-tab active' : 'library-tab'}
              data-testid={`library-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="library-body">
          {activeTab === 'scenes' && <SceneList />}
          {activeTab === 'playlists' && (
            <PlaylistManager trackName={engine?.fileName ?? null} />
          )}
          {activeTab === 'timeline' && (
            <TimelineView
              entries={bodyEntries(timelineEntries)}
              names={names}
              activeKey={activeEntryKey}
              cueClock={cueClock}
              onSelect={(id, key) =>
                useDirectorStore.getState().requestDissolve(id, key)
              }
              trackDuration={engine?.duration ?? null}
              position={engine?.position ?? null}
            />
          )}
          {activeTab === 'bases' && <BasesExplorer />}
          {activeTab === 'keys' && <KeyManager />}
        </div>
      </div>
    </div>
  );
}
