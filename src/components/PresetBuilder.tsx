import { useState } from 'react';
import { useDirectorStore } from '../director/directorStore';
import { BASE_CAPABILITIES, HOST_PARAM_SCHEMAS } from '../scenes/bases';
import type { BaseId, BaseInstance, ScenePreset } from '../scenes/presets';
import { draftToPreset } from '../scenes/presetDraft';
import { InstanceParamFields } from './InstanceParamFields';
import { PreviewStage } from './PreviewStage';
import './PresetBuilder.css';

const BASE_OPTIONS: BaseId[] = ['particles', 'mesh', 'tunnel', 'fractal'];

function defaultParamsFor(base: BaseId): Record<string, unknown> {
  const host = Object.fromEntries(
    HOST_PARAM_SCHEMAS.map((schema) => [schema.name, schema.default]),
  );
  const baseParams = BASE_CAPABILITIES[base].params.reduce(
    (acc: Record<string, unknown>, schema) => {
      if (schema.default !== null) acc[schema.name] = schema.default;
      return acc;
    },
    {} as Record<string, unknown>,
  );
  return { ...host, ...baseParams };
}

/**
 * Visual preset builder: browse native bases, preview the draft in an
 * isolated mini stage, tweak schema knobs, then save as a custom scene.
 * The preview never writes to the store — saving is explicit.
 */
export function PresetBuilder({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave?: (draft: Omit<ScenePreset, 'id'>) => void;
}) {
  const [name, setName] = useState('Built Scene');
  const [primary, setPrimary] = useState('#22d3ee');
  const [emissive, setEmissive] = useState('#0e7490');
  const [background, setBackground] = useState('#01090d');
  const [gain, setGain] = useState(1);
  const [speed, setSpeed] = useState(1);
  const [instances, setInstances] = useState<BaseInstance[]>([
    { base: 'tunnel', params: defaultParamsFor('tunnel') },
  ]);
  const [error, setError] = useState<string | null>(null);

  const save = () => {
    const result = draftToPreset({
      name,
      primary,
      emissive,
      background,
      gain,
      speed,
      instances,
    });
    if ('error' in result) {
      setError(result.error);
      return;
    }
    if (onSave) {
      onSave(result.preset);
    } else {
      const store = useDirectorStore.getState();
      const created = store.createScene(result.preset);
      store.setPreset(created.id);
    }
    onClose();
  };

  return (
    <div className="builder-veil" data-testid="preset-builder">
      <div className="builder-card" role="dialog" aria-label="Preset builder">
        <div className="builder-head">
          <strong>Preset builder</strong>
          <button type="button" className="builder-close" onClick={onClose}>
            Close
          </button>
        </div>

        <section aria-label="Base browser">
          <h3>1 · Pick bases</h3>
          <div className="builder-browser">
            {BASE_OPTIONS.map((base: BaseId) => (
              <div key={base} className="builder-base">
                <strong>{BASE_CAPABILITIES[base].label}</strong>
                <span>{BASE_CAPABILITIES[base].description}</span>
                <button
                  type="button"
                  onClick={() =>
                    setInstances((prev) => [
                      ...prev,
                      { base, params: defaultParamsFor(base) },
                    ])
                  }
                >
                  Add
                </button>
              </div>
            ))}
          </div>
        </section>

        <section aria-label="Live preview">
          <h3>2 · Preview</h3>
          <PreviewStage
            instances={instances}
            palette={{ primary, emissive }}
            background={background}
            gain={gain}
            speed={speed}
          />
        </section>

        <section aria-label="Assemble">
          <h3>3 · Assemble and save</h3>
          <label className="builder-field">
            <span>Name</span>
            <input value={name} maxLength={40} onChange={(e) => setName(e.target.value)} />
          </label>
          <div className="builder-grid">
            <label className="builder-field">
              <span>Primary</span>
              <input value={primary} onChange={(e) => setPrimary(e.target.value)} />
            </label>
            <label className="builder-field">
              <span>Emissive</span>
              <input value={emissive} onChange={(e) => setEmissive(e.target.value)} />
            </label>
            <label className="builder-field">
              <span>Background</span>
              <input value={background} onChange={(e) => setBackground(e.target.value)} />
            </label>
            <label className="builder-field">
              <span>Gain {gain.toFixed(1)}</span>
              <input type="range" min={0.4} max={2} step={0.1} value={gain} onChange={(e) => setGain(Number(e.target.value))} />
            </label>
            <label className="builder-field">
              <span>Speed {speed.toFixed(1)}</span>
              <input type="range" min={0.5} max={2} step={0.1} value={speed} onChange={(e) => setSpeed(Number(e.target.value))} />
            </label>
          </div>
          {instances.map((inst, index) => (
            <div key={index} className="builder-instance">
              <div className="builder-instance-head">
                <strong>{BASE_CAPABILITIES[inst.base].label}</strong>
                <button
                  type="button"
                  onClick={() =>
                    setInstances((prev) => prev.filter((_, i) => i !== index))
                  }
                >
                  Remove
                </button>
              </div>
              <InstanceParamFields
                base={inst.base}
                params={inst.params ?? {}}
                onParam={(key, value) =>
                  setInstances((prev) =>
                    prev.map((entry, i) =>
                      i === index
                        ? { ...entry, params: { ...(entry.params ?? {}), [key]: value } }
                        : entry,
                    ),
                  )
                }
              />
            </div>
          ))}
        </section>

        {error && <p className="builder-error">{error}</p>}

        <div className="builder-actions">
          <button type="button" className="builder-cancel" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="builder-save" onClick={save}>
            Save scene
          </button>
        </div>
      </div>
    </div>
  );
}
