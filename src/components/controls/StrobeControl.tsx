import { STROBE_MAX_HZ, STROBE_MIN_HZ, type StrobeMode } from '../../director/fx';

const MODES: StrobeMode[] = ['white', 'black', 'color'];

/**
 * Shared strobe control: an on/off switch plus a single-choice color
 * radio with visible swatches, then a speed slider. Same component on
 * the deck and the second-screen popup.
 */
export function StrobeControl({
  on,
  mode,
  hz,
  onToggle,
  onMode,
  onHz,
}: {
  on: boolean;
  mode: string;
  hz: number;
  onToggle: () => void;
  onMode: (mode: StrobeMode) => void;
  onHz: (value: number) => void;
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
        <div
          className="kit-radio-group"
          role="radiogroup"
          aria-label="Strobe color"
        >
          {MODES.map((entry) => (
            <label
              key={entry}
              className={
                mode === entry ? 'kit-radio checked' : 'kit-radio'
              }
            >
              <input
                type="radio"
                name="strobe-color"
                checked={mode === entry}
                onChange={() => onMode(entry)}
              />
              <span className={`kit-swatch ${entry}`} aria-hidden />
              {entry}
            </label>
          ))}
        </div>
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
