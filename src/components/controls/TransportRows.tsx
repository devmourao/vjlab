import { ZOOM_MAX, ZOOM_MIN } from '../../director/fx';

/**
 * Shared continuous transport: zoom rides a slider (absolute setters
 * exist), while duration and hue step through their discrete sets.
 */
export function TransportRows({
  duration,
  hue,
  zoom,
  onCycleDuration,
  onStepHue,
  onZoom,
}: {
  duration: number;
  hue: number;
  zoom: number;
  onCycleDuration: () => void;
  onStepHue: () => void;
  onZoom: (value: number) => void;
}) {
  return (
    <div className="kit-transport" data-testid="transport-rows">
      <div className="kit-row">
        <button type="button" onClick={onCycleDuration}>
          Duration · {duration.toFixed(1)}s
        </button>
        <button type="button" onClick={onStepHue}>
          Hue · {Math.round(hue * 8)}/8
        </button>
      </div>
      <label className="kit-slider">
        <span>Zoom · {zoom.toFixed(2)}x</span>
        <input
          type="range"
          min={ZOOM_MIN}
          max={ZOOM_MAX}
          step={0.01}
          value={zoom}
          aria-label="Zoom"
          onChange={(event) => onZoom(Number(event.target.value))}
        />
      </label>
    </div>
  );
}
