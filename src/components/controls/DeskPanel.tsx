import { useDirectorStore } from '../../director/directorStore';
import { FX_SLOTS, ZOOM_MAX, ZOOM_MIN, type FxSlot } from '../../director/fx';
import { PRESETS, resolveInstances } from '../../scenes/presets';
import './ControlsKit.css';
import { EffectSlotList } from './EffectSlotList';
import { FlagPills } from './FlagPills';
import { HueSlider } from './HueSlider';
import { MixRow } from './MixRow';
import { SectionHandle } from './SectionHandle';
import { sectionDropProps } from './sectionDrag';
import { StrobeControl } from './StrobeControl';

const DESK_SECTIONS = ['stage', 'strobe', 'effects', 'flags', 'overlay'] as const;

const DESK_TITLES: Record<string, string> = {
  stage: 'Stage',
  strobe: 'Strobe',
  effects: 'Effects',
  flags: 'Flags',
  overlay: 'Overlay and actions',
};

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
  const hueShift = useDirectorStore((s) => s.hueShift);
  const zoomTarget = useDirectorStore((s) => s.zoomTarget);
  const activePresetId = useDirectorStore((s) => s.activePresetId);
  const customPresets = useDirectorStore((s) => s.customPresets);
  const fractalShape = useDirectorStore((s) => s.fractalShape);
  const fractalInner = useDirectorStore((s) => s.fractalInner);
  const fractalZ = useDirectorStore((s) => s.fractalZ);

  const store = useDirectorStore.getState();
  const sectionOrder = useDirectorStore((s) => s.sectionOrder);
  const deskOrder = sectionOrder.filter((id): id is (typeof DESK_SECTIONS)[number] =>
    (DESK_SECTIONS as readonly string[]).includes(id),
  );
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
      {deskOrder.map((sectionId) => {
        const fullIndex = sectionOrder.indexOf(sectionId);
        return (
        <section
          key={sectionId}
          className="kit-section"
          aria-label={DESK_TITLES[sectionId]}
          {...sectionDropProps(fullIndex, (from, to) => store.moveSection(from, to))}
        >
          <div className="section-head">
            <h2>{DESK_TITLES[sectionId]}</h2>
            <SectionHandle
              index={fullIndex}
              total={sectionOrder.length}
              onMove={(from, to) => store.moveSection(from, to)}
            />
          </div>
          {sectionId === 'stage' && (
            <>
              <MixRow
                name="Stage zoom"
                display={`${zoomTarget.toFixed(2)}x`}
                min={ZOOM_MIN}
                max={ZOOM_MAX}
                step={0.01}
                value={zoomTarget}
                inputLabel="Stage zoom"
                onChange={(value) => store.setZoomTarget(value)}
              />
              {resolveInstances(preset).some((inst) => inst.base === 'fractal') && (
                <p className="kit-note" data-testid="fractal-hud">
                  Fractal {FRACTAL_SIDES[fractalShape]}p · inner {fractalInner.toFixed(2)}x · Z{' '}
                  {fractalZ.toFixed(1)}rad
                </p>
              )}
            </>
          )}
          {sectionId === 'strobe' && (
            <StrobeControl
              on={strobeOn}
              mode={strobeMode}
              hz={strobeRateHz}
              mix={mixStrobe}
              onToggle={() => store.toggleStrobe()}
              onCycleMode={() => store.cycleStrobeMode()}
              onHz={(value) => store.setStrobeRate(value)}
              onMix={(value) => store.setFxMix('strobe', value)}
            />
          )}
          {sectionId === 'effects' && (
            <>
              <EffectSlotList
                slots={[...FX_SLOTS]}
                values={values}
                selected={selectedFx}
                onSelect={(slot: FxSlot) => store.selectFxSlot(slot)}
                onMix={(slot: FxSlot, value: number) => store.setFxMix(slot, value)}
                trailing={
                  <HueSlider
                    value={hueShift}
                    onChange={(value) => store.setHueShift(value)}
                  />
                }
              />
              <div className="kit-row">
                <button type="button" onClick={() => store.fireBurst()}>
                  Burst
                </button>
              </div>
            </>
          )}
          {sectionId === 'flags' && (
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
          )}
          {sectionId === 'overlay' && (
            <>
              <div className="kit-row">
                <button type="button" onClick={() => store.fireText()}>
                  Fire text
                </button>
                <button type="button" onClick={() => store.killAll()}>
                  Kill all
                </button>
              </div>
              <p className="kit-note">Overlay text lives in the Track tab.</p>
            </>
          )}
        </section>
        );
      })}
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
