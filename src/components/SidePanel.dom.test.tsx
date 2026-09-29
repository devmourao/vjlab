// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { AudioEngineApi } from '../audio/useAudioEngine';
import { SidePanel } from './SidePanel';

const stubEngine = {
  fileName: null,
  isPlaying: false,
  error: null,
  spectrum: { bass: 0, mids: 0, treble: 0 },
  position: 0,
  duration: 0,
  loadFile: () => undefined,
  loadUrl: () => undefined,
  toggle: () => Promise.resolve(),
  seekTo: () => undefined,
  skipBy: () => undefined,
  getSpectrum: () => ({ bass: 0, mids: 0, treble: 0 }),
  getPosition: () => 0,
} satisfies AudioEngineApi;

describe('SidePanel scenes tab', () => {
  it('shows the scene list after clicking Scenes', () => {
    render(<SidePanel engine={stubEngine} />);
    fireEvent.click(screen.getByTestId('side-tab-scenes'));
    expect(screen.getByTestId('scene-list')).toBeTruthy();
  });
});
