import { describe, expect, it } from 'vitest';
import { version as APP_VERSION } from '../../package.json';
import { PRESETS } from '../scenes/presets';
import {
  compareVersions,
  exportScenesPack,
  validatePack,
} from './packFormat';

const HEADER = {
  format: 'vjlab-pack',
  formatVersion: 1,
  kind: 'scenes',
  name: 'Demo Pack',
  author: 'Owner',
  packVersion: '1.0.0',
  minAppVersion: '0.1.0',
};

describe('packFormat', () => {
  it('rejects packs with invalid headers', () => {
    expect(validatePack(null).headerErrors.length).toBeGreaterThan(0);
    expect(validatePack({ header: {} }).headerErrors.length).toBeGreaterThan(
      0,
    );
    const future = validatePack({
      header: { ...HEADER, minAppVersion: '99.0.0' },
      scenes: [],
    });
    expect(future.headerErrors.join(' ')).toContain('requires app');
    expect(future.acceptedScenes).toHaveLength(0);
  });

  it('accepts complete scenes and namespaces ids', () => {
    const report = validatePack({
      header: HEADER,
      scenes: [
        {
          id: 'solo',
          base: 'tunnel',
          name: 'Solo',
          palette: { primary: '#ff0000', emissive: '#00ff00' },
          background: '#000000',
          gain: 1.2,
          speed: 0.8,
        },
      ],
    });
    expect(report.headerErrors).toEqual([]);
    expect(report.rejected).toEqual([]);
    expect(report.acceptedScenes[0].id).toBe('demo-pack:solo');
    expect(report.acceptedScenes[0].instances).toEqual([{ base: 'tunnel' }]);
  });

  it('clamps numbers, drops unknown params and rejects unknown bases', () => {
    const report = validatePack({
      header: HEADER,
      scenes: [
        {
          id: 'wild',
          base: 'mesh',
          gain: 99,
          background: 'not-a-color',
          params: { cameraSensitivity: 9, color: 'red' },
          instances: [
            { base: 'mesh', params: { cameraSensitivity: 9, color: 'red' } },
          ],
        },
        { id: 'ghost', base: 'plasma' },
        { id: '', base: 'tunnel' },
      ],
    });
    const [wild] = report.acceptedScenes;
    expect(wild.gain).toBe(2);
    expect(wild.background).toBe('#000000');
    expect(wild.instances[0].params).toEqual({ cameraSensitivity: 2 });
    expect(wild.warnings.length).toBeGreaterThan(0);
    expect(report.rejected.map((entry) => entry.id)).toEqual([
      'ghost',
      '?',
    ]);
  });

  it('validates media entries for audio now and video later', () => {
    const report = validatePack({
      header: { ...HEADER, kind: 'media' },
      media: [
        { name: 'set.mp3', src: 'local', type: 'audio' },
        { name: 'clip', src: 'url', url: 'https://cdn.test/clip.mp4', type: 'video' },
        { name: 'broken', src: 'url' },
      ],
    });
    expect(report.acceptedMedia).toHaveLength(2);
    expect(report.rejected).toEqual([
      { id: 'broken', reason: 'url media requires a url string' },
    ]);
  });

  it('round-trips shipped presets unchanged', () => {
    const pack = exportScenesPack(PRESETS, {
      name: 'Shipped',
      author: 'Owner',
      packVersion: APP_VERSION,
    });
    const report = validatePack(pack, { namespace: null });
    expect(report.headerErrors).toEqual([]);
    expect(report.rejected).toEqual([]);
    expect(report.acceptedScenes).toHaveLength(PRESETS.length);
    for (const [index, scene] of report.acceptedScenes.entries()) {
      expect(scene.id).toBe(String(PRESETS[index].id));
      expect(scene.instances).toEqual(PRESETS[index].instances);
    }
  });

  it('compares app versions numerically', () => {
    expect(compareVersions('0.8.0', '0.7.9')).toBe(true);
    expect(compareVersions('0.8.0', '0.8.0')).toBe(true);
    expect(compareVersions('0.8.0', '0.9.0')).toBe(false);
    expect(compareVersions('1.0.0', '0.99.99')).toBe(true);
  });
});
