import { BASE_CAPABILITIES } from '../scenes/bases';
import type { ScenePreset } from '../scenes/presets';
import { useDirectorStore, type PanelMode } from './directorStore';

/**
 * Second-screen control protocol.
 *
 * The main deck owns all state (director store, audio engine, WebGL).
 * A control-only popup on a second screen never writes state directly:
 * it renders read-only snapshots and sends whitelisted commands back.
 * This split avoids sync loops by construction.
 */
export const CONTROL_CHANNEL = 'vjlab-control-v1';

export type ControlCommand =
  | { type: 'dissolve'; id: number }
  | { type: 'nextPreset' }
  | { type: 'prevPreset' }
  | { type: 'hardCut' }
  | { type: 'cycleDuration' }
  | { type: 'stepHue' }
  | { type: 'setHue'; value: number }
  | { type: 'zoomIn' }
  | { type: 'zoomOut' }
  | { type: 'cycleFxSlot' }
  | { type: 'selectFxSlot'; slot: string }
  | { type: 'fxUp' }
  | { type: 'fxDown' }
  | { type: 'strobeFaster' }
  | { type: 'strobeSlower' }
  | { type: 'cycleStrobeMode' }
  | { type: 'toggleStrobe' }
  | { type: 'toggleVhs' }
  | { type: 'toggleRgb' }
  | { type: 'toggleBeatFlash' }
  | { type: 'toggleFxBypass' }
  | { type: 'toggleLite' }
  | { type: 'toggleAutoPilot' }
  | { type: 'fireBurst' }
  | { type: 'fireText' }
  | { type: 'killAll' }
  | { type: 'setPanelMode'; mode: PanelMode }
  | { type: 'cyclePanelMode' }
  | { type: 'openLibrary' }
  | { type: 'closeLibrary' }
  | { type: 'showGuide' }
  | { type: 'replayTour' }
  | { type: 'togglePlayback' }
  | { type: 'playQueueTrack'; id: string }
  | { type: 'removeQueueTrack'; id: string }
  | { type: 'moveQueueTrack'; from: number; to: number }
  | { type: 'setOverlayText'; text: string }
  | { type: 'setMix'; slot: string; value: number }
  | { type: 'setZoom'; value: number }
  | { type: 'setStrobeHz'; value: number }
  | { type: 'uploadTrack'; name: string; mime: string; data: ArrayBuffer }
  | { type: 'createScene'; draft: SceneDraftPayload }
  | { type: 'updateScene'; id: number; patch: SceneDraftPayload }
  | { type: 'deleteScene'; id: number }
  | { type: 'moveScene'; from: number; to: number }
  | { type: 'toggleFavorite'; id: number }
  | { type: 'exportScenes' }
  | { type: 'importPack'; pack: unknown };

export interface SceneDraftPayload {
  name: string;
  palette: { primary: string; emissive: string };
  background: string;
  gain: number;
  speed: number;
  instances: Array<{ base: string; params?: Record<string, unknown> }>;
}

export interface SnapshotPreset {
  id: number;
  name: string;
  palette: { primary: string; emissive: string };
  background: string;
  gain: number;
  speed: number;
  instances: Array<{ base: string; params?: Record<string, unknown> }>;
}

export interface ControlSnapshot {
  activePresetId: number;
  presets: SnapshotPreset[];
  favoriteIds: number[];
  sceneOrder: number[];
  strobeOn: boolean;
  strobeMode: string;
  strobeRateHz: number;
  vhsOn: boolean;
  rgbOn: boolean;
  beatFlashOn: boolean;
  fxBypassed: boolean;
  liteOn: boolean;
  autoPilotOn: boolean;
  panelMode: PanelMode;
  hueShift: number;
  zoomTarget: number;
  transitionDuration: number;
  selectedFx: string;
  mixes: Record<string, number>;
  fileName: string | null;
  isPlaying: boolean;
  audioError: string | null;
  queue: Array<{ id: string; name: string }>;
  mediaIndex: number | null;
}

export interface ImportResult {
  accepted: string[];
  rejected: Array<{ id: string; reason: string }>;
}

export type ControlMessage =
  | { kind: 'hello'; source: 'controls' }
  | { kind: 'snapshot'; snapshot: ControlSnapshot }
  | { kind: 'importResult'; result: ImportResult }
  | { type: 'command'; command: ControlCommand };

