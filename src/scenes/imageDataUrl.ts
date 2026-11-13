/**
 * Read a local image file as a data URL so textures survive localStorage
 * and load reliably in Three.js (blob: URLs break after reload / can fail
 * to refresh the cover plate).
 *
 * Uses arrayBuffer + base64 so it works in the browser and in Node tests
 * (no FileReader dependency).
 */
export async function readImageAsDataUrl(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const mime = file.type || 'application/octet-stream';
  const base64 = encodeBase64(bytes);
  return `data:${mime};base64,${base64}`;
}

function encodeBase64(bytes: Uint8Array): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(bytes).toString('base64');
  }
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

export function isImageDataUrl(value: unknown): value is string {
  return typeof value === 'string' && value.startsWith('data:image/');
}
