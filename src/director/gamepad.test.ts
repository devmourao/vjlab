import { describe, expect, it } from 'vitest';
import { pressedEdges } from './gamepad';

describe('gamepad', () => {
  it('fires only on press edges, not holds', () => {
    expect(pressedEdges([false, false], [true, false])).toEqual([0]);
    expect(pressedEdges([true, false], [true, true])).toEqual([1]);
    expect(pressedEdges([true, true], [true, true])).toEqual([]);
    expect(pressedEdges([true, false], [false, false])).toEqual([]);
  });
});
