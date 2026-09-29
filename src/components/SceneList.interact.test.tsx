// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import {
  cueTiming,
  cueWindows,
  selectActivePlaylist,
  useDirectorStore,
} from '../director/directorStore';
import { CueRail } from './CueRail';
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

  it('reads rail modes, gaps and off-program cues', () => {
    const names = new Map([
      [0, 'Nebula'],
      [1, 'Bloom'],
    ]);
    const windows = cueWindows([
      { key: 'a', sceneId: 0, durationSec: 2 },
      { key: 'b', sceneId: 1, durationSec: 40, startSec: 12 },
    ]);
    const noop = () => undefined;
    // Scale: anchored gap renders as empty space between segments.
    const scale = renderToString(
      <CueRail
        windows={windows}
        names={names}
        activeKey="a"
        fraction={0}
        onSelect={noop}
        mode="scale"
      />,
    );
    expect(scale).toContain('cue-gap-b');
    expect(scale).toContain('data-rail-mode="scale"');
    // Even: active off-program cue reads amber with progress fill.
    const even = renderToString(
      <CueRail
        windows={windows}
        names={names}
        activeKey="a"
        fraction={0.9}
        onSelect={noop}
        mode="even"
      />,
    );
    expect(even).toContain('data-rail-mode="even"');
    expect(even).toContain('detour');
    expect(even).toContain('cue-fill-a');
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
