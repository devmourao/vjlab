import { create } from 'zustand';
import { PRESET_COUNT } from '../scenes/presets';
import {
  CONTRAST_DEFAULT,
  MIX_STEP,
  SATURATION_DEFAULT,
  STROBE_DEFAULT_HZ,
  ZOOM_STEP,
  clampContrast,
  clampMix,
  clampSaturation,
  clampStrobeHz,
  clampZoom,
  nextFxSlot,
  nextStrobeMode,
  type FxSlot,
  type StrobeMode,
} from './fx';
import { DEFAULT_TRANSITION_DURATION, nextDuration } from './transition';

export type PanelMode = 'docked' | 'detached' | 'hidden';

interface DirectorState {
  strobeOn: boolean;
  burstCount: number;
  activePresetId: number;
  transitionDuration: number;
  hueShift: number;
  zoomTarget: number;
  selectedFx: FxSlot;
  mixBloom: number;
  mixVignette: number;
  mixStrobe: number;
  masterMix: number;
  strobeRateHz: number;
  strobeMode: StrobeMode;
  colorSaturation: number;
  colorContrast: number;
  vhsOn: boolean;
  rgbOn: boolean;
  beatFlashOn: boolean;
  fxBypassed: boolean;
  aboutOpen: boolean;
  helpOpen: boolean;
  tourSeen: boolean;
  tourOpen: boolean;
  liteOn: boolean;
  overlayText: string;
  overlayVisible: boolean;
  overlayKey: number;
  meshTextureUrl: string | null;
  meshTextureStatus: 'idle' | 'loading' | 'ready' | 'error';
  panelMode: PanelMode;
  autoPilotOn: boolean;
  fractalShape: number;
  fractalZ: number;
  fractalInner: number;
  toggleStrobe: () => void;
  fireBurst: () => void;
  killAll: () => void;
  setPreset: (id: number) => void;
  nextPreset: () => void;
  prevPreset: () => void;
  requestDissolve: (id: number) => void;
  hardCutNext: () => void;
  cycleDuration: () => void;
  stepHue: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  cycleFxSlot: () => void;
  selectFxSlot: (slot: FxSlot) => void;
  fxUp: () => void;
  fxDown: () => void;
  strobeFaster: () => void;
  strobeSlower: () => void;
  cycleStrobeMode: () => void;
  toggleVhs: () => void;
  toggleRgb: () => void;
  toggleBeatFlash: () => void;
  toggleFxBypass: () => void;
  toggleAbout: () => void;
  toggleHelp: () => void;
  setHelpOpen: (open: boolean) => void;
  completeTour: () => void;
  replayTour: () => void;
  closeTour: () => void;
  toggleLite: () => void;
  setOverlayText: (text: string) => void;
  fireText: () => void;
  hideText: () => void;
  setMeshTexture: (url: string | null) => void;
  setMeshTextureStatus: (
    status: 'idle' | 'loading' | 'ready' | 'error',
  ) => void;
  cyclePanelMode: () => void;
  setPanelMode: (mode: PanelMode) => void;
  toggleAutoPilot: () => void;
  cycleFractalShape: (dir: 1 | -1) => void;
  rotateFractalZ: (dir: 1 | -1) => void;
  cycleFractalInner: (dir: 1 | -1) => void;
}

/**
 * Low-frequency director state only (safe for React re-render).
 * Per-frame data (audio bands, camera nudge, burst impulse) lives in
 * mutable refs in `liveRefs` to avoid 60 fps re-renders.
 */
const TOUR_SEEN_KEY = 'vjlab.tour.seen.v1';

function readTourSeen(): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    return window.localStorage.getItem(TOUR_SEEN_KEY) === '1';
  } catch {
    return false;
  }
}

function writeTourSeen(): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    window.localStorage.setItem(TOUR_SEEN_KEY, '1');
  } catch {
    // Private mode or blocked storage must never break the deck.
  }
}

const tourSeenInitial = readTourSeen();

