import { version as APP_VERSION } from '../../package.json';
import { BASE_CAPABILITIES, HOST_PARAM_SCHEMAS } from '../scenes/bases';
import type { BaseId, BaseInstance, ScenePreset } from '../scenes/presets';

/**
 * Importable pack format (data only, never code).
 *
 * A pack carries complete deck-reactive scenes or media entries with a
 * mandatory header. Validation always returns per-item accept/reject
 * reasons, clamps out-of-range numbers with warnings, namespaces ids
 * per pack, and rejects unknown bases without touching the stage.
 */
export const PACK_FORMAT = 'vjlab-pack';
export const PACK_FORMAT_VERSION = 1;

export type PackKind = 'scenes' | 'media';

export interface PackHeader {
  format: string;
  formatVersion: number;
  kind: PackKind;
  name: string;
  author: string;
  packVersion: string;
  minAppVersion: string;
}

export interface ScenePackItem {
  id: string;
  base: string;
  name?: string;
  palette?: { primary?: string; emissive?: string };
  background?: string;
  gain?: number;
  speed?: number;
  params?: Record<string, unknown>;
  instances?: Array<{
    base?: string;
    params?: Record<string, unknown>;
  }>;
}

export interface MediaPackItem {
  name: string;
  src: 'local' | 'url';
  url?: string;
  type?: 'audio' | 'video';
}

export interface PackFile {
  header?: Record<string, unknown>;
  scenes?: unknown;
  media?: unknown;
}

export interface NormalizedScene {
  id: string;
  name: string;
  instances: BaseInstance[];
  palette: { primary: string; emissive: string };
  background: string;
  gain: number;
  speed: number;
  warnings: string[];
}

export interface NormalizedMedia {
  name: string;
  src: 'local' | 'url';
  url: string | null;
  type: 'audio' | 'video';
}

export interface PackRejection {
  id: string;
  reason: string;
}

export interface PackReport {
  headerErrors: string[];
  acceptedScenes: NormalizedScene[];
  acceptedMedia: NormalizedMedia[];
  rejected: PackRejection[];
}

const HEX_PATTERN = /^#[0-9a-f]{6}$/i;
const KNOWN_BASES = new Set<string>(Object.keys(BASE_CAPABILITIES));

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function clampNumber(
  value: unknown,
  min: number,
  max: number,
  fallback: number,
): { value: number; clamped: boolean } {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return { value: fallback, clamped: true };
  }
  if (value < min) return { value: min, clamped: true };
  if (value > max) return { value: max, clamped: true };
  return { value, clamped: false };
}

export function compareVersions(app: string, minimum: string): boolean {
  const parse = (version: string) =>
    version
      .split('.')
      .map((part) => Number.parseInt(part, 10))
      .map((num) => (Number.isNaN(num) ? 0 : num));
  const [aMajor = 0, aMinor = 0, aPatch = 0] = parse(app);
  const [mMajor = 0, mMinor = 0, mPatch = 0] = parse(minimum);
  if (aMajor !== mMajor) return aMajor > mMajor;
  if (aMinor !== mMinor) return aMinor > mMinor;
  return aPatch >= mPatch;
}

function validateHeader(header: unknown): string[] {
  const errors: string[] = [];
  if (!isRecord(header)) return ['header must be an object'];
  if (header['format'] !== PACK_FORMAT) {
    errors.push(`format must be '${PACK_FORMAT}'`);
  }
  if (header['formatVersion'] !== PACK_FORMAT_VERSION) {
    errors.push(`formatVersion must be ${PACK_FORMAT_VERSION}`);
  }
  if (header['kind'] !== 'scenes' && header['kind'] !== 'media') {
    errors.push("kind must be 'scenes' or 'media'");
  }
  for (const field of ['name', 'author', 'packVersion', 'minAppVersion']) {
    if (typeof header[field] !== 'string' || !header[field]) {
      errors.push(`${field} must be a non-empty string`);
    }
  }
  if (
    typeof header['minAppVersion'] === 'string' &&
    !compareVersions(APP_VERSION, header['minAppVersion'])
  ) {
    errors.push(
      `pack requires app ${header['minAppVersion']} but running ${APP_VERSION}`,
    );
  }
  return errors;
}

function hexOr(
  value: unknown,
  fallback: string,
  warnings: string[],
  label: string,
): string {
  if (typeof value === 'string' && HEX_PATTERN.test(value)) return value;
  warnings.push(`${label} invalid, using ${fallback}`);
  return fallback;
}

function normalizeInstances(
  item: ScenePackItem,
  warnings: string[],
): BaseInstance[] | string {
  const raw =
    Array.isArray(item.instances) && item.instances.length > 0
      ? item.instances
      : [{ base: item.base, params: item.params }];
  const instances: BaseInstance[] = [];
  for (const entry of raw) {
    if (!isRecord(entry) || typeof entry['base'] !== 'string') {
      return `unknown base '${String(entry)}'`;
    }
    if (!KNOWN_BASES.has(entry['base'])) {
      return `unknown base '${entry['base']}'`;
    }
    const base = entry['base'] as BaseId;
    const schemas = [
      ...BASE_CAPABILITIES[base].params,
      ...HOST_PARAM_SCHEMAS,
    ];
    const params: Record<string, unknown> = {};
    const rawParams = isRecord(entry['params']) ? entry['params'] : {};
    for (const [key, value] of Object.entries(rawParams)) {
      const schema = schemas.find((entry) => entry.name === key);
      if (!schema) {
        warnings.push(`unknown param '${key}' ignored`);
        continue;
      }
      if (schema.type === 'image') {
        if (typeof value === 'string' && value.length > 0) {
          params[key] = value;
        } else {
          warnings.push(`param '${key}' must be a URL string, ignored`);
        }
        continue;
      }
      const clamped = clampNumber(
        value,
        schema.min ?? Number.NEGATIVE_INFINITY,
        schema.max ?? Number.POSITIVE_INFINITY,
        schema.default as number,
      );
      params[key] = clamped.value;
      if (clamped.clamped) warnings.push(`param '${key}' clamped`);
    }
    instances.push(Object.keys(params).length > 0 ? { base, params } : { base });
  }
  return instances;
}

