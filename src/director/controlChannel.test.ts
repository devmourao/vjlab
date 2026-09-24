import { describe, expect, it } from 'vitest';
import {
  buildSnapshot,
  isControlMessage,
  resolveDetachmentToggle,
  resolveVisibilityToggle,
  toggleInterfaceVisibility,
} from './controlChannel';
import { useDirectorStore } from './directorStore';

describe('controlChannel', () => {
  it('accepts hello, snapshot and whitelisted commands only', () => {
    expect(isControlMessage({ kind: 'hello', source: 'controls' })).toBe(true);
    expect(
      isControlMessage({
        kind: 'snapshot',
        snapshot: { activePresetId: 0 },
      }),
    ).toBe(true);
    expect(
      isControlMessage({ type: 'command', command: { type: 'toggleStrobe' } }),
    ).toBe(true);
    expect(
      isControlMessage({
        type: 'command',
        command: { type: 'dissolve', id: 2 },
      }),
    ).toBe(true);
    expect(
      isControlMessage({ type: 'command', command: { type: 'formatDisk' } }),
    ).toBe(false);
    expect(
      isControlMessage({
        type: 'command',
        command: { type: 'setMix', slot: 'bloom', value: 0.5 },
      }),
    ).toBe(true);
    expect(
      isControlMessage({
        type: 'command',
        command: { type: 'setZoom', value: 1.2 },
      }),
    ).toBe(true);
    expect(
      isControlMessage({
        type: 'command',
        command: { type: 'setHue', value: 0.5 },
      }),
    ).toBe(true);
    expect(
      isControlMessage({
        type: 'command',
        command: { type: 'setHue', value: 'half' },
      }),
    ).toBe(false);
    expect(
      isControlMessage({
        type: 'command',
        command: { type: 'setMix', slot: 'bloom' },
      }),
    ).toBe(false);
    expect(
      isControlMessage({
        type: 'command',
        command: { type: 'setZoom', value: 'far' },
      }),
    ).toBe(false);
    expect(
      isControlMessage({
        type: 'command',
        command: {
          type: 'uploadTrack',
          name: 'set.mp3',
          mime: 'audio/mpeg',
          data: new ArrayBuffer(8),
        },
      }),
    ).toBe(true);
    expect(
      isControlMessage({
        type: 'command',
        command: { type: 'uploadTrack', name: '', mime: 'audio/mpeg', data: new ArrayBuffer(8) },
      }),
    ).toBe(false);
    expect(
      isControlMessage({
        type: 'command',
        command: { type: 'uploadTrack', name: 'set.mp3', mime: 'audio/mpeg', data: 'nope' },
      }),
    ).toBe(false);
    expect(isControlMessage({ type: 'command', command: null })).toBe(false);
    expect(isControlMessage(null)).toBe(false);
    expect(isControlMessage('toggleStrobe')).toBe(false);
    expect(
      isControlMessage({
        type: 'command',
        command: {
          type: 'createScene',
          draft: { name: 'Built', instances: [{ base: 'tunnel' }] },
        },
      }),
    ).toBe(true);
    expect(
      isControlMessage({
        type: 'command',
        command: { type: 'createScene', draft: { name: '', instances: [] } },
      }),
    ).toBe(false);
    expect(
      isControlMessage({
        type: 'command',
        command: { type: 'deleteScene', id: 7 },
      }),
    ).toBe(true);
    expect(
      isControlMessage({ type: 'command', command: { type: 'exportScenes' } }),
    ).toBe(true);
    expect(
      isControlMessage({ type: 'command', command: { type: 'openLibrary' } }),
    ).toBe(true);
    expect(
      isControlMessage({ type: 'command', command: { type: 'closeLibrary' } }),
    ).toBe(true);
    expect(
      isControlMessage({ type: 'command', command: { type: 'showGuide' } }),
    ).toBe(true);
    expect(
      isControlMessage({ type: 'command', command: { type: 'replayTour' } }),
    ).toBe(true);
    expect(
      isControlMessage({
        type: 'command',
        command: { type: 'moveScene', from: 1, to: 0 },
      }),
    ).toBe(true);
    expect(
      isControlMessage({
        type: 'command',
        command: { type: 'toggleFavorite', id: 3 },
      }),
    ).toBe(true);
    expect(
      isControlMessage({
        type: 'command',
        command: { type: 'moveScene', from: 1, to: 'top' },
      }),
    ).toBe(false);
    expect(
      isControlMessage({
        type: 'command',
        command: { type: 'toggleFavorite', id: 'three' },
      }),
    ).toBe(false);
    expect(
      isControlMessage({
        type: 'command',
        command: { type: 'playQueueTrack', id: 'track-1' },
      }),
    ).toBe(true);
    expect(
      isControlMessage({
        type: 'command',
        command: { type: 'removeQueueTrack', id: 'track-1' },
      }),
    ).toBe(true);
    expect(
      isControlMessage({
        type: 'command',
        command: { type: 'moveQueueTrack', from: 0, to: 1 },
      }),
    ).toBe(true);
    expect(
      isControlMessage({
        type: 'command',
        command: { type: 'playQueueTrack', id: 7 },
      }),
    ).toBe(false);
    expect(
      isControlMessage({
        type: 'command',
        command: { type: 'moveQueueTrack', from: 0, to: 'far' },
      }),
    ).toBe(false);
    expect(
      isControlMessage({
        type: 'command',
        command: { type: 'importPack', pack: { header: {} } },
      }),
    ).toBe(true);
  });

  it('builds a serializable snapshot from store state', () => {
    const snapshot = buildSnapshot(
      useDirectorStore.getState(),
      { fileName: 'demo.mp3', isPlaying: true },
      [
        {
          id: 0,
          name: 'Nebula',
          palette: { primary: '#ffffff', emissive: '#000000' },
          background: '#000000',
          gain: 1,
          speed: 1,
          scene: 0 as const,
          instances: [{ base: 'particles' as const }],
        },
      ],
    );
    expect(snapshot.fileName).toBe('demo.mp3');
    expect(snapshot.isPlaying).toBe(true);
    expect(snapshot.presets).toHaveLength(1);
    expect(snapshot.favoriteIds.length).toBeLessThanOrEqual(9);
    expect(snapshot.mixes['bloom']).toBe(1);
    expect(snapshot.audioError).toBeNull();
    expect(snapshot.queue).toEqual([]);
    expect(snapshot.mediaIndex).toBeNull();
    expect(Array.isArray(snapshot.sceneOrder)).toBe(true);
    expect(JSON.parse(JSON.stringify(snapshot))).toMatchObject({
      fileName: 'demo.mp3',
    });
  });

  it('hides the stage without closing the popup path', () => {
    useDirectorStore.getState().setPanelMode('detached');
    toggleInterfaceVisibility();
    expect(useDirectorStore.getState().panelMode).toBe('hidden');
    // No popup open in tests, so restore docks the deck panels.
    toggleInterfaceVisibility();
    expect(useDirectorStore.getState().panelMode).toBe('docked');
    useDirectorStore.getState().setPanelMode('docked');
  });

  it('splits visibility and detachment into single-purpose toggles', () => {
    expect(resolveVisibilityToggle('docked')).toBe('hidden');
    expect(resolveVisibilityToggle('hidden')).toBe('docked');
    expect(resolveVisibilityToggle('detached')).toBe('hidden');
    expect(resolveDetachmentToggle('docked')).toBe('detached');
    expect(resolveDetachmentToggle('detached')).toBe('docked');
    expect(resolveDetachmentToggle('hidden')).toBe('detached');
  });
});
