// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  cueTiming,
  selectActivePlaylist,
  useDirectorStore,
} from '../director/directorStore';
import { SceneList } from './SceneList';

describe('SceneList timing interaction', () => {
  it('renders library mode without entries', () => {
    render(<SceneList />);
    expect(screen.getByTestId('scene-list')).toBeTruthy();
  });

  it('steps duration and toggles follow from the row', () => {
    const api = useDirectorStore.getState();
    const previousActive = api.activePlaylistId;
    api.createPlaylist('Interact test');
    const id = useDirectorStore.getState().activePlaylistId;
    api.addSceneToPlaylist(id, 0);
    const key = selectActivePlaylist(useDirectorStore.getState()).entries[0].key;

    render(
      <SceneList
        manage={false}
        entries={selectActivePlaylist(useDirectorStore.getState()).entries}
      />,
    );
    const before = cueTiming(
      selectActivePlaylist(useDirectorStore.getState()).entries[0],
    ).durationSec;
    fireEvent.click(screen.getByTestId(`cue-plus-${key}`));
    const after = cueTiming(
      selectActivePlaylist(useDirectorStore.getState()).entries[0],
    ).durationSec;
    expect(after).toBe(before + 5);
    fireEvent.click(screen.getByTestId(`cue-follow-${key}`));
    expect(
      cueTiming(selectActivePlaylist(useDirectorStore.getState()).entries[0])
        .follow,
    ).toBe('auto');

    api.deletePlaylist(id);
    expect(useDirectorStore.getState().activePlaylistId).toBe(previousActive);
  });
});