function normalizeScene(
  item: unknown,
  namespace: string | null,
):
  | { scene: NormalizedScene }
  | { rejection: string } {
  if (!isRecord(item) || typeof item['id'] !== 'string' || !item['id']) {
    return { rejection: 'scene id must be a non-empty string' };
  }
  const raw = item as unknown as ScenePackItem;
  const id = namespace ? `${namespace}:${raw.id}` : raw.id;
  const warnings: string[] = [];
  const instances = normalizeInstances(raw, warnings);
  if (typeof instances === 'string') return { rejection: instances };
  const gain = clampNumber(raw.gain ?? 1, 0.4, 2, 1);
  if (gain.clamped) warnings.push('gain clamped to 0.4–2.0');
  const speed = clampNumber(raw.speed ?? 1, 0.5, 2, 1);
  if (speed.clamped) warnings.push('speed clamped to 0.5–2.0');
  const palette = isRecord(raw.palette) ? raw.palette : {};
  return {
    scene: {
      id,
      name: typeof raw.name === 'string' && raw.name ? raw.name : id,
      instances,
      palette: {
        primary: hexOr(palette['primary'], '#ffffff', warnings, 'primary'),
        emissive: hexOr(palette['emissive'], '#000000', warnings, 'emissive'),
      },
      background: hexOr(raw.background, '#000000', warnings, 'background'),
      gain: gain.value,
      speed: speed.value,
      warnings,
    },
  };
}

function normalizeMedia(item: unknown):
  | { media: NormalizedMedia }
  | { rejection: string } {
  if (!isRecord(item) || typeof item['name'] !== 'string' || !item['name']) {
    return { rejection: 'media name must be a non-empty string' };
  }
  if (item['src'] !== 'local' && item['src'] !== 'url') {
    return { rejection: "media src must be 'local' or 'url'" };
  }
  const type = item['type'] ?? 'audio';
  if (type !== 'audio' && type !== 'video') {
    return { rejection: "media type must be 'audio' or 'video'" };
  }
  if (item['src'] === 'url' && typeof item['url'] !== 'string') {
    return { rejection: 'url media requires a url string' };
  }
  return {
    media: {
      name: item['name'],
      src: item['src'],
      url: item['src'] === 'url' ? (item['url'] as string) : null,
      type,
    },
  };
}

function slug(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'pack'
  );
}

export function validatePack(
  pack: unknown,
  options: { namespace?: string | null } = {},
): PackReport {
  const report: PackReport = {
    headerErrors: [],
    acceptedScenes: [],
    acceptedMedia: [],
    rejected: [],
  };
  if (!isRecord(pack)) {
    report.headerErrors.push('pack must be an object');
    return report;
  }
  const file = pack as PackFile;
  report.headerErrors = validateHeader(file.header);
  if (report.headerErrors.length > 0) return report;
  const header = file.header as Record<string, unknown>;
  const namespace =
    options.namespace === null
      ? null
      : (options.namespace ?? slug(header['name'] as string));
  if (header['kind'] === 'scenes' || Array.isArray(file.scenes)) {
    const items = Array.isArray(file.scenes) ? file.scenes : [];
    for (const item of items) {
      const result = normalizeScene(item, namespace);
      if ('scene' in result) report.acceptedScenes.push(result.scene);
      else {
        const rawId =
          isRecord(item) && typeof item['id'] === 'string' && item['id']
            ? item['id']
            : '?';
        report.rejected.push({ id: rawId, reason: result.rejection });
      }
    }
  }
  if (header['kind'] === 'media' || Array.isArray(file.media)) {
    const items = Array.isArray(file.media) ? file.media : [];
    for (const item of items) {
      const result = normalizeMedia(item);
      if ('media' in result) report.acceptedMedia.push(result.media);
      else {
        const rawName =
          isRecord(item) && typeof item['name'] === 'string'
            ? item['name']
            : '?';
        report.rejected.push({ id: rawName, reason: result.rejection });
      }
    }
  }
  return report;
}

/** Export shipped presets as a pack for round-trip and sharing. */
export function exportScenesPack(
  presets: ScenePreset[],
  meta: { name: string; author: string; packVersion: string },
): PackFile {
  return {
    header: {
      format: PACK_FORMAT,
      formatVersion: PACK_FORMAT_VERSION,
      kind: 'scenes',
      name: meta.name,
      author: meta.author,
      packVersion: meta.packVersion,
      minAppVersion: APP_VERSION,
    },
    scenes: presets.map((preset) => ({
      id: String(preset.id),
      base: 'particles',
      name: preset.name,
      palette: { ...preset.palette },
      background: preset.background,
      gain: preset.gain,
      speed: preset.speed,
      instances: (preset.instances ?? []).map((instance) => ({
        base: instance.base,
        params: { ...(instance.params ?? {}) },
      })),
    })),
  };
}
