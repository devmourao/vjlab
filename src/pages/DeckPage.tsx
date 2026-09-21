import { useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import '../App.css';
import { useAudioEngine } from '../audio/useAudioEngine';
import { AudioPanel } from '../components/AudioPanel';
import { BeatFlashOverlay } from '../components/BeatFlashOverlay';
import { AboutPanel, Seal } from '../components/Identity';
import { ShortcutMap } from '../components/ShortcutMap';
import { StrobeOverlay } from '../components/StrobeOverlay';
import { TextOverlay } from '../components/TextOverlay';
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
  const popupRef = useRef<Window | null>(null);

  // Detached mode: try to open a separate popup window for controls.
  // If blocked, fall back to an in-page floating panel.
  useEffect(() => {
    if (panelMode !== 'detached') {
      if (popupRef.current && !popupRef.current.closed) popupRef.current.close();
      popupRef.current = null;
      return;
    }
    try {
      const popup = window.open('', '_blank', 'popup,width=460,height=700');
      if (popup) {
        popupRef.current = popup;
        popup.document.title = 'VJ Lab — Controls';
        popup.document.body.innerHTML =
          '<p style="font-family: sans-serif; padding: 16px;">VJ Lab controls are detached. Use U to cycle panel modes. This popup is a placeholder — controls stay synced via BroadcastChannel in the next iteration.</p>';
      }
    } catch {
      // Fallback is the in-page floating panel rendered below.
    }
    return () => {
      if (popupRef.current && !popupRef.current.closed) popupRef.current.close();
    };
  }, [panelMode]);

  const showDocked = panelMode === 'docked';
  const showDetached = panelMode === 'detached';
  const showHidden = panelMode === 'hidden';

  return (
    <div className="stage-container" data-testid="blank-stage">
      {showDocked && <AudioPanel engine={engine} />}
      {showDocked && <ShortcutMap />}
      {showDetached && (
        <div
          data-testid="detached-panel"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            maxHeight: '90vh',
            overflow: 'auto',
            padding: '12px',
            background: 'rgba(0,0,0,0.75)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '12px',
          }}
        >
          <AudioPanel engine={engine} />
          <ShortcutMap />
          <span style={{ color: '#fff', fontSize: 11, opacity: 0.7 }}>
            Detached — press U to cycle (popup fallback if blocked)
          </span>
        </div>
      )}
      {!showHidden && showDetached ? null : null}
      <StrobeOverlay />
      <BeatFlashOverlay />
      <TransitionOverlay />
      <TextOverlay />
      <AboutPanel />
      <Seal />
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