const COMMAND_TYPES: ReadonlySet<string> = new Set([
  'dissolve',
  'nextPreset',
  'prevPreset',
  'hardCut',
  'cycleDuration',
  'stepHue',
  'setHue',
  'zoomIn',
  'zoomOut',
  'cycleFxSlot',
  'selectFxSlot',
  'fxUp',
  'fxDown',
  'strobeFaster',
  'strobeSlower',
  'cycleStrobeMode',
  'toggleStrobe',
  'toggleVhs',
  'toggleRgb',
  'toggleBeatFlash',
  'toggleFxBypass',
  'toggleLite',
  'toggleAutoPilot',
  'fireBurst',
  'fireText',
  'killAll',
  'setPanelMode',
  'cyclePanelMode',
  'openLibrary',
  'closeLibrary',
  'showGuide',
  'replayTour',
  'togglePlayback',
  'playQueueTrack',
  'removeQueueTrack',
  'moveQueueTrack',
  'setOverlayText',
  'setMix',
  'setZoom',
  'setStrobeHz',
  'uploadTrack',
  'createScene',
  'updateScene',
  'deleteScene',
  'moveScene',
  'toggleFavorite',
  'exportScenes',
  'importPack',
]);

const KNOWN_BASE_IDS = new Set(Object.keys(BASE_CAPABILITIES));

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isSceneDraft(value: unknown): boolean {
  if (!isRecord(value)) return false;
  if (typeof value['name'] !== 'string' || !value['name']) return false;
  if (!Array.isArray(value['instances']) || value['instances'].length === 0) {
    return false;
  }
  return value['instances'].every(
    (entry) =>
      isRecord(entry) &&
      typeof entry['base'] === 'string' &&
      KNOWN_BASE_IDS.has(entry['base']),
  );
}

function hasValidPayload(command: Record<string, unknown>): boolean {
  switch (command['type']) {
    case 'dissolve':
      return typeof command['id'] === 'number';
    case 'playQueueTrack':
    case 'removeQueueTrack':
      return typeof command['id'] === 'string';
    case 'moveQueueTrack':
      return (
        typeof command['from'] === 'number' &&
        typeof command['to'] === 'number'
      );
    case 'selectFxSlot':
      return typeof command['slot'] === 'string';
    case 'setPanelMode':
      return typeof command['mode'] === 'string';
    case 'setOverlayText':
      return typeof command['text'] === 'string';
    case 'setMix':
      return (
        typeof command['slot'] === 'string' &&
        typeof command['value'] === 'number'
      );
    case 'setZoom':
    case 'setStrobeHz':
    case 'setHue':
      return typeof command['value'] === 'number';
    case 'uploadTrack':
      return (
        typeof command['name'] === 'string' &&
        command['name'].length > 0 &&
        typeof command['mime'] === 'string' &&
        command['data'] instanceof ArrayBuffer &&
        command['data'].byteLength > 0
      );
    case 'createScene':
      return isSceneDraft(command['draft']);
    case 'updateScene':
      return (
        typeof command['id'] === 'number' && isSceneDraft(command['patch'])
      );
    case 'deleteScene':
    case 'toggleFavorite':
      return typeof command['id'] === 'number';
    case 'moveScene':
      return (
        typeof command['from'] === 'number' &&
        typeof command['to'] === 'number'
      );
    case 'exportScenes':
      return true;
    case 'importPack':
      return command['pack'] !== undefined;
    default:
      return true;
  }
}

export function isControlMessage(value: unknown): value is ControlMessage {
  if (typeof value !== 'object' || value === null) return false;
  const record = value as Record<string, unknown>;
  if (record['kind'] === 'hello') return record['source'] === 'controls';
  if (record['kind'] === 'snapshot') {
    return (
      typeof record['snapshot'] === 'object' && record['snapshot'] !== null
    );
  }
  if (record['kind'] === 'importResult') {
    return (
      typeof record['result'] === 'object' && record['result'] !== null
    );
  }
  if (record['type'] === 'command') {
    const command = record['command'] as Record<string, unknown> | null;
    if (typeof command !== 'object' || command === null) return false;
    return (
      typeof command['type'] === 'string' &&
      COMMAND_TYPES.has(command['type']) &&
      hasValidPayload(command)
    );
  }
  return false;
}

