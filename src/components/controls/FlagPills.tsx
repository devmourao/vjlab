export interface FlagEntry {
  id: string;
  label: string;
  on: boolean;
  tone: string;
}

/**
 * Shared flag pills with colored active treatment. Tones map to
 * kit-flag-* classes so deck and popup stay identical.
 */
export function FlagPills({
  flags,
  onToggle,
}: {
  flags: FlagEntry[];
  onToggle: (id: string) => void;
}) {
  return (
    <div className="kit-flags" data-testid="flag-pills">
      {flags.map((flag) => (
        <button
          key={flag.id}
          type="button"
          aria-pressed={flag.on}
          className={flag.on ? `kit-flag on tone-${flag.tone}` : 'kit-flag'}
          onClick={() => onToggle(flag.id)}
        >
          {flag.label}
        </button>
      ))}
    </div>
  );
}
