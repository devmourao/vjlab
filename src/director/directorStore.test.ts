import { describe, expect, it } from 'vitest';
import { liveRefs, transitionRef, useDirectorStore } from './directorStore';

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
