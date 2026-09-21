import { Canvas } from '@react-three/fiber';
import '../App.css';
import { useAudioEngine } from '../audio/useAudioEngine';
import { AudioPanel } from '../components/AudioPanel';
import { BeatFlashOverlay } from '../components/BeatFlashOverlay';
import { AboutPanel } from '../components/Identity';
import { ShortcutMap } from '../components/ShortcutMap';
import { StrobeOverlay } from '../components/StrobeOverlay';
import { TextOverlay } from '../components/TextOverlay';
import { FloatingPanelToggle, TopBar } from '../components/TopBar';
import { TransitionOverlay } from '../components/TransitionOverlay';
import { useDirectorStore } from '../director/directorStore';
import { useAutoPilot } from '../director/useAutoPilot';
import { useKeyboardDesk } from '../director/useKeyboardDesk';
import { CameraRig } from '../scenes/CameraRig';
import { PostRig } from '../scenes/PostRig';
import { SceneHost } from '../scenes/SceneHost';
import { PLAYLIST, PRESETS, getPreset } from '../scenes/presets';
import { CAMERA_POSITION } from '../stageConfig';

function DeckPage() {
  const engine = useAudioEngine();
  useKeyboardDesk();
  useAutoPilot();
  const activePresetId = useDirectorStore((s) => s.activePresetId);
  const liteOn = useDirectorStore((s) => s.liteOn);
  const panelMode = useDirectorStore((s) => s.panelMode);
  const autoPilotOn = useDirectorStore((s) => s.autoPilotOn);
  const preset = getPreset(activePresetId);

  const showDocked = panelMode === 'docked';
  const showDetached = panelMode === 'detached';

  return (
    <div className="stage-container" data-testid="blank-stage">
      <TopBar />
      <FloatingPanelToggle />
      {showDocked && <AudioPanel engine={engine} />}
      {showDocked && <ShortcutMap />}
      {showDetached && (
        <div
          data-testid="detached-panel"
          className="detached-panel"
          style={{
            position: 'absolute',
            top: '60px',
            left: '12px',
            bottom: '60px',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            width: '380px',
            maxWidth: 'min(380px, calc(100vw - 24px))',
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: '12px',
            background: 'rgba(0,0,0,0.8)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '12px',
          }}
        >
          <AudioPanel engine={engine} />
          <ShortcutMap />
          <span style={{ color: '#fff', fontSize: 11, opacity: 0.7 }}>
            Second-screen preview — press U to cycle
          </span>
        </div>
      )}
      <StrobeOverlay />
      <BeatFlashOverlay />
      <TransitionOverlay />
      <TextOverlay />
      <AboutPanel />
      <div className="scene-badge" data-testid="scene-name">
        {preset.name} · {activePresetId + 1}/{PRESETS.length} · playlist{' '}
        {PLAYLIST.length}
        {liteOn ? ' · LITE' : ''}
        {panelMode !== 'docked' ? ` · ${panelMode.toUpperCase()}` : ''}
        {autoPilotOn ? ' · AUTO' : ''}
      </div>
      <Canvas dpr={liteOn ? 1 : [1, 2]} camera={{ position: CAMERA_POSITION }}>
        <color attach="background" args={[preset.background]} />
        <ambientLight intensity={1} />
        <CameraRig />
        <SceneHost />
        <PostRig />
      </Canvas>
    </div>
  );
}

export default DeckPage;
