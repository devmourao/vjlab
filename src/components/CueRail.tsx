import { formatTrackTime } from '../audio/track';
import type { CueWindow } from '../director/directorStore';
import './CueRail.css';

/**
 * Vertical show mini-map: one segment per cue, heights proportional to
 * duration share, with a playhead descending as the show runs. Clicking
 * a segment dissolves to that cue. Sits beside the rows; the active row
 * keeps its own highlight.
 */
export function CueRail({
  windows,
  names,
  activeKey,
  fraction,
  onSelect,
}: {
  windows: CueWindow[];
  names: Map<number, string>;
  activeKey: string | null;
  /** Elapsed share 0..1 of the total; null hides the playhead. */
  fraction: number | null;
  onSelect: (sceneId: number, key: string) => void;
}) {
  if (windows.length === 0) return null;
  const clamped =
    fraction === null ? null : Math.min(1, Math.max(0, fraction));

  return (
    <div className="cue-rail" data-testid="cue-rail" aria-label="Show progress">
      {windows.map((window) => (
        <button
          key={window.key}
          type="button"
          className={window.key === activeKey ? 'cue-seg active' : 'cue-seg'}
          style={{ flexGrow: window.endSec - window.startSec }}
          onClick={() => onSelect(window.sceneId, window.key)}
          title={`${names.get(window.sceneId) ?? `#${window.sceneId}`} · in ${formatTrackTime(window.startSec)} → out ${formatTrackTime(window.endSec)}`}
          data-testid={`cue-seg-${window.key}`}
          aria-label={`Cue ${names.get(window.sceneId) ?? window.sceneId}`}
        />
      ))}
      {clamped !== null && (
        <div
          className="cue-playhead"
          data-testid="cue-playhead"
          style={{ top: `${clamped * 100}%` }}
          aria-hidden
        />
      )}
    </div>
  );
}
