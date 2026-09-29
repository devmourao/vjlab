// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { AudioEngineApi } from '../audio/useAudioEngine';
import {
  selectActivePlaylist,
  useDirectorStore,
} from '../director/directorStore';
import { BottomSheet } from './BottomSheet';
import { PlayerBar } from './PlayerBar';
import { PlaylistManager } from './PlaylistManager';
import { TimelineView } from './TimelineView';

const stubEngine = {
  fileName: 'demo.mp3',
  isPlaying: false,
  error: null,
  spectrum: { bass: 0, mids: 0, treble: 0 },
  position: 0,
  duration: 2400,
  loadFile: () => undefined,
  loadUrl: () => undefined,
  toggle: () => Promise.resolve(),
  seekTo: () => undefined,
  skipBy: () => undefined,
  getSpectrum: () => ({ bass: 0, mids: 0, treble: 0 }),
  getPosition: () => 0,
} satisfies AudioEngineApi;

describe('panel surfaces', () => {
  it('shows the scene list on the bottom sheet scenes tab', () => {
    render(<BottomSheet engine={stubEngine} />);
    fireEvent.click(screen.getByTestId('sheet-tab-scenes'));
    expect(screen.getByTestId('scene-list')).toBeTruthy();
  });

  it('renders the playlist manager with coverage', () => {
    render(<PlaylistManager />);
    expect(screen.getByTestId('playlist-manager')).toBeTruthy();
    expect(screen.getByTestId('coverage-meter')).toBeTruthy();
  });

  it('renders the proportional timeline', () => {
    const state = useDirectorStore.getState();
    const playlist = selectActivePlaylist(state);
    const names = new Map([[0, 'Nebula Drift']]);
    const { unmount } = render(
      <TimelineView
        entries={playlist.entries}
        names={names}
        activeKey={playlist.entries[0]?.key ?? null}
        cueClock={null}
        onSelect={() => undefined}
      />,
    );
    expect(screen.getByTestId('timeline-view')).toBeTruthy();
    unmount();
  });

  it('drives the track from the bottom bar with show progress', () => {
    const api = useDirectorStore.getState();
    const previousActive = api.activePlaylistId;
    api.createPlaylist('Player test');
    const id = useDirectorStore.getState().activePlaylistId;
    for (let i = 0; i < 12; i += 1) {
      api.addSceneToPlaylist(id, i % 6);
    }
    const { unmount } = render(<PlayerBar engine={stubEngine} />);
    expect(screen.getByTestId('player-bar')).toBeTruthy();
    expect(screen.getByTestId('track-toggle')).toBeTruthy();
    expect(screen.getByLabelText('Seek in track')).toBeTruthy();
    expect(screen.getByTestId('player-show-progress')).toBeTruthy();
    unmount();
    api.deletePlaylist(id);
    expect(useDirectorStore.getState().activePlaylistId).toBe(previousActive);
  });

  it('reads cue positions on a track ruler with playhead', () => {
    const names = new Map([
      [0, 'Nebula Drift'],
      [1, 'Neon Bloom'],
    ]);
    const { unmount } = render(
      <TimelineView
        entries={[
          { key: 'a', sceneId: 0, durationSec: 30 },
          { key: 'b', sceneId: 1, durationSec: 30 },
        ]}
        names={names}
        activeKey="a"
        cueClock={null}
        onSelect={() => undefined}
        trackDuration={2400}
        position={75}
      />,
    );
    expect(screen.getByTestId('timeline-ruler')).toBeTruthy();
    expect(screen.getByTestId('timeline-playhead')).toBeTruthy();
    expect(screen.getByText('0:30→1:00')).toBeTruthy();
    unmount();
  });
});
