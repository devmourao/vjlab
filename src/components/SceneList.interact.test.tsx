// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  cueTiming,
  selectActivePlaylist,
  useDirectorStore,
} from '../director/directorStore';
import { cueUnitHeight } from './cueUnits';
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
        activeKey={entries[10].key}
        cueClock={{ key: entries[10].key, remainingSec: 20, fraction: 0.25 }}
      />,
    );
    expect(screen.getByTestId(`cue-pill-${entries[10].key}`)).toBeTruthy();
    // Progress lives inside the active pill (no global playhead line).
    expect(screen.getByTestId(`cue-pfill-${entries[10].key}`)).toBeTruthy();
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

  it('sizes units compressively with gaps and a free-space placeholder', () => {
    expect(cueUnitHeight(2)).toBeLessThan(cueUnitHeight(40));
    expect(cueUnitHeight(3600)).toBe(248);
    const api = useDirectorStore.getState();
    const previousActive = api.activePlaylistId;
    api.createPlaylist('Units test');
    const id = useDirectorStore.getState().activePlaylistId;
    for (let i = 0; i < 12; i += 1) {
      api.addSceneToPlaylist(id, i % 6);
    }
    const getEntries = () =>
      selectActivePlaylist(useDirectorStore.getState()).entries;
    // Anchor the second body cue at 0:12 with 2 s and 40 s neighbors.
    api.setCueTiming(getEntries()[10].key, { durationSec: 2 });
    api.setCueTiming(getEntries()[11].key, { durationSec: 40 });
    api.setCueAnchor(getEntries()[11].key, 12);
    const { unmount, rerender } = render(
      <SceneList
        manage={false}
        entries={getEntries()}
        activeKey={getEntries()[10].key}
        cueClock={{ key: getEntries()[10].key, remainingSec: 20, fraction: 0.25 }}
        trackTotal={2400}
      />,
    );
    const refresh = () =>
      rerender(
        <SceneList
          manage={false}
          entries={getEntries()}
          activeKey={getEntries()[10].key}
          cueClock={{ key: getEntries()[10].key, remainingSec: 20, fraction: 0.25 }}
          trackTotal={2400}
        />,
      );
    // Anchored gap reads as labeled empty space between units.
    expect(screen.getByText('vão 0:10')).toBeTruthy();
    // Active unit pill carries progress; off-program would read amber.
    expect(
      screen.getByTestId(`cue-pfill-${getEntries()[10].key}`),
    ).toBeTruthy();
    // Free track remainder offers one-tap distribution.
    expect(screen.getByTestId('cue-unit-free')).toBeTruthy();
    fireEvent.click(screen.getByTestId('cue-distribute'));
    refresh();
    // The anchored gap refills (predecessor stretches to 0:12).
    expect(screen.queryByText('vão 0:10')).toBeNull();
    expect(
      cueTiming(
        selectActivePlaylist(useDirectorStore.getState()).entries[10],
      ).durationSec,
    ).toBe(12);
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
