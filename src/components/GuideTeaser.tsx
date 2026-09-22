import { useDirectorStore } from '../director/directorStore';
import './GuideTeaser.css';

/**
 * Single source for the guide entry, shared by the side panel and the
 * bottom sheet. The full content lives in the help drawer.
 */
export function GuideTeaser() {
  return (
    <div className="guide-teaser" data-testid="guide-teaser">
      <p>
        New here? Open the full guide with shortcuts and pro tips, or replay
        the first-run tour.
      </p>
      <button
        type="button"
        className="guide-teaser-button"
        onClick={() => useDirectorStore.getState().setHelpOpen(true)}
      >
        <strong>Open full guide</strong>
      </button>
      <button
        type="button"
        className="guide-teaser-button"
        onClick={() => useDirectorStore.getState().replayTour()}
      >
        <strong>Replay tour</strong>
      </button>
    </div>
  );
}
