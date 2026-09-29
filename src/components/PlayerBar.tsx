import { useMemo } from 'react';
import type { AudioEngineApi } from '../audio/useAudioEngine';
import { createTrack, formatTrackTime } from '../audio/track';
import {
  bodyEntries,
  cueWindows,
  selectActivePlaylist,
  showTotalSec,
  useDirectorStore,
} from '../director/directorStore';
import { cueIndexAt, showElapsedSec } from '../director/showClock';
import { TrackCard } from './TrackCard';
import './PlayerBar.css';

/**
 * Dedicated always-on player strip (desktop): full track transport
 * (scrub, skip, times, queue prev/next) plus a live show readout, so
 * programming cues happens while watching progress. Hidden on small
 * screens where the bottom sheet owns playback, and in hidden mode
 * for clean output.
 */
export function PlayerBar({ engine }: { engine: AudioEngineApi }) {
  const mediaQueue = useDirectorStore((s) => s.mediaQueue);
  const mediaIndex = useDirectorStore((s) => s.mediaIndex);
  const showEntries = useDirectorStore(
    (s) => selectActivePlaylist(s).entries,
  );
  const stepTrack = (delta: 1 | -1) => {
    const next = useDirectorStore.getState().stepMedia(delta);
    if (next?.url) engine.loadUrl(next.url, next.name);
  };
  const track = useMemo(
    () => (engine.fileName ? createTrack(engine.fileName) : null),
    [engine.fileName],
  );
  if (!track) return null;

  const body = bodyEntries(showEntries);
  const windows = cueWindows(body);
  const elapsed = showElapsedSec();
  const index = cueIndexAt(windows, elapsed);
  const total = showTotalSec(body);

  return (
    <div className="player-bar" data-testid="player-bar">
      <TrackCard
        track={track}
        isPlaying={engine.isPlaying}
        variant="row"
        position={engine.position}
        duration={engine.duration}
        canPrev={mediaIndex !== null && mediaIndex > 0}
        canNext={mediaIndex !== null && mediaIndex < mediaQueue.length - 1}
        onTogglePlayback={() => void engine.toggle()}
        onSeek={(seconds) => engine.seekTo(seconds)}
        onSkip={(delta) => engine.skipBy(delta)}
        onPrev={() => stepTrack(-1)}
        onNext={() => stepTrack(1)}
      />
      {windows.length > 0 && index >= 0 && (
        <div className="player-show" data-testid="player-show-progress">
          cue {index + 1}/{windows.length} · SHOW {formatTrackTime(elapsed)}/
          {formatTrackTime(total)}
        </div>
      )}
    </div>
  );
}
