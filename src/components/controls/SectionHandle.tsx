/**
 * Drag handle for console sections (popup cards, desk groups): HTML5
 * drag to move, Alt+Arrow keys as the keyboard and touch fallback.
 * Order persists locally as a sync-ready JSON array.
 */
export function SectionHandle({
  index,
  total,
  onMove,
}: {
  index: number;
  total: number;
  onMove: (from: number, to: number) => void;
}) {
  const move = (from: number, to: number) => {
    if (from === to) return;
    onMove(from, to);
  };

  return (
    <span
      className="section-handle"
      role="button"
      tabIndex={0}
      title="Drag to reorder section (Alt+Arrow keys move it)"
      aria-label={`Reorder section ${index + 1} of ${total}. Drag or press Alt plus arrow keys.`}
      draggable
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = 'move';
        try {
          event.dataTransfer.setData('text/plain', String(index));
        } catch {
          // Some browsers only need the drag image.
        }
      }}
      onKeyDown={(event) => {
        if (!event.altKey) return;
        if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
          event.preventDefault();
          move(index, Math.max(0, index - 1));
        } else if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
          event.preventDefault();
          move(index, Math.min(total - 1, index + 1));
        }
      }}
    >
      <span aria-hidden>⠿⠿</span>
    </span>
  );
}


