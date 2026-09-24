import './DeckStrip.css';

export interface DeckSlot {
  id: number;
  name: string;
}

/**
 * Quick-access deck: the active playlist favorites in slot order.
 * Positions map to Digit1-Digit9. Arrows reorder and renumber.
 * Same component on deck and popup.
 */
export function DeckStrip({
  slots,
  activeId,
  onSelect,
  onMove,
}: {
  slots: DeckSlot[];
  activeId: number;
  onSelect: (id: number) => void;
  onMove: (from: number, to: number) => void;
}) {
  if (slots.length === 0) {
    return (
      <p className="deck-strip-empty" data-testid="deck-strip-empty">
        Deck empty — star scenes below to pin quick slots.
      </p>
    );
  }
  return (
    <ul className="deck-strip" data-testid="deck-strip">
      {slots.map((slot, index) => (
        <li
          key={slot.id}
          className={slot.id === activeId ? 'deck-slot active' : 'deck-slot'}
        >
          <span className="deck-slot-number" aria-hidden>
            {index + 1}
          </span>
          <button
            type="button"
            className="deck-slot-name"
            data-testid={`deck-slot-${index + 1}`}
            onClick={() => onSelect(slot.id)}
            title={`Dissolve to ${slot.name} (${index + 1})`}
          >
            {slot.name}
          </button>
          <div className="deck-slot-actions">
            <button
              type="button"
              disabled={index === 0}
              aria-label={`Move ${slot.name} up`}
              onClick={() => onMove(index, index - 1)}
            >
              ↑
            </button>
            <button
              type="button"
              disabled={index === slots.length - 1}
              aria-label={`Move ${slot.name} down`}
              onClick={() => onMove(index, index + 1)}
            >
              ↓
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
