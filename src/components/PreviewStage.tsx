import { Canvas } from '@react-three/fiber';
import type { BaseInstance, ScenePalette } from '../scenes/presets';
import { SceneInstances } from '../scenes/SceneInstances';
import './PreviewStage.css';

/**
 * Shared live preview: the same bases as the stage in an isolated mini
 * canvas with read-only audio. Sticky by default so parameter scrolling
 * never loses sight of the result.
 */
export function PreviewStage({
  instances,
  palette,
  background,
  gain,
  speed,
  sticky = true,
  variant = 'panel',
}: {
  instances: BaseInstance[];
  palette: ScenePalette;
  background: string;
  gain: number;
  speed: number;
  sticky?: boolean;
  variant?: 'panel' | 'hero';
}) {
  const className = [
    'preview-stage',
    sticky ? 'sticky' : '',
    variant === 'hero' ? 'hero' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={className} data-testid="preview-stage">
      <Canvas dpr={1} camera={{ position: [0, 0, 6] }}>
        <color attach="background" args={[background]} />
        <ambientLight intensity={0.55} />
        <pointLight
          position={[3, 2, 4]}
          color={palette.primary}
          intensity={1.1}
          distance={24}
        />
        <pointLight
          position={[-3, 0, -2]}
          color={palette.emissive}
          intensity={0.7}
          distance={20}
        />
        <fog attach="fog" args={[background, 7, 24]} />
        <SceneInstances
          groupKey="preview"
          instances={instances}
          palette={palette}
          gain={gain}
          speed={speed}
          getMapUrl={(_base, index) => {
            const map = instances[index]?.params?.['map'];
            return typeof map === 'string' && map.length > 0 ? map : null;
          }}
        />
      </Canvas>
    </div>
  );
}
