import { SHORTCUT_MAP } from '../../director/directorStore';

export const START_KEYS = new Set(['U', 'D', 'G / F11', 'L', 'A', 'I', 'M']);
export const PERFORM_KEYS = new Set([
  '1–9',
  'N / P',
  'X',
  'Y',
  'T',
  'B',
  'Arrows',
  '+ / -',
  'Q / W',
  '↑/↓ (Fractal)',
]);
export const EFFECTS_KEYS = new Set([
  'H',
  'E / ]',
  'R / F',
  ', / .',
  'Space',
  'O',
  'V',
  'C',
  'J',
  '0',
  'S',
]);

export function rowsFor(keys: Set<string>) {
  return SHORTCUT_MAP.filter((row) => keys.has(row.key));
}

export const SHORTCUT_GROUPS: Array<{ title: string; keys: Set<string> }> = [
  { title: 'Start', keys: START_KEYS },
  { title: 'Perform', keys: PERFORM_KEYS },
  { title: 'Effects', keys: EFFECTS_KEYS },
];
