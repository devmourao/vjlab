import {
  slotFraction,
  slotRange,
  type FxSlot,
} from '../../director/fx';

/**
 * Shared effect slots: every row carries its own slider and value bar,
 * and clicking a row selects it. Same component on deck and popup.
 */
export function EffectSlotList({
  slots,
  values,
  selected,
  onSelect,
  onMix,
}: {
  slots: FxSlot[];
  values: Record<string, number>;
  selected: string;
  onSelect: (slot: FxSlot) => void;
  onMix: (slot: FxSlot, value: number) => void;
}) {
  return (
    <div className="kit-slots" data-testid="effect-slots">
      {slots.map((slot) => {
        const value = values[slot] ?? 0;
        const range = slotRange(slot);
        return (
          <div
            key={slot}
            className={slot === selected ? 'kit-slot active' : 'kit-slot'}
          >
            <button
              type="button"
              className="kit-slot-head"
              aria-pressed={slot === selected}
              onClick={() => onSelect(slot)}
            >
              <span>{slot}</span>
              <span>{value.toFixed(2)}</span>
            </button>
            <div className="kit-bar" aria-hidden>
              <div
                style={{
                  width: `${Math.round(slotFraction(slot, value) * 100)}%`,
                }}
              />
            </div>
            <input
              type="range"
              min={range.min}
              max={range.max}
              step={range.step}
              value={value}
              aria-label={`${slot} mix`}
              onChange={(event) => onMix(slot, Number(event.target.value))}
            />
          </div>
        );
      })}
    </div>
  );
}
