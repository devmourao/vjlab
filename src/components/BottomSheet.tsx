import { useState } from 'react';
import type { AudioEngineApi } from '../audio/useAudioEngine';
import { useDirectorStore } from '../director/directorStore';
import { PRESETS } from '../scenes/presets';
import { AudioPanel } from './AudioPanel';
import './BottomSheet.css';
import { ShortcutMap } from './ShortcutMap';

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
  const activePresetId = useDirectorStore((s) => s.activePresetId);
  const [activeTab, setActiveTab] = useState<SheetTab>('audio');
  const [size, setSize] = useState<SheetSize>('mini');

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
          onClick={() => useDirectorStore.getState().setPanelMode('docked')}
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
          onClick={() => useDirectorStore.getState().setPanelMode('hidden')}
        >
          Hide
        </button>
      </div>
      {size !== 'mini' && (
        <div className="sheet-content" data-testid="sheet-content">
          {activeTab === 'audio' && <AudioPanel engine={engine} />}
          {activeTab === 'scenes' && (
            <ul className="sheet-scenes" data-testid="scene-list">
              {PRESETS.map((preset) => (
                <li key={preset.id}>
                  <button
                    type="button"
                    className={
                      preset.id === activePresetId
                        ? 'sheet-scene active'
                        : 'sheet-scene'
                    }
                    data-testid={`scene-button-${preset.id}`}
                    onClick={() =>
                      useDirectorStore.getState().requestDissolve(preset.id)
                    }
                  >
                    <span
                      className="sheet-swatch"
                      style={{ background: preset.palette.primary }}
                      aria-hidden
                    />
                    <strong>{preset.name}</strong>
                    <span className="sheet-scene-sub">
                      {preset.gain.toFixed(1)}x · {preset.speed.toFixed(1)}x
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {activeTab === 'fx' && <ShortcutMap />}
          {activeTab === 'guide' && (
            <div className="sheet-guide" data-testid="sheet-guide">
              <p>
                New here? Open the full guide with shortcuts and pro tips, or
                replay the first-run tour.
              </p>
              <button
                type="button"
                className="sheet-scene"
                onClick={() =>
                  useDirectorStore.getState().setHelpOpen(true)
                }
              >
                <strong>Open full guide</strong>
              </button>
              <button
                type="button"
                className="sheet-scene"
                onClick={() => useDirectorStore.getState().replayTour()}
              >
                <strong>Replay tour</strong>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
