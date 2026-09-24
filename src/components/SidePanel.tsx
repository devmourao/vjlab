import { useState } from 'react';
import type { AudioEngineApi } from '../audio/useAudioEngine';
import { useActivePlaylist, useDirectorStore } from '../director/directorStore';
import { AudioPanel } from './AudioPanel';
import { DeskPanel } from './controls/DeskPanel';
import { SceneTransport } from './controls/SceneTransport';
import { GuideTeaser } from './GuideTeaser';
import { SceneList } from './SceneList';
import './SidePanel.css';

type PanelTab = 'track' | 'scenes' | 'fx' | 'guide';

const TABS: Array<{ id: PanelTab; label: string }> = [
  { id: 'track', label: 'Track' },
  { id: 'scenes', label: 'Scenes' },
  { id: 'fx', label: 'FX' },
  { id: 'guide', label: 'Guide' },
];

/**
 * The single docked control surface: one left scrollable panel with tabs.
 * Replaces the former split of an audio panel plus a separate desk panel,
 * so no information renders on both sides at once.
 */
export function SidePanel({ engine }: { engine: AudioEngineApi }) {
  const [activeTab, setActiveTab] = useState<PanelTab>('track');
  const transitionDuration = useDirectorStore((s) => s.transitionDuration);
  const playlist = useActivePlaylist();

  return (
    <div className="side-panel" data-testid="side-panel">
      <div className="side-tabs" role="tablist" aria-label="Deck controls">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            className={activeTab === tab.id ? 'side-tab active' : 'side-tab'}
            data-testid={`side-tab-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="side-content" data-testid="side-content">
        {activeTab === 'track' && <AudioPanel engine={engine} />}
        {activeTab === 'scenes' && (
          <>
            <SceneList
              manage={false}
              entries={playlist.entries}
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
    </div>
  );
}
