import { useMemo, useState } from 'react';
import { useDirectorStore } from '../director/directorStore';
import { BASE_CAPABILITIES, HOST_PARAM_SCHEMAS } from '../scenes/bases';
import type { BaseId, BaseInstance, ScenePreset } from '../scenes/presets';
import { BASE_IDS, PRESETS } from '../scenes/presets';
import { readImageAsDataUrl } from '../scenes/imageDataUrl';
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

type StartMode = 'template' | 'scene';

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
 * Compose surface: split pane keeps the live preview pinned while
 * controls scroll. Create starts from a template or an existing scene
 * (recombine); edit keeps the same layout.
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
  const customPresets = useDirectorStore((s) => s.customPresets);
  const library = useMemo(
    () => [...PRESETS, ...customPresets],
    [customPresets],
  );

  const seed = useMemo(
    () => (preset ? seedFromPreset(preset) : materializeTemplate('dj-cover')),
    [preset],
  );
  const [startMode, setStartMode] = useState<StartMode>('template');
  const [templateId, setTemplateId] = useState<SceneTemplateId>('dj-cover');
  const [cloneId, setCloneId] = useState<number | null>(null);
  const [name, setName] = useState(seed.name);
  const [primary, setPrimary] = useState(seed.primary);
  const [emissive, setEmissive] = useState(seed.emissive);
  const [background, setBackground] = useState(seed.background);
  const [gain, setGain] = useState(seed.gain);
  const [speed, setSpeed] = useState(seed.speed);
  const [instances, setInstances] = useState<BaseInstance[]>(seed.instances);
  const [error, setError] = useState<string | null>(null);
  const [slotBusy, setSlotBusy] = useState(false);

  const templateSlots = imageSlotsFromInstances(instances);

  const applySeed = (next: ReturnType<typeof seedFromPreset>) => {
    setName(next.name);
    setPrimary(next.primary);
    setEmissive(next.emissive);
    setBackground(next.background);
    setGain(next.gain);
    setSpeed(next.speed);
    setInstances(next.instances);
    setError(null);
  };

  const applyTemplate = (id: SceneTemplateId) => {
    const next = materializeTemplate(id);
    setStartMode('template');
    setTemplateId(id);
    setCloneId(null);
    applySeed(next);
  };

  const applySceneClone = (id: number) => {
    const source = library.find((entry) => entry.id === id);
    if (!source) return;
    const next = seedFromPreset(source);
    setStartMode('scene');
    setCloneId(id);
    applySeed({
      ...next,
      name: `${source.name} remix`,
    });
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

  const moveInstance = (index: number, delta: -1 | 1) => {
    setInstances((prev) => {
      const target = index + delta;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      const [item] = next.splice(index, 1);
      next.splice(target, 0, item);
      return next;
    });
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
      onSave(
        result.preset,
        isEdit && preset && !isNativeEdit ? preset.id : null,
      );
    } else {
      const store = useDirectorStore.getState();
      if (isEdit && preset && !isNativeEdit) {
        store.updateScene(preset.id, result.preset);
        store.setPreset(preset.id);
      } else {
        const created = store.createScene(
          {
            ...result.preset,
            name: isNativeEdit
              ? `${result.preset.name} (custom)`
              : result.preset.name,
          },
          { addToPlaylist: !isNativeEdit },
        );
        if (isNativeEdit && preset) {
          store.replacePlaylistSceneId(preset.id, created.id);
          const after = useDirectorStore.getState();
          const active = after.playlists.find(
            (entry) => entry.id === after.activePlaylistId,
          );
          const alreadyQueued = active?.entries.some(
            (entry) => entry.sceneId === created.id,
          );
          if (!alreadyQueued && active) {
            after.addSceneToPlaylist(active.id, created.id);
          }
        }
        useDirectorStore.getState().setPreset(created.id);
      }
    }
    onClose();
  };

  const title = isEdit
    ? `${isNativeEdit ? 'Customize' : 'Edit'} · ${preset?.name}`
    : 'Compose scene';

  return (
    <div
      className="builder-veil"
      data-testid={isEdit ? 'scene-editor' : 'preset-builder'}
    >
      <div
        className="builder-card"
        role="dialog"
        aria-label={title}
      >
        <div className="builder-head">
          <div>
            <strong>{title}</strong>
            <p className="builder-subtitle">
              Preview stays pinned — stack bases, tune look, save to the
              setlist.
            </p>
          </div>
          <button type="button" className="builder-close" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="builder-split">
          <div className="builder-controls">
            {!isEdit && (
              <section aria-label="Start from">
                <h3>1 · Start from</h3>
                <p className="builder-hint">
                  Pick a recipe or remix an existing scene, then stack bases.
                </p>
                <div className="builder-start-tabs" role="tablist">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={startMode === 'template'}
                    className={
                      startMode === 'template'
                        ? 'builder-start-tab is-active'
                        : 'builder-start-tab'
                    }
                    onClick={() => setStartMode('template')}
                  >
                    Templates
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={startMode === 'scene'}
                    className={
                      startMode === 'scene'
                        ? 'builder-start-tab is-active'
                        : 'builder-start-tab'
                    }
                    onClick={() => setStartMode('scene')}
                    data-testid="start-from-scene"
                  >
                    Remix scene
                  </button>
                </div>

                {startMode === 'template' ? (
                  <div className="builder-templates" data-testid="template-picker">
                    {SCENE_TEMPLATES.map((entry) => (
                      <button
                        key={entry.id}
                        type="button"
                        className={
                          entry.id === templateId && cloneId === null
                            ? 'builder-template is-active'
                            : 'builder-template'
                        }
                        data-testid={`template-${entry.id}`}
                        onClick={() => applyTemplate(entry.id)}
                      >
                        <strong>{entry.name}</strong>
                        <span className="builder-template-cat">
                          {entry.category}
                        </span>
                        <span>{entry.blurb}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="builder-clone-list" data-testid="scene-clone-list">
                    {library.map((entry) => (
                      <button
                        key={entry.id}
                        type="button"
                        className={
                          cloneId === entry.id
                            ? 'builder-clone is-active'
                            : 'builder-clone'
                        }
                        data-testid={`clone-scene-${entry.id}`}
                        onClick={() => applySceneClone(entry.id)}
                      >
                        <strong>{entry.name}</strong>
                        <span>
                          {(entry.instances ?? [])
                            .map((inst) => BASE_CAPABILITIES[inst.base].label)
                            .join(' + ') || 'legacy'}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </section>
            )}

            <section aria-label="Layers">
              <h3>{isEdit ? '1 · Layers' : '2 · Layers'}</h3>
              <p className="builder-hint">
                Order is draw order. Add, reorder, or remove bases — the
                preview updates live.
              </p>
              <div className="builder-browser" data-testid="base-picker">
                {BASE_IDS.map((base) => (
                  <div key={base} className="builder-base">
                    <strong>{BASE_CAPABILITIES[base].label}</strong>
                    <span className="builder-template-cat">
                      {BASE_CAPABILITIES[base].category}
                    </span>
                    <span>{BASE_CAPABILITIES[base].description}</span>
                    <button
                      type="button"
                      data-testid={`add-base-${base}`}
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
              {instances.length === 0 && (
                <p className="builder-hint">No layers yet — add a base above.</p>
              )}
              {instances.map((inst, index) => (
                <div
                  key={`${inst.base}-${index}`}
                  className="builder-instance"
                  data-testid={`layer-${index}`}
                >
                  <div className="builder-instance-head">
                    <strong>
                      {index + 1}. {BASE_CAPABILITIES[inst.base].label}
                    </strong>
                    <div className="builder-instance-actions">
                      <button
                        type="button"
                        disabled={index === 0}
                        aria-label="Move layer up"
                        onClick={() => moveInstance(index, -1)}
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        disabled={index === instances.length - 1}
                        aria-label="Move layer down"
                        onClick={() => moveInstance(index, 1)}
                      >
                        ↓
                      </button>
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
            </section>

            <section aria-label="Look">
              <h3>{isEdit ? '2 · Look' : '3 · Look'}</h3>
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
                      disabled={slotBusy}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        e.target.value = '';
                        if (!file) return;
                        setSlotBusy(true);
                        setError(null);
                        void readImageAsDataUrl(file)
                          .then((dataUrl) => {
                            setSlotValue(slot.path, dataUrl);
                          })
                          .catch(() => {
                            setError(
                              'Could not read that image — try PNG or JPG',
                            );
                          })
                          .finally(() => setSlotBusy(false));
                      }}
                    />
                    {slotBusy ? (
                      <span className="builder-slot-wait">Loading image…</span>
                    ) : hasCustom ? (
                      <span className="builder-slot-ok">
                        Custom image attached
                      </span>
                    ) : (
                      <span className="builder-slot-wait">
                        Drop album art — preview updates as soon as it loads
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

            {error && <p className="builder-error">{error}</p>}
          </div>

          <aside className="builder-preview-pane" aria-label="Live preview">
            <div className="builder-preview-label">Live preview</div>
            <PreviewStage
              instances={instances}
              palette={{ primary, emissive }}
              background={background}
              gain={gain}
              speed={speed}
              sticky={false}
            />
            <p className="builder-preview-meta">
              {instances.length} layer{instances.length === 1 ? '' : 's'}
              {startMode === 'template' && !isEdit
                ? ` · ${getTemplate(templateId).name}`
                : ''}
              {cloneId !== null && !isEdit ? ' · remix' : ''}
            </p>
          </aside>
        </div>

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
