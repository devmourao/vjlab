import { useDirectorStore } from '../director/directorStore';
import './GuideTeaser.css';

/**
 * Single source for the guide entry, shared by the side panel, the
 * bottom sheet and the console popup. The full content lives in the
 * help drawer. Actions are injectable so the remote popup can fire
 * deck commands instead of touching its own local store.
 */
export function GuideTeaser({
  onOpenGuide,
  onReplayTour,
}: {
  onOpenGuide?: () => void;
  onReplayTour?: () => void;
} = {}) {
  const open = onOpenGuide ?? (() => useDirectorStore.getState().setHelpOpen(true));
  const replay = onReplayTour ?? (() => useDirectorStore.getState().replayTour());
  return (
    <div className="guide-teaser" data-testid="guide-teaser">
      <p>
        New here? Open the full guide with shortcuts and pro tips, or replay
        the first-run tour.
      </p>
      <button
        type="button"
        className="guide-teaser-button"
        onClick={open}
      >
        <strong>Open full guide</strong>
      </button>
      <button
        type="button"
        className="guide-teaser-button"
        onClick={replay}
      >
        <strong>Replay tour</strong>
      </button>
    </div>
  );
}
