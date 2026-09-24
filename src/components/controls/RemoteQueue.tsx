import '../MediaQueue.css';

export interface RemoteQueueItem {
  id: string;
  name: string;
}

/**
 * Read-only mirror of the deck session queue: play, reorder and remove
 * run on the main deck through control commands. Audio stays there.
 */
export function RemoteQueue({
  items,
  activeIndex,
  onPlay,
  onMove,
  onRemove,
}: {
  items: RemoteQueueItem[];
  activeIndex: number | null;
  onPlay: (id: string) => void;
  onMove: (from: number, to: number) => void;
  onRemove: (id: string) => void;
}) {
  if (items.length === 0) {
    return (
      <div className="media-queue" data-testid="remote-queue">
        <p className="media-hint">Session queue — empty. Load audio above.</p>
      </div>
    );
  }

  return (
    <div className="media-queue" data-testid="remote-queue">
      <div className="media-queue-head">
        <strong>
          Queue{' '}
          {activeIndex !== null
            ? `${activeIndex + 1}/${items.length}`
            : `${items.length}`}
        </strong>
      </div>
      <p className="media-hint">Session only — files stay in memory until reload.</p>
      <ul className="media-list">
        {items.map((track, index) => (
          <li
            key={track.id}
            className={index === activeIndex ? 'media-item active' : 'media-item'}
          >
            <button
              type="button"
              className="media-play"
              onClick={() => onPlay(track.id)}
            >
              {index === activeIndex ? '●' : '▶'} {track.name}
            </button>
            <div className="media-actions">
              <button
                type="button"
                disabled={index === 0}
                onClick={() => onMove(index, index - 1)}
              >
                ↑
              </button>
              <button
                type="button"
                disabled={index === items.length - 1}
                onClick={() => onMove(index, index + 1)}
              >
                ↓
              </button>
              <button type="button" onClick={() => onRemove(track.id)}>
                ✕
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
