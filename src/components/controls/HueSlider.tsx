/**
 * Shared global hue slider: 0-359 degrees in 1-degree steps over the
 * circular hueShift fraction. The H key keeps its coarse 45-degree
 * jumps; this is the fine trim. Same component on deck and popup.
 */
export function HueSlider({
  value,
  onChange,
}: {
  value: number;
  onChange: (fraction: number) => void;
}) {
  const degrees = Math.round(value * 360) % 360;
  return (
    <label className="kit-slider">
      <span>Hue · {degrees}°</span>
      <input
        type="range"
        min={0}
        max={359}
        step={1}
        value={degrees}
        aria-label="Global hue"
        onChange={(event) => onChange(Number(event.target.value) / 360)}
      />
    </label>
  );
}
