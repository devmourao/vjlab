import { useRef, useState } from 'react';
import { formatTrackTime } from '../audio/track';
import {
  DECK_SIZE,
  bodyEntries,
  cueTiming,
  cueWindows,
  sanitizeAnchor,
  useDirectorStore,
  type CueFollow,
  type CueWindow,
  type PlaylistEntry,
} from '../director/directorStore';
import { PRESETS } from '../scenes/presets';
import type { ScenePreset } from '../scenes/presets';
import { rowDragStart, sectionDropProps } from './controls/sectionDrag';
import { CueRail } from './CueRail';
import './CueRail.css';
import type { CueCountdown } from '../director/showClock';
import { PresetBuilder } from './PresetBuilder';
import { SceneEditor } from './SceneEditor';
import './SceneList.css';

/** Entries per console page before the full-list toggle. Matches the deck. */
export const SCENE_PAGE_SIZE = 10;

/** Duration stepper step (seconds). Steppers only in v1 — no drag. */
export const CUE_STEP_SEC = 5;

/**
 * Single source for scene rows. Two modes:
 * - entries mode (console, deck and popup): occurrence rows in playlist
 *   order with position badges; the top DECK_SIZE map to Digit1-Digit0.
 *   Starring pins the occurrence into the deck by position.
 * - library mode (no entries): every preset in library order with the
 *   CRUD chrome; pinning lives in the Playlists tab.
 */
function useAllPresets() {
  const customPresets = useDirectorStore((s) => s.customPresets);
  return [...PRESETS, ...customPresets];
}

export interface SceneListOps {
  onRemove?: (key: string) => void;
  onMove?: (from: number, to: number) => void;
  onPin?: (key: string) => void;
  onCueTiming?: (
    key: string,
    patch: { durationSec?: number; follow?: CueFollow },
  ) => void;
  onCueAnchor?: (key: string, seconds: number | null) => void;
  onExport?: () => void;
  onImport?: (file: File) => void;
  onSaveDraft?: (
    draft: Omit<ScenePreset, 'id'>,
    editingId: number | null,
  ) => void;
  importReport?: string | null;
}

interface SceneRow {
  key: string;
  preset: ScenePreset;
  position: number | null;
  timing?: { durationSec: number; follow: CueFollow };
  window?: CueWindow;
  anchor?: number | null;
}

function keyLabel(index: number): string {
  if (index < DECK_SIZE - 1) return `${index + 1}`;
  if (index === DECK_SIZE - 1) return '0';
  return '';
}

