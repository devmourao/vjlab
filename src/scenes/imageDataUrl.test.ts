import { describe, expect, it } from 'vitest';
import { isImageDataUrl, readImageAsDataUrl } from './imageDataUrl';

describe('imageDataUrl', () => {
  it('recognizes data image URLs', () => {
    expect(isImageDataUrl('data:image/png;base64,abc')).toBe(true);
    expect(isImageDataUrl('blob:http://localhost/x')).toBe(false);
    expect(isImageDataUrl('/cover-placeholder.svg')).toBe(false);
  });

  it('reads a File into a data URL', async () => {
    const file = new File([new Uint8Array([137, 80, 78, 71])], 'x.png', {
      type: 'image/png',
    });
    const url = await readImageAsDataUrl(file);
    expect(url.startsWith('data:image/png')).toBe(true);
  });
});
