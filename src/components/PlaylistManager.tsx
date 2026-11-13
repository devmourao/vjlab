import { useState } from 'react';
import { formatTrackTime } from '../audio/track';
import {
  DECK_SIZE,
  bodyEntries,
  cueTiming,
  sanitizeAnchor,
  showTotalSec,
  useDirectorStore,
  windowConflicts,
} from '../director/directorStore';
import { PRESETS, type ScenePreset } from '../scenes/presets';
import { CoverageMeter } from './CoverageMeter';
import { SceneThumb } from './SceneThumb';
import { rowDragStart, sectionDropProps } from './controls/sectionDrag';
import './PlaylistManager.css';

/** Manual show-target stepper step (seconds). */
export const SHOW_TARGET_STEP_SEC = 60;

function resolvePreset(
  id: number,
  library: ScenePreset[],
): ScenePreset | null {
  return library.find((preset) => preset.id === id) ?? null;
}

/**
 * Visual setlist (Winamp-style): ordered scene occurrences with thumbs,
 * pin-to-deck, and one-tap play. Library pane feeds the set; binding a
 * track still switches which set loads with that song.
 */
export function PlaylistManager({ trackName }: { trackName?: string | null }) {
  const playlists = useDirectorStore((s) => s.playlists);
  const activePlaylistId = useDirectorStore((s) => s.activePlaylistId);
  const customPresets = useDirectorStore((s) => s.customPresets);
  const activePresetId = useDirectorStore((s) => s.activePresetId);
  const activeEntryKey = useDirectorStore((s) => s.activeEntryKey);
  const showDirty = useDirectorStore((s) => s.showDirty);
  const trackBindings = useDirectorStore((s) => s.trackBindings);
  const [draft, setDraft] = useState('');
  const [renaming, setRenaming] = useState(false);
  const [renameDraft, setRenameDraft] = useState('');

  const store = useDirectorStore.getState();
  const active =
    playlists.find((entry) => entry.id === activePlaylistId) ?? playlists[0];
  if (!active) return null;
  const library = [...PRESETS, ...customPresets];
  const names = new Map(library.map((preset) => [preset.id, preset.name]));

  const create = () => {
    if (!draft.trim()) return;
    store.createPlaylist(draft);
    setDraft('');
  };

  const playCue = (sceneId: number, key: string) => {
    store.requestDissolve(sceneId, key);
    store.setLibraryOpen(false);
  };

  const playVisualSet = () => {
    const body = bodyEntries(active.entries);
    const first = body[0] ?? active.entries[0];
    if (!first) return;
    store.setBodyFollow('auto');
    store.requestDissolve(first.sceneId, first.key);
    store.setLibraryOpen(false);
  };

  return (
    <div className="playlist-manager" data-testid="playlist-manager">
      <div className="playlist-hero">
        <div>
          <p className="playlist-kicker">Visual set</p>
          <h2 className="playlist-title">{active.name}</h2>
          <p className="playlist-lead">
            Ordered visualizations — like a Winamp playlist. Pin favorites to
            the deck (1–0), then play the set or jump a cue.
          </p>
        </div>
        <button
          type="button"
          className="playlist-play-set"
          data-testid="play-visual-set"
          disabled={active.entries.length === 0}
          onClick={playVisualSet}
          title="Auto-follow the set from the first body cue (or first entry)"
        >
          Play visual set
        </button>
      </div>

      <div className="playlist-bar">
        <label className="playlist-pick">
          <span>Setlist</span>
          <select
            value={active.id}
            aria-label="Active playlist"
            onChange={(event) => store.setActivePlaylist(event.target.value)}
          >
            {playlists.map((entry) => (
              <option key={entry.id} value={entry.id}>
                {entry.name} ({entry.entries.length})
              </option>
            ))}
          </select>
        </label>
        {renaming ? (
          <label className="playlist-rename">
            <span>Rename</span>
            <input
              type="text"
              maxLength={40}
              value={renameDraft}
              placeholder={active.name}
              onChange={(event) => setRenameDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  store.renamePlaylist(active.id, renameDraft);
                  setRenaming(false);
                  setRenameDraft('');
                }
              }}
            />
          </label>
        ) : (
          <button
            type="button"
            onClick={() => {
              setRenameDraft(active.name);
              setRenaming(true);
            }}
          >
            Rename
          </button>
        )}
        <button
          type="button"
          disabled={playlists.length <= 1}
          title={playlists.length <= 1 ? 'Keep at least one playlist' : undefined}
          onClick={() => store.deletePlaylist(active.id)}
        >
          Delete
        </button>
        <label className="playlist-new">
          <span>New</span>
          <input
            type="text"
            maxLength={40}
            value={draft}
            placeholder="Name"
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') create();
            }}
          />
        </label>
        <button type="button" onClick={create} disabled={!draft.trim()}>
          Create
        </button>
      </div>

      <CoverageMeter
        totalSec={showTotalSec(bodyEntries(active.entries))}
        referenceSec={active.targetSec ?? null}
        referenceLabel="TARGET"
      />
      <div className="playlist-states">
        {(
          [
            ['pre', 'Pré'],
            ['pause', 'Pausa'],
            ['post', 'Pós'],
          ] as const
        ).map(([slot, label]) => (
          <label key={slot} className="playlist-state">
            <span>{label}</span>
            <select
              aria-label={`${label}-show cue`}
              value={
                (slot === 'pre'
                  ? active.preCue
                  : slot === 'pause'
                    ? active.pauseCue
                    : active.postCue) ?? ''
              }
              onChange={(event) =>
                store.setStateCue(
                  active.id,
                  slot,
                  event.target.value === '' ? null : Number(event.target.value),
                )
              }
            >
              <option value="">—</option>
              {library.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.name}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
      <div className="playlist-bind">
        {trackName ? (
          trackBindings[trackName] === active.id ? (
            <button type="button" onClick={() => store.unbindTrack(trackName)}>
              Unbind {trackName}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => store.bindTrack(trackName, active.id)}
            >
              Bind {trackName} to {active.name}
            </button>
          )
        ) : (
          <span className="playlist-bind-hint">Load a track to bind it</span>
        )}
        <button
          type="button"
          onClick={() => store.generateBody(active.targetSec ?? null)}
          title="Fill the body from library order (explicit tap only)"
          data-testid="body-generate"
        >
          Generate
        </button>
      </div>
      {(() => {
        const conflicts = windowConflicts(bodyEntries(active.entries));
        if (conflicts.length === 0) return null;
        const label = (key: string) => {
          const entry = active.entries.find((item) => item.key === key);
          return entry
            ? (names.get(entry.sceneId) ?? `#${entry.sceneId}`)
            : key;
        };
        return (
          <p className="playlist-conflict" data-testid="playlist-conflict">
            Sobreposição:{' '}
            {conflicts
              .map(
                (conflict) =>
                  `${label(conflict.withKey)} × ${label(conflict.key)}`,
              )
              .join('; ')}{' '}
            — ajuste os pinos para distribuir.
          </p>
        );
      })()}
      <div className="playlist-target">
        <span>Show target {formatTrackTime(active.targetSec ?? 0)}</span>
        <button
          type="button"
          onClick={() =>
            store.setPlaylistTarget(
              active.id,
              (active.targetSec ?? 0) - SHOW_TARGET_STEP_SEC,
            )
          }
          title={`Shorten show target by ${SHOW_TARGET_STEP_SEC}s`}
          aria-label="Shorten show target by one minute"
        >
          −
        </button>
        <button
          type="button"
          onClick={() =>
            store.setPlaylistTarget(
              active.id,
              (active.targetSec ?? 0) + SHOW_TARGET_STEP_SEC,
            )
          }
          title={`Lengthen show target by ${SHOW_TARGET_STEP_SEC}s`}
          aria-label="Lengthen show target by one minute"
        >
          +
        </button>
        {active.targetSec != null && (
          <button
            type="button"
            onClick={() => store.setPlaylistTarget(active.id, null)}
            title="Clear the manual show target"
          >
            Clear
          </button>
        )}
        {bodyEntries(active.entries).length > 0 && (
          <button
            type="button"
            onClick={() =>
              store.setBodyFollow(
                bodyEntries(active.entries).every(
                  (entry) => cueTiming(entry).follow === 'auto',
                )
                  ? 'manual'
                  : 'auto',
              )
            }
            title="Flip every body cue between auto-advance and manual hold"
            data-testid="body-follow-toggle"
          >
            Body:{' '}
            {bodyEntries(active.entries).every(
              (entry) => cueTiming(entry).follow === 'auto',
            )
              ? 'auto'
              : 'manual'}
          </button>
        )}
        {bodyEntries(active.entries).length > 1 ? (
          <button
            type="button"
            disabled={windowConflicts(bodyEntries(active.entries)).length > 0}
            onClick={() => store.distributeBody(active.targetSec ?? null)}
            title={
              windowConflicts(bodyEntries(active.entries)).length > 0
                ? 'Resolve overlaps first (see message above)'
                : 'Even unfixed body cues over the target (else the current total)'
            }
            data-testid="body-distribute"
            data-dirty={showDirty ? 'true' : undefined}
          >
            {showDirty ? 'Distribute •' : 'Distribute'}
          </button>
        ) : null}
      </div>

      <div className="playlist-panes">
        <div className="playlist-pane">
          <h3>Scene library · {library.length}</h3>
          <ul className="playlist-rows" data-testid="visual-library">
            {library.map((preset) => (
              <li key={preset.id} className="playlist-row visual">
                <SceneThumb preset={preset} size="sm" />
                <span className="playlist-name">{preset.name}</span>
                <button
                  type="button"
                  title="Append to visual set (duplicates allowed)"
                  onClick={() => store.addSceneToPlaylist(active.id, preset.id)}
                >
                  +
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="playlist-pane">
          <h3>
            Setlist · {active.entries.length} · deck{' '}
            {Math.min(active.entries.length, DECK_SIZE)}/{DECK_SIZE}
          </h3>
          <ul className="playlist-rows" data-testid="visual-setlist">
            {active.entries.map((entry, index) => {
              const inDeck = index < DECK_SIZE;
              const preset = resolvePreset(entry.sceneId, library);
              const isLive =
                activeEntryKey === entry.key ||
                (!activeEntryKey && activePresetId === entry.sceneId);
              return (
                <li
                  key={entry.key}
                  className={
                    isLive ? 'playlist-row visual is-live' : 'playlist-row visual'
                  }
                  {...sectionDropProps(index, (from, to) =>
                    store.movePlaylistScene(from, to),
                  )}
                >
                  <span
                    className={inDeck ? 'playlist-slot' : 'playlist-slot dim'}
                    title={
                      inDeck
                        ? `Shortcut ${index === DECK_SIZE - 1 ? '0' : index + 1} — drag to reorder`
                        : `Position ${index + 1} (no shortcut) — drag to reorder`
                    }
                    draggable
                    {...rowDragStart(index)}
                  >
                    {index + 1}
                  </span>
                  {preset ? (
                    <button
                      type="button"
                      className="playlist-thumb-hit"
                      title="Play this visualization"
                      data-testid={`play-cue-${entry.key}`}
                      onClick={() => playCue(entry.sceneId, entry.key)}
                    >
                      <SceneThumb
                        preset={preset}
                        size="md"
                        active={isLive}
                      />
                    </button>
                  ) : (
                    <span className="playlist-thumb-missing" />
                  )}
                  <button
                    type="button"
                    className="playlist-name-hit"
                    onClick={() => playCue(entry.sceneId, entry.key)}
                  >
                    <span className="playlist-name">
                      {names.get(entry.sceneId) ?? `#${entry.sceneId}`}
                    </span>
                    <span
                      className="playlist-time"
                      title={`Cue ${formatTrackTime(cueTiming(entry).durationSec)} · ${cueTiming(entry).follow}`}
                    >
                      {sanitizeAnchor(entry.startSec) !== null
                        ? `◈ ${formatTrackTime(sanitizeAnchor(entry.startSec) ?? 0)}`
                        : formatTrackTime(cueTiming(entry).durationSec)}
                    </span>
                  </button>
                  <div className="playlist-actions">
                    <button
                      type="button"
                      disabled={index === 0}
                      title="Move up (renumbers shortcuts)"
                      onClick={() => store.movePlaylistScene(index, index - 1)}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      disabled={index === active.entries.length - 1}
                      title="Move down (renumbers shortcuts)"
                      onClick={() => store.movePlaylistScene(index, index + 1)}
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      title={inDeck ? 'Unpin from deck' : 'Pin to deck'}
                      onClick={() => store.pinScene(entry.key)}
                    >
                      {inDeck ? '★' : '☆'}
                    </button>
                    <button
                      type="button"
                      title="Remove this occurrence"
                      onClick={() =>
                        store.removeSceneFromPlaylist(active.id, entry.key)
                      }
                    >
                      ✕
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
