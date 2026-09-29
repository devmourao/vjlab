import { Fragment } from 'react';
import { formatTrackTime } from '../audio/track';
import type { CueWindow } from '../director/directorStore';
import './CueRail.css';

export type RailMode = 'scale' | 'even';

/**
 * Show mini-map beside the body rows. Two reading modes:
 * - scale: segment heights proportional to durations, with visible gap
 *   spacers between anchored windows (2 s vs 40 s reads true, gaps show).
 * - even: uniform pills with internal progress fill on the active cue;
 *   an off-program active cue (interrupt, manual hold elsewhere) reads
 *   amber instead of cyan.
 */
export function CueRail({
  windows,
  names,
  activeKey,
  fraction,
  onSelect,
  mode = 'scale',
}: {
  windows: CueWindow[];
  names: Map<number, string>;
  activeKey: string | null;
  /** Elapsed share 0..1 of the total; null hides progress. */
  fraction: number | null;
  onSelect: (sceneId: number, key: string) => void;
  mode?: RailMode;
}) {
  if (windows.length === 0) return null;
  const total = windows[windows.length - 1].endSec;
  const elapsed = fraction === null ? null : fraction * total;
  const programmedKey =
    elapsed === null
      ? null
      : (() => {
          let key: string | null = null;
          for (const window of windows) {
            if (elapsed >= window.startSec) key = window.key;
          }
          return key;
        })();

  const segment = (window: CueWindow) => {
    const active = window.key === activeKey;
    const programmed = window.key === programmedKey;
    const tone = active
      ? programmed || programmedKey === null
        ? 'active'
        : 'detour'
      : programmed
        ? 'scheduled'
        : '';
    const duration = Math.max(0, window.endSec - window.startSec);
    // Progress lives inside the active pill in both modes: a global
    // playhead line cannot align with rows (time-proportional rail vs
    // uniform rows), so it lied whenever durations varied.
    const fill =
      active && elapsed !== null && duration > 0
        ? Math.min(100, Math.max(0, ((elapsed - window.startSec) / duration) * 100))
        : null;
    return (
      <button
        key={window.key}
        type="button"
        className={tone ? `cue-seg ${tone}` : 'cue-seg'}
        style={
          mode === 'scale' ? { flexGrow: Math.max(duration, 0.001) } : undefined
        }
        onClick={() => onSelect(window.sceneId, window.key)}
        title={`${names.get(window.sceneId) ?? `#${window.sceneId}`} · in ${formatTrackTime(window.startSec)} → out ${formatTrackTime(window.endSec)}`}
        data-testid={`cue-seg-${window.key}`}
        aria-label={`Cue ${names.get(window.sceneId) ?? window.sceneId}`}
      >
        {fill !== null && (
          <span
            className="cue-fill"
            data-testid={`cue-fill-${window.key}`}
            style={{ height: `${fill}%` }}
            aria-hidden
          />
        )}
      </button>
    );
  };

  return (
    <div
      className={mode === 'even' ? 'cue-rail even' : 'cue-rail'}
      data-testid="cue-rail"
      data-rail-mode={mode}
      aria-label="Show progress"
    >
      {mode === 'scale'
        ? windows.map((window, index) => {
            const previousEnd =
              index === 0 ? 0 : windows[index - 1].endSec;
            const gap = Math.max(0, window.startSec - previousEnd);
            return (
              <Fragment key={window.key}>
                {gap > 0 && (
                  <span
                    className="cue-gap"
                    data-testid={`cue-gap-${window.key}`}
                    style={{ flexGrow: gap }}
                    title={`Gap ${formatTrackTime(gap)}`}
                    aria-hidden
                  />
                )}
                {segment(window)}
              </Fragment>
            );
          })
        : windows.map((window) => segment(window))}
    </div>
  );
}
