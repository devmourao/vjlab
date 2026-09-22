import { useState } from 'react';
import { useDirectorStore } from '../director/directorStore';
import './TourOverlay.css';

const STEPS = [
  {
    title: 'Load a track',
    body: 'Drop a local .mp3 file into the deck, then press play. The browser only allows audio after your gesture.',
  },
  {
    title: 'Perform live',
    body: 'Dissolve across scenes with keys 1–6, fire a burst with B, and shape effects from the FX tab.',
  },
  {
    title: 'Present clean',
    body: 'Press U to hide every panel and G for fullscreen output. S kills all effects instantly.',
  },
];

export function TourOverlay() {
  const tourOpen = useDirectorStore((s) => s.tourOpen);
  const [step, setStep] = useState(0);
  if (!tourOpen) return null;
  const last = step === STEPS.length - 1;

  return (
    <div className="tour-veil" data-testid="tour-overlay">
      <div className="tour-card" role="dialog" aria-label="First-run tour">
        <p className="tour-kicker">
          Step {step + 1} of {STEPS.length}
        </p>
        <h2>{STEPS[step].title}</h2>
        <p>{STEPS[step].body}</p>
        <div className="tour-dots" aria-hidden>
          {STEPS.map((_, index) => (
            <span key={index} className={index === step ? 'on' : ''} />
          ))}
        </div>
        <div className="tour-actions">
          {step > 0 && (
            <button
              type="button"
              className="tour-button secondary"
              data-testid="tour-back"
              onClick={() => setStep(step - 1)}
            >
              Back
            </button>
          )}
          <button
            type="button"
            className="tour-button ghost"
            data-testid="tour-skip"
            onClick={() => useDirectorStore.getState().completeTour()}
          >
            Skip
          </button>
          {!last ? (
            <button
              type="button"
              className="tour-button primary"
              data-testid="tour-next"
              onClick={() => setStep(step + 1)}
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              className="tour-button primary"
              data-testid="tour-next"
              onClick={() => useDirectorStore.getState().completeTour()}
            >
              Start performing
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
