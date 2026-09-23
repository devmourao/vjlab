import { useRef, useState } from 'react';
import { useDirectorStore } from '../director/directorStore';
import { PRESETS } from '../scenes/presets';
import type { ScenePreset } from '../scenes/presets';
import { SceneEditor } from './SceneEditor';
import './SceneList.css';

/**
 * Single source for the scene selection list, shared by the side panel
 * and the bottom sheet. Pointer-friendly companion to keyboard presets.
 */
function useAllPresets() {
  const customPresets = useDirectorStore((s) => s.customPresets);
  return [...PRESETS, ...customPresets];
}

export function SceneList() {
  const activePresetId = useDirectorStore((s) => s.activePresetId);
  const sceneOrder = useDirectorStore((s) => s.sceneOrder);
  const favoriteIds = useDirectorStore((s) => s.favoriteIds);
  const all = useAllPresets();
  const ordered = sceneOrder
    .map((id) => all.find((preset) => preset.id === id))
    .filter((entry): entry is ScenePreset => Boolean(entry));
  const missing = all.filter((preset) => !sceneOrder.includes(preset.id));
  const presets = [...ordered, ...missing];
  const favorites = new Set(favoriteIds);
  const [editing, setEditing] = useState<ScenePreset | null | undefined>(undefined);
  const [report, setReport] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const isNative = (id: number) => PRESETS.some((entry) => entry.id === id);

  const onImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const result = useDirectorStore.getState().importScenes(parsed);
        const lines: string[] = [];
        if (result.headerErrors.length > 0) lines.push(`Header: ${result.headerErrors.join('; ')}`);
        if (result.accepted.length > 0) lines.push(`Accepted: ${result.accepted.map((entry) => entry.name).join(', ')}`);
        if (result.rejected.length > 0) lines.push(`Rejected: ${result.rejected.map((entry) => `${entry.id} (${entry.reason})`).join('; ')}`);
        setReport(lines.join(' | ') || 'No scenes found');
      } catch (err) {
        setReport(err instanceof Error ? err.message : 'Invalid file');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  return (
    <div className="scene-library" data-testid="scene-library">
      <div className="scene-library-actions">
        <button type="button" onClick={() => setEditing(null)} data-testid="create-scene">
          Create
        </button>
        <button type="button" onClick={() => useDirectorStore.getState().exportCustomScenes()} data-testid="export-scenes">
          Export
        </button>
        <label className="scene-import">
          Import
          <input ref={fileRef} type="file" accept="application/json" onChange={onImport} hidden />
        </label>
      </div>
      {report && <p className="scene-report" data-testid="import-report">{report}</p>}
      <ul className="scene-list" data-testid="scene-list">
        {presets.map((preset, index) => (
          <li key={preset.id} className="scene-row">
            <button
              type="button"
              className={preset.id === activePresetId ? 'scene-item active' : 'scene-item'}
              data-testid={`scene-button-${preset.id}`}
              onClick={() => useDirectorStore.getState().requestDissolve(preset.id)}
            >
              <span className="scene-swatch" style={{ background: preset.palette.primary }} aria-hidden />
              <strong>{preset.name}</strong>
              {favorites.has(preset.id) && (
                <span className="scene-fav" title="Favorite" aria-hidden>
                  ★
                </span>
              )}
              {isNative(preset.id) && <span className="scene-badge-native">native</span>}
              <span className="scene-sub">
                {preset.gain.toFixed(1)}x · {preset.speed.toFixed(1)}x
              </span>
            </button>
            <div className="scene-item-actions">
              <button type="button" disabled={index === 0} onClick={() => useDirectorStore.getState().reorderScenes(index, index - 1)} data-testid={`up-scene-${preset.id}`}>
                ↑
              </button>
              <button type="button" disabled={index === presets.length - 1} onClick={() => useDirectorStore.getState().reorderScenes(index, index + 1)} data-testid={`down-scene-${preset.id}`}>
                ↓
              </button>
              <button
                type="button"
                onClick={() => useDirectorStore.getState().toggleFavorite(preset.id)}
                data-testid={`fav-scene-${preset.id}`}
                title={favorites.has(preset.id) ? 'Unfavorite' : 'Favorite'}
              >
                {favorites.has(preset.id) ? '★' : '☆'}
              </button>
              {!isNative(preset.id) && (
                <>
                  <button type="button" onClick={() => setEditing(preset)} data-testid={`edit-scene-${preset.id}`}>
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => useDirectorStore.getState().deleteScene(preset.id)}
                    data-testid={`delete-scene-${preset.id}`}
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
      {editing !== undefined && (
        <SceneEditor preset={editing ?? undefined} onClose={() => setEditing(undefined)} />
      )}
    </div>
  );
}
