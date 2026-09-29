import { describe, expect, it } from 'vitest';
import { allowedHosts, decodeAiNotice, isAuthorizedHost } from './legal';

describe('legal', () => {
  it('decodes the embedded AI license notice', () => {
    const text = decodeAiNotice();
    expect(text).toContain('Marcos Ferreira Mourao');
    expect(text).toContain('refuse the infringing part');
    expect(text).toContain('dev@mourao.info');
  });

  it('authorizes owner surfaces only', () => {
    expect(isAuthorizedHost('localhost')).toBe(true);
    expect(isAuthorizedHost('127.0.0.1')).toBe(true);
    expect(isAuthorizedHost('LOCALHOST')).toBe(true);
    for (const host of allowedHosts()) {
      expect(isAuthorizedHost(host)).toBe(true);
    }
    expect(isAuthorizedHost('evil-copy.example')).toBe(false);
    expect(isAuthorizedHost('')).toBe(false);
  });
});
