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
  | { type: 'togglePlayback' }
  | { type: 'setOverlayText'; text: string }
  | { type: 'setMix'; slot: string; value: number }
  | { type: 'setZoom'; value: number }
  | { type: 'setStrobeHz'; value: number };

export interface ControlSnapshot {
  activePresetId: number;
  presetCount: number;
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
}

export type ControlMessage =
  | { kind: 'hello'; source: 'controls' }
  | { kind: 'snapshot'; snapshot: ControlSnapshot }
  | { type: 'command'; command: ControlCommand };

const COMMAND_TYPES: ReadonlySet<string> = new Set([
  'dissolve',
  'nextPreset',
  'prevPreset',
  'hardCut',
  'cycleDuration',
  'stepHue',
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
  'togglePlayback',
  'setOverlayText',
  'setMix',
  'setZoom',
  'setStrobeHz',
]);

function hasValidPayload(command: Record<string, unknown>): boolean {
  switch (command['type']) {
    case 'dissolve':
      return typeof command['id'] === 'number';
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
      return typeof command['value'] === 'number';
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
  track: { fileName: string | null; isPlaying: boolean },
  presetCount: number,
): ControlSnapshot {
  return {
    activePresetId: state.activePresetId,
    presetCount,
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

/**
 * Button A: hide or show the interface. Never opens a popup and never
 * touches fullscreen, so it is safe at any moment of a performance.
 */
export function toggleInterfaceVisibility(): void {
  const store = useDirectorStore.getState();
  if (store.panelMode === 'detached') closeControlsPopup();
  store.setPanelMode(resolveVisibilityToggle(store.panelMode));
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
