import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { selectActivePlaylist, useDirectorStore } from '../director/directorStore';
import { SceneList } from './SceneList';

describe('SceneList smoke', () => {
  it('renders entries mode without throwing', () => {
    const entries = selectActivePlaylist(useDirectorStore.getState()).entries;
    const html = renderToString(<SceneList manage={false} entries={entries} />);
    expect(html).toContain('scene-list');
  });

  it('renders entries mode with a live countdown without throwing', () => {
    const entries = selectActivePlaylist(useDirectorStore.getState()).entries;
    const html = renderToString(
      <SceneList
        manage={false}
        entries={entries}
        cueClock={{ key: entries[0]?.key ?? null, remainingSec: 12 }}
      />,
    );
    expect(html).toContain('scene-list');
  });
});
