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
}: {
  instances: BaseInstance[];
  palette: ScenePalette;
  background: string;
  gain: number;
  speed: number;
  sticky?: boolean;
}) {
  return (
    <div
      className={sticky ? 'preview-stage sticky' : 'preview-stage'}
      data-testid="preview-stage"
    >
      <Canvas dpr={1} camera={{ position: [0, 0, 6] }}>
        <color attach="background" args={[background]} />
        <ambientLight intensity={1} />
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
