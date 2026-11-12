import {
  Bloom,
  BrightnessContrast,
  ChromaticAberration,
  EffectComposer,
  EffectGroup,
  Glitch,
  HueSaturation,
  Scanline,
  Vignette,
} from '@react-three/postprocessing';
import { GlitchMode } from 'postprocessing';
import { useDirectorStore } from '../director/directorStore';
import {
  applyMix,
  CHROMATIC_OFFSET_OFF,
  CHROMATIC_OFFSET_ON,
  GLITCH_DELAY,
  GLITCH_DURATION,
  GLITCH_STRENGTH,
} from '../director/fx';

const BLOOM_BASE = 0.85;
const VIGNETTE_BASE = 0.6;

export function PostRig() {
  const hueShift = useDirectorStore((s) => s.hueShift);
  const mixBloom = useDirectorStore((s) => s.mixBloom);
  const mixVignette = useDirectorStore((s) => s.mixVignette);
  const masterMix = useDirectorStore((s) => s.masterMix);
  const colorSaturation = useDirectorStore((s) => s.colorSaturation);
  const colorContrast = useDirectorStore((s) => s.colorContrast);
  const vhsOn = useDirectorStore((s) => s.vhsOn);
  const rgbOn = useDirectorStore((s) => s.rgbOn);
  const liteOn = useDirectorStore((s) => s.liteOn);
  const fxBypassed = useDirectorStore((s) => s.fxBypassed);

  if (fxBypassed) return null;

  return (
    <EffectComposer multisampling={0}>
      <HueSaturation hue={hueShift * Math.PI * 2} saturation={colorSaturation} />
      <BrightnessContrast contrast={colorContrast} />
      {/* Always mounted: toggling swaps a live uniform instead of
          re-chaining composer passes mid-performance. */}
      <ChromaticAberration
        offset={rgbOn ? CHROMATIC_OFFSET_ON : CHROMATIC_OFFSET_OFF}
        radialModulation
        modulationOffset={0.4}
      />
      <Bloom
        intensity={applyMix(BLOOM_BASE, mixBloom, masterMix)}
        luminanceThreshold={0.55}
        luminanceSmoothing={0.25}
        mipmapBlur={!liteOn}
      />
      <Vignette
        darkness={applyMix(VIGNETTE_BASE, mixVignette, masterMix)}
        offset={0.28}
      />
      {/* Own pass: GlitchEffect transforms UVs and the library rejects
          sharing a pass with convolution effects (Bloom). The group stays
          mounted and toggles via enabled, so no pass re-chaining either. */}
      <EffectGroup enabled={vhsOn}>
        <Glitch
          delay={GLITCH_DELAY}
          duration={GLITCH_DURATION}
          strength={GLITCH_STRENGTH}
          mode={GlitchMode.SPORADIC}
          active
        />
        <Scanline density={1.25} />
      </EffectGroup>
    </EffectComposer>
  );
}