export function SceneList({
  items,
  entries,
  activeId: activeOverride,
  activeKey: activeKeyOverride,
  onSelect,
  manage = true,
  pageSize = SCENE_PAGE_SIZE,
  ops = {},
  cueClock = null,
}: {
  items?: ScenePreset[];
  entries?: PlaylistEntry[];
  activeId?: number;
  activeKey?: string | null;
  onSelect?: (id: number, key?: string | null) => void;
  manage?: boolean;
  pageSize?: number;
  ops?: SceneListOps;
  /** Live countdown (deck clock, or popup audio-derived); null hides it. */
  cueClock?: CueCountdown | null;
} = {}) {
  const storeActive = useDirectorStore((s) => s.activePresetId);
  const storeKey = useDirectorStore((s) => s.activeEntryKey);
  // Remote callers mirror the deck's active occurrence instead of the
  // popup-local one, so the highlight follows the stage position.
  const activePresetId = activeOverride ?? storeActive;
  const activeKey = activeKeyOverride !== undefined ? activeKeyOverride : storeKey;
  const storeOrder = useDirectorStore((s) => s.sceneOrder);
  const storePresets = useAllPresets();
  const all = items ?? storePresets;
  const byId = new Map(all.map((preset) => [preset.id, preset]));

  const windowsByKey = new Map(
    (entries ? cueWindows(entries) : []).map((window) => [window.key, window]),
  );
  // Body rows read body windows (track 0:00); pool rows keep the
  // sequential map for display only (pool never runs on the timeline).
  const bodyWindowsByKey = new Map(
    (entries ? cueWindows(bodyEntries(entries)) : []).map((window) => [
      window.key,
      window,
    ]),
  );
  const timeCue =
    ops.onCueTiming ??
    ((key: string, patch: { durationSec?: number; follow?: CueFollow }) =>
      useDirectorStore.getState().setCueTiming(key, patch));
  const anchorCue =
    ops.onCueAnchor ??
    ((key: string, seconds: number | null) =>
      useDirectorStore.getState().setCueAnchor(key, seconds));
  let rows: SceneRow[];
  if (entries) {
    rows = entries
      .map((entry, index): SceneRow | null => {
        const preset = byId.get(entry.sceneId);
        if (!preset) return null;
        const poolRow = index < DECK_SIZE;
        return {
          key: entry.key,
          preset,
          position: index,
          timing: cueTiming(entry),
          window: poolRow
            ? windowsByKey.get(entry.key)
            : bodyWindowsByKey.get(entry.key),
          anchor: sanitizeAnchor(entry.startSec),
        };
      })
      .filter((row): row is SceneRow => row !== null);
  } else {
    const ordered = storeOrder
      .map((id) => byId.get(id))
      .filter((entry): entry is ScenePreset => Boolean(entry));
    const missing = all.filter(
      (preset) => !storeOrder.includes(preset.id),
    );
    rows = [...ordered, ...missing].map((preset) => ({
      key: `lib-${preset.id}`,
      preset,
      position: null,
    }));
  }

  const [expanded, setExpanded] = useState(false);
  // Library mode collapses; entries mode always shows pool + body
  // (collapsing at 10 hid exactly the show behind the pool).
  const collapsible = !manage && !entries && rows.length > pageSize;
  const visible = collapsible && !expanded ? rows.slice(0, pageSize) : rows;

  const select =
    onSelect ??
    ((id: number, key?: string | null) =>
      useDirectorStore.getState().requestDissolve(id, key ?? null));
  const [editing, setEditing] = useState<ScenePreset | null | undefined>(undefined);
  const [building, setBuilding] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const remoteSave = ops.onSaveDraft ?? null;
  const fileRef = useRef<HTMLInputElement | null>(null);
  const isNative = (id: number) => PRESETS.some((entry) => entry.id === id);
  const pin = (key: string) => {
    if (ops.onPin) ops.onPin(key);
    else useDirectorStore.getState().pinScene(key);
  };

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
      {(() => {
        const renderRow = (row: SceneRow, visibleIndex: number) => {
          const { key, preset, position, timing, window, anchor } = row;
          const counting = cueClock?.key === key;
          const follow = timing?.follow ?? 'manual';
          // Pool positions are manual-only overlays: no anchor controls.
          const pool = position !== null && position < DECK_SIZE;
          const fixed = anchor ?? null;
          const inDeck = position !== null && position < DECK_SIZE;
          const libraryIndex = rows.findIndex((entry) => entry.key === key);
          const highlighted =
            position !== null && activeKey
              ? key === activeKey
              : preset.id === activePresetId;
          const orderIndex = position ?? libraryIndex;
          const moveRow =
            ops.onMove ??
            ((from: number, to: number) =>
              position !== null
                ? useDirectorStore.getState().movePlaylistScene(from, to)
                : useDirectorStore.getState().reorderScenes(from, to));
          return (
          <li
            key={key}
            className={timing ? 'scene-row timed' : 'scene-row'}
            {...sectionDropProps(orderIndex, moveRow)}
          >
            <button
              type="button"
              className={highlighted ? 'scene-item active' : 'scene-item'}
              data-testid={`scene-button-${preset.id}`}
              onClick={() => select(preset.id, position !== null ? key : null)}
            >
              {position !== null && (
                <span
                  className={inDeck ? 'scene-pos deck' : 'scene-pos'}
                  title={
                    inDeck
                      ? `Shortcut ${keyLabel(position)} · position ${position + 1} — drag to reorder`
                      : `Position ${position + 1} (no shortcut) — drag to reorder`
                  }
                  draggable
                  {...rowDragStart(orderIndex)}
                >
                  {position + 1}
                </span>
              )}
              <span
                className="scene-swatch"
                style={{ background: preset.palette.primary }}
                aria-hidden
                title={position === null ? 'Drag to reorder' : undefined}
                draggable={position === null}
                {...(position === null ? rowDragStart(orderIndex) : {})}
              />
              <strong>{preset.name}</strong>
              {inDeck && (
                <span className="scene-fav" title="Pinned to deck" aria-hidden>
                  ★
                </span>
              )}
              {timing && (
                <span
                  className={counting ? 'scene-timing live' : 'scene-timing'}
                  title={
                    window
                      ? `Cue ${formatTrackTime(timing.durationSec)} · in ${formatTrackTime(window.startSec)} → out ${formatTrackTime(window.endSec)} · ${follow}${fixed !== null ? ` · fixed ${formatTrackTime(fixed)}` : ''}`
                      : `Cue ${formatTrackTime(timing.durationSec)} · ${follow}`
                  }
                  data-testid={`cue-time-${key}`}
                >
                  {counting && cueClock
                    ? cueClock.held
                      ? 'HOLD'
                      : `◷ ${formatTrackTime(cueClock.remainingSec)}`
                    : fixed !== null
                      ? `◈ ${formatTrackTime(fixed)}`
                      : formatTrackTime(timing.durationSec)}
                </span>
              )}
              {isNative(preset.id) && <span className="scene-badge-native">native</span>}
            </button>
            <div className="scene-item-actions">
              {position !== null ? (
                <>
                  <span className="scene-actions-group" role="group" aria-label="Reorder">
                    <button type="button" disabled={position === 0} onClick={() => (ops.onMove ? ops.onMove(position, position - 1) : useDirectorStore.getState().movePlaylistScene(position, position - 1))} data-testid={`up-scene-${key}`} title="Move up (renumbers shortcuts)">
                      ↑
                    </button>
                    <button type="button" disabled={position === rows.length - 1} onClick={() => (ops.onMove ? ops.onMove(position, position + 1) : useDirectorStore.getState().movePlaylistScene(position, position + 1))} data-testid={`down-scene-${key}`} title="Move down (renumbers shortcuts)">
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => pin(key)}
                      data-testid={`fav-scene-${key}`}
                      title={inDeck ? 'Unpin from deck' : 'Pin to deck'}
                    >
                      {inDeck ? '★' : '☆'}
                    </button>
                  </span>
                  {timing && (
                    <>
                      <span className="scene-actions-group" role="group" aria-label="Duration seconds">
                        <button
                          type="button"
                          onClick={() =>
                            timeCue(key, { durationSec: timing.durationSec - CUE_STEP_SEC })
                          }
                          data-testid={`cue-minus-${key}`}
                          title={`Shorten cue by ${CUE_STEP_SEC}s`}
                          aria-label={`Shorten cue by ${CUE_STEP_SEC} seconds`}
                        >
                          −{CUE_STEP_SEC}s
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            timeCue(key, { durationSec: timing.durationSec + CUE_STEP_SEC })
                          }
                          data-testid={`cue-plus-${key}`}
                          title={`Lengthen cue by ${CUE_STEP_SEC}s`}
                          aria-label={`Lengthen cue by ${CUE_STEP_SEC} seconds`}
                        >
                          +{CUE_STEP_SEC}s
                        </button>
                        <button
                          type="button"
                          className={follow === 'auto' ? 'scene-follow auto' : 'scene-follow'}
                          onClick={() =>
                            timeCue(key, { follow: follow === 'auto' ? 'manual' : 'auto' })
                          }
                          data-testid={`cue-follow-${key}`}
                          title={
                            follow === 'auto'
                              ? 'Follow: auto — advance on expiry'
                              : 'Follow: manual — hold until advanced'
                          }
                          aria-label={`Follow mode ${follow}. Activate to switch.`}
                        >
                          {follow === 'auto' ? 'Auto' : 'Hold'}
                        </button>
                      </span>
                      {!pool && (
                        <span className="scene-actions-group" role="group" aria-label="Fixed start seconds">
                          {fixed === null ? (
                            <button
                              type="button"
                              onClick={() =>
                                anchorCue(key, window?.startSec ?? 0)
                              }
                              data-testid={`anchor-fix-${key}`}
                              title="Pin this cue at its natural start (harmless first step)"
                              aria-label="Pin cue at its natural start time"
                            >
                              ◈ Fix
                            </button>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => anchorCue(key, fixed - CUE_STEP_SEC)}
                                data-testid={`anchor-minus-${key}`}
                                title={`Move fixed start earlier by ${CUE_STEP_SEC}s`}
                                aria-label="Move fixed start earlier by five seconds"
                              >
                                −{CUE_STEP_SEC}s
                              </button>
                              <button
                                type="button"
                                onClick={() => anchorCue(key, fixed + CUE_STEP_SEC)}
                                data-testid={`anchor-plus-${key}`}
                                title={`Move fixed start later by ${CUE_STEP_SEC}s`}
                                aria-label="Move fixed start later by five seconds"
                              >
                                +{CUE_STEP_SEC}s
                              </button>
                              <button
                                type="button"
                                onClick={() => anchorCue(key, null)}
                                data-testid={`anchor-clear-${key}`}
                                title="Clear fixed start (back to sequential flow)"
                                aria-label="Clear fixed start"
                              >
                                ✕
                              </button>
                            </>
                          )}
                        </span>
                      )}
                    </>
                  )}
                </>
              ) : (
                <>
                  <button type="button" disabled={visibleIndex === 0} onClick={() => useDirectorStore.getState().reorderScenes(libraryIndex, libraryIndex - 1)} data-testid={`up-scene-${key}`}>
                    ↑
                  </button>
                  <button type="button" disabled={visibleIndex === visible.length - 1} onClick={() => useDirectorStore.getState().reorderScenes(libraryIndex, libraryIndex + 1)} data-testid={`down-scene-${key}`}>
                    ↓
                  </button>
                </>
              )}
              {manage && !isNative(preset.id) && (
                <>
                  <button type="button" onClick={() => setEditing(preset)} data-testid={`edit-scene-${preset.id}`}>
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      ops.onRemove
                        ? ops.onRemove(key)
                        : useDirectorStore.getState().deleteScene(preset.id)
                    }
                    data-testid={`delete-scene-${preset.id}`}
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </li>
          );
        };
        const poolVisible = (entries ? visible : []).filter(
          (row) => row.position !== null && row.position < DECK_SIZE,
        );
        const bodyVisible = (entries ? visible : []).filter(
          (row) => row.position === null || row.position >= DECK_SIZE,
        );
        const bodySource = entries ? bodyEntries(entries) : [];
        if (!entries) {
          return (
            <ul className="scene-list" data-testid="scene-list">
              {visible.map((row, visibleIndex) => renderRow(row, visibleIndex))}
            </ul>
          );
        }
        return (
          <>
            {poolVisible.length > 0 && (
              <>
                <p className="scene-group-title">Favoritos · teclas 1–0</p>
                <ul className="scene-list" data-testid="scene-list">
                  {poolVisible.map((row) => renderRow(row, row.position ?? 0))}
                </ul>
              </>
            )}
            {bodyVisible.length > 0 && (
              <>
                <p className="scene-group-title">Show · timeline</p>
                <div className="scene-list-wrap">
                  <CueRail
                    windows={cueWindows(bodySource)}
                    names={new Map(all.map((preset) => [preset.id, preset.name]))}
                    activeKey={activeKey}
                    fraction={cueClock?.fraction ?? null}
                    onSelect={(id, key) => select(id, key)}
                  />
                  <ul className="scene-list" data-testid="scene-list-body">
                    {bodyVisible.map((row) => renderRow(row, row.position ?? 0))}
                  </ul>
                </div>
              </>
            )}
          </>
        );
      })()}
      {collapsible && (
        <button
          type="button"
          className="scene-toggle"
          aria-expanded={expanded}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? 'Show less' : `Show full list (${rows.length - pageSize} more)`}
        </button>
      )}
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
