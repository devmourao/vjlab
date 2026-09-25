import { describe, expect, it } from 'vitest';
import {
  DECK_SIZE,
  liveRefs,
  positionIndex,
  selectActivePlaylist,
  transitionRef,
  useDirectorStore,
} from './directorStore';

describe('directorStore', () => {
  it('starts with safe defaults (strobe off)', () => {
    const state = useDirectorStore.getState();
    expect(state.strobeOn).toBe(false);
  });

  it('toggles strobe and kills all effects', () => {
    const { toggleStrobe, fireBurst, killAll } = useDirectorStore.getState();
    toggleStrobe();
    expect(useDirectorStore.getState().strobeOn).toBe(true);
    fireBurst();
    expect(liveRefs.burstId).toBeGreaterThan(0);
    killAll();
    expect(useDirectorStore.getState().strobeOn).toBe(false);
    expect(useDirectorStore.getState().burstCount).toBe(0);
    expect(liveRefs.burstId).toBe(0);
  });

  it('requests dissolves and hard cuts without touching the preset early', () => {
    const store = useDirectorStore.getState();
    store.setPreset(0);
    store.requestDissolve(2);
    expect(transitionRef.active).toBe(true);
    expect(transitionRef.to).toBe(2);
    expect(useDirectorStore.getState().activePresetId).toBe(0);
    store.hardCutNext();
    expect(transitionRef.active).toBe(false);
    expect(useDirectorStore.getState().activePresetId).toBe(1);
  });

  it('cycles duration and steps hue', () => {
    const store = useDirectorStore.getState();
    const first = store.transitionDuration;
    store.cycleDuration();
    expect(useDirectorStore.getState().transitionDuration).not.toBe(first);
    store.stepHue();
    expect(useDirectorStore.getState().hueShift).toBeGreaterThan(0);
    store.setHueShift(0.5);
    expect(useDirectorStore.getState().hueShift).toBeCloseTo(0.5);
    store.setHueShift(1.25);
    expect(useDirectorStore.getState().hueShift).toBeCloseTo(0.25);
  });

  it('reorders console sections within bounds', () => {
    const api = useDirectorStore.getState();
    const before = [...api.sectionOrder];
    api.moveSection(0, 2);
    expect(useDirectorStore.getState().sectionOrder[2]).toBe(before[0]);
    api.resetSectionOrder();
    expect(useDirectorStore.getState().sectionOrder[0]).toBe('track');
  });

  it('opens and closes the scene library', () => {
    const store = useDirectorStore.getState();
    store.setLibraryOpen(true);
    expect(useDirectorStore.getState().libraryOpen).toBe(true);
    store.setLibraryOpen(false);
    expect(useDirectorStore.getState().libraryOpen).toBe(false);
  });

  it('zooms within limits and adjusts the selected mix', () => {    const store = useDirectorStore.getState();
    store.zoomIn();
    expect(useDirectorStore.getState().zoomTarget).toBeGreaterThan(1);
    store.zoomOut();
    store.zoomOut();
    expect(useDirectorStore.getState().zoomTarget).toBeLessThanOrEqual(1);
    store.cycleFxSlot();
    expect(useDirectorStore.getState().selectedFx).toBe('vignette');
    store.fxDown();
    expect(useDirectorStore.getState().mixVignette).toBeLessThan(1);
    store.fxUp();
    expect(useDirectorStore.getState().mixVignette).toBeCloseTo(1);
  });

  it('fires and hides the text overlay', () => {    const store = useDirectorStore.getState();
    store.setOverlayText('Hello VJ');
    expect(useDirectorStore.getState().overlayText).toBe('Hello VJ');
    store.fireText();
    expect(useDirectorStore.getState().overlayVisible).toBe(true);
    const key = useDirectorStore.getState().overlayKey;
    store.fireText();
    expect(useDirectorStore.getState().overlayKey).toBe(key + 1);
    store.hideText();
    expect(useDirectorStore.getState().overlayVisible).toBe(false);
  });

  it('sets and clears per-instance maps', () => {
    const store = useDirectorStore.getState();
    store.setInstanceMap('1:mesh:0', 'blob:fake-url');
    expect(useDirectorStore.getState().instanceMaps['1:mesh:0']).toBe(
      'blob:fake-url',
    );
    expect(useDirectorStore.getState().meshTextureStatus).toBe('loading');
    store.setMeshTextureStatus('ready');
    expect(useDirectorStore.getState().meshTextureStatus).toBe('ready');
    store.setInstanceMap('1:mesh:0', null);
    expect(useDirectorStore.getState().instanceMaps['1:mesh:0']).toBeNull();
    expect(useDirectorStore.getState().meshTextureStatus).toBe('idle');
  });

    it('tunes strobe rate and toggles the effects pack', () => {    const store = useDirectorStore.getState();
    expect(useDirectorStore.getState().strobeRateHz).toBe(4);
    store.strobeFaster();
    expect(useDirectorStore.getState().strobeRateHz).toBe(5);
    store.strobeSlower();
    store.strobeSlower();
    expect(useDirectorStore.getState().strobeRateHz).toBe(3);
    store.toggleVhs();
    store.toggleRgb();
    store.toggleBeatFlash();
    expect(useDirectorStore.getState().vhsOn).toBe(true);
    expect(useDirectorStore.getState().rgbOn).toBe(true);
    expect(useDirectorStore.getState().beatFlashOn).toBe(true);
    store.killAll();
    expect(useDirectorStore.getState().vhsOn).toBe(false);
    expect(useDirectorStore.getState().rgbOn).toBe(false);
    expect(useDirectorStore.getState().beatFlashOn).toBe(false);
    expect(useDirectorStore.getState().fxBypassed).toBe(false);
  });

  it('toggles the post-processing bypass', () => {
    expect(useDirectorStore.getState().fxBypassed).toBe(false);
    useDirectorStore.getState().toggleFxBypass();
    expect(useDirectorStore.getState().fxBypassed).toBe(true);
    useDirectorStore.getState().toggleFxBypass();
    expect(useDirectorStore.getState().fxBypassed).toBe(false);
  });

  it('toggles about and lite mode', () => {
    expect(useDirectorStore.getState().aboutOpen).toBe(false);
    useDirectorStore.getState().toggleAbout();
    expect(useDirectorStore.getState().aboutOpen).toBe(true);
    useDirectorStore.getState().toggleAbout();
    expect(useDirectorStore.getState().liteOn).toBe(false);
    useDirectorStore.getState().toggleLite();
    expect(useDirectorStore.getState().liteOn).toBe(true);
    useDirectorStore.getState().toggleLite();
    expect(useDirectorStore.getState().liteOn).toBe(false);
  });

  it('cycles strobe mode and adjusts saturation and contrast slots', () => {    const store = useDirectorStore.getState();
    expect(useDirectorStore.getState().strobeMode).toBe('white');
    store.cycleStrobeMode();
    expect(useDirectorStore.getState().strobeMode).toBe('black');
    store.setPreset(0);
    useDirectorStore.getState().setPreset(0);
    const api = useDirectorStore.getState();
    api.setPreset(0);
    // Select saturation slot directly through the cycle order.
    while (useDirectorStore.getState().selectedFx !== 'saturation') {
      useDirectorStore.getState().cycleFxSlot();
    }
    const before = useDirectorStore.getState().colorSaturation;
    useDirectorStore.getState().fxUp();
    expect(useDirectorStore.getState().colorSaturation).toBeGreaterThanOrEqual(
      before,
    );
    while (useDirectorStore.getState().selectedFx !== 'contrast') {
      useDirectorStore.getState().cycleFxSlot();
    }
    useDirectorStore.getState().fxDown();
    expect(useDirectorStore.getState().colorContrast).toBeLessThanOrEqual(1);
  });

  it('selects mix slots directly and clamps color ranges', () => {
    const api = useDirectorStore.getState();
    api.selectFxSlot('saturation');
    expect(useDirectorStore.getState().selectedFx).toBe('saturation');
    for (let i = 0; i < 12; i += 1) useDirectorStore.getState().fxUp();
    expect(useDirectorStore.getState().colorSaturation).toBe(0.6);
    api.selectFxSlot('contrast');
    for (let i = 0; i < 12; i += 1) useDirectorStore.getState().fxDown();
    expect(useDirectorStore.getState().colorContrast).toBe(-0.5);
    for (let i = 0; i < 12; i += 1) useDirectorStore.getState().fxUp();
    expect(useDirectorStore.getState().colorContrast).toBe(0.5);
  });

  it('toggles help and completes the tour', () => {
    const api = useDirectorStore.getState();
    api.setHelpOpen(false);
    expect(useDirectorStore.getState().helpOpen).toBe(false);
    api.toggleHelp();
    expect(useDirectorStore.getState().helpOpen).toBe(true);
    api.setHelpOpen(false);
    api.replayTour();
    expect(useDirectorStore.getState().tourOpen).toBe(true);
    api.completeTour();
    expect(useDirectorStore.getState().tourOpen).toBe(false);
    expect(useDirectorStore.getState().tourSeen).toBe(true);
  });

  it('migrates legacy order into a Main playlist', () => {
    const state = useDirectorStore.getState();
    expect(state.playlists.length).toBeGreaterThan(0);
    const active = selectActivePlaylist(state);
    expect(active.entries.length).toBeGreaterThan(0);
    expect(
      active.entries.every(
        (entry) =>
          typeof entry.key === 'string' && typeof entry.sceneId === 'number',
      ),
    ).toBe(true);
  });

  it('pins occurrences into the ten-slot deck and back out', () => {
    const api = useDirectorStore.getState();
    const previousActive = api.activePlaylistId;
    api.createPlaylist('Deck test');
    const id = useDirectorStore.getState().activePlaylistId;
    for (let scene = 0; scene < DECK_SIZE + 2; scene += 1) {
      api.addSceneToPlaylist(id, scene % 6);
    }
    let entries = selectActivePlaylist(useDirectorStore.getState()).entries;
    const lastKey = entries[entries.length - 1].key;
    api.pinScene(lastKey);
    entries = selectActivePlaylist(useDirectorStore.getState()).entries;
    expect(entries[DECK_SIZE - 1].key).toBe(lastKey);
    api.pinScene(lastKey);
    entries = selectActivePlaylist(useDirectorStore.getState()).entries;
    expect(entries[entries.length - 1].key).toBe(lastKey);
    api.deletePlaylist(id);
    expect(useDirectorStore.getState().activePlaylistId).toBe(previousActive);
  });

  it('manages playlist membership with duplicates and execution order', () => {
    const api = useDirectorStore.getState();
    const previousActive = api.activePlaylistId;
    api.createPlaylist('Order test');
    const id = useDirectorStore.getState().activePlaylistId;
    api.addSceneToPlaylist(id, 0);
    api.addSceneToPlaylist(id, 1);
    api.addSceneToPlaylist(id, 0);
    let scenes = selectActivePlaylist(useDirectorStore.getState()).entries.map(
      (entry) => entry.sceneId,
    );
    expect(scenes).toEqual([0, 1, 0]);
    api.movePlaylistScene(0, 2);
    scenes = selectActivePlaylist(useDirectorStore.getState()).entries.map(
      (entry) => entry.sceneId,
    );
    expect(scenes).toEqual([1, 0, 0]);
    const victim = selectActivePlaylist(useDirectorStore.getState()).entries[0].key;
    api.removeSceneFromPlaylist(id, victim);
    scenes = selectActivePlaylist(useDirectorStore.getState()).entries.map(
      (entry) => entry.sceneId,
    );
    expect(scenes).toEqual([0, 0]);
    api.renamePlaylist(id, 'Renamed');
    expect(selectActivePlaylist(useDirectorStore.getState()).name).toBe('Renamed');
    api.deletePlaylist(id);
    expect(useDirectorStore.getState().activePlaylistId).toBe(previousActive);
  });

  it('tracks the playing occurrence and advances by position', () => {
    const api = useDirectorStore.getState();
    const previousActive = api.activePlaylistId;
    api.createPlaylist('Cursor test');
    const id = useDirectorStore.getState().activePlaylistId;
    api.addSceneToPlaylist(id, 0);
    api.addSceneToPlaylist(id, 1);
    api.addSceneToPlaylist(id, 0);
    const keys = selectActivePlaylist(useDirectorStore.getState()).entries.map(
      (entry) => entry.key,
    );
    api.setPreset(1);
    transitionRef.active = false;
    api.requestDissolve(0, keys[2]);
    // Pending target stashes the key; the stage cursor is untouched.
    expect(transitionRef.toKey).toBe(keys[2]);
    expect(useDirectorStore.getState().activeEntryKey).not.toBe(keys[2]);
    api.setPreset(transitionRef.to, transitionRef.toKey);
    expect(useDirectorStore.getState().activeEntryKey).toBe(keys[2]);
    expect(positionIndex(useDirectorStore.getState())).toBe(2);
    api.nextPreset();
    // Positional advance wraps to the first occurrence; an id lookup
    // would have landed on the middle entry instead.
    expect(useDirectorStore.getState().activeEntryKey).toBe(keys[0]);
    api.deletePlaylist(id);
    expect(useDirectorStore.getState().activePlaylistId).toBe(previousActive);
  });

  it('sets absolute mix, zoom and strobe values with clamps', () => {
    const api = useDirectorStore.getState();
    api.setFxMix('bloom', 0.4);
    expect(useDirectorStore.getState().mixBloom).toBeCloseTo(0.4);
    api.setFxMix('bloom', 9);
    expect(useDirectorStore.getState().mixBloom).toBe(1);
    api.setFxMix('contrast', -9);
    expect(useDirectorStore.getState().colorContrast).toBe(-0.5);
    api.setFxMix('saturation', 9);
    expect(useDirectorStore.getState().colorSaturation).toBe(0.6);
    api.setZoomTarget(9);
    expect(useDirectorStore.getState().zoomTarget).toBe(2.5);
    api.setStrobeRate(99);
    expect(useDirectorStore.getState().strobeRateHz).toBe(12);
  });
});
