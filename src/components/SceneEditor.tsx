import { useState } from 'react';
import { BASE_CAPABILITIES, HOST_PARAM_SCHEMAS } from '../scenes/bases';
import type { BaseId, BaseInstance, ScenePreset } from '../scenes/presets';
import { InstanceParamFields } from './InstanceParamFields';
import { PreviewStage } from './PreviewStage';
import { useDirectorStore } from '../director/directorStore';
import './SceneEditor.css';

interface SceneEditorProps {
  preset?: ScenePreset | null;
  onClose: () => void;
  onSave?: (draft: Omit<ScenePreset, 'id'>, editingId: number | null) => void;
}

const BASE_OPTIONS: BaseId[] = ['particles', 'mesh', 'tunnel', 'fractal'];

function hexValid(value: string): boolean {
  return /^#[0-9a-f]{6}$/i.test(value);
}

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

export function SceneEditor({ preset, onClose, onSave }: SceneEditorProps) {
  const isEdit = Boolean(preset);
  const [name, setName] = useState(preset?.name ?? 'New Scene');
  const [primary, setPrimary] = useState(preset?.palette.primary ?? '#ffffff');
  const [emissive, setEmissive] = useState(preset?.palette.emissive ?? '#000000');
  const [background, setBackground] = useState(preset?.background ?? '#000000');
  const [gain, setGain] = useState(preset?.gain ?? 1);
  const [speed, setSpeed] = useState(preset?.speed ?? 1);
  const [instances, setInstances] = useState<BaseInstance[]>(
    preset?.instances && preset.instances.length > 0
      ? preset.instances.map((inst) => ({ ...inst, params: { ...(inst.params ?? {}) } }))
      : [{ base: 'particles', params: defaultParamsFor('particles') }],
  );
  const [error, setError] = useState<string | null>(null);

  const save = () => {
    if (!name.trim()) {
      setError('Name must not be empty');
      return;
    }
    if (!hexValid(primary) || !hexValid(emissive) || !hexValid(background)) {
      setError('Colors must be #rrggbb');
      return;
    }
    if (instances.length === 0) {
      setError('Add at least one base');
      return;
    }
    const payload: Omit<ScenePreset, 'id'> = {
      name: name.trim(),
      palette: { primary, emissive },
      background,
      gain,
      speed,
      scene: 0 as const,
      instances,
    };
    if (onSave) {
      onSave(payload, isEdit && preset ? preset.id : null);
    } else {
      const store = useDirectorStore.getState();
      if (isEdit && preset) {
        store.updateScene(preset.id, payload);
      } else {
        const created = store.createScene(payload);
        store.setPreset(created.id);
      }
    }
    onClose();
  };

  const updateInstanceBase = (index: number, base: BaseId) => {
    setInstances((prev) =>
      prev.map((inst, i) => (i === index ? { base, params: defaultParamsFor(base) } : inst)),
    );
  };

  const updateInstanceParam = (index: number, key: string, value: unknown) => {
    setInstances((prev) =>
      prev.map((inst, i) =>
        i === index ? { ...inst, params: { ...(inst.params ?? {}), [key]: value } } : inst,
      ),
    );
  };

  return (
    <div className="scene-editor-veil" data-testid="scene-editor">
      <div className="scene-editor-card" role="dialog" aria-label="Scene editor">
        <div className="scene-editor-head">
          <strong>{isEdit ? 'Edit scene' : 'Create scene'}</strong>
          <button type="button" className="scene-editor-close" onClick={onClose}>
            Close
          </button>
        </div>
        <PreviewStage
          instances={instances}
          palette={{ primary, emissive }}
          background={background}
          gain={gain}
          speed={speed}
        />

        <label className="scene-editor-field">
          <span>Name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={40} />
        </label>

        <div className="scene-editor-grid">
          <label className="scene-editor-field">
            <span>Primary</span>
            <input value={primary} onChange={(e) => setPrimary(e.target.value)} placeholder="#ffffff" />
          </label>
          <label className="scene-editor-field">
            <span>Emissive</span>
            <input value={emissive} onChange={(e) => setEmissive(e.target.value)} placeholder="#000000" />
          </label>
          <label className="scene-editor-field">
            <span>Background</span>
            <input value={background} onChange={(e) => setBackground(e.target.value)} placeholder="#000000" />
          </label>
          <label className="scene-editor-field">
            <span>Gain {gain.toFixed(2)}</span>
            <input type="range" min={0.4} max={2} step={0.1} value={gain} onChange={(e) => setGain(Number(e.target.value))} />
          </label>
          <label className="scene-editor-field">
            <span>Speed {speed.toFixed(2)}</span>
            <input type="range" min={0.5} max={2} step={0.1} value={speed} onChange={(e) => setSpeed(Number(e.target.value))} />
          </label>
        </div>

        <div className="scene-editor-instances">
          <div className="scene-editor-instances-head">
            <strong>Bases ({instances.length})</strong>
            <button
              type="button"
              onClick={() => setInstances((prev) => [...prev, { base: 'particles', params: defaultParamsFor('particles') }])}
            >
              Add base
            </button>
          </div>

          {instances.map((inst, index) => (
            <div key={index} className="scene-editor-instance">
              <div className="scene-editor-instance-head">
                <select value={inst.base} onChange={(e) => updateInstanceBase(index, e.target.value as BaseId)}>
                  {BASE_OPTIONS.map((base) => (
                    <option key={base} value={base}>
                      {BASE_CAPABILITIES[base].label}
                    </option>
                  ))}
                </select>
                <button type="button" onClick={() => setInstances((prev) => prev.filter((_, i) => i !== index))}>
                  Remove
                </button>
              </div>
              <InstanceParamFields
                base={inst.base}
                params={inst.params ?? {}}
                onParam={(key, value) => updateInstanceParam(index, key, value)}
              />
            </div>
          ))}
        </div>

        {error && <p className="scene-editor-error">{error}</p>}

        <div className="scene-editor-actions">
          <button type="button" className="scene-editor-cancel" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="scene-editor-save" onClick={save}>
            {isEdit ? 'Save' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}
