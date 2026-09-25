import { describe, expect, it } from 'vitest';
import { ACTIONS } from './actionRegistry';
import { findConflict, resolveCode } from './bindings';

describe('bindings', () => {
  it('falls back to registry defaults without overrides', () => {
    const action = ACTIONS.find((entry) => entry.id === 'scene.next');
    expect(action).toBeDefined();
    if (!action) return;
    expect(resolveCode(action, {})).toBe('KeyN');
    expect(resolveCode(action, { 'scene.next': 'KeyJ' })).toBe('KeyJ');
  });

  it('detects key conflicts excluding the action being rebound', () => {
    const taken = findConflict(ACTIONS, {}, 'KeyN', 'scene.cut');
    expect(taken?.id).toBe('scene.next');
    expect(findConflict(ACTIONS, {}, 'KeyN', 'scene.next')).toBeNull();
    expect(
      findConflict(ACTIONS, { 'scene.cut': 'KeyN' }, 'KeyJ', 'scene.next')?.id,
    ).toBe('flag.beat');
  });
});
