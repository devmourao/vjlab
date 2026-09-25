import { create } from 'zustand';
import { createTrack, type Track } from '../audio/track';
import { readBindings, writeBindings, type Bindings } from './bindings';
import { exportScenesPack, validatePack } from '../packs/packFormat';
import { PRESETS, type ScenePreset } from '../scenes/presets';
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
  libraryOpen: boolean;
  tourSeen: boolean;
  tourOpen: boolean;
  liteOn: boolean;
  overlayText: string;
  overlayVisible: boolean;
  overlayKey: number;
  meshTextureStatus: 'idle' | 'loading' | 'ready' | 'error';
  instanceMaps: Record<string, string | null>;
  customPresets: ScenePreset[];
  mediaQueue: Track[];
  mediaIndex: number | null;
  sceneOrder: number[];
  playlists: ScenePlaylist[];
  activePlaylistId: string;
  /** Occurrence key playing on stage; null falls back to scene matching. */
  activeEntryKey: string | null;
  panelMode: PanelMode;
  autoPilotOn: boolean;
  fractalShape: number;
  fractalZ: number;
  fractalInner: number;
  toggleStrobe: () => void;
  fireBurst: () => void;
  killAll: () => void;
  setPreset: (id: number, key?: string | null) => void;
  nextPreset: () => void;
  prevPreset: () => void;
  requestDissolve: (id: number, key?: string | null) => void;
  hardCutNext: () => void;
  createScene: (preset: Omit<ScenePreset, 'id'>) => ScenePreset;
  updateScene: (id: number, patch: Partial<Omit<ScenePreset, 'id'>>) => void;
  deleteScene: (id: number) => void;
  importScenes: (packFile: unknown) => {
    accepted: ScenePreset[];
    rejected: Array<{ id: string; reason: string }>;
    headerErrors: string[];
  };
  exportCustomScenes: () => void;
  addMediaTracks: (files: File[]) => import('../audio/track').Track[];
  removeMediaTrack: (id: string) => void;
  reorderMedia: (from: number, to: number) => void;
  playMedia: (id: string) => void;
  reorderScenes: (from: number, to: number) => void;
  movePlaylistScene: (from: number, to: number) => void;
  pinScene: (key: string) => void;
  createPlaylist: (name: string) => void;
  renamePlaylist: (id: string, name: string) => void;
  deletePlaylist: (id: string) => void;
  setActivePlaylist: (id: string) => void;
  addSceneToPlaylist: (playlistId: string, sceneId: number) => void;
  removeSceneFromPlaylist: (playlistId: string, key: string) => void;
  cycleDuration: () => void;
  stepHue: () => void;
  setHueShift: (value: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  cycleFxSlot: () => void;
  selectFxSlot: (slot: FxSlot) => void;
  setFxMix: (slot: FxSlot, value: number) => void;
  setZoomTarget: (value: number) => void;
  setStrobeRate: (value: number) => void;
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
  setLibraryOpen: (open: boolean) => void;
  bindings: Bindings;
  setBinding: (id: string, code: string) => void;
  resetBindings: () => void;
  /** Console section order; JSON array, sync-ready for a future backend. */
  sectionOrder: string[];
  moveSection: (from: number, to: number) => void;
  resetSectionOrder: () => void;
  completeTour: () => void;
  replayTour: () => void;
  closeTour: () => void;
  toggleLite: () => void;
  setOverlayText: (text: string) => void;
  fireText: () => void;
  hideText: () => void;
  setInstanceMap: (key: string, url: string | null) => void;
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

const CUSTOM_PRESETS_KEY = 'vjlab.customPresets.v1';

function readCustomPresets(): ScenePreset[] {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return [];
    const raw = window.localStorage.getItem(CUSTOM_PRESETS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (entry): entry is ScenePreset =>
        typeof entry === 'object' &&
        entry !== null &&
        typeof (entry as ScenePreset).id === 'number' &&
        typeof (entry as ScenePreset).name === 'string' &&
        Array.isArray((entry as ScenePreset).instances),
    );
  } catch {
    return [];
  }
}

