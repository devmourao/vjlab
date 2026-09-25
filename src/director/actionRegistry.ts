import {
  toggleControlsDetachment,
  toggleInterfaceVisibility,
} from './controlChannel';
import {
  liveRefs,
  selectActivePlaylist,
  useDirectorStore,
} from './directorStore';

const CAMERA_STEP = 0.12;
const FRACTAL_PRESET_ID = 5;

export type ActionCategory =
  | 'Deck'
  | 'Scenes'
  | 'Stage'
  | 'Strobe'
  | 'Effects'
  | 'Flags'
  | 'Overlay'
  | 'Library'
  | 'System';

export interface ActionDef {
  /** Stable id: the only thing future bindings persist. */
  id: string;
  label: string;
  category: ActionCategory;
  /** Default event.code. Remappable from K2 on. */
  code: string;
  /** Per-action sensitivity for continuous controls. */
  step?: number;
  /** Guide row display; entries sharing it merge into one row. */
  guide?: string;
  /** Extra guide row appended after the merged rows. */
  extraGuide?: string;
  preventDefault?: boolean;
  run: () => void;
}

function dissolveAt(index: number): void {
  const store = useDirectorStore.getState();
  const slot = selectActivePlaylist(store).entries[index];
  if (slot) store.requestDissolve(slot.sceneId, slot.key);
  else store.requestDissolve(index);
}



function fractalActive(): boolean {
  return useDirectorStore.getState().activePresetId === FRACTAL_PRESET_ID;
}

/**
 * Canonical action registry: every bindable deck action exactly once,
 * with its default key. Deck runs these directly; the popup (P4) and
 * remapping (K2) resolve through the same ids. Behavior here mirrors
 * the former keyboard switch one to one.
 */
