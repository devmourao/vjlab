import { useDirectorStore } from '../director/directorStore';
import { buildLibrary } from '../scenes/library';
import { PRESETS } from '../scenes/presets';
import './SceneList.css';

const FAVORITES = new Set(
  buildLibrary(PRESETS.map((preset) => preset.id))
    .filter((entry) => entry.favorite)
    .map((entry) => entry.presetId),
);

/**
 * Single source for the scene selection list, shared by the side panel
 * and the bottom sheet. Pointer-friendly companion to keyboard presets.
 */
export function SceneList() {
  const activePresetId = useDirectorStore((s) => s.activePresetId);

  return (
    <ul className="scene-list" data-testid="scene-list">
      {PRESETS.map((preset) => (
        <li key={preset.id}>
          <button
            type="button"
            className={
              preset.id === activePresetId
                ? 'scene-item active'
                : 'scene-item'
            }
            data-testid={`scene-button-${preset.id}`}
            onClick={() =>
              useDirectorStore.getState().requestDissolve(preset.id)
            }
          >
            <span
              className="scene-swatch"
              style={{ background: preset.palette.primary }}
              aria-hidden
            />
            <strong>{preset.name}</strong>
            {FAVORITES.has(preset.id) && (
              <span className="scene-fav" title="Favorite" aria-hidden>
                ★
              </span>
            )}
            <span className="scene-sub">
              {preset.gain.toFixed(1)}x · {preset.speed.toFixed(1)}x
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