function writeCustomPresets(presets: ScenePreset[]): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    window.localStorage.setItem(CUSTOM_PRESETS_KEY, JSON.stringify(presets));
  } catch {
    // Private mode or quota must never break the deck.
  }
}

function allPresets(custom: ScenePreset[]): ScenePreset[] {
  return [...PRESETS, ...custom];
}

function findPreset(custom: ScenePreset[], id: number): ScenePreset | undefined {
  return allPresets(custom).find((preset) => preset.id === id);
}

function normalizeId(custom: ScenePreset[], id: number): number {
  const direct = findPreset(custom, id);
  if (direct) return direct.id;
  const ordered = allPresets(custom);
  const len = ordered.length;
  if (len === 0) return id;
  const wrapped = ((Math.floor(id) % len) + len) % len;
  return ordered[wrapped].id;
}

const SCENE_ORDER_KEY = 'vjlab.sceneOrder.v1';
const FAVORITES_KEY = 'vjlab.favorites.v1';

function readSceneOrder(custom: ScenePreset[]): number[] {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return allPresets(custom).map((entry) => entry.id);
    const raw = window.localStorage.getItem(SCENE_ORDER_KEY);
    if (!raw) return allPresets(custom).map((entry) => entry.id);
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return allPresets(custom).map((entry) => entry.id);
    const ids = parsed.filter((entry): entry is number => typeof entry === 'number');
    const allIds = new Set(allPresets(custom).map((entry) => entry.id));
    const filtered = ids.filter((id) => allIds.has(id));
    const missing = allPresets(custom).map((entry) => entry.id).filter((id) => !filtered.includes(id));
    return [...filtered, ...missing];
  } catch {
    return allPresets(custom).map((entry) => entry.id);
  }
}

function writeSceneOrder(order: number[]): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    window.localStorage.setItem(SCENE_ORDER_KEY, JSON.stringify(order));
  } catch {
    // Ignore
  }
}

function readFavorites(): number[] {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return [];
    const raw = window.localStorage.getItem(FAVORITES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((entry): entry is number => typeof entry === 'number');
  } catch {
    return [];
  }
}

/**
 * Quick-access deck size: playlist positions 1-10 map to Digit1-Digit9
 * and Digit0. Position IS the shortcut; starring pins into the deck.
 */
export const DECK_SIZE = 10;

import {
  moveOrderItem,
  readSectionOrder,
  SECTION_IDS,
  writeSectionOrder,
} from './sectionLayout';

export { SECTION_IDS };

export interface PlaylistEntry {
  key: string;
  sceneId: number;
}

export interface ScenePlaylist {
  id: string;
  name: string;
  /** Execution order; duplicates allowed, position maps to shortcuts. */
  entries: PlaylistEntry[];
}

const PLAYLISTS_KEY = 'vjlab.playlists.v1';
const ACTIVE_PLAYLIST_KEY = 'vjlab.activePlaylist.v1';

function sanitizeEntries(ids: unknown, valid: Set<number>): PlaylistEntry[] {
  if (!Array.isArray(ids)) return [];
  const entries: PlaylistEntry[] = [];
  const seenKeys = new Set<string>();
  let counter = 0;
  for (const entry of ids) {
    if (typeof entry !== 'object' || entry === null) continue;
    const record = entry as Record<string, unknown>;
    if (typeof record['sceneId'] !== 'number' || !valid.has(record['sceneId'])) {
      continue;
    }
    let key = typeof record['key'] === 'string' ? record['key'] : '';
    if (!key || seenKeys.has(key)) key = `e${counter}`;
    counter += 1;
    seenKeys.add(key);
    entries.push({ key, sceneId: record['sceneId'] });
  }
  return entries;
}

