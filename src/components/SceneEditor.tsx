import type { ScenePreset } from '../scenes/presets';
import { PresetBuilder } from './PresetBuilder';

/**
 * Back-compat entry for edit/create — same Compose surface as PresetBuilder.
 * Library "Edit" and remote save both land here.
 */
export function SceneEditor({
  preset,
  onClose,
  onSave,
}: {
  preset?: ScenePreset | null;
  onClose: () => void;
  onSave?: (draft: Omit<ScenePreset, 'id'>, editingId: number | null) => void;
}) {
  return (
    <PresetBuilder
      preset={preset ?? null}
      onClose={onClose}
      onSave={onSave}
    />
  );
}
