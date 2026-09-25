import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { ACTIONS, deriveShortcutMap } from './actionRegistry';

describe('actionRegistry', () => {
  it('binds every default code exactly once', () => {
    const codes = ACTIONS.map((action) => action.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it('gives every action a stable id, label, category and handler', () => {
    const ids = new Set<string>();
    for (const action of ACTIONS) {
      expect(action.id).toMatch(/^[a-z0-9]+(\.[a-z0-9]+)+$/);
      expect(ids.has(action.id)).toBe(false);
      ids.add(action.id);
      expect(action.label.length).toBeGreaterThan(0);
      expect(typeof action.run).toBe('function');
    }
  });

  it('derives the guide table with merged rows in registry order', () => {
    const rows = deriveShortcutMap();
    expect(rows.slice(0, 6)).toEqual([
      { key: '1–0', action: 'Dissolve deck position 1' },
      { key: 'N / P', action: 'Dissolve next in playlist' },
      { key: 'X', action: 'Hard cut to next preset' },
      { key: 'Y', action: 'Cycle transition duration' },
      { key: 'T', action: 'Fire text overlay' },
      { key: 'H', action: 'Step global hue shift' },
    ]);
    expect(rows[rows.length - 1]).toEqual({
      key: '↑/↓ (Fractal)',
      action: 'Fractal next/prev shape (when Fractal active)',
    });
  });

  it('stays in sync with docs/03-design/keymap.md', () => {
    const doc = readFileSync('docs/03-design/keymap.md', 'utf8');
    for (const action of ACTIONS) {
      const guide = action.guide ?? '—';
      expect(
        doc.includes(
          `| ${action.id} | ${action.code} | ${action.category} | ${guide} |`,
        ),
      ).toBe(true);
    }
  });
});
