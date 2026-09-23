import { BASE_CAPABILITIES, HOST_PARAM_SCHEMAS } from '../scenes/bases';
import type { BaseId } from '../scenes/presets';
import './InstanceParamFields.css';

/**
 * Generic schema-driven param fields for one base instance.
 * Shared by the scene editor and the preset builder so knobs render
 * identically everywhere. File uploads resolve to session object URLs.
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
          return (
            <label key={schema.name} className="param-field">
              <span>{schema.name} (image URL)</span>
              <input
                value={(value as string) ?? ''}
                placeholder="https://... or leave empty"
                onChange={(e) => onParam(schema.name, e.target.value || null)}
              />
              <input
                type="file"
                accept="image/png,image/jpeg"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  onParam(schema.name, URL.createObjectURL(file));
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
              value={typeof value === 'number' ? value : (schema.default as number)}
              onChange={(e) => onParam(schema.name, Number(e.target.value))}
            />
          </label>
        );
      })}
    </>
  );
}