export function buildSnapshot(
  state: ReturnType<typeof useDirectorStore.getState>,
  track: { fileName: string | null; isPlaying: boolean; error?: string | null },
  presets: ScenePreset[],
  favoriteIds: number[],
): ControlSnapshot {
  return {
    activePresetId: state.activePresetId,
    presets: presets.map((preset) => ({
      id: preset.id,
      name: preset.name,
      palette: { ...preset.palette },
      background: preset.background,
      gain: preset.gain,
      speed: preset.speed,
      instances: (preset.instances ?? []).map((instance) => ({
        base: instance.base,
        params: { ...(instance.params ?? {}) },
      })),
    })),
    favoriteIds: [...favoriteIds],
    sceneOrder: [...state.sceneOrder],
    strobeOn: state.strobeOn,
    strobeMode: state.strobeMode,
    strobeRateHz: state.strobeRateHz,
    vhsOn: state.vhsOn,
    rgbOn: state.rgbOn,
    beatFlashOn: state.beatFlashOn,
    fxBypassed: state.fxBypassed,
    liteOn: state.liteOn,
    autoPilotOn: state.autoPilotOn,
    panelMode: state.panelMode,
    hueShift: state.hueShift,
    zoomTarget: state.zoomTarget,
    transitionDuration: state.transitionDuration,
    selectedFx: state.selectedFx,
    mixes: {
      bloom: state.mixBloom,
      vignette: state.mixVignette,
      strobe: state.mixStrobe,
      master: state.masterMix,
      saturation: state.colorSaturation,
      contrast: state.colorContrast,
    },
    fileName: track.fileName,
    isPlaying: track.isPlaying,
    audioError: track.error ?? null,
    queue: state.mediaQueue.map((entry) => ({ id: entry.id, name: entry.name })),
    mediaIndex: state.mediaIndex,
  };
}

let popupRef: Window | null = null;

export function openControlsPopup(): Window | null {
  try {
    if (typeof window === 'undefined') return null;
    if (popupRef && !popupRef.closed) {
      popupRef.focus();
      return popupRef;
    }
    const popup = window.open(
      `${window.location.origin}/controls`,
      '_blank',
      'width=460,height=700',
    );
    popupRef = popup;
    return popup;
  } catch {
    return null;
  }
}

export function closeControlsPopup(): void {
  try {
    if (popupRef && !popupRef.closed) popupRef.close();
  } catch {
    // A blocked or user-closed popup must never break the deck.
  } finally {
    popupRef = null;
  }
}

/**
 * Pure next state for the interface toggle (button A / U key).
 * Hiding and showing never opens popups and never touches fullscreen.
 */
export function resolveVisibilityToggle(mode: PanelMode): PanelMode {
  return mode === 'hidden' ? 'docked' : 'hidden';
}

/**
 * Pure next state for the detach toggle (button B / D key).
 * Detaching owns the popup; re-docking returns to the in-page panels.
 */
export function resolveDetachmentToggle(mode: PanelMode): PanelMode {
  return mode === 'detached' ? 'docked' : 'detached';
}

export function isControlsPopupOpen(): boolean {
  try {
    return popupRef !== null && !popupRef.closed;
  } catch {
    return false;
  }
}

/**
 * Button A: hide or show the main-screen interface. Never closes the
 * second-screen popup: the performance use case is a clean stage on the
 * main screen while control continues from the popup. Restoring from
 * hidden returns to detached when the popup is still open.
 */
export function toggleInterfaceVisibility(): void {
  const store = useDirectorStore.getState();
  if (store.panelMode === 'hidden') {
    store.setPanelMode(isControlsPopupOpen() ? 'detached' : 'docked');
    return;
  }
  store.setPanelMode('hidden');
}

/**
 * Button B: detach controls into the second-screen popup, or dock them
 * back into the interface. Must run inside a real user gesture so popup
 * blockers allow the window. Falls back to the in-page panel when the
 * popup is blocked.
 */
export function toggleControlsDetachment(): void {
  const store = useDirectorStore.getState();
  const next = resolveDetachmentToggle(store.panelMode);
  if (next === 'detached') {
    openControlsPopup();
  } else {
    closeControlsPopup();
  }
  store.setPanelMode(next);
}
