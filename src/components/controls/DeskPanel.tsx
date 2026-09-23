import { useDirectorStore } from '../../director/directorStore';
import {
  FX_SLOTS,
  strobeStepsTo,
  type FxSlot,
  type StrobeMode,
} from '../../director/fx';
import { PRESETS, resolveInstances } from '../../scenes/presets';
import './ControlsKit.css';
import { EffectSlotList } from './EffectSlotList';
import { FlagPills } from './FlagPills';
import { StrobeControl } from './StrobeControl';
import { TransportRows } from './TransportRows';

const FRACTAL_SIDES = [10, 8, 6, 5, 12];

/**
 * Deck-bound desk: the shared kit wired to the live store, plus the
 * fractal readout and a shortcuts entry. Replaces the retired desk panel
 * in the side panel and the bottom sheet.
 */
export function DeskPanel() {
  const strobeOn = useDirectorStore((s) => s.strobeOn);
  const strobeMode = useDirectorStore((s) => s.strobeMode);
  const strobeRateHz = useDirectorStore((s) => s.strobeRateHz);
  const vhsOn = useDirectorStore((s) => s.vhsOn);
  const rgbOn = useDirectorStore((s) => s.rgbOn);
  const beatFlashOn = useDirectorStore((s) => s.beatFlashOn);
  const fxBypassed = useDirectorStore((s) => s.fxBypassed);
  const liteOn = useDirectorStore((s) => s.liteOn);
  const autoPilotOn = useDirectorStore((s) => s.autoPilotOn);
  const selectedFx = useDirectorStore((s) => s.selectedFx);
  const mixBloom = useDirectorStore((s) => s.mixBloom);
  const mixVignette = useDirectorStore((s) => s.mixVignette);
  const mixStrobe = useDirectorStore((s) => s.mixStrobe);
  const masterMix = useDirectorStore((s) => s.masterMix);
  const colorSaturation = useDirectorStore((s) => s.colorSaturation);
  const colorContrast = useDirectorStore((s) => s.colorContrast);
  const transitionDuration = useDirectorStore((s) => s.transitionDuration);
  const hueShift = useDirectorStore((s) => s.hueShift);
  const zoomTarget = useDirectorStore((s) => s.zoomTarget);
  const activePresetId = useDirectorStore((s) => s.activePresetId);
  const customPresets = useDirectorStore((s) => s.customPresets);
  const fractalShape = useDirectorStore((s) => s.fractalShape);
  const fractalInner = useDirectorStore((s) => s.fractalInner);
  const fractalZ = useDirectorStore((s) => s.fractalZ);

  const store = useDirectorStore.getState();
  const preset =
    [...PRESETS, ...customPresets].find((entry) => entry.id === activePresetId) ??
    PRESETS[0];
  const values: Record<string, number> = {
    bloom: mixBloom,
    vignette: mixVignette,
    strobe: mixStrobe,
    master: masterMix,
    saturation: colorSaturation,
    contrast: colorContrast,
  };

  return (
    <div className="desk-panel" data-testid="desk-panel">
      <StrobeControl
        on={strobeOn}
        mode={strobeMode}
        hz={strobeRateHz}
        onToggle={() => store.toggleStrobe()}
        onMode={(mode: StrobeMode) => {
          const steps = strobeStepsTo(
            useDirectorStore.getState().strobeMode,
            mode,
          );
          for (let i = 0; i < steps; i += 1) store.cycleStrobeMode();
        }}
        onHz={(value) => store.setStrobeRate(value)}
      />
      <FlagPills
        flags={[
          { id: 'vhs', label: `VHS ${vhsOn ? 'on' : 'off'}`, on: vhsOn, tone: 'vhs' },
          { id: 'rgb', label: `RGB ${rgbOn ? 'on' : 'off'}`, on: rgbOn, tone: 'rgb' },
          { id: 'beat', label: `Beat ${beatFlashOn ? 'on' : 'off'}`, on: beatFlashOn, tone: 'beat' },
          { id: 'bypass', label: `Bypass ${fxBypassed ? 'on' : 'off'}`, on: fxBypassed, tone: 'bypass' },
          { id: 'lite', label: `Lite ${liteOn ? 'on' : 'off'}`, on: liteOn, tone: 'lite' },
          { id: 'auto', label: `Auto ${autoPilotOn ? 'on' : 'off'}`, on: autoPilotOn, tone: 'auto' },
        ]}
        onToggle={(id) => {
          if (id === 'vhs') store.toggleVhs();
          else if (id === 'rgb') store.toggleRgb();
          else if (id === 'beat') store.toggleBeatFlash();
          else if (id === 'bypass') store.toggleFxBypass();
          else if (id === 'lite') store.toggleLite();
          else store.toggleAutoPilot();
        }}
      />
      {resolveInstances(preset).some((inst) => inst.base === 'fractal') && (
        <p className="kit-note" data-testid="fractal-hud">
          Fractal {FRACTAL_SIDES[fractalShape]}p · inner {fractalInner.toFixed(2)}x · Z{' '}
          {fractalZ.toFixed(1)}rad
        </p>
      )}
      <EffectSlotList
        slots={[...FX_SLOTS]}
        values={values}
        selected={selectedFx}
        onSelect={(slot: FxSlot) => store.selectFxSlot(slot)}
        onMix={(slot: FxSlot, value: number) => store.setFxMix(slot, value)}
      />
      <TransportRows
        duration={transitionDuration}
        hue={hueShift}
        zoom={zoomTarget}
        onCycleDuration={() => store.cycleDuration()}
        onStepHue={() => store.stepHue()}
        onZoom={(value) => store.setZoomTarget(value)}
      />
      <button
        type="button"
        className="kit-link"
        onClick={() => store.setHelpOpen(true)}
      >
        Shortcuts guide
      </button>
    </div>
  );
}
