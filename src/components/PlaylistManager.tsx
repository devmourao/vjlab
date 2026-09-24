import { useState } from 'react';
import {
  DECK_SIZE,
  useDirectorStore,
} from '../director/directorStore';
import { PRESETS } from '../scenes/presets';
import './PlaylistManager.css';

/**
 * Library tab managing playlists: create, rename, delete and switch,
 * plus membership (library on the left, playlist on the right).
 * Playlist arrows reorder execution; stars pin the nine-slot deck.
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
  const deckFull = active.favoriteIds.length >= DECK_SIZE;

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
                {entry.name} ({entry.sceneIds.length})
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
            {library.map((preset) => {
              const included = active.sceneIds.includes(preset.id);
              return (
                <li key={preset.id} className="playlist-row">
                  <span className="playlist-name">{preset.name}</span>
                  <button
                    type="button"
                    disabled={included}
                    title={included ? 'Already in playlist' : 'Add to playlist'}
                    onClick={() => store.addSceneToPlaylist(active.id, preset.id)}
                  >
                    +
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="playlist-pane">
          <h3>
            {active.name} · {active.sceneIds.length} · deck{' '}
            {active.favoriteIds.length}/{DECK_SIZE}
          </h3>
          {deckFull && (
            <p className="playlist-hint">Deck full — unstar a slot to pin another.</p>
          )}
          <ul className="playlist-rows">
            {active.sceneIds.map((id, index) => {
              const favIndex = active.favoriteIds.indexOf(id);
              return (
                <li key={id} className="playlist-row">
                  {favIndex >= 0 && (
                    <span className="playlist-slot" title={`Deck slot ${favIndex + 1}`}>
                      {favIndex + 1}
                    </span>
                  )}
                  <span className="playlist-name">{names.get(id) ?? `#${id}`}</span>
                  <div className="playlist-actions">
                    <button
                      type="button"
                      disabled={index === 0}
                      title="Move up in execution order"
                      onClick={() => store.movePlaylistScene(index, index - 1)}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      disabled={index === active.sceneIds.length - 1}
                      title="Move down in execution order"
                      onClick={() => store.movePlaylistScene(index, index + 1)}
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      disabled={favIndex < 0 && deckFull}
                      title={
                        favIndex >= 0
                          ? 'Unpin from deck'
                          : deckFull
                            ? 'Deck full'
                            : 'Pin to deck'
                      }
                      onClick={() => store.toggleFavorite(id)}
                    >
                      {favIndex >= 0 ? '★' : '☆'}
                    </button>
                    <button
                      type="button"
                      title="Remove from playlist"
                      onClick={() => store.removeSceneFromPlaylist(active.id, id)}
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