function sanitizeLegacyIds(ids: unknown, valid: Set<number>): number[] {
  if (!Array.isArray(ids)) return [];
  return ids.filter(
    (entry): entry is number => typeof entry === 'number' && valid.has(entry),
  );
}

function writePlaylists(playlists: ScenePlaylist[], activeId: string): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    window.localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(playlists));
    window.localStorage.setItem(ACTIVE_PLAYLIST_KEY, activeId);
  } catch {
    // Ignore
  }
}

function entriesFromLegacy(
  order: unknown,
  favorites: unknown,
  valid: Set<number>,
): PlaylistEntry[] {
  const cleanOrder = sanitizeLegacyIds(order, valid);
  const cleanFavs = sanitizeLegacyIds(favorites, valid).slice(0, DECK_SIZE);
  const rest = cleanOrder.filter((id) => !cleanFavs.includes(id));
  return [...cleanFavs, ...rest].map((sceneId, index) => ({
    key: `e${index}`,
    sceneId,
  }));
}

function readPlaylists(
  custom: ScenePreset[],
  legacyOrder: number[],
  legacyFavorites: number[],
): { playlists: ScenePlaylist[]; activeId: string } {
  const valid = new Set(allPresets(custom).map((entry) => entry.id));
  const cleanupLegacyKeys = () => {
    try {
      window.localStorage.removeItem(SCENE_ORDER_KEY);
      window.localStorage.removeItem(FAVORITES_KEY);
    } catch {
      // Ignore
    }
  };
  const fallback = (): { playlists: ScenePlaylist[]; activeId: string } => {
    let entries = entriesFromLegacy(legacyOrder, legacyFavorites, valid);
    if (entries.length === 0) {
      entries = allPresets(custom).map((entry, index) => ({
        key: `e${index}`,
        sceneId: entry.id,
      }));
    }
    const main: ScenePlaylist = { id: 'main', name: 'Main', entries };
    writePlaylists([main], main.id);
    cleanupLegacyKeys();
    return { playlists: [main], activeId: main.id };
  };
  try {
    if (typeof window === 'undefined' || !window.localStorage) return fallback();
    const raw = window.localStorage.getItem(PLAYLISTS_KEY);
    if (!raw) return fallback();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed) || parsed.length === 0) return fallback();
    const playlists: ScenePlaylist[] = [];
    for (const entry of parsed) {
      if (typeof entry !== 'object' || entry === null) continue;
      const record = entry as Record<string, unknown>;
      if (typeof record['id'] !== 'string' || typeof record['name'] !== 'string') {
        continue;
      }
      let entries: PlaylistEntry[];
      if (Array.isArray(record['entries'])) {
        entries = sanitizeEntries(record['entries'], valid);
      } else {
        // v1 shape: favorites lead, then the remaining order.
        entries = entriesFromLegacy(
          record['sceneIds'],
          record['favoriteIds'],
          valid,
        );
      }
      if (entries.length === 0) continue;
      playlists.push({
        id: record['id'],
        name: (record['name'] as string).slice(0, 40) || 'Untitled',
        entries,
      });
    }
    if (playlists.length === 0) return fallback();
    const storedActive = window.localStorage.getItem(ACTIVE_PLAYLIST_KEY);
    const activeId = playlists.some((entry) => entry.id === storedActive)
      ? (storedActive as string)
      : playlists[0].id;
    cleanupLegacyKeys();
    return { playlists, activeId };
  } catch {
    return fallback();
  }
}

/** Position cursor: active entry key first, scene id fallback, -1. */
export function positionIndex(state: {
  playlists: ScenePlaylist[];
  activePlaylistId: string;
  sceneOrder: number[];
  activeEntryKey: string | null;
  activePresetId: number;
}): number {
  const entries = selectActivePlaylist(state).entries;
  if (state.activeEntryKey) {
    const byKey = entries.findIndex((entry) => entry.key === state.activeEntryKey);
    if (byKey >= 0) return byKey;
  }
  return entries.findIndex((entry) => entry.sceneId === state.activePresetId);
}

