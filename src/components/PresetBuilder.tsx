import { useMemo, useState } from 'react';
import { useDirectorStore } from '../director/directorStore';
import { BASE_CAPABILITIES, HOST_PARAM_SCHEMAS } from '../scenes/bases';
import type { BaseId, BaseInstance, ScenePreset } from '../scenes/presets';
import { draftToPreset } from '../scenes/presetDraft';
import {
  SCENE_TEMPLATES,
  getTemplate,
  materializeTemplate,
  parseSlotPath,
  type SceneTemplateId,
} from '../scenes/templates';
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
 * Compose-mode builder: pick a scene template (Winamp-style recipe),
 * fill friendly slots, tweak a few knobs, save into the playlist.
 * Advanced base assembly stays collapsed so the happy path stays clear.
 */
export function PresetBuilder({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave?: (draft: Omit<ScenePreset, 'id'>) => void;
}) {
  const seed = useMemo(() => materializeTemplate('dj-cover'), []);
  const [templateId, setTemplateId] = useState<SceneTemplateId>('dj-cover');
  const [name, setName] = useState(seed.name);
  const [primary, setPrimary] = useState(seed.primary);
  const [emissive, setEmissive] = useState(seed.emissive);
  const [background, setBackground] = useState(seed.background);
  const [gain, setGain] = useState(seed.gain);
  const [speed, setSpeed] = useState(seed.speed);
  const [instances, setInstances] = useState<BaseInstance[]>(seed.instances);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const template = getTemplate(templateId);

  const applyTemplate = (id: SceneTemplateId) => {
    const next = materializeTemplate(id);
    setTemplateId(id);
    setName(next.name);
    setPrimary(next.primary);
    setEmissive(next.emissive);
    setBackground(next.background);
    setGain(next.gain);
    setSpeed(next.speed);
    setInstances(next.instances);
    setError(null);
    setAdvancedOpen(id === 'blank');
  };

  const setSlotValue = (path: string, value: unknown) => {
    const parsed = parseSlotPath(path);
    if (!parsed) return;
    setInstances((prev) =>
      prev.map((inst, index) =>
        index === parsed.instanceIndex
          ? {
              ...inst,
              params: { ...(inst.params ?? {}), [parsed.param]: value },
            }
          : inst,
      ),
    );
  };

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
      <div className="builder-card" role="dialog" aria-label="Scene builder">
        <div className="builder-head">
          <strong>Compose scene</strong>
          <button type="button" className="builder-close" onClick={onClose}>
            Close
          </button>
        </div>

        <section aria-label="Scene templates">
          <h3>1 · Choose a template</h3>
          <p className="builder-hint">
            Templates are starter recipes. Saving creates a normal scene in your
            playlist — same model Unity will port later.
          </p>
          <div className="builder-templates" data-testid="template-picker">
            {SCENE_TEMPLATES.map((entry) => (
              <button
                key={entry.id}
                type="button"
                className={
                  entry.id === templateId
                    ? 'builder-template is-active'
                    : 'builder-template'
                }
                data-testid={`template-${entry.id}`}
                onClick={() => applyTemplate(entry.id)}
              >
                <strong>{entry.name}</strong>
                <span className="builder-template-cat">{entry.category}</span>
                <span>{entry.blurb}</span>
              </button>
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

        <section aria-label="Quick adjust">
          <h3>3 · Adjust and save</h3>
          <label className="builder-field">
            <span>Name</span>
            <input
              value={name}
              maxLength={40}
              onChange={(e) => setName(e.target.value)}
            />
          </label>

          {template.slots?.map((slot) => {
            const parsed = parseSlotPath(slot.path);
            const current =
              parsed && instances[parsed.instanceIndex]
                ? instances[parsed.instanceIndex].params?.[parsed.param]
                : null;
            return (
              <label
                key={slot.path}
                className="builder-field builder-slot"
                data-testid={`slot-${slot.path}`}
              >
                <span>{slot.label}</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setSlotValue(slot.path, URL.createObjectURL(file));
                  }}
                />
                {typeof current === 'string' && current.length > 0 && (
                  <span className="builder-slot-ok">Image attached</span>
                )}
                {(!current || current === null) && (
                  <span className="builder-slot-wait">
                    Optional — wireframe until you drop art
                  </span>
                )}
              </label>
            );
          })}

          <div className="builder-grid">
            <label className="builder-field">
              <span>Primary</span>
              <input
                value={primary}
                onChange={(e) => setPrimary(e.target.value)}
              />
            </label>
            <label className="builder-field">
              <span>Emissive</span>
              <input
                value={emissive}
                onChange={(e) => setEmissive(e.target.value)}
              />
            </label>
            <label className="builder-field">
              <span>Background</span>
              <input
                value={background}
                onChange={(e) => setBackground(e.target.value)}
              />
            </label>
            <label className="builder-field">
              <span>Gain {gain.toFixed(1)}</span>
              <input
                type="range"
                min={0.4}
                max={2}
                step={0.1}
                value={gain}
                onChange={(e) => setGain(Number(e.target.value))}
              />
            </label>
            <label className="builder-field">
              <span>Speed {speed.toFixed(1)}</span>
              <input
                type="range"
                min={0.5}
                max={2}
                step={0.1}
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
              />
            </label>
          </div>
        </section>

        <section aria-label="Advanced assembly">
          <button
            type="button"
            className="builder-advanced-toggle"
            aria-expanded={advancedOpen}
            onClick={() => setAdvancedOpen((open) => !open)}
          >
            {advancedOpen ? 'Hide advanced bases' : 'Advanced · edit bases'}
          </button>
          {advancedOpen && (
            <div className="builder-advanced">
              <div className="builder-browser">
                {BASE_OPTIONS.map((base: BaseId) => (
                  <div key={base} className="builder-base">
                    <strong>{BASE_CAPABILITIES[base].label}</strong>
                    <span className="builder-template-cat">
                      {BASE_CAPABILITIES[base].category}
                    </span>
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
              {instances.map((inst, index) => (
                <div key={`${inst.base}-${index}`} className="builder-instance">
                  <div className="builder-instance-head">
                    <strong>{BASE_CAPABILITIES[inst.base].label}</strong>
                    <button
                      type="button"
                      onClick={() =>
                        setInstances((prev) =>
                          prev.filter((_, i) => i !== index),
                        )
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
                            ? {
                                ...entry,
                                params: {
                                  ...(entry.params ?? {}),
                                  [key]: value,
                                },
                              }
                            : entry,
                        ),
                      )
                    }
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        {error && <p className="builder-error">{error}</p>}

        <div className="builder-actions">
          <button type="button" className="builder-cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="builder-save"
            data-testid="builder-save"
            onClick={save}
          >
            Save to playlist
          </button>
        </div>
      </div>
    </div>
  );
}
