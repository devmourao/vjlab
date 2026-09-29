import { formatTrackTime } from '../audio/track';
import { coverageStatus } from '../director/showClock';
import './CoverageMeter.css';

/**
 * Show-level ruler (list level, never row level): total runtime against
 * the reference — loaded track, manual target, or the total alone.
 * Read-only everywhere; the manual target edits on the deck manager.
 */
export function CoverageMeter({
  totalSec,
  referenceSec,
  referenceLabel,
}: {
  totalSec: number;
  referenceSec: number | null;
  referenceLabel: string;
}) {
  if (referenceSec === null) {
    return (
      <div className="coverage-meter" data-testid="coverage-meter">
        <span className="coverage-total">SHOW {formatTrackTime(totalSec)}</span>
      </div>
    );
  }
  const status = coverageStatus(totalSec, referenceSec);
  return (
    <div
      className={`coverage-meter ${status}`}
      data-testid="coverage-meter"
      title={
        status === 'covered'
          ? 'Show covers the reference'
          : status === 'under'
            ? 'Show is shorter than the reference'
            : 'Show runs past the reference'
      }
    >
      <span className="coverage-total">SHOW {formatTrackTime(totalSec)}</span>
      <span className="coverage-ref">
        {referenceLabel} {formatTrackTime(referenceSec)}
      </span>
      <span className="coverage-status">{status.toUpperCase()}</span>
    </div>
  );
}