export const useDirectorStore = create<DirectorState>((set) => ({
  strobeOn: false,
  burstCount: 0,
  activePresetId: 0,
  transitionDuration: DEFAULT_TRANSITION_DURATION,
  hueShift: 0,
  zoomTarget: 1,
  selectedFx: 'bloom',
  mixBloom: 1,
  mixVignette: 1,
  mixStrobe: 1,
  masterMix: 1,
  strobeRateHz: STROBE_DEFAULT_HZ,
  strobeMode: 'white',
  colorSaturation: SATURATION_DEFAULT,
  colorContrast: CONTRAST_DEFAULT,
  vhsOn: false,
  rgbOn: false,
  beatFlashOn: false,
  fxBypassed: false,
  aboutOpen: false,
  helpOpen: false,
  tourSeen: tourSeenInitial,
  tourOpen: !tourSeenInitial,
  liteOn: false,
  overlayText: 'VJ LAB',
  overlayVisible: false,
  overlayKey: 0,
  meshTextureUrl: null,
  meshTextureStatus: 'idle',
  panelMode: 'docked',
  autoPilotOn: true,
  fractalShape: 0,
  fractalZ: 0,
  fractalInner: 1.9,
  toggleStrobe: () => set((s) => ({ strobeOn: !s.strobeOn })),
  fireBurst: () => {
    liveRefs.burstId += 1;
    liveRefs.boost = 1;
    set((s) => ({ burstCount: s.burstCount + 1 }));
  },
  killAll: () => {
    liveRefs.burstId = 0;
    liveRefs.boost = 0;
    set({
      strobeOn: false,
      burstCount: 0,
      overlayVisible: false,
      vhsOn: false,
      rgbOn: false,
      beatFlashOn: false,
      fxBypassed: false,
    });
  },
  setPreset: (id: number) =>
    set({
      activePresetId:
        ((Math.floor(id) % PRESET_COUNT) + PRESET_COUNT) % PRESET_COUNT,
    }),
  nextPreset: () =>
    set((s) => ({ activePresetId: (s.activePresetId + 1) % PRESET_COUNT })),
  prevPreset: () =>
    set((s) => ({
      activePresetId:
        (s.activePresetId - 1 + PRESET_COUNT) % PRESET_COUNT,
    })),
  requestDissolve: (id: number) => {
    const { activePresetId } = useDirectorStore.getState();
    const target =
      ((Math.floor(id) % PRESET_COUNT) + PRESET_COUNT) % PRESET_COUNT;
    if (target === activePresetId || transitionRef.active) return;
    transitionRef.active = true;
    transitionRef.swapped = false;
    transitionRef.start = performance.now();
    transitionRef.to = target;
  },
  hardCutNext: () => {
    const { activePresetId } = useDirectorStore.getState();
    transitionRef.active = false;
    transitionRef.swapped = false;
    useDirectorStore
      .getState()
      .setPreset(activePresetId + 1);
  },
  cycleDuration: () =>
    set((s) => ({ transitionDuration: nextDuration(s.transitionDuration) })),
  stepHue: () => set((s) => ({ hueShift: (s.hueShift + 1 / 8) % 1 })),
  setOverlayText: (text: string) =>
    set({ overlayText: text.slice(0, 60) }),
  fireText: () =>
    set((s) => ({
      overlayVisible: true,
      overlayKey: s.overlayKey + 1,
    })),
  hideText: () => set({ overlayVisible: false }),
  setMeshTexture: (url: string | null) =>
    set({ meshTextureUrl: url, meshTextureStatus: url ? 'loading' : 'idle' }),
  setMeshTextureStatus: (
    status: 'idle' | 'loading' | 'ready' | 'error',
  ) => set({ meshTextureStatus: status }),
  strobeFaster: () =>
    set((s) => ({ strobeRateHz: clampStrobeHz(s.strobeRateHz + 1) })),
  strobeSlower: () =>
    set((s) => ({ strobeRateHz: clampStrobeHz(s.strobeRateHz - 1) })),
  toggleVhs: () => set((s) => ({ vhsOn: !s.vhsOn })),
  toggleRgb: () => set((s) => ({ rgbOn: !s.rgbOn })),
  toggleBeatFlash: () => set((s) => ({ beatFlashOn: !s.beatFlashOn })),
  toggleFxBypass: () => set((s) => ({ fxBypassed: !s.fxBypassed })),
  toggleAbout: () => set((s) => ({ aboutOpen: !s.aboutOpen })),
  toggleHelp: () => set((s) => ({ helpOpen: !s.helpOpen })),
  setHelpOpen: (open: boolean) => set({ helpOpen: open }),
  completeTour: () => {
    writeTourSeen();
    set({ tourSeen: true, tourOpen: false });
  },
  replayTour: () => set({ tourOpen: true }),
  closeTour: () => set({ tourOpen: false }),
  toggleLite: () => set((s) => ({ liteOn: !s.liteOn })),
  cyclePanelMode: () =>
    set((s) => ({
      panelMode:
        s.panelMode === 'docked'
          ? 'detached'
          : s.panelMode === 'detached'
            ? 'hidden'
            : 'docked',
    })),
  setPanelMode: (mode: PanelMode) => set({ panelMode: mode }),
  toggleAutoPilot: () => set((s) => ({ autoPilotOn: !s.autoPilotOn })),
  cycleFractalShape: (dir) =>
    set((s) => ({
      fractalShape: (s.fractalShape + dir + 5) % 5,
    })),
  rotateFractalZ: (dir) =>
    set((s) => ({
      fractalZ: s.fractalZ + dir * 0.45,
    })),
  cycleFractalInner: (dir) =>
    set((s) => ({
      fractalInner: Math.max(1.3, Math.min(2.4, s.fractalInner + dir * 0.15)),
    })),
  zoomIn: () => {
    // Held keys auto-repeat, so each event steps the damped target.
    set((s) => ({ zoomTarget: clampZoom(s.zoomTarget + ZOOM_STEP) }));
  },
  zoomOut: () => {
    set((s) => ({ zoomTarget: clampZoom(s.zoomTarget - ZOOM_STEP) }));
  },
  cycleFxSlot: () => set((s) => ({ selectedFx: nextFxSlot(s.selectedFx) })),
  selectFxSlot: (slot: FxSlot) => set({ selectedFx: slot }),
  cycleStrobeMode: () =>
    set((s) => ({ strobeMode: nextStrobeMode(s.strobeMode) })),
  fxUp: () =>
    set((s) => {
      const read = (key: FxSlot): number =>
        key === 'bloom'
          ? s.mixBloom
          : key === 'vignette'
            ? s.mixVignette
            : key === 'strobe'
              ? s.mixStrobe
              : key === 'master'
                ? s.masterMix
                : key === 'saturation'
                  ? s.colorSaturation
                  : s.colorContrast;
      const value = (key: FxSlot): number =>
        key === 'contrast'
          ? clampContrast(read(key) + MIX_STEP)
          : key === 'saturation'
            ? clampSaturation(read(key) + MIX_STEP)
            : clampMix(read(key) + MIX_STEP);
      return {
        mixBloom: s.selectedFx === 'bloom' ? value('bloom') : s.mixBloom,
        mixVignette:
          s.selectedFx === 'vignette' ? value('vignette') : s.mixVignette,
        mixStrobe:
          s.selectedFx === 'strobe' ? value('strobe') : s.mixStrobe,
        masterMix:
          s.selectedFx === 'master' ? value('master') : s.masterMix,
        colorSaturation:
          s.selectedFx === 'saturation'
            ? value('saturation')
            : s.colorSaturation,
        colorContrast:
          s.selectedFx === 'contrast' ? value('contrast') : s.colorContrast,
      };
    }),
  fxDown: () =>
    set((s) => {
      const read = (key: FxSlot): number =>
        key === 'bloom'
          ? s.mixBloom
          : key === 'vignette'
            ? s.mixVignette
            : key === 'strobe'
              ? s.mixStrobe
              : key === 'master'
                ? s.masterMix
                : key === 'saturation'
                  ? s.colorSaturation
                  : s.colorContrast;
      const value = (key: FxSlot): number =>
        key === 'contrast'
          ? clampContrast(read(key) - MIX_STEP)
          : key === 'saturation'
            ? clampSaturation(read(key) - MIX_STEP)
            : clampMix(read(key) - MIX_STEP);
      return {
        mixBloom: s.selectedFx === 'bloom' ? value('bloom') : s.mixBloom,
        mixVignette:
          s.selectedFx === 'vignette' ? value('vignette') : s.mixVignette,
        mixStrobe:
          s.selectedFx === 'strobe' ? value('strobe') : s.mixStrobe,
        masterMix:
          s.selectedFx === 'master' ? value('master') : s.masterMix,
        colorSaturation:
          s.selectedFx === 'saturation'
            ? value('saturation')
            : s.colorSaturation,
        colorContrast:
          s.selectedFx === 'contrast' ? value('contrast') : s.colorContrast,
      };
    }),
}));

