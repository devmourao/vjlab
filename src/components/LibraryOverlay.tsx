import { useState } from 'react';
import { useDirectorStore } from '../director/directorStore';
import { BasesExplorer } from './BasesExplorer';
import { KeyManager } from './KeyManager';
import './LibraryOverlay.css';
import { PlaylistManager } from './PlaylistManager';
import { SceneList } from './SceneList';

type LibraryTab = 'scenes' | 'playlists' | 'bases' | 'keys';

const TABS: Array<{ id: LibraryTab; label: string }> = [
  { id: 'scenes', label: 'Scenes' },
  { id: 'playlists', label: 'Playlists' },
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
  const [activeTab, setActiveTab] = useState<LibraryTab>('scenes');
  if (!libraryOpen) return null;

  const close = () => useDirectorStore.getState().setLibraryOpen(false);

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
          {activeTab === 'bases' && <BasesExplorer />}
          {activeTab === 'keys' && <KeyManager />}
        </div>
      </div>
    </div>
  );
}
