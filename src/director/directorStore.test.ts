import { describe, expect, it } from 'vitest';
import { createTrack } from '../audio/track';
import {
  DECK_SIZE,
  bodyEntries,
  cueTiming,
  cueWindows,
  distributeBodyEntries,
  isPoolIndex,
  liveRefs,
  positionIndex,
  sanitizeAnchor,
  selectActivePlaylist,
  showTotalSec,
  transitionRef,
  useDirectorStore,
  windowConflicts,
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

  it('times cues per occurrence with accumulated windows', () => {
    const api = useDirectorStore.getState();
    const previousActive = api.activePlaylistId;
    api.createPlaylist('Timing test');
    const id = useDirectorStore.getState().activePlaylistId;
    api.addSceneToPlaylist(id, 0);
    api.addSceneToPlaylist(id, 1);
    let entries = selectActivePlaylist(useDirectorStore.getState()).entries;
    // New cues are born timed: playlist default, manual hold.
    expect(entries.map((entry) => cueTiming(entry))).toEqual([
      { durationSec: 30, follow: 'manual' },
      { durationSec: 30, follow: 'manual' },
    ]);
    // Same scene twice may carry different durations (occurrence-owned).
    api.setCueTiming(entries[0].key, { durationSec: 45, follow: 'auto' });
    api.setCueTiming(entries[1].key, { durationSec: 15 });
    entries = selectActivePlaylist(useDirectorStore.getState()).entries;
    expect(cueTiming(entries[0])).toEqual({ durationSec: 45, follow: 'auto' });
    expect(cueTiming(entries[1])).toEqual({ durationSec: 15, follow: 'manual' });
    expect(cueWindows(entries).map((window) => [window.startSec, window.endSec])).toEqual([
      [0, 45],
      [45, 60],
    ]);
    expect(showTotalSec(entries)).toBe(60);
    // Clamps keep the file self-describing; unknown keys are ignored.
    api.setCueTiming(entries[0].key, { durationSec: 99999 });
    api.setCueTiming('missing', { durationSec: 10 });
    entries = selectActivePlaylist(useDirectorStore.getState()).entries;
    expect(cueTiming(entries[0]).durationSec).toBe(3600);
    expect(showTotalSec(entries)).toBe(3615);
    // Legacy-shaped entries (no timing fields) still resolve to defaults.
    expect(cueTiming({ key: 'legacy', sceneId: 2 })).toEqual({
      durationSec: 30,
      follow: 'manual',
    });
    api.deletePlaylist(id);
    expect(useDirectorStore.getState().activePlaylistId).toBe(previousActive);
  });

  it('splits the interrupt pool from the timed body', () => {
    const entries = Array.from({ length: DECK_SIZE + 2 }, (_, index) => ({
      key: `e${index}`,
      sceneId: index % 6,
    }));
    expect(bodyEntries(entries).map((entry) => entry.key)).toEqual([
      'e10',
      'e11',
    ]);
    expect(bodyEntries(entries.slice(0, DECK_SIZE))).toEqual([]);
    expect(isPoolIndex(0)).toBe(true);
    expect(isPoolIndex(DECK_SIZE - 1)).toBe(true);
    expect(isPoolIndex(DECK_SIZE)).toBe(false);
    expect(isPoolIndex(-1)).toBe(false);
  });

  it('flips the whole body between auto and manual', () => {
    const api = useDirectorStore.getState();
    const previousActive = api.activePlaylistId;
    api.createPlaylist('Bulk follow test');
    const id = useDirectorStore.getState().activePlaylistId;
    for (let i = 0; i < DECK_SIZE + 2; i += 1) {
      api.addSceneToPlaylist(id, i % 6);
    }
    const states = () =>
      bodyEntries(
        selectActivePlaylist(useDirectorStore.getState()).entries,
      ).map((entry) => cueTiming(entry).follow);
    expect(states()).toEqual(['manual', 'manual']);
    api.setBodyFollow('auto');
    expect(states()).toEqual(['auto', 'auto']);
    // Pool cues are untouched by the bulk flip.
    const pool = selectActivePlaylist(useDirectorStore.getState())
      .entries.slice(0, DECK_SIZE)
      .map((entry) => cueTiming(entry).follow);
    expect(pool.every((follow) => follow === 'manual')).toBe(true);
    api.setBodyFollow('manual');
    expect(states()).toEqual(['manual', 'manual']);
    api.deletePlaylist(id);
    expect(useDirectorStore.getState().activePlaylistId).toBe(previousActive);
  });

  it('anchors cues and refills predecessors on demand', () => {
    expect(sanitizeAnchor(null)).toBeNull();
    expect(sanitizeAnchor(-5)).toBeNull();
    expect(sanitizeAnchor('x')).toBeNull();
    expect(sanitizeAnchor(103.6)).toBe(104);
    // Fixed pins the start; gaps read as holds of the previous cue.
    const windows = cueWindows([
      { key: 'a', sceneId: 0, durationSec: 30 },
      { key: 'b', sceneId: 1, durationSec: 30, startSec: 103 },
      { key: 'c', sceneId: 2, durationSec: 30 },
    ]);
    expect(windows.map((window) => [window.startSec, window.endSec])).toEqual([
      [0, 30],
      [103, 133],
      [133, 163],
    ]);
    // Predecessors split the gap evenly (102 s over 2 cues).
    const filled = distributeBodyEntries(
      [
        { key: 'a', sceneId: 0, durationSec: 30 },
        { key: 'b', sceneId: 1, durationSec: 30 },
        { key: 'c', sceneId: 2, durationSec: 30, startSec: 102 },
      ],
      1000,
    );
    expect(filled.map((entry) => entry.durationSec)).toEqual([51, 51, 30]);
    expect(
      cueWindows(filled).map((window) => [window.startSec, window.endSec]),
    ).toEqual([
      [0, 51],
      [51, 102],
      [102, 132],
    ]);
    // Trailing runs split the remaining space (example: 3 cues, 60 s).
    const even = distributeBodyEntries(
      [
        { key: 'a', sceneId: 0, durationSec: 30 },
        { key: 'b', sceneId: 1, durationSec: 30 },
        { key: 'c', sceneId: 2, durationSec: 30 },
      ],
      60,
    );
    expect(even.map((entry) => entry.durationSec)).toEqual([20, 20, 20]);
  });

  it('anchors and distributes the active body through the store', () => {
    const api = useDirectorStore.getState();
    const previousActive = api.activePlaylistId;
    api.createPlaylist('Anchor test');
    const id = useDirectorStore.getState().activePlaylistId;
    for (let i = 0; i < DECK_SIZE + 3; i += 1) {
      api.addSceneToPlaylist(id, i % 6);
    }
    let body = bodyEntries(
      selectActivePlaylist(useDirectorStore.getState()).entries,
    );
    api.setCueAnchor(body[2].key, 102);
    api.setCueAnchor('missing', 10);
    body = bodyEntries(selectActivePlaylist(useDirectorStore.getState()).entries);
    expect(sanitizeAnchor(body[2].startSec)).toBe(102);
    api.distributeBody(null);
    body = bodyEntries(selectActivePlaylist(useDirectorStore.getState()).entries);
    expect(body.map((entry) => entry.durationSec)).toEqual([51, 51, 30]);
    api.setCueAnchor(body[2].key, null);
    body = bodyEntries(selectActivePlaylist(useDirectorStore.getState()).entries);
    expect(body[2].startSec ?? null).toBeNull();
    api.deletePlaylist(id);
    expect(useDirectorStore.getState().activePlaylistId).toBe(previousActive);
  });

  it('pins ends, flags overlaps and fills gaps', () => {
    // End pins win over duration; both-pinned derives it.
    const windows = cueWindows([
      { key: 'a', sceneId: 0, durationSec: 30, startSec: 43 },
      { key: 'b', sceneId: 1, durationSec: 30, endSec: 71 },
    ]);
    expect(windows.map((window) => [window.startSec, window.endSec])).toEqual([
      [43, 73],
      [41, 71],
    ]);
    // Overlap between locked intervals never goes silent.
    expect(
      windowConflicts([
        { key: 'a', sceneId: 0, durationSec: 30, startSec: 43, endSec: 71 },
        { key: 'b', sceneId: 1, durationSec: 30, startSec: 60 },
      ]),
    ).toEqual([{ key: 'b', withKey: 'a' }]);
    expect(
      windowConflicts([
        { key: 'a', sceneId: 0, durationSec: 30 },
        { key: 'b', sceneId: 1, durationSec: 30, startSec: 30 },
      ]),
    ).toEqual([]);
    // End pins shrink predecessors to fit (100 s over [0, 71] keeps 41 s).
    const shrunk = distributeBodyEntries(
      [
        { key: 'a', sceneId: 0, durationSec: 100 },
        { key: 'b', sceneId: 1, durationSec: 28, endSec: 71 },
      ],
      1000,
    );
    expect(shrunk.map((entry) => entry.durationSec)).toEqual([43, 28]);
    expect(
      cueWindows(shrunk).map((window) => [window.startSec, window.endSec]),
    ).toEqual([
      [0, 43],
      [43, 71],
    ]);
  });

  it('tracks end pins, gap fills and the dirty dot through the store', () => {
    const api = useDirectorStore.getState();
    const previousActive = api.activePlaylistId;
    useDirectorStore.setState({ showDirty: false });
    expect(useDirectorStore.getState().showDirty).toBe(false);
    api.createPlaylist('Pins test');
    const id = useDirectorStore.getState().activePlaylistId;
    for (let i = 0; i < DECK_SIZE + 3; i += 1) {
      api.addSceneToPlaylist(id, i % 6);
    }
    const keys = () =>
      bodyEntries(selectActivePlaylist(useDirectorStore.getState()).entries).map(
        (entry) => entry.key,
      );
    api.setCueEnd(keys()[1], 71);
    api.setCueAnchor('missing', 10);
    expect(
      sanitizeAnchor(
        bodyEntries(selectActivePlaylist(useDirectorStore.getState()).entries)[1]
          .endSec,
      ),
    ).toBe(71);
    expect(useDirectorStore.getState().showDirty).toBe(true);
    // Gap fill duplicates the previous cue trimmed to the void.
    api.setCueAnchor(keys()[2], 200);
    api.fillGap(keys()[2]);
    let body = bodyEntries(selectActivePlaylist(useDirectorStore.getState()).entries);
    expect(body).toHaveLength(4);
    expect(body[2].durationSec).toBe(200 - 71);
    api.fillGap('missing');
    api.fillGap(keys()[0]);
    expect(
      bodyEntries(selectActivePlaylist(useDirectorStore.getState()).entries),
    ).toHaveLength(4);
    api.distributeBody(null);
    expect(useDirectorStore.getState().showDirty).toBe(false);
    body = bodyEntries(selectActivePlaylist(useDirectorStore.getState()).entries);
    expect(body.map((entry) => entry.durationSec)).toEqual([41, 30, 129, 30]);
    api.deletePlaylist(id);
    expect(useDirectorStore.getState().activePlaylistId).toBe(previousActive);
  });

  it('binds tracks, assigns state cues and generates bodies', () => {
    const api = useDirectorStore.getState();
    const previousActive = api.activePlaylistId;
    api.createPlaylist('Bound test');
    const id = useDirectorStore.getState().activePlaylistId;
    for (let i = 0; i < DECK_SIZE + 2; i += 1) {
      api.addSceneToPlaylist(id, i % 6);
    }
    // State cues accept valid scenes, reject ghosts.
    api.setStateCue(id, 'pause', 1);
    api.setStateCue(id, 'pre', 999);
    const active = selectActivePlaylist(useDirectorStore.getState());
    expect(active.pauseCue).toBe(1);
    expect(active.preCue ?? null).toBeNull();
    // Bindings persist per track name and die with the playlist.
    api.bindTrack('demo.mp3', id);
    api.bindTrack('', id);
    api.bindTrack('demo.mp3', 'missing');
    expect(useDirectorStore.getState().trackBindings['demo.mp3']).toBe(id);
    // Autogen fills the body from library order at the default duration.
    api.generateBody(65);
    const body = bodyEntries(
      selectActivePlaylist(useDirectorStore.getState()).entries,
    );
    expect(body).toHaveLength(2);
    expect(
      body.every(
        (entry) =>
          typeof entry.sceneId === 'number' && entry.durationSec === 30,
      ),
    ).toBe(true);
    // Status bridge is idempotent and runtime-only.
    api.setAudioStatus('paused');
    api.setAudioStatus('paused');
    expect(useDirectorStore.getState().audioStatus).toBe('paused');
    api.setAudioStatus('empty');
    api.deletePlaylist(id);
    expect(
      useDirectorStore.getState().trackBindings['demo.mp3'] ?? null,
    ).toBeNull();
    expect(useDirectorStore.getState().activePlaylistId).toBe(previousActive);
  });

  it('stores a manual show target per playlist', () => {
    const api = useDirectorStore.getState();
    const previousActive = api.activePlaylistId;
    api.createPlaylist('Target test');
    const id = useDirectorStore.getState().activePlaylistId;
    expect(selectActivePlaylist(useDirectorStore.getState()).targetSec ?? null).toBeNull();
    api.setPlaylistTarget(id, 2400);
    expect(selectActivePlaylist(useDirectorStore.getState()).targetSec).toBe(2400);
    api.setPlaylistTarget(id, -30);
    expect(selectActivePlaylist(useDirectorStore.getState()).targetSec ?? null).toBeNull();
    api.setPlaylistTarget(id, 2400.4);
    expect(selectActivePlaylist(useDirectorStore.getState()).targetSec).toBe(2400);
    api.setPlaylistTarget(id, null);
    expect(selectActivePlaylist(useDirectorStore.getState()).targetSec ?? null).toBeNull();
    api.deletePlaylist(id);
    expect(useDirectorStore.getState().activePlaylistId).toBe(previousActive);
  });

  it('steps the media queue without wrapping at the ends', () => {
    const api = useDirectorStore.getState();
    useDirectorStore.setState({
      mediaQueue: [createTrack('a'), createTrack('b'), createTrack('c')],
      mediaIndex: 1,
    });
    expect(api.stepMedia(1)?.name).toBe('c');
    expect(useDirectorStore.getState().mediaIndex).toBe(2);
    // No wrap-around: stepping past the last track is a no-op.
    expect(api.stepMedia(1)).toBeNull();
    expect(useDirectorStore.getState().mediaIndex).toBe(2);
    expect(api.stepMedia(-1)?.name).toBe('b');
    expect(api.stepMedia(-1)?.name).toBe('a');
    expect(api.stepMedia(-1)).toBeNull();
    expect(useDirectorStore.getState().mediaIndex).toBe(0);
    useDirectorStore.setState({ mediaQueue: [], mediaIndex: null });
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
