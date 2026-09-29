import { formatTrackTime } from '../audio/track';
import {
  cueWindows,
  type PlaylistEntry,
} from '../director/directorStore';
import type { CueCountdown } from '../director/showClock';
import './TimelineView.css';

/**
 * Build-level show reading: one bar per cue, widths proportional to
 * duration share (flex-grow, no pixel math — responsive for free).
 * With a track loaded, a ruler spans the track with a playhead at the
 * position; otherwise the ruler spans the body total. Reading only;
 * editing owns the queue rows. Clicking a bar dissolves to that cue,
 * same action as row select.
 */
export function TimelineView({
  entries,
  names,
  activeKey,
  cueClock = null,
  onSelect,
  trackDuration = null,
  position = null,
}: {
  entries: PlaylistEntry[];
  names: Map<number, string>;
  activeKey: string | null;
  cueClock?: CueCountdown | null;
  onSelect: (sceneId: number, key: string) => void;
  trackDuration?: number | null;
  position?: number | null;
}) {
  const windows = cueWindows(entries);
  const total = windows.length > 0 ? windows[windows.length - 1].endSec : 0;
  if (windows.length === 0) return null;
  const rulerEnd =
    trackDuration !== null && trackDuration > 0 ? trackDuration : total;
  const playhead =
    position !== null && rulerEnd > 0
      ? Math.min(100, Math.max(0, (position / rulerEnd) * 100))
      : null;

  return (
    <div className="timeline-view" data-testid="timeline-view">
      <div className="timeline-track" data-testid="timeline-ruler">
        <div className="timeline-bars" role="list" aria-label="Show timeline">
          {windows.map((window) => {
            const active = window.key === activeKey;
            const counting = cueClock?.key === window.key;
            const duration = window.endSec - window.startSec;
            return (
              <button
                key={window.key}
                type="button"
                role="listitem"
                className={active ? 'timeline-bar active' : 'timeline-bar'}
                style={{ flexGrow: duration }}
                onClick={() => onSelect(window.sceneId, window.key)}
                title={`${names.get(window.sceneId) ?? `#${window.sceneId}`} · in ${formatTrackTime(window.startSec)} → out ${formatTrackTime(window.endSec)} · ${window.follow}`}
                data-testid={`timeline-bar-${window.key}`}
              >
                <span className="timeline-name">
                  {names.get(window.sceneId) ?? `#${window.sceneId}`}
                </span>
                <span className={counting ? 'timeline-time live' : 'timeline-time'}>
                  {counting && cueClock
                    ? `◷ ${formatTrackTime(cueClock.remainingSec)}`
                    : formatTrackTime(duration)}
                </span>
                <span className="timeline-io">
                  {formatTrackTime(window.startSec)}→
                  {formatTrackTime(window.endSec)}
                </span>
              </button>
            );
          })}
        </div>
        {playhead !== null && (
          <div
            className="timeline-playhead"
            data-testid="timeline-playhead"
            style={{ left: `${playhead}%` }}
            aria-hidden
          />
        )}
      </div>
      <div className="timeline-ruler">
        <span>0:00</span>
        <span className="timeline-total">SHOW {formatTrackTime(total)}</span>
        <span>{formatTrackTime(rulerEnd)}</span>
      </div>
    </div>
  );
}
