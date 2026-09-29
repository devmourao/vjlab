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

  it('reads labeled groups and a progress rail beside the rows', () => {
    const api = useDirectorStore.getState();
    const previousActive = api.activePlaylistId;
    api.createPlaylist('Rail test');
    const id = useDirectorStore.getState().activePlaylistId;
    for (let i = 0; i < 12; i += 1) {
      api.addSceneToPlaylist(id, i % 6);
    }
    const entries = selectActivePlaylist(useDirectorStore.getState()).entries;
    render(
      <SceneList
        manage={false}
        entries={entries}
        cueClock={{ key: entries[2].key, remainingSec: 20, fraction: 0.25 }}
      />,
    );
    expect(screen.getByTestId('cue-rail')).toBeTruthy();
    expect(screen.getByTestId('cue-playhead')).toBeTruthy();
    expect(screen.getByTestId(`cue-seg-${entries[10].key}`)).toBeTruthy();
    expect(screen.getByTestId(`cue-minus-${entries[2].key}`).textContent).toBe(
      '−5s',
    );
    expect(screen.getByTestId(`cue-follow-${entries[2].key}`).textContent).toBe(
      'Hold',
    );
    api.deletePlaylist(id);
    expect(useDirectorStore.getState().activePlaylistId).toBe(previousActive);
  });

  it('groups pool above body and pins anchors only on Fix', () => {
    const api = useDirectorStore.getState();
    const previousActive = api.activePlaylistId;
    api.createPlaylist('Group test');
    const id = useDirectorStore.getState().activePlaylistId;
    for (let i = 0; i < 12; i += 1) {
      api.addSceneToPlaylist(id, i % 6);
    }
    const getEntries = () =>
      selectActivePlaylist(useDirectorStore.getState()).entries;
    const bodyKey = getEntries()[10].key;
    const { unmount, rerender } = render(
      <SceneList manage={false} entries={getEntries()} />,
    );
    const refresh = () =>
      rerender(<SceneList manage={false} entries={getEntries()} />);
    // Pool rows carry no anchor controls; body rows offer Fix first.
    expect(screen.queryByTestId(`anchor-fix-${getEntries()[2].key}`)).toBeNull();
    expect(screen.getByTestId(`anchor-fix-${bodyKey}`)).toBeTruthy();
    expect(screen.queryByTestId(`anchor-plus-${bodyKey}`)).toBeNull();
    // Fix pins at the natural start (harmless), then adjusts.
    fireEvent.click(screen.getByTestId(`anchor-fix-${bodyKey}`));
    refresh();
    expect(
      screen.getByTestId(`anchor-plus-${bodyKey}`),
    ).toBeTruthy();
    fireEvent.click(screen.getByTestId(`anchor-plus-${bodyKey}`));
    refresh();
    const fixed = selectActivePlaylist(
      useDirectorStore.getState(),
    ).entries.find((entry) => entry.key === bodyKey);
    expect(fixed?.startSec).toBe(5);
    fireEvent.click(screen.getByTestId(`anchor-clear-${bodyKey}`));
    expect(
      selectActivePlaylist(useDirectorStore.getState()).entries.find(
        (entry) => entry.key === bodyKey,
      )?.startSec ?? null,
    ).toBeNull();
    unmount();
    api.deletePlaylist(id);
    expect(useDirectorStore.getState().activePlaylistId).toBe(previousActive);
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