export const liveRefs = {
  burstId: 0,
  boost: 0,
  azimuth: 0,
  elevation: 0,
  zoom: 1,
};

export const transitionRef = {
  active: false,
  swapped: false,
  start: 0,
  to: 0,
};

export const SHORTCUT_MAP: Array<{ key: string; action: string }> = [
  { key: '1–6', action: 'Dissolve to preset' },
  { key: 'N / P', action: 'Dissolve next / previous in playlist' },
  { key: 'X', action: 'Hard cut to next preset' },
  { key: 'Y', action: 'Cycle transition duration' },
  { key: 'T', action: 'Fire text overlay' },
  { key: 'H', action: 'Step global hue shift' },
  { key: 'Space', action: 'Toggle strobe (default off)' },
  { key: 'O', action: 'Cycle strobe mode (white/black/color)' },
  { key: 'B', action: 'Fire burst impulse' },
  { key: 'Arrows', action: 'Nudge camera' },
  { key: '+ / -', action: 'Zoom in / out (damped)' },
  { key: 'E / ]', action: 'Select effect slot' },
  { key: 'R / F', action: 'Effect mix up / down (selected slot, ABNT2: [ / \u00B4)' },
  { key: ', / .', action: 'Strobe speed down / up' },
  { key: 'V', action: 'Toggle VHS glitch' },
  { key: 'C', action: 'Toggle RGB split' },
  { key: 'J', action: 'Toggle beat flash' },
  { key: '0', action: 'Bypass all post-processing' },
  { key: 'I', action: 'Toggle About panel' },
  { key: 'L', action: 'Toggle lite mode' },
  { key: 'S', action: 'Kill all effects' },
  { key: 'U', action: 'Cycle panel visibility (docked / detached / hidden)' },
  { key: 'G / F11', action: 'Toggle fullscreen output' },
  { key: 'A', action: 'Toggle auto-pilot tour' },
  { key: 'Q / W', action: 'Fractal Z rotation +/− (when Fractal active)' },
  { key: '↑/↓ (Fractal)', action: 'Fractal next/prev shape (when Fractal active)' },
];
