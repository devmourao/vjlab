import { useState } from 'react';
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
  { id: 'playlists', label: 'Playlists' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'bases', label: 'Bases' },
  { id: 'keys', label: 'Keys' },
];

/**
 * Preparation surface: scene CRUD plus pack import/export plus the
 * bases reference, as a full-screen overlay above the living Stage.
 * Audio and WebGL keep running behind the veil; closing returns to
 * the show. Opens from the deck (M key, Manage buttons) or remotely
 * from the console popup.
 */
export function LibraryOverlay() {
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
        aria-label="Scene library"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="library-head">
          <strong>Library</strong>
          <button
            type="button"
            className="library-close"
            data-testid="library-close"
            onClick={close}
          >
            Close
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
          {activeTab === 'playlists' && <PlaylistManager />}
          {activeTab === 'timeline' && (
            <TimelineView
              entries={bodyEntries(timelineEntries)}
              names={names}
              activeKey={activeEntryKey}
              cueClock={cueClock}
              onSelect={(id, key) =>
                useDirectorStore.getState().requestDissolve(id, key)
              }
            />
          )}
          {activeTab === 'bases' && <BasesExplorer />}
          {activeTab === 'keys' && <KeyManager />}
        </div>
      </div>
    </div>
  );
}