/** Reactive active playlist for components. */
export function useActivePlaylist(): ScenePlaylist {
  const playlists = useDirectorStore((s) => s.playlists);
  const activePlaylistId = useDirectorStore((s) => s.activePlaylistId);
  const sceneOrder = useDirectorStore((s) => s.sceneOrder);
  return selectActivePlaylist({ playlists, activePlaylistId, sceneOrder });
}

/** Execution order: active playlist scenes, library order as fallback. */
export function playlistOrder(state: {
  playlists: ScenePlaylist[];
  activePlaylistId: string;
  sceneOrder: number[];
  customPresets: ScenePreset[];
}): number[] {
  const ids = selectActivePlaylist(state).entries.map((entry) => entry.sceneId);
  if (ids.length > 0) return ids;
  return state.sceneOrder.length > 0
    ? state.sceneOrder
    : allPresets(state.customPresets).map((entry) => entry.id);
}

/** Active playlist with a synthesized fallback that never breaks callers. */
export function selectActivePlaylist(state: {
  playlists: ScenePlaylist[];
  activePlaylistId: string;
  sceneOrder: number[];
}): ScenePlaylist {
  const found = state.playlists.find((entry) => entry.id === state.activePlaylistId);
  if (found) return found;
  if (state.playlists.length > 0) return state.playlists[0];
  const entries = [...state.sceneOrder].map((sceneId, index) => ({
    key: `e${index}`,
    sceneId,
  }));
  return { id: 'main', name: 'Main', entries };
}

const tourSeenInitial = readTourSeen();
const customPresetsInitial = readCustomPresets();
const sceneOrderInitial = readSceneOrder(customPresetsInitial);
const favoriteIdsInitial = (() => {
  const stored = readFavorites();
  if (stored.length > 0) return stored;
  return sceneOrderInitial.slice(0, DECK_SIZE);
})();
const playlistsInitial = readPlaylists(
  customPresetsInitial,
  sceneOrderInitial,
  favoriteIdsInitial,
);
const activeEntryKeyInitial = (() => {
  const active =
    playlistsInitial.playlists.find(
      (entry) => entry.id === playlistsInitial.activeId,
    ) ?? playlistsInitial.playlists[0];
  return (
    active?.entries.find((entry) => entry.sceneId === 0)?.key ??
    active?.entries[0]?.key ??
    null
  );
})();

