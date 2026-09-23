import { useState } from 'react';
import type { AudioEngineApi } from '../audio/useAudioEngine';
import { AudioPanel } from './AudioPanel';
import { DeskPanel } from './controls/DeskPanel';
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
        {activeTab === 'scenes' && <SceneList />}
        {activeTab === 'fx' && <DeskPanel />}
        {activeTab === 'guide' && <GuideTeaser />}
      </div>
    </div>
  );
}
