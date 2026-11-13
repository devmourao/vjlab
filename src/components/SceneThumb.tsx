import type { CSSProperties } from 'react';
import type { ScenePreset } from '../scenes/presets';
import { BASE_THUMB_LABEL, sceneThumbModel } from '../scenes/sceneThumb';
import './SceneThumb.css';

/**
 * Winamp-style scene thumbnail: cover art when present, else palette wash
 * with base badges. Shared by setlist and library rows.
 */
export function SceneThumb({
  preset,
  size = 'md',
  active = false,
}: {
  preset: ScenePreset;
  size?: 'sm' | 'md' | 'lg';
  active?: boolean;
}) {
  const thumb = sceneThumbModel(preset);
  const className = [
    'scene-thumb',
    `scene-thumb-${size}`,
    active ? 'is-active' : '',
    thumb.isCover ? 'is-cover' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={className}
      data-testid={`scene-thumb-${preset.id}`}
      style={
        {
          '--thumb-bg': thumb.background,
          '--thumb-primary': thumb.primary,
          '--thumb-emissive': thumb.emissive,
        } as CSSProperties
      }
      aria-hidden
    >
      {thumb.coverUrl ? (
        <img
          className="scene-thumb-art"
          src={thumb.coverUrl}
          alt=""
          draggable={false}
        />
      ) : (
        <div className="scene-thumb-wash" />
      )}
      <div className="scene-thumb-bases">
        {thumb.bases.slice(0, 3).map((base, index) => (
          <span key={`${base}-${index}`}>{BASE_THUMB_LABEL[base]}</span>
        ))}
      </div>
    </div>
  );
}
