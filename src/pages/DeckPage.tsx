import { useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import '../App.css';
import { useAudioEngine, type AudioEngineApi } from '../audio/useAudioEngine';
import { AudioPanel } from '../components/AudioPanel';
import { BeatFlashOverlay } from '../components/BeatFlashOverlay';
import { BottomSheet } from '../components/BottomSheet';
import { EmptyState } from '../components/EmptyState';
import { GuideDrawer } from '../components/GuideDrawer';
import { AboutPanel } from '../components/Identity';
import { ShortcutMap } from '../components/ShortcutMap';
import { StrobeOverlay } from '../components/StrobeOverlay';
import { TextOverlay } from '../components/TextOverlay';
import { TourOverlay } from '../components/TourOverlay';
import { FloatingPanelToggle, TopBar } from '../components/TopBar';
import { TransitionOverlay } from '../components/TransitionOverlay';
import {
  CONTROL_CHANNEL,
  buildSnapshot,
  isControlMessage,
  type ControlCommand,
} from '../director/controlChannel';
import { useDirectorStore, type PanelMode } from '../director/directorStore';
import { useAutoPilot } from '../director/useAutoPilot';
import { useKeyboardDesk } from '../director/useKeyboardDesk';
import { FX_SLOTS, type FxSlot } from '../director/fx';
import { CameraRig } from '../scenes/CameraRig';
import { PostRig } from '../scenes/PostRig';
import { SceneHost } from '../scenes/SceneHost';
import { PLAYLIST, PRESETS, PRESET_COUNT, getPreset } from '../scenes/presets';
import { CAMERA_POSITION } from '../stageConfig';

const PANEL_MODES: PanelMode[] = ['docked', 'detached', 'hidden'];

function executeControlCommand(
  command: ControlCommand,
  engine: AudioEngineApi,
): void {
  const store = useDirectorStore.getState();
  switch (command.type) {
    case 'dissolve':
      store.requestDissolve(command.id);
      break;
    case 'nextPreset':
      store.requestDissolve((store.activePresetId + 1) % PRESET_COUNT);
      break;
    case 'prevPreset':
      store.requestDissolve(
        (store.activePresetId - 1 + PRESET_COUNT) % PRESET_COUNT,
      );
      break;
    case 'hardCut':
      store.hardCutNext();
      break;
    case 'cycleDuration':
      store.cycleDuration();
      break;
    case 'stepHue':
      store.stepHue();
      break;
    case 'zoomIn':
      store.zoomIn();
      break;
    case 'zoomOut':
      store.zoomOut();
      break;
    case 'cycleFxSlot':
      store.cycleFxSlot();
      break;
    case 'selectFxSlot':
      if ((FX_SLOTS as readonly string[]).includes(command.slot)) {
        store.selectFxSlot(command.slot as FxSlot);
      }
      break;
    case 'fxUp':
      store.fxUp();
      break;
    case 'fxDown':
      store.fxDown();
      break;
    case 'strobeFaster':
      store.strobeFaster();
      break;
    case 'strobeSlower':
      store.strobeSlower();
      break;
    case 'cycleStrobeMode':
      store.cycleStrobeMode();
      break;
    case 'toggleStrobe':
      store.toggleStrobe();
      break;
    case 'toggleVhs':
      store.toggleVhs();
      break;
    case 'toggleRgb':
      store.toggleRgb();
      break;
    case 'toggleBeatFlash':
      store.toggleBeatFlash();
      break;
    case 'toggleFxBypass':
      store.toggleFxBypass();
      break;
    case 'toggleLite':
      store.toggleLite();
      break;
    case 'toggleAutoPilot':
      store.toggleAutoPilot();
      break;
    case 'fireBurst':
      store.fireBurst();
      break;
    case 'fireText':
      store.fireText();
      break;
    case 'killAll':
      store.killAll();
      break;
    case 'setPanelMode':
      if ((PANEL_MODES as readonly string[]).includes(command.mode)) {
        store.setPanelMode(command.mode);
      }
      break;
    case 'cyclePanelMode':
      store.cyclePanelMode();
      break;
    case 'togglePlayback':
      void engine.toggle();
      break;
    case 'setOverlayText':
      store.setOverlayText(command.text);
      break;
    case 'setMix':
      if ((FX_SLOTS as readonly string[]).includes(command.slot)) {
        store.setFxMix(command.slot as FxSlot, command.value);
      }
      break;
    case 'setZoom':
      store.setZoomTarget(command.value);
      break;
    case 'setStrobeHz':
      store.setStrobeRate(command.value);
      break;
  }
}

function DeckPage() {
  const engine = useAudioEngine();
  useKeyboardDesk();
  useAutoPilot();
  const activePresetId = useDirectorStore((s) => s.activePresetId);
  const liteOn = useDirectorStore((s) => s.liteOn);
  const panelMode = useDirectorStore((s) => s.panelMode);
  const autoPilotOn = useDirectorStore((s) => s.autoPilotOn);
  const preset = getPreset(activePresetId);
  const engineRef = useRef(engine);
  useEffect(() => {
    engineRef.current = engine;
  });

  // Second-screen bridge: answer control popups with snapshots and
  // execute their whitelisted commands. Audio and WebGL stay here.
  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return;
    const channel = new BroadcastChannel(CONTROL_CHANNEL);
    const sendSnapshot = () => {
      try {
        const current = engineRef.current;
        channel.postMessage({
          kind: 'snapshot',
          snapshot: buildSnapshot(
            useDirectorStore.getState(),
            { fileName: current.fileName, isPlaying: current.isPlaying },
            PRESET_COUNT,
          ),
        });
      } catch {
        // A closed popup must never break the deck.
      }
    };
    channel.onmessage = (event: MessageEvent) => {
      const message = event.data;
      if (!isControlMessage(message)) return;
      if ('kind' in message) {
        if (message.kind === 'hello') sendSnapshot();
        return;
      }
      executeControlCommand(message.command, engineRef.current);
      sendSnapshot();
    };
    const unsubscribe = useDirectorStore.subscribe(sendSnapshot);
    sendSnapshot();
    return () => {
      unsubscribe();
      channel.close();
    };
  }, []);

  const showDocked = panelMode === 'docked';
  const showDetached = panelMode === 'detached';

  return (
    <div className="stage-container" data-testid="blank-stage">
      <TopBar />
      <FloatingPanelToggle />
      <BottomSheet engine={engine} />
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
      <GuideDrawer />
      <TourOverlay />
      <EmptyState engine={engine} />
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
