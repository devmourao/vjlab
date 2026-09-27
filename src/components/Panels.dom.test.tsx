// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { AudioEngineApi } from '../audio/useAudioEngine';
import {
  selectActivePlaylist,
  useDirectorStore,
} from '../director/directorStore';
import { BottomSheet } from './BottomSheet';
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
});
