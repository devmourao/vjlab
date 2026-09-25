import { useState } from 'react';
import { DECK_SIZE, useDirectorStore } from '../director/directorStore';
import { PRESETS } from '../scenes/presets';
import { rowDragStart, sectionDropProps } from './controls/sectionDrag';
import './PlaylistManager.css';

/**
 * Library tab managing playlists: create, rename, delete and switch,
 * plus membership (library on the left, playlist sequence on the right).
 * Positions 1-DECK_SIZE map to Digit1-Digit0; starring pins the
 * occurrence into the deck by position.
 */
export function PlaylistManager() {
  const playlists = useDirectorStore((s) => s.playlists);
  const activePlaylistId = useDirectorStore((s) => s.activePlaylistId);
  const customPresets = useDirectorStore((s) => s.customPresets);
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

  return (
    <div className="playlist-manager" data-testid="playlist-manager">
      <div className="playlist-bar">
        <label className="playlist-pick">
          <span>Playlist</span>
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

      <div className="playlist-panes">
        <div className="playlist-pane">
          <h3>Library · {library.length}</h3>
          <ul className="playlist-rows">
            {library.map((preset) => (
              <li key={preset.id} className="playlist-row">
                <span className="playlist-name">{preset.name}</span>
                <button
                  type="button"
                  title="Append to playlist (duplicates allowed)"
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
            {active.name} · {active.entries.length} · deck{' '}
            {Math.min(active.entries.length, DECK_SIZE)}/{DECK_SIZE}
          </h3>
          <ul className="playlist-rows">
            {active.entries.map((entry, index) => {
              const inDeck = index < DECK_SIZE;
              return (
                <li
                  key={entry.key}
                  className="playlist-row"
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
                  <span className="playlist-name">
                    {names.get(entry.sceneId) ?? `#${entry.sceneId}`}
                  </span>
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
