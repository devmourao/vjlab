import { slotRange, type FxSlot } from '../../director/fx';
import { MixRow } from './MixRow';

/**
 * Shared effect slots: every row is one MixRow carrying its own slider,
 * and clicking a row head selects it. Same component on deck and popup.
 * The strobe mix lives with the strobe group, so it is excluded here.
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
      {slots
        .filter((slot) => slot !== 'strobe')
        .map((slot) => {
          const value = values[slot] ?? 0;
          const range = slotRange(slot);
          return (
            <MixRow
              key={slot}
              name={slot}
              display={value.toFixed(2)}
              min={range.min}
              max={range.max}
              step={range.step}
              value={value}
              inputLabel={`${slot} mix`}
              selected={slot === selected}
              onSelect={() => onSelect(slot)}
              onChange={(next) => onMix(slot, next)}
            />
          );
        })}
    </div>
  );
}
