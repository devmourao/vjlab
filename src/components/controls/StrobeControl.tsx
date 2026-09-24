import { STROBE_MAX_HZ, STROBE_MIN_HZ } from '../../director/fx';

/**
 * Shared strobe group: an on/off switch, a mode stepper showing the
 * current color swatch, a speed slider and the burst trigger next to
 * it. Same component on the deck and the second-screen popup.
 */
export function StrobeControl({
  on,
  mode,
  hz,
  onToggle,
  onCycleMode,
  onHz,
  onBurst,
}: {
  on: boolean;
  mode: string;
  hz: number;
  onToggle: () => void;
  onCycleMode: () => void;
  onHz: (value: number) => void;
  onBurst: () => void;
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
        <button type="button" onClick={onBurst}>
          Burst
        </button>
      </div>
      <label className="kit-slider">
        <span>Speed · {hz}Hz</span>
        <input
          type="range"
          min={STROBE_MIN_HZ}
          max={STROBE_MAX_HZ}
          step={1}
          value={hz}
          aria-label="Strobe speed"
          onChange={(event) => onHz(Number(event.target.value))}
        />
      </label>
    </div>
  );
}
