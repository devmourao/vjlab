import { useRef, useState } from 'react';
import { useDirectorStore } from '../director/directorStore';
import { PRESETS } from '../scenes/presets';
import type { ScenePreset } from '../scenes/presets';
import { PresetBuilder } from './PresetBuilder';
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

export interface SceneListOps {
  onRemove?: (id: number) => void;
  onMove?: (from: number, to: number) => void;
  onToggleFavorite?: (id: number) => void;
  onExport?: () => void;
  onImport?: (file: File) => void;
  onSaveDraft?: (
    draft: Omit<ScenePreset, 'id'>,
    editingId: number | null,
  ) => void;
  importReport?: string | null;
}

export function SceneList({
  items,
  favoriteIds: favoriteOverride,
  sceneOrder: orderOverride,
  activeId: activeOverride,
  onSelect,
  manage = true,
  ops = {},
}: {
  items?: ScenePreset[];
  favoriteIds?: number[];
  sceneOrder?: number[];
  activeId?: number;
  onSelect?: (id: number) => void;
  manage?: boolean;
  ops?: SceneListOps;
} = {}) {
  const storeActive = useDirectorStore((s) => s.activePresetId);
  // Remote callers mirror the deck's active scene instead of the
  // popup-local one, so the highlight follows the stage.
  const activePresetId = activeOverride ?? storeActive;
  const storeOrder = useDirectorStore((s) => s.sceneOrder);
  // Remote callers (second-screen popup) mirror the deck order instead of
  // the popup-local one, so both windows list scenes identically.
  const sceneOrder = orderOverride ?? storeOrder;
  const storeFavorites = useDirectorStore((s) => s.favoriteIds);
  const storePresets = useAllPresets();
  const all = items ?? storePresets;
  const ordered = sceneOrder
    .map((id) => all.find((preset) => preset.id === id))
    .filter((entry): entry is ScenePreset => Boolean(entry));
  const missing = all.filter((preset) => !sceneOrder.includes(preset.id));
  const presets = [...ordered, ...missing];
  const favorites = new Set(favoriteOverride ?? storeFavorites);
  const select =
    onSelect ?? ((id: number) => useDirectorStore.getState().requestDissolve(id));
  const [editing, setEditing] = useState<ScenePreset | null | undefined>(undefined);
  const [building, setBuilding] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const remoteSave = ops.onSaveDraft ?? null;
  const fileRef = useRef<HTMLInputElement | null>(null);
  const isNative = (id: number) => PRESETS.some((entry) => entry.id === id);

  const onImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (ops.onImport) {
      ops.onImport(file);
      event.target.value = '';
      return;
    }
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
      {manage && (
      <div className="scene-library-actions">
        <button type="button" onClick={() => setBuilding(true)} data-testid="open-builder">
          Builder
        </button>
        <button type="button" onClick={() => setEditing(null)} data-testid="create-scene">
          Create
        </button>
        <button
          type="button"
          onClick={() =>
            ops.onExport
              ? ops.onExport()
              : useDirectorStore.getState().exportCustomScenes()
          }
          data-testid="export-scenes"
        >
          Export
        </button>
        <label className="scene-import">
          Import
          <input ref={fileRef} type="file" accept="application/json" onChange={onImport} hidden />
        </label>
      </div>
      )}
      {manage && report && <p className="scene-report" data-testid="import-report">{report}</p>}
      <ul className="scene-list" data-testid="scene-list">
        {presets.map((preset, index) => (
          <li key={preset.id} className="scene-row">
            <button
              type="button"
              className={preset.id === activePresetId ? 'scene-item active' : 'scene-item'}
              data-testid={`scene-button-${preset.id}`}
              onClick={() => select(preset.id)}
            >
              <span className="scene-swatch" style={{ background: preset.palette.primary }} aria-hidden />
              <strong>{preset.name}</strong>
              {favorites.has(preset.id) && (
                <span className="scene-fav" title="Favorite" aria-hidden>
                  ★
                </span>
              )}
              {isNative(preset.id) && <span className="scene-badge-native">native</span>}
            </button>
            {manage && (
            <div className="scene-item-actions">
              <button type="button" disabled={index === 0} onClick={() => (ops.onMove ? ops.onMove(index, index - 1) : useDirectorStore.getState().reorderScenes(index, index - 1))} data-testid={`up-scene-${preset.id}`}>
                ↑
              </button>
              <button type="button" disabled={index === presets.length - 1} onClick={() => (ops.onMove ? ops.onMove(index, index + 1) : useDirectorStore.getState().reorderScenes(index, index + 1))} data-testid={`down-scene-${preset.id}`}>
                ↓
              </button>
              <button
                type="button"
                onClick={() => (ops.onToggleFavorite ? ops.onToggleFavorite(preset.id) : useDirectorStore.getState().toggleFavorite(preset.id))}
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
                    onClick={() =>
                      ops.onRemove
                        ? ops.onRemove(preset.id)
                        : useDirectorStore.getState().deleteScene(preset.id)
                    }
                    data-testid={`delete-scene-${preset.id}`}
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
            )}
          </li>
        ))}
      </ul>
      {manage && editing !== undefined && (
        <SceneEditor
          preset={editing ?? undefined}
          onClose={() => setEditing(undefined)}
          onSave={
            remoteSave
              ? (draft, editingId) =>
                  remoteSave({ ...draft, instances: draft.instances ?? [] }, editingId)
              : undefined
          }
        />
      )}
      {manage && building && (
        <PresetBuilder
          onClose={() => setBuilding(false)}
          onSave={
            remoteSave
              ? (draft) => remoteSave({ ...draft, instances: draft.instances ?? [] }, null)
              : undefined
          }
        />
      )}
      {manage && ops.importReport && (
        <p className="scene-report" data-testid="import-report-remote">
          {ops.importReport}
        </p>
      )}
    </div>
  );
}
