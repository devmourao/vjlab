import { useMemo, useState } from 'react';
import { useDirectorStore } from '../director/directorStore';
import { BASE_CAPABILITIES, HOST_PARAM_SCHEMAS } from '../scenes/bases';
import type { BaseId, BaseInstance, ScenePreset } from '../scenes/presets';
import { PRESETS } from '../scenes/presets';
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

function seedFromPreset(preset: ScenePreset) {
  return {
    name: preset.name,
    primary: preset.palette.primary,
    emissive: preset.palette.emissive,
    background: preset.background,
    gain: preset.gain,
    speed: preset.speed,
    instances: (preset.instances && preset.instances.length > 0
      ? preset.instances
      : [{ base: 'particles' as const }]
    ).map((inst) => ({
      base: inst.base,
      params: { ...(inst.params ?? {}) },
    })),
  };
}

function imageSlotsFromInstances(instances: BaseInstance[]) {
  const slots: Array<{ path: string; label: string; kind: 'image' }> = [];
  instances.forEach((inst, index) => {
    if (inst.base !== 'mesh') return;
    slots.push({
      path: `${index}.map`,
      label:
        Number(inst.params?.['cover'] ?? 0) >= 0.5
          ? 'Album / track image'
          : 'Mesh image',
      kind: 'image',
    });
  });
  return slots;
}

/**
 * Single Compose surface for create + edit. Create starts from a template;
 * edit loads the scene and keeps the same preview / slots / advanced path.
 */
export function PresetBuilder({
  preset = null,
  onClose,
  onSave,
}: {
  preset?: ScenePreset | null;
  onClose: () => void;
  onSave?: (draft: Omit<ScenePreset, 'id'>, editingId: number | null) => void;
}) {
  const isEdit = Boolean(preset);
  const isNativeEdit = Boolean(
    preset && PRESETS.some((entry) => entry.id === preset.id),
  );
  const seed = useMemo(
    () => (preset ? seedFromPreset(preset) : materializeTemplate('dj-cover')),
    [preset],
  );
  const [templateId, setTemplateId] = useState<SceneTemplateId>('dj-cover');
  const [name, setName] = useState(seed.name);
  const [primary, setPrimary] = useState(seed.primary);
  const [emissive, setEmissive] = useState(seed.emissive);
  const [background, setBackground] = useState(seed.background);
  const [gain, setGain] = useState(seed.gain);
  const [speed, setSpeed] = useState(seed.speed);
  const [instances, setInstances] = useState<BaseInstance[]>(seed.instances);
  const [advancedOpen, setAdvancedOpen] = useState(isEdit);
  const [error, setError] = useState<string | null>(null);

  const templateSlots = isEdit
    ? imageSlotsFromInstances(instances)
    : (getTemplate(templateId).slots ?? []);

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
      // Native customize always saves as a new custom scene (null editingId).
      onSave(
        result.preset,
        isEdit && preset && !isNativeEdit ? preset.id : null,
      );
    } else {
      const store = useDirectorStore.getState();
      if (isEdit && preset && !isNativeEdit) {
        store.updateScene(preset.id, result.preset);
      } else {
        const created = store.createScene({
          ...result.preset,
          name: isNativeEdit
            ? `${result.preset.name} (custom)`
            : result.preset.name,
        });
        store.setPreset(created.id);
      }
    }
    onClose();
  };

  return (
    <div
      className="builder-veil"
      data-testid={isEdit ? 'scene-editor' : 'preset-builder'}
    >
      <div
        className="builder-card"
        role="dialog"
        aria-label={isEdit ? 'Edit scene' : 'Compose scene'}
      >
        <div className="builder-head">
          <strong>
            {isEdit
              ? `${isNativeEdit ? 'Customize' : 'Edit'} · ${preset?.name}`
              : 'Compose scene'}
          </strong>
          <button type="button" className="builder-close" onClick={onClose}>
            Close
          </button>
        </div>

        {!isEdit && (
          <section aria-label="Scene templates">
            <h3>1 · Choose a template</h3>
            <p className="builder-hint">
              Start from a recipe, drop art if needed, save into your visual
              playlist.
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
        )}

        <section aria-label="Live preview">
          <h3>{isEdit ? '1 · Preview' : '2 · Preview'}</h3>
          <PreviewStage
            instances={instances}
            palette={{ primary, emissive }}
            background={background}
            gain={gain}
            speed={speed}
          />
        </section>

        <section aria-label="Quick adjust">
          <h3>{isEdit ? '2 · Adjust and save' : '3 · Adjust and save'}</h3>
          <label className="builder-field">
            <span>Name</span>
            <input
              value={name}
              maxLength={40}
              onChange={(e) => setName(e.target.value)}
            />
          </label>

          {templateSlots.map((slot) => {
            const parsed = parseSlotPath(slot.path);
            const current =
              parsed && instances[parsed.instanceIndex]
                ? instances[parsed.instanceIndex].params?.[parsed.param]
                : null;
            const hasCustom =
              typeof current === 'string' &&
              current.length > 0 &&
              !current.includes('cover-placeholder');
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
                {hasCustom ? (
                  <span className="builder-slot-ok">Custom image attached</span>
                ) : (
                  <span className="builder-slot-wait">
                    Drop album art — placeholder shows until you do
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
            {isNativeEdit
              ? 'Save as custom'
              : isEdit
                ? 'Save scene'
                : 'Save to playlist'}
          </button>
        </div>
      </div>
    </div>
  );
}
