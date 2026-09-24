import { useState } from 'react';
import { useDirectorStore } from '../director/directorStore';
import {
  EFFECTS_KEYS,
  PERFORM_KEYS,
  START_KEYS,
  rowsFor,
} from './controls/shortcutGroups';
import './GuideDrawer.css';

type GuideTab = 'start' | 'perform' | 'effects' | 'tips';

const TABS: Array<{ id: GuideTab; label: string }> = [
  { id: 'start', label: 'Start' },
  { id: 'perform', label: 'Perform' },
  { id: 'effects', label: 'Effects' },
  { id: 'tips', label: 'Tips' },
];

export function GuideDrawer() {
  const helpOpen = useDirectorStore((s) => s.helpOpen);
  const [activeTab, setActiveTab] = useState<GuideTab>('start');
  if (!helpOpen) return null;

  return (
    <div
      className="guide-veil"
      data-testid="help-drawer"
      onClick={() => useDirectorStore.getState().setHelpOpen(false)}
    >
      <div
        className="guide-drawer"
        role="dialog"
        aria-label="Usage guide"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="guide-head">
          <strong>Guide</strong>
          <button
            type="button"
            className="guide-close"
            data-testid="help-close"
            onClick={() => useDirectorStore.getState().setHelpOpen(false)}
          >
            Close
          </button>
        </div>
        <div className="guide-tabs" role="tablist" aria-label="Guide sections">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              className={activeTab === tab.id ? 'guide-tab active' : 'guide-tab'}
              data-testid={`help-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="guide-body">
          {activeTab === 'start' && (
            <>
              <ol className="guide-steps">
                <li>
                  <strong>Load.</strong> Drop a local .mp3 file into the deck,
                  then press play. Audio starts only after your gesture.
                </li>
                <li>
                  <strong>Watch.</strong> Bass drives scale, mids and treble
                  drive color, light and camera motion.
                </li>
                <li>
                  <strong>Perform.</strong> Dissolve across presets with number
                  keys, then hide the UI for a clean output.
                </li>
              </ol>
              <ul className="guide-rows">
                {rowsFor(START_KEYS).map((row) => (
                  <li key={row.key}>
                    <code>{row.key}</code>
                    <span>{row.action}</span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className="guide-replay"
                data-testid="replay-tour"
                onClick={() => {
                  useDirectorStore.getState().setHelpOpen(false);
                  useDirectorStore.getState().replayTour();
                }}
              >
                Replay first-run tour
              </button>
            </>
          )}
          {activeTab === 'perform' && (
            <ul className="guide-rows">
              {rowsFor(PERFORM_KEYS).map((row) => (
                <li key={row.key}>
                  <code>{row.key}</code>
                  <span>{row.action}</span>
                </li>
              ))}
            </ul>
          )}
          {activeTab === 'effects' && (
            <ul className="guide-rows">
              {rowsFor(EFFECTS_KEYS).map((row) => (
                <li key={row.key}>
                  <code>{row.key}</code>
                  <span>{row.action}</span>
                </li>
              ))}
            </ul>
          )}
          {activeTab === 'tips' && (
            <ul className="guide-tips">
              <li>
                Strobe is off by default and flashes light. Press{' '}
                <code>S</code> any time to kill every effect instantly.
              </li>
              <li>
                On weak GPUs press <code>L</code> for lite mode with capped
                pixel ratio and effects.
              </li>
              <li>
                Combine <code>U</code> hidden panels with <code>G</code>{' '}
                fullscreen for a clean projection or recording.
              </li>
              <li>
                Browsers block audio before interaction — if a track stays
                silent, press play again after clicking anywhere.
              </li>
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
