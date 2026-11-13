import { BASE_CAPABILITIES, HOST_PARAM_SCHEMAS } from '../scenes/bases';
import { readImageAsDataUrl } from '../scenes/imageDataUrl';
import type { BaseId } from '../scenes/presets';
import './InstanceParamFields.css';

/**
 * Generic schema-driven param fields for one base instance.
 * Shared by the scene editor and the preset builder so knobs render
 * identically everywhere. File uploads become data URLs (persistable).
 */
export function InstanceParamFields({
  base,
  params,
  onParam,
}: {
  base: BaseId;
  params: Record<string, unknown>;
  onParam: (key: string, value: unknown) => void;
}) {
  const capability = BASE_CAPABILITIES[base];

  return (
    <>
      <p className="param-desc">{capability.description}</p>
      {[...HOST_PARAM_SCHEMAS, ...capability.params].map((schema) => {
        const value = params[schema.name] ?? schema.default;
        if (schema.type === 'image') {
          const display =
            typeof value === 'string' && value.startsWith('data:')
              ? '(embedded image)'
              : ((value as string) ?? '');
          return (
            <label key={schema.name} className="param-field">
              <span>{schema.name} (image)</span>
              <input
                value={display}
                placeholder="Upload below or paste a URL"
                onChange={(e) => {
                  const next = e.target.value.trim();
                  if (next === '(embedded image)') return;
                  onParam(schema.name, next || null);
                }}
              />
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = '';
                  if (!file) return;
                  void readImageAsDataUrl(file)
                    .then((dataUrl) => onParam(schema.name, dataUrl))
                    .catch(() => {
                      // Keep prior value; builder shows its own error path.
                    });
                }}
              />
            </label>
          );
        }
        return (
          <label key={schema.name} className="param-field">
            <span>
              {schema.name} {typeof value === 'number' ? value.toString() : ''}
            </span>
            <input
              type="range"
              min={schema.min}
              max={schema.max}
              step={0.01}
              value={
                typeof value === 'number' ? value : (schema.default as number)
              }
              onChange={(e) => onParam(schema.name, Number(e.target.value))}
            />
          </label>
        );
      })}
    </>
  );
}