export const useDirectorStore = create<DirectorState>((set, get) => ({
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
  libraryOpen: false,
  bindings: readBindings(),
  sectionOrder: readSectionOrder(),
  tourSeen: tourSeenInitial,
  tourOpen: !tourSeenInitial,
  liteOn: false,
  overlayText: 'VJ LAB',
  overlayVisible: false,
  overlayKey: 0,
  meshTextureStatus: 'idle',
  instanceMaps: {},
  customPresets: customPresetsInitial,
  mediaQueue: [],
  mediaIndex: null,
  sceneOrder: sceneOrderInitial,
  playlists: playlistsInitial.playlists,
  activePlaylistId: playlistsInitial.activeId,
  activeEntryKey: activeEntryKeyInitial,
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
  setPreset: (id: number, key: string | null = null) =>
    set((state) => ({
      activePresetId: normalizeId(state.customPresets, id),
      activeEntryKey: key,
    })),
  nextPreset: () =>
    set((state) => {
      const entries = selectActivePlaylist(state).entries;
      if (entries.length === 0) return {};
      const cursor = positionIndex(state);
      const next = entries[(cursor + 1 + entries.length) % entries.length];
      return { activePresetId: next.sceneId, activeEntryKey: next.key };
    }),
  prevPreset: () =>
    set((state) => {
      const entries = selectActivePlaylist(state).entries;
      if (entries.length === 0) return {};
      const cursor = positionIndex(state);
      const prev =
        entries[(cursor - 1 + entries.length) % entries.length];
      return { activePresetId: prev.sceneId, activeEntryKey: prev.key };
    }),
  requestDissolve: (id: number, key: string | null = null) => {
    const state = useDirectorStore.getState();
    const target = normalizeId(state.customPresets, id);
    if (target === state.activePresetId || transitionRef.active) return;
    if (!findPreset(state.customPresets, target)) return;
    const entries = selectActivePlaylist(state).entries;
    transitionRef.toKey =
      (key && entries.some((entry) => entry.key === key && entry.sceneId === target)
        ? key
        : entries.find((entry) => entry.sceneId === target)?.key) ?? null;
    transitionRef.active = true;
    transitionRef.swapped = false;
    transitionRef.start = performance.now();
    transitionRef.to = target;
  },
  hardCutNext: () => {
    const state = useDirectorStore.getState();
    transitionRef.active = false;
    transitionRef.swapped = false;
    const entries = selectActivePlaylist(state).entries;
    if (entries.length === 0) return;
    const cursor = positionIndex(state);
    const next = entries[(cursor + 1) % entries.length];
    set({ activeEntryKey: next.key });
    useDirectorStore.getState().setPreset(next.sceneId);
  },
  createScene: (preset) => {
    const state = get();
    const ids = allPresets(state.customPresets).map((entry) => entry.id);
    const nextId = ids.length === 0 ? 0 : Math.max(...ids) + 1;
    const created: ScenePreset = { ...preset, id: nextId } as ScenePreset;
    const nextCustom = [...state.customPresets, created];
    writeCustomPresets(nextCustom);
    const nextOrder = [...state.sceneOrder, created.id];
    writeSceneOrder(nextOrder);
    const active = selectActivePlaylist(state);
    const nextPlaylists = state.playlists.map((entry) =>
      entry.id === active.id
        ? {
            ...entry,
            entries: [
              ...entry.entries,
              { key: `e${Date.now().toString(36)}`, sceneId: created.id },
            ],
          }
        : entry,
    );
    writePlaylists(nextPlaylists, state.activePlaylistId);
    set({ customPresets: nextCustom, sceneOrder: nextOrder, playlists: nextPlaylists });
    return created;
  },
  updateScene: (id, patch) => {
    const state = get();
    if (PRESETS.some((entry) => entry.id === id)) return;
    const nextCustom = state.customPresets.map((entry) =>
      entry.id === id ? { ...entry, ...patch, id } : entry,
    );
    writeCustomPresets(nextCustom);
    set({ customPresets: nextCustom });
  },
  deleteScene: (id) => {
    const state = get();
    if (PRESETS.some((entry) => entry.id === id)) return;
    const nextCustom = state.customPresets.filter((entry) => entry.id !== id);
    writeCustomPresets(nextCustom);
    const nextOrder = state.sceneOrder.filter((entry) => entry !== id);
    writeSceneOrder(nextOrder);
    const nextPlaylists = state.playlists.map((entry) => ({
      ...entry,
      entries: entry.entries.filter((scene) => scene.sceneId !== id),
    }));
    writePlaylists(nextPlaylists, state.activePlaylistId);
    const stillExists = findPreset(nextCustom, state.activePresetId);
    const nextActive = selectActivePlaylist({
      ...state,
      playlists: nextPlaylists,
    });
    const keyKept =
      stillExists &&
      nextActive.entries.some((entry) => entry.key === state.activeEntryKey)
        ? state.activeEntryKey
        : (nextActive.entries.find((entry) => entry.sceneId === state.activePresetId)
            ?.key ??
          nextActive.entries[0]?.key ??
          null);
    set({
      customPresets: nextCustom,
      sceneOrder: nextOrder,
      playlists: nextPlaylists,
      activePresetId: stillExists ? state.activePresetId : PRESETS[0].id,
      activeEntryKey: stillExists ? keyKept : (nextActive.entries[0]?.key ?? null),
    });
  },
  importScenes: (packFile) => {
    const report = validatePack(packFile);
    if (report.headerErrors.length > 0) {
      return {
        accepted: [],
        rejected: [],
        headerErrors: report.headerErrors,
      };
    }
    const accepted: ScenePreset[] = [];
    const rejected: Array<{ id: string; reason: string }> = [...report.rejected];
    let custom = get().customPresets;
    for (const scene of report.acceptedScenes) {
      const ids = allPresets(custom).map((entry) => entry.id);
      const nextId = ids.length === 0 ? 0 : Math.max(...ids) + 1;
      const preset: ScenePreset = {
        id: nextId,
        name: scene.name,
        palette: scene.palette,
        background: scene.background,
        gain: scene.gain,
        speed: scene.speed,
        scene: 0 as const,
        instances: scene.instances,
      };
      custom = [...custom, preset];
      accepted.push(preset);
    }
    if (accepted.length > 0) {
      writeCustomPresets(custom);
      const state = get();
      const nextOrder = [...state.sceneOrder, ...accepted.map((entry) => entry.id)];
      writeSceneOrder(nextOrder);
      const active = selectActivePlaylist(state);
      const stamp = Date.now().toString(36);
      const nextPlaylists = state.playlists.map((entry) =>
        entry.id === active.id
          ? {
              ...entry,
              entries: [
                ...entry.entries,
                ...accepted.map((scene, index) => ({
                  key: `e${stamp}${index}`,
                  sceneId: scene.id,
                })),
              ],
            }
          : entry,
      );
      writePlaylists(nextPlaylists, state.activePlaylistId);
      set({ customPresets: custom, sceneOrder: nextOrder, playlists: nextPlaylists });
    }
    return { accepted, rejected, headerErrors: [] };
  },
  exportCustomScenes: () => {
    const state = get();
    if (state.customPresets.length === 0) return;
    const pack = exportScenesPack(state.customPresets, {
      name: 'Custom Scenes',
      author: 'VJ Lab',
      packVersion: '1.0.0',
    });
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(pack, null, 2)], { type: 'application/json' }),
    );
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `vjlab-scenes-${Date.now()}.json`;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  },
  addMediaTracks: (files) => {
    const created = files.map((file) =>
      createTrack(file.name, URL.createObjectURL(file)),
    );
    set((state) => ({
      mediaQueue: [...state.mediaQueue, ...created],
      mediaIndex: state.mediaIndex ?? 0,
    }));
    return created;
  },
  removeMediaTrack: (id) =>
    set((state) => {
      const index = state.mediaQueue.findIndex((entry) => entry.id === id);
      if (index === -1) return {};
      const entry = state.mediaQueue[index];
      if (entry.url) URL.revokeObjectURL(entry.url);
      const nextQueue = state.mediaQueue.filter((entry) => entry.id !== id);
      let nextIndex = state.mediaIndex;
      if (nextQueue.length === 0) nextIndex = null;
      else if (state.mediaIndex !== null) {
        if (index < state.mediaIndex) nextIndex = state.mediaIndex - 1;
        else if (index === state.mediaIndex) nextIndex = Math.min(state.mediaIndex, nextQueue.length - 1);
      }
      return { mediaQueue: nextQueue, mediaIndex: nextIndex };
    }),
  reorderMedia: (from, to) =>
    set((state) => {
      if (from < 0 || from >= state.mediaQueue.length || to < 0 || to >= state.mediaQueue.length) return {};
      const nextQueue = [...state.mediaQueue];
      const [moved] = nextQueue.splice(from, 1);
      nextQueue.splice(to, 0, moved);
      let nextIndex = state.mediaIndex;
      if (state.mediaIndex !== null) {
        const id = state.mediaQueue[state.mediaIndex]?.id;
        nextIndex = nextQueue.findIndex((entry) => entry.id === id);
      }
      return { mediaQueue: nextQueue, mediaIndex: nextIndex };
    }),
  playMedia: (id) =>
    set((state) => {
      const index = state.mediaQueue.findIndex((entry) => entry.id === id);
      if (index === -1) return {};
      return { mediaIndex: index };
    }),
  reorderScenes: (from, to) =>
    set((state) => {
      const order = [...state.sceneOrder];
      if (from < 0 || from >= order.length || to < 0 || to >= order.length) return {};
      const [moved] = order.splice(from, 1);
      order.splice(to, 0, moved);
      writeSceneOrder(order);
      return { sceneOrder: order };
    }),
  movePlaylistScene: (from, to) => {
    const state = get();
    const active = selectActivePlaylist(state);
    const entries = [...active.entries];
    if (from < 0 || from >= entries.length || to < 0 || to >= entries.length) {
      return;
    }
    const [moved] = entries.splice(from, 1);
    entries.splice(to, 0, moved);
    const nextPlaylists = state.playlists.map((entry) =>
      entry.id === active.id ? { ...entry, entries } : entry,
    );
    writePlaylists(nextPlaylists, state.activePlaylistId);
    set({ playlists: nextPlaylists });
  },
  pinScene: (key) => {
    // Starring pins the occurrence into the deck (position DECK_SIZE);
    // unstarring drops it past the deck, at the end of the list.
    const state = get();
    const active = selectActivePlaylist(state);
    const index = active.entries.findIndex((entry) => entry.key === key);
    if (index < 0) return;
    const entries = [...active.entries];
    const [moved] = entries.splice(index, 1);
    const target =
      index < DECK_SIZE
        ? entries.length
        : Math.min(DECK_SIZE - 1, entries.length);
    entries.splice(target, 0, moved);
    const nextPlaylists = state.playlists.map((entry) =>
      entry.id === active.id ? { ...entry, entries } : entry,
    );
    writePlaylists(nextPlaylists, state.activePlaylistId);
    set({ playlists: nextPlaylists });
  },
  createPlaylist: (name) => {
    const state = get();
    const clean = name.trim().slice(0, 40) || 'Untitled';
    const next: ScenePlaylist = {
      id: `pl-${Date.now().toString(36)}${Math.floor(Math.random() * 1296).toString(36)}`,
      name: clean,
      entries: [],
    };
    const nextPlaylists = [...state.playlists, next];
    writePlaylists(nextPlaylists, next.id);
    set({ playlists: nextPlaylists, activePlaylistId: next.id, activeEntryKey: null });
  },
  renamePlaylist: (id, name) => {
    const state = get();
    const clean = name.trim().slice(0, 40);
    if (!clean) return;
    const nextPlaylists = state.playlists.map((entry) =>
      entry.id === id ? { ...entry, name: clean } : entry,
    );
    writePlaylists(nextPlaylists, state.activePlaylistId);
    set({ playlists: nextPlaylists });
  },
  deletePlaylist: (id) => {
    const state = get();
    if (state.playlists.length <= 1) return;
    const nextPlaylists = state.playlists.filter((entry) => entry.id !== id);
    if (nextPlaylists.length === state.playlists.length) return;
    const nextActive = state.activePlaylistId === id ? nextPlaylists[0].id : state.activePlaylistId;
    writePlaylists(nextPlaylists, nextActive);
    const switched = nextActive !== state.activePlaylistId;
    const nextKey = switched
      ? (nextPlaylists[0].entries.find(
          (entry) => entry.sceneId === state.activePresetId,
        )?.key ??
        nextPlaylists[0].entries[0]?.key ??
        null)
      : state.activeEntryKey;
    set({ playlists: nextPlaylists, activePlaylistId: nextActive, activeEntryKey: nextKey });
  },
  setActivePlaylist: (id) => {
    const state = get();
    const target = state.playlists.find((entry) => entry.id === id);
    if (!target) return;
    writePlaylists(state.playlists, id);
    set({
      activePlaylistId: id,
      activeEntryKey:
        target.entries.find((entry) => entry.sceneId === state.activePresetId)?.key ??
        target.entries[0]?.key ??
        null,
    });
  },
  addSceneToPlaylist: (playlistId, sceneId) => {
    const state = get();
    if (!findPreset(state.customPresets, sceneId)) return;
    const nextPlaylists = state.playlists.map((entry) =>
      entry.id === playlistId
        ? {
            ...entry,
            entries: [
              ...entry.entries,
              { key: `e${Date.now().toString(36)}${entry.entries.length}`, sceneId },
            ],
          }
        : entry,
    );
    writePlaylists(nextPlaylists, state.activePlaylistId);
    set({ playlists: nextPlaylists });
  },
  removeSceneFromPlaylist: (playlistId, key) => {
    const state = get();
    const nextPlaylists = state.playlists.map((entry) =>
      entry.id === playlistId
        ? {
            ...entry,
            entries: entry.entries.filter((scene) => scene.key !== key),
          }
        : entry,
    );
    writePlaylists(nextPlaylists, state.activePlaylistId);
    set({ playlists: nextPlaylists });
  },
  cycleDuration: () =>
    set((s) => ({ transitionDuration: nextDuration(s.transitionDuration) })),
  stepHue: () => set((s) => ({ hueShift: (s.hueShift + 1 / 8) % 1 })),
  setHueShift: (value) =>
    set({ hueShift: ((value % 1) + 1) % 1 }),
  setOverlayText: (text: string) =>
    set({ overlayText: text.slice(0, 60) }),
  fireText: () =>
    set((s) => ({
      overlayVisible: true,
      overlayKey: s.overlayKey + 1,
    })),
  hideText: () => set({ overlayVisible: false }),
  setInstanceMap: (key: string, url: string | null) =>
    set((s) => ({
      instanceMaps: { ...s.instanceMaps, [key]: url },
      meshTextureStatus: url ? 'loading' : 'idle',
    })),
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
  setLibraryOpen: (open: boolean) => set({ libraryOpen: open }),
  setBinding: (id, code) =>
    set((state) => {
      const next = { ...state.bindings, [id]: code };
      writeBindings(next);
      return { bindings: next };
    }),
  resetBindings: () => {
    writeBindings({});
    set({ bindings: {} });
  },
  moveSection: (from, to) =>
    set((state) => {
      const order = moveOrderItem(state.sectionOrder, from, to);
      if (order === state.sectionOrder) return {};
      writeSectionOrder(order);
      return { sectionOrder: order };
    }),
  resetSectionOrder: () => {
    writeSectionOrder([...SECTION_IDS]);
    set({ sectionOrder: [...SECTION_IDS] });
  },
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
  setFxMix: (slot: FxSlot, value: number) =>
    set((s) => {
      if (slot === 'contrast')
        return { colorContrast: clampContrast(value) };
      if (slot === 'saturation')
        return { colorSaturation: clampSaturation(value) };
      return {
        mixBloom: slot === 'bloom' ? clampMix(value) : s.mixBloom,
        mixVignette: slot === 'vignette' ? clampMix(value) : s.mixVignette,
        mixStrobe: slot === 'strobe' ? clampMix(value) : s.mixStrobe,
        masterMix: slot === 'master' ? clampMix(value) : s.masterMix,
      };
    }),
  setZoomTarget: (value: number) => set({ zoomTarget: clampZoom(value) }),
  setStrobeRate: (value: number) => set({ strobeRateHz: clampStrobeHz(value) }),
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
  roll: 0,
  zoom: 1,
};

export const transitionRef = {
  active: false,
  swapped: false,
  start: 0,
  to: 0,
  toKey: null as string | null,
};


