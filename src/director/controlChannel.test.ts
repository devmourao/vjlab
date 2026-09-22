import { describe, expect, it } from 'vitest';
import {
  buildSnapshot,
  isControlMessage,
  resolveDetachmentToggle,
  resolveVisibilityToggle,
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
        command: { type: 'setMix', slot: 'bloom' },
      }),
    ).toBe(false);
    expect(
      isControlMessage({
        type: 'command',
        command: { type: 'setZoom', value: 'far' },
      }),
    ).toBe(false);
    expect(isControlMessage({ type: 'command', command: null })).toBe(false);
    expect(isControlMessage(null)).toBe(false);
    expect(isControlMessage('toggleStrobe')).toBe(false);
  });

  it('builds a serializable snapshot from store state', () => {
    const snapshot = buildSnapshot(
      useDirectorStore.getState(),
      { fileName: 'demo.mp3', isPlaying: true },
      6,
    );
    expect(snapshot.fileName).toBe('demo.mp3');
    expect(snapshot.isPlaying).toBe(true);
    expect(snapshot.presetCount).toBe(6);
    expect(snapshot.mixes['bloom']).toBe(1);
    expect(JSON.parse(JSON.stringify(snapshot))).toMatchObject({
      fileName: 'demo.mp3',
    });
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
