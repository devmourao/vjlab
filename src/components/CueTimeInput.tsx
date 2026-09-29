import { useState } from 'react';
import { formatTrackTime, parseMmSs } from '../audio/track';
import './CueTimeInput.css';

/**
 * mm:ss pin input with mobile numeric keyboard. Commits valid values on
 * Enter/blur; invalid input shakes back to the current value — garbage
 * never reaches the store.
 */
export function CueTimeInput({
  valueSec,
  onCommit,
  testId,
  label,
}: {
  valueSec: number | null;
  onCommit: (seconds: number | null) => void;
  testId: string;
  label: string;
}) {
  const [draft, setDraft] = useState(
    valueSec === null ? '' : formatTrackTime(valueSec),
  );
  const [bad, setBad] = useState(false);
  // External pin changes (steppers, distribute, remote) reset the draft.
  // Render-phase adjustment: guarded, never loops.
  const [syncedValue, setSyncedValue] = useState<number | null>(valueSec);
  if (syncedValue !== valueSec) {
    setSyncedValue(valueSec);
    setDraft(valueSec === null ? '' : formatTrackTime(valueSec));
    setBad(false);
  }

  const commit = () => {
    const trimmed = draft.trim();
    if (trimmed === '') {
      onCommit(null);
      return;
    }
    const parsed = parseMmSs(trimmed);
    if (parsed === null) {
      setBad(true);
      setDraft(valueSec === null ? '' : formatTrackTime(valueSec));
      return;
    }
    setBad(false);
    onCommit(parsed);
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      placeholder="m:ss"
      aria-label={label}
      data-testid={testId}
      className={bad ? 'cue-time bad' : 'cue-time'}
      value={draft}
      onChange={(event) => {
        setDraft(event.target.value);
        setBad(false);
      }}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === 'Enter') (event.target as HTMLInputElement).blur();
      }}
    />
  );
}
