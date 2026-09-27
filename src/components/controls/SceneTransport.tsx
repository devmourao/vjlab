export function SceneTransport({
  durationLabel,
  onPrev,
  onNext,
  onCut,
  onCycleDuration,
  onResume,
}: {
  durationLabel: string;
  onPrev: () => void;
  onNext: () => void;
  onCut: () => void;
  onCycleDuration: () => void;
  onResume: () => void;
}) {
  return (
    <div className="kit-row" data-testid="scene-transport">
      <button type="button" onClick={onPrev}>
        Prev
      </button>
      <button type="button" onClick={onNext}>
        Next
      </button>
      <button type="button" onClick={onCut}>
        Cut
      </button>
      <button
        type="button"
        onClick={onResume}
        title="Resume show at track point (Z)"
        data-testid="scene-resume"
      >
        Resume
      </button>
      <button type="button" onClick={onCycleDuration}>
        {durationLabel}
      </button>
    </div>
  );
}