export const ACTIONS: ActionDef[] = [
  { id: 'deck.slot.1', label: 'Dissolve deck position 1', category: 'Deck', code: 'Digit1', guide: '1–0', run: () => dissolveAt(0) },
  { id: 'deck.slot.2', label: 'Dissolve deck position 2', category: 'Deck', code: 'Digit2', guide: '1–0', run: () => dissolveAt(1) },
  { id: 'deck.slot.3', label: 'Dissolve deck position 3', category: 'Deck', code: 'Digit3', guide: '1–0', run: () => dissolveAt(2) },
  { id: 'deck.slot.4', label: 'Dissolve deck position 4', category: 'Deck', code: 'Digit4', guide: '1–0', run: () => dissolveAt(3) },
  { id: 'deck.slot.5', label: 'Dissolve deck position 5', category: 'Deck', code: 'Digit5', guide: '1–0', run: () => dissolveAt(4) },
  { id: 'deck.slot.6', label: 'Dissolve deck position 6', category: 'Deck', code: 'Digit6', guide: '1–0', run: () => dissolveAt(5) },
  { id: 'deck.slot.7', label: 'Dissolve deck position 7', category: 'Deck', code: 'Digit7', guide: '1–0', run: () => dissolveAt(6) },
  { id: 'deck.slot.8', label: 'Dissolve deck position 8', category: 'Deck', code: 'Digit8', guide: '1–0', run: () => dissolveAt(7) },
  { id: 'deck.slot.9', label: 'Dissolve deck position 9', category: 'Deck', code: 'Digit9', guide: '1–0', run: () => dissolveAt(8) },
  { id: 'deck.slot.10', label: 'Dissolve deck position 10', category: 'Deck', code: 'Digit0', guide: '1–0', run: () => dissolveAt(9) },
  { id: 'deck.slot.1.pad', label: 'Dissolve deck position 1', category: 'Deck', code: 'Numpad1', run: () => dissolveAt(0) },
  { id: 'deck.slot.2.pad', label: 'Dissolve deck position 2', category: 'Deck', code: 'Numpad2', run: () => dissolveAt(1) },
  { id: 'deck.slot.3.pad', label: 'Dissolve deck position 3', category: 'Deck', code: 'Numpad3', run: () => dissolveAt(2) },
  { id: 'deck.slot.4.pad', label: 'Dissolve deck position 4', category: 'Deck', code: 'Numpad4', run: () => dissolveAt(3) },
  { id: 'deck.slot.5.pad', label: 'Dissolve deck position 5', category: 'Deck', code: 'Numpad5', run: () => dissolveAt(4) },
  { id: 'deck.slot.6.pad', label: 'Dissolve deck position 6', category: 'Deck', code: 'Numpad6', run: () => dissolveAt(5) },
  { id: 'deck.slot.7.pad', label: 'Dissolve deck position 7', category: 'Deck', code: 'Numpad7', run: () => dissolveAt(6) },
  { id: 'deck.slot.8.pad', label: 'Dissolve deck position 8', category: 'Deck', code: 'Numpad8', run: () => dissolveAt(7) },
  { id: 'deck.slot.9.pad', label: 'Dissolve deck position 9', category: 'Deck', code: 'Numpad9', run: () => dissolveAt(8) },
  { id: 'deck.slot.10.pad', label: 'Dissolve deck position 10', category: 'Deck', code: 'Numpad0', run: () => dissolveAt(9) },
  { id: 'scene.next', label: 'Dissolve next in playlist', category: 'Scenes', code: 'KeyN', guide: 'N / P', run: () => useDirectorStore.getState().nextPreset() },
  { id: 'scene.prev', label: 'Dissolve previous in playlist', category: 'Scenes', code: 'KeyP', guide: 'N / P', run: () => useDirectorStore.getState().prevPreset() },
  { id: 'scene.cut', label: 'Hard cut to next preset', category: 'Scenes', code: 'KeyX', guide: 'X', run: () => useDirectorStore.getState().hardCutNext() },
  { id: 'scene.duration', label: 'Cycle transition duration', category: 'Scenes', code: 'KeyY', guide: 'Y', run: () => useDirectorStore.getState().cycleDuration() },
  { id: 'overlay.fire', label: 'Fire text overlay', category: 'Overlay', code: 'KeyT', guide: 'T', run: () => useDirectorStore.getState().fireText() },
  { id: 'fx.hue.step', label: 'Step global hue shift', category: 'Effects', code: 'KeyH', guide: 'H', run: () => useDirectorStore.getState().stepHue() },
  { id: 'strobe.toggle', label: 'Toggle strobe (default off)', category: 'Strobe', code: 'Space', guide: 'Space', preventDefault: true, run: () => useDirectorStore.getState().toggleStrobe() },
  { id: 'strobe.mode', label: 'Cycle strobe mode (white/black/color)', category: 'Strobe', code: 'KeyO', guide: 'O', run: () => useDirectorStore.getState().cycleStrobeMode() },
  { id: 'burst.fire', label: 'Fire burst impulse', category: 'Strobe', code: 'KeyB', guide: 'B', run: () => useDirectorStore.getState().fireBurst() },
  { id: 'camera.left', label: 'Nudge camera', category: 'Stage', code: 'ArrowLeft', guide: 'Arrows', preventDefault: true, step: CAMERA_STEP, run: () => {
    const store = useDirectorStore.getState();
    if (fractalActive()) { store.cycleFractalInner(-1); return; }
    liveRefs.azimuth -= CAMERA_STEP;
  } },
  { id: 'camera.right', label: 'Nudge camera', category: 'Stage', code: 'ArrowRight', guide: 'Arrows', preventDefault: true, step: CAMERA_STEP, run: () => {
    const store = useDirectorStore.getState();
    if (fractalActive()) { store.cycleFractalInner(1); return; }
    liveRefs.azimuth += CAMERA_STEP;
  } },
  { id: 'camera.up', label: 'Nudge camera', category: 'Stage', code: 'ArrowUp', guide: 'Arrows', preventDefault: true, step: CAMERA_STEP, extraGuide: '↑/↓ (Fractal)', run: () => {
    const store = useDirectorStore.getState();
    if (fractalActive()) { store.cycleFractalShape(1); return; }
    liveRefs.elevation = Math.min(1.2, liveRefs.elevation + CAMERA_STEP);
  } },
  { id: 'camera.down', label: 'Nudge camera', category: 'Stage', code: 'ArrowDown', guide: 'Arrows', preventDefault: true, step: CAMERA_STEP, run: () => {
    const store = useDirectorStore.getState();
    if (fractalActive()) { store.cycleFractalShape(-1); return; }
    liveRefs.elevation = Math.max(-1.2, liveRefs.elevation - CAMERA_STEP);
  } },
  { id: 'camera.zoom.in', label: 'Zoom in / out (damped)', category: 'Stage', code: 'Equal', guide: '+ / -', preventDefault: true, run: () => useDirectorStore.getState().zoomIn() },
  { id: 'camera.zoom.in.pad', label: 'Zoom in / out (damped)', category: 'Stage', code: 'NumpadAdd', preventDefault: true, run: () => useDirectorStore.getState().zoomIn() },
  { id: 'camera.zoom.out', label: 'Zoom in / out (damped)', category: 'Stage', code: 'Minus', guide: '+ / -', preventDefault: true, run: () => useDirectorStore.getState().zoomOut() },
  { id: 'camera.zoom.out.pad', label: 'Zoom in / out (damped)', category: 'Stage', code: 'NumpadSubtract', preventDefault: true, run: () => useDirectorStore.getState().zoomOut() },
  { id: 'fx.slot.select', label: 'Select effect slot', category: 'Effects', code: 'KeyE', guide: 'E / ]', run: () => useDirectorStore.getState().cycleFxSlot() },
  { id: 'fx.slot.select.alt', label: 'Select effect slot', category: 'Effects', code: 'Backslash', run: () => useDirectorStore.getState().cycleFxSlot() },
  { id: 'fx.mix.up', label: 'Effect mix up / down (selected slot, ABNT2: [ / ´)', category: 'Effects', code: 'KeyR', guide: 'R / F', run: () => useDirectorStore.getState().fxUp() },
  { id: 'fx.mix.up.alt', label: 'Effect mix up / down (selected slot, ABNT2: [ / ´)', category: 'Effects', code: 'BracketRight', run: () => useDirectorStore.getState().fxUp() },
  { id: 'fx.mix.down', label: 'Effect mix up / down (selected slot, ABNT2: [ / ´)', category: 'Effects', code: 'KeyF', guide: 'R / F', run: () => useDirectorStore.getState().fxDown() },
  { id: 'fx.mix.down.alt', label: 'Effect mix up / down (selected slot, ABNT2: [ / ´)', category: 'Effects', code: 'BracketLeft', run: () => useDirectorStore.getState().fxDown() },
  { id: 'strobe.slower', label: 'Strobe speed down / up', category: 'Strobe', code: 'Comma', guide: ', / .', run: () => useDirectorStore.getState().strobeSlower() },
  { id: 'strobe.faster', label: 'Strobe speed down / up', category: 'Strobe', code: 'Period', guide: ', / .', run: () => useDirectorStore.getState().strobeFaster() },
  { id: 'flag.vhs', label: 'Toggle VHS glitch', category: 'Flags', code: 'KeyV', guide: 'V', run: () => useDirectorStore.getState().toggleVhs() },
  { id: 'flag.rgb', label: 'Toggle RGB split', category: 'Flags', code: 'KeyC', guide: 'C', run: () => useDirectorStore.getState().toggleRgb() },
  { id: 'flag.beat', label: 'Toggle beat flash', category: 'Flags', code: 'KeyJ', guide: 'J', run: () => useDirectorStore.getState().toggleBeatFlash() },
  { id: 'flag.bypass', label: 'Bypass all post-processing', category: 'Flags', code: 'KeyK', guide: 'K', run: () => useDirectorStore.getState().toggleFxBypass() },
  { id: 'about.toggle', label: 'Toggle About panel', category: 'System', code: 'KeyI', guide: 'I', run: () => useDirectorStore.getState().toggleAbout() },
  { id: 'lite.toggle', label: 'Toggle lite mode', category: 'System', code: 'KeyL', guide: 'L', run: () => useDirectorStore.getState().toggleLite() },
  { id: 'effects.kill', label: 'Kill all effects', category: 'Effects', code: 'KeyS', guide: 'S', run: () => useDirectorStore.getState().killAll() },
  { id: 'ui.visibility', label: 'Toggle interface visibility (docked / hidden)', category: 'System', code: 'KeyU', guide: 'U', run: () => toggleInterfaceVisibility() },
  { id: 'controls.detach', label: 'Detach controls to second screen (repeat to dock back)', category: 'System', code: 'KeyD', guide: 'D', run: () => toggleControlsDetachment() },
  { id: 'output.fullscreen', label: 'Toggle fullscreen output', category: 'System', code: 'KeyG', guide: 'G / F11', run: () => {
    const el = document.documentElement;
    if (!document.fullscreenElement) void el.requestFullscreen().catch(() => {});
    else void document.exitFullscreen().catch(() => {});
  } },
  { id: 'output.fullscreen.f11', label: 'Toggle fullscreen output', category: 'System', code: 'F11', guide: 'G / F11', run: () => {
    const el = document.documentElement;
    if (!document.fullscreenElement) void el.requestFullscreen().catch(() => {});
    else void document.exitFullscreen().catch(() => {});
  } },
  { id: 'autopilot.toggle', label: 'Toggle auto-pilot tour', category: 'System', code: 'KeyA', guide: 'A', run: () => useDirectorStore.getState().toggleAutoPilot() },
  { id: 'library.toggle', label: 'Toggle scene library', category: 'Library', code: 'KeyM', guide: 'M', run: () => {
    const store = useDirectorStore.getState();
    store.setLibraryOpen(!store.libraryOpen);
  } },
  { id: 'axis.z.plus', label: 'Z axis + (Fractal Z / camera roll)', category: 'Stage', code: 'KeyQ', guide: 'Q / W', step: CAMERA_STEP, run: () => {
    const store = useDirectorStore.getState();
    if (store.activePresetId === FRACTAL_PRESET_ID) { store.rotateFractalZ(1); return; }
    liveRefs.roll -= CAMERA_STEP;
  } },
  { id: 'axis.z.minus', label: 'Z axis − (Fractal Z / camera roll)', category: 'Stage', code: 'KeyW', guide: 'Q / W', step: CAMERA_STEP, run: () => {
    const store = useDirectorStore.getState();
    if (store.activePresetId === FRACTAL_PRESET_ID) { store.rotateFractalZ(-1); return; }
    liveRefs.roll += CAMERA_STEP;
  } },
  { id: 'dialogs.close', label: 'Close topmost dialog', category: 'System', code: 'Escape', run: () => {
    const store = useDirectorStore.getState();
    if (store.aboutOpen) store.toggleAbout();
    if (store.helpOpen) store.setHelpOpen(false);
    if (store.libraryOpen) store.setLibraryOpen(false);
  } },
];

export function buildKeymap(): Map<string, ActionDef> {
  return new Map(ACTIONS.map((action) => [action.code, action]));
}

export interface GuideRow {
  key: string;
  action: string;
}

/** Guide table derived from the registry; replaces the hand-kept map. */
export function deriveShortcutMap(): GuideRow[] {
  const rows: GuideRow[] = [];
  const seen = new Set<string>();
  for (const action of ACTIONS) {
    if (!action.guide || seen.has(action.guide)) continue;
    seen.add(action.guide);
    rows.push({ key: action.guide, action: action.label });
  }
  for (const action of ACTIONS) {
    if (action.extraGuide) {
      rows.push({ key: action.extraGuide, action: 'Fractal next/prev shape (when Fractal active)' });
    }
  }
  return rows;
}
