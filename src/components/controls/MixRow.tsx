/**
 * The single slider-row pattern: name plus value readout on top, one
 * range input below. Used by every continuous control (effect slots,
 * hue, strobe speed and intensity, stage zoom) on deck and popup.
 * The head acts as a select button only when onSelect is provided.
 */
export function MixRow({
  name,
  display,
  min,
  max,
  step,
  value,
  inputLabel,
  selected,
  onSelect,
  onChange,
}: {
  name: string;
  display: string;
  min: number;
  max: number;
  step: number;
  value: number;
  inputLabel: string;
  selected?: boolean;
  onSelect?: () => void;
  onChange: (value: number) => void;
}) {
  return (
    <div className={selected ? 'kit-mix active' : 'kit-mix'}>
      {onSelect ? (
        <button
          type="button"
          className="kit-mix-head"
          aria-pressed={selected}
          onClick={onSelect}
        >
          <span>{name}</span>
          <span>{display}</span>
        </button>
      ) : (
        <div className="kit-mix-head">
          <span>{name}</span>
          <span>{display}</span>
        </div>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={inputLabel}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </div>
  );
}
