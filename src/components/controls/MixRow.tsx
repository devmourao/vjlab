import { useRef, useState } from 'react';

/**
 * The single slider-row pattern: name plus value readout on top, one
 * range input below. Used by every continuous control (effect slots,
 * hue, strobe speed and intensity, stage zoom) on deck and popup.
 * The head acts as a select button only when onSelect is provided.
 *
 * The thumb follows a local drag echo: while the pointer is down the
 * row shows the dragged value immediately and forwards it, so remote
 * popups stay smooth despite the snapshot round trip. On release the
 * live value takes over again.
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
  const draggingRef = useRef(false);
  const [echo, setEcho] = useState<number | null>(null);

  const release = () => {
    draggingRef.current = false;
    setEcho(null);
  };

  const shown = echo ?? value;

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
        value={shown}
        aria-label={inputLabel}
        onChange={(event) => {
          const next = Number(event.target.value);
          // Pointer drags keep a local echo for smoothness; keyboard
          // steps are discrete and always follow the live value.
          setEcho(draggingRef.current ? next : null);
          onChange(next);
        }}
        onPointerDown={() => {
          draggingRef.current = true;
        }}
        onPointerUp={release}
        onPointerCancel={release}
        onBlur={release}
      />
    </div>
  );
}
