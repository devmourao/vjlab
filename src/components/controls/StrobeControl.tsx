import { STROBE_MAX_HZ, STROBE_MIN_HZ } from '../../director/fx';
import { MixRow } from './MixRow';

/**
 * Shared strobe group: an on/off switch, a mode stepper showing the
 * current color swatch, a speed slider and an intensity slider.
 * Same component on the deck and the second-screen popup.
 */
export function StrobeControl({
  on,
  mode,
  hz,
  mix,
  onToggle,
  onCycleMode,
  onHz,
  onMix,
}: {
  on: boolean;
  mode: string;
  hz: number;
  mix: number;
  onToggle: () => void;
  onCycleMode: () => void;
  onHz: (value: number) => void;
  onMix: (value: number) => void;
}) {
  return (
    <div className="kit-group" data-testid="strobe-control">
      <div className="kit-row">
        <button
          type="button"
          role="switch"
          aria-checked={on}
          className={on ? 'kit-switch on' : 'kit-switch'}
          data-testid="strobe-switch"
          onClick={onToggle}
        >
          <span className="kit-knob" aria-hidden />
          <span>{on ? 'On' : 'Off'}</span>
        </button>
        <button
          type="button"
          className="kit-mode-step"
          data-testid="strobe-mode"
          title="Cycle strobe color"
          onClick={onCycleMode}
        >
          <span className={`kit-swatch ${mode}`} aria-hidden />
          {mode}
        </button>
      </div>
      <MixRow
        name="Speed"
        display={`${hz}Hz`}
        min={STROBE_MIN_HZ}
        max={STROBE_MAX_HZ}
        step={1}
        value={hz}
        inputLabel="Strobe speed"
        onChange={onHz}
      />
      <MixRow
        name="Intensity"
        display={mix.toFixed(2)}
        min={0}
        max={1}
        step={0.01}
        value={mix}
        inputLabel="Strobe intensity"
        onChange={onMix}
      />
    </div>
  );
}
