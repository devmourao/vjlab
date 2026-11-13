import {
  BASE_CAPABILITIES,
  HOST_PARAM_SCHEMAS,
  paramLabel,
  type BaseParamSchema,
} from '../scenes/bases';
import { readImageAsDataUrl } from '../scenes/imageDataUrl';
import type { BaseId } from '../scenes/presets';
import './InstanceParamFields.css';

const HEX = /^#[0-9a-f]{6}$/i;

function ColorParamField({
  schema,
  value,
  onParam,
}: {
  schema: BaseParamSchema;
  value: unknown;
  onParam: (key: string, value: unknown) => void;
}) {
  const hex =
    typeof value === 'string' && HEX.test(value) ? value : '#888888';
  const unset = value === null || value === undefined || value === '';
  return (
    <label className="param-field param-color">
      <span>{paramLabel(schema)}</span>
      <div className="param-color-row">
        <input
          type="color"
          value={hex}
          aria-label={`${paramLabel(schema)} picker`}
          onChange={(e) => onParam(schema.name, e.target.value)}
        />
        <input
          value={unset ? '' : String(value)}
          placeholder="scene default"
          maxLength={7}
          onChange={(e) => {
            const next = e.target.value.trim();
            if (!next) {
              onParam(schema.name, null);
              return;
            }
            onParam(schema.name, next);
          }}
        />
        {!unset && (
          <button
            type="button"
            className="param-clear"
            onClick={() => onParam(schema.name, null)}
          >
            Use scene
          </button>
        )}
      </div>
    </label>
  );
}

function renderSchema(
  schema: BaseParamSchema,
  params: Record<string, unknown>,
  onParam: (key: string, value: unknown) => void,
) {
  const value = params[schema.name] ?? schema.default;
  if (schema.type === 'image') {
    const display =
      typeof value === 'string' && value.startsWith('data:')
        ? '(embedded image)'
        : ((value as string) ?? '');
    return (
      <label key={schema.name} className="param-field">
        <span>{paramLabel(schema)}</span>
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
  if (schema.type === 'color') {
    return (
      <ColorParamField
        key={schema.name}
        schema={schema}
        value={value}
        onParam={onParam}
      />
    );
  }
  if (schema.type === 'toggle') {
    const on = Number(value ?? 0) >= 0.5;
    return (
      <label key={schema.name} className="param-field param-toggle">
        <span>{paramLabel(schema)}</span>
        <button
          type="button"
          role="switch"
          aria-checked={on}
          className={on ? 'param-switch is-on' : 'param-switch'}
          onClick={() => onParam(schema.name, on ? 0 : 1)}
        >
          {on ? 'On — motion locked' : 'Off — free to move'}
        </button>
      </label>
    );
  }
  const numeric =
    typeof value === 'number' ? value : (schema.default as number);
  return (
    <label key={schema.name} className="param-field">
      <span>
        {paramLabel(schema)}{' '}
        {typeof numeric === 'number' ? numeric.toFixed(2) : ''}
      </span>
      <input
        type="range"
        min={schema.min}
        max={schema.max}
        step={0.01}
        value={typeof numeric === 'number' ? numeric : 0}
        onChange={(e) => onParam(schema.name, Number(e.target.value))}
      />
    </label>
  );
}

/**
 * Schema-driven param fields for one base instance.
 * Groups host placement/color knobs separately from base-specific ones.
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
  const colorHost = HOST_PARAM_SCHEMAS.filter((s) => s.family === 'color');
  const placeHost = HOST_PARAM_SCHEMAS.filter((s) => s.family === 'spatial');

  return (
    <>
      <p className="param-desc">{capability.description}</p>

      <p className="param-group-title">Colors</p>
      {colorHost.map((schema) => renderSchema(schema, params, onParam))}

      <p className="param-group-title">Placement & motion</p>
      {placeHost.map((schema) => renderSchema(schema, params, onParam))}

      <p className="param-group-title">Base knobs</p>
      {capability.params.map((schema) => renderSchema(schema, params, onParam))}
    </>
  );
}
