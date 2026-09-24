import { useState } from 'react';
import type { AudioEngineApi } from '../audio/useAudioEngine';
import { toggleInterfaceVisibility } from '../director/controlChannel';
import { useActivePlaylist, useDirectorStore } from '../director/directorStore';
import { AudioPanel } from './AudioPanel';
import './BottomSheet.css';
import { DeskPanel } from './controls/DeskPanel';
import { SceneTransport } from './controls/SceneTransport';
import { GuideTeaser } from './GuideTeaser';
import { SceneList } from './SceneList';

type SheetTab = 'audio' | 'scenes' | 'fx' | 'guide';
type SheetSize = 'mini' | 'half' | 'expanded';

const TABS: Array<{ id: SheetTab; label: string }> = [
  { id: 'audio', label: 'Audio' },
  { id: 'scenes', label: 'Scenes' },
  { id: 'fx', label: 'FX' },
  { id: 'guide', label: 'Guide' },
];

const SIZES: SheetSize[] = ['mini', 'half', 'expanded'];

export function BottomSheet({ engine }: { engine: AudioEngineApi }) {
  const panelMode = useDirectorStore((s) => s.panelMode);
  const [activeTab, setActiveTab] = useState<SheetTab>('audio');
  const [size, setSize] = useState<SheetSize>('mini');
  const transitionDuration = useDirectorStore((s) => s.transitionDuration);
  const playlist = useActivePlaylist();

  const cycleSize = () => {
    const next = SIZES[(SIZES.indexOf(size) + 1) % SIZES.length];
    setSize(next);
  };

  // Hidden mode on mobile keeps a slim restore bar so touch users
  // never lose the way back (desktop keeps the floating toggle).
  if (panelMode === 'hidden') {
    return (
      <div
        className="bottom-sheet mini restore"
        data-testid="bottom-sheet"
      >
        <button
          type="button"
          className="sheet-restore"
          data-testid="sheet-restore"
          onClick={toggleInterfaceVisibility}
        >
          Show UI
        </button>
      </div>
    );
  }

  return (
    <div
      className={`bottom-sheet ${size}`}
      data-testid="bottom-sheet"
    >
      <div className="sheet-header">
        <button
          type="button"
          className="sheet-handle"
          data-testid="sheet-size"
          title="Cycle sheet size"
          onClick={cycleSize}
          aria-label={`Sheet size ${size}. Activate to change size.`}
        >
          <span aria-hidden>—</span>
        </button>
        <div className="sheet-tabs" role="tablist" aria-label="Deck controls">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              className={activeTab === tab.id ? 'sheet-tab active' : 'sheet-tab'}
              data-testid={`sheet-tab-${tab.id}`}
              onClick={() => {
                setActiveTab(tab.id);
                if (size === 'mini') setSize('half');
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="sheet-hide"
          data-testid="sheet-hide"
          title="Hide all UI"
          onClick={toggleInterfaceVisibility}
        >
          Hide
        </button>
      </div>
      {size !== 'mini' && (
        <div className="sheet-content" data-testid="sheet-content">
          {activeTab === 'audio' && <AudioPanel engine={engine} />}
          {activeTab === 'scenes' && (
            <>
              <SceneList
                manage={false}
                sceneOrder={playlist.sceneIds}
                favoriteIds={playlist.favoriteIds}
                ops={{
                  onMove: (from, to) =>
                    useDirectorStore.getState().movePlaylistScene(from, to),
                }}
              />
              <SceneTransport
                durationLabel={`${transitionDuration.toFixed(1)}s`}
                onPrev={() => useDirectorStore.getState().prevPreset()}
                onNext={() => useDirectorStore.getState().nextPreset()}
                onCut={() => useDirectorStore.getState().hardCutNext()}
                onCycleDuration={() => useDirectorStore.getState().cycleDuration()}
              />
              <button
                type="button"
                className="kit-link"
                onClick={() => useDirectorStore.getState().setLibraryOpen(true)}
              >
                Manage scenes…
              </button>
            </>
          )}
          {activeTab === 'fx' && <DeskPanel />}
          {activeTab === 'guide' && <GuideTeaser />}
        </div>
      )}
    </div>
  );
}
