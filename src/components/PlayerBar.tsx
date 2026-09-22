import { useMemo } from 'react';
import type { AudioEngineApi } from '../audio/useAudioEngine';
import { createTrack } from '../audio/track';
import { TrackCard } from './TrackCard';
import './PlayerBar.css';

/**
 * Dedicated always-on player strip (desktop): track identity plus
 * transport, apart from effects. Hidden on small screens where the
 * bottom sheet owns playback, and in hidden mode for clean output.
 */
export function PlayerBar({ engine }: { engine: AudioEngineApi }) {
  const track = useMemo(
    () => (engine.fileName ? createTrack(engine.fileName) : null),
    [engine.fileName],
  );
  if (!track) return null;

  return (
    <div className="player-bar" data-testid="player-bar">
      <TrackCard
        track={track}
        isPlaying={engine.isPlaying}
        variant="row"
        onTogglePlayback={() => void engine.toggle()}
      />
    </div>
  );
}
