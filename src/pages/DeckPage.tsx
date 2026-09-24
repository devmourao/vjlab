import { useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import '../App.css';
import { useAudioEngine, type AudioEngineApi } from '../audio/useAudioEngine';
import { BeatFlashOverlay } from '../components/BeatFlashOverlay';
import { BottomSheet } from '../components/BottomSheet';
import { EmptyState } from '../components/EmptyState';
import { GuideDrawer } from '../components/GuideDrawer';
import { AboutPanel } from '../components/Identity';
import { PlayerBar } from '../components/PlayerBar';
import { SidePanel } from '../components/SidePanel';
import { StrobeOverlay } from '../components/StrobeOverlay';
import { TextOverlay } from '../components/TextOverlay';
import { TourOverlay } from '../components/TourOverlay';
import { FloatingPanelToggle, TopBar } from '../components/TopBar';
import { TransitionOverlay } from '../components/TransitionOverlay';
import {
  CONTROL_CHANNEL,
  buildSnapshot,
  closeControlsPopup,
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
import {
  PLAYLIST,
  PRESETS,
  getPreset,
  type BaseInstance,
} from '../scenes/presets';
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
      store.nextPreset();
      break;
    case 'prevPreset':
      store.prevPreset();
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
    case 'setHue':
      store.setHueShift(command.value);
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
    case 'setPanelMode': {
      if (!(PANEL_MODES as readonly string[]).includes(command.mode)) break;
      const wasDetached = store.panelMode === 'detached';
      store.setPanelMode(command.mode);
      // A popup that docks the deck would orphan itself: follow it home.
      if (wasDetached && command.mode !== 'detached') closeControlsPopup();
      break;
    }
    case 'cyclePanelMode': {
      const wasDetached = store.panelMode === 'detached';
      store.cyclePanelMode();
      if (
        wasDetached &&
        useDirectorStore.getState().panelMode !== 'detached'
      ) {
        closeControlsPopup();
      }
      break;
    }
    case 'togglePlayback':
      void engine.toggle();
      break;
    case 'playQueueTrack': {
      const track = store.mediaQueue.find((entry) => entry.id === command.id);
      if (!track) break;
      store.playMedia(command.id);
      if (track.url) engine.loadUrl(track.url, track.name);
      break;
    }
    case 'removeQueueTrack':
      store.removeMediaTrack(command.id);
      break;
    case 'moveQueueTrack':
      store.reorderMedia(command.from, command.to);
      break;
    case 'uploadTrack': {
      // ArrayBuffer clones reliably across same-origin windows; the main
      // deck owns the resulting object URL, so playback stays local.
      const file = new File([command.data], command.name, {
        type: command.mime,
      });
      const [created] = store.addMediaTracks([file]);
      if (created) store.playMedia(created.id);
      break;
    }
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
    case 'createScene':
      store.createScene({
        name: command.draft.name,
        palette: { ...command.draft.palette },
        background: command.draft.background,
        gain: command.draft.gain,
        speed: command.draft.speed,
        scene: 0 as const,
        instances: command.draft.instances.map((instance) => ({
          base: instance.base as BaseInstance['base'],
          params: { ...(instance.params ?? {}) },
        })),
      });
      break;
    case 'updateScene':
      store.updateScene(command.id, {
        name: command.patch.name,
        palette: { ...command.patch.palette },
        background: command.patch.background,
        gain: command.patch.gain,
        speed: command.patch.speed,
        instances: command.patch.instances.map((instance) => ({
          base: instance.base as BaseInstance['base'],
          params: { ...(instance.params ?? {}) },
        })),
      });
      break;
    case 'deleteScene':
      store.deleteScene(command.id);
      break;
    case 'moveScene':
      store.reorderScenes(command.from, command.to);
      break;
    case 'toggleFavorite':
      store.toggleFavorite(command.id);
      break;
    case 'exportScenes':
      store.exportCustomScenes();
      break;
    case 'importPack': {
      const result = store.importScenes(command.pack);
      try {
        const channel = new BroadcastChannel(CONTROL_CHANNEL);
        channel.postMessage({
          kind: 'importResult',
          result: {
            accepted: result.accepted.map((entry) => entry.name),
            rejected: result.rejected,
          },
        });
        channel.close();
      } catch {
        // The popup refreshes from snapshots regardless.
      }
      break;
    }
  }
}

function DeckPage() {
  const engine = useAudioEngine();
  useKeyboardDesk();
  useAutoPilot();
  const activePresetId = useDirectorStore((s) => s.activePresetId);
  const customPresets = useDirectorStore((s) => s.customPresets);
  const liteOn = useDirectorStore((s) => s.liteOn);
  const panelMode = useDirectorStore((s) => s.panelMode);
  const autoPilotOn = useDirectorStore((s) => s.autoPilotOn);
  const allPresets = [...PRESETS, ...customPresets];
  const preset =
    allPresets.find((entry) => entry.id === activePresetId) ??
    getPreset(activePresetId);
  const orderIndex = allPresets.findIndex((entry) => entry.id === activePresetId);
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
        const state = useDirectorStore.getState();
        channel.postMessage({
          kind: 'snapshot',
          snapshot: buildSnapshot(
            state,
            {
              fileName: current.fileName,
              isPlaying: current.isPlaying,
              error: current.error,
            },
            [...PRESETS, ...state.customPresets],
            state.favoriteIds,
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
  // Focus mode: with no track loaded the hero player and tour lead,
  // so side panels stay collapsed until the first stage reveals.
  const focusMode = !engine.fileName;

  return (
    <div className="stage-container" data-testid="blank-stage">
      <TopBar />
      <FloatingPanelToggle />
      <BottomSheet engine={engine} />
      {(showDocked || showDetached) && !focusMode && (
        <SidePanel engine={engine} />
      )}
      <StrobeOverlay />
      <BeatFlashOverlay />
      <TransitionOverlay />
      <TextOverlay />
      <AboutPanel />
      <GuideDrawer />
      <TourOverlay />
      <EmptyState engine={engine} />
      {!focusMode && panelMode !== 'hidden' && (
        <PlayerBar engine={engine} />
      )}
      <div className="scene-badge" data-testid="scene-name">
        {preset.name} · {orderIndex + 1}/{allPresets.length} · playlist {PLAYLIST.length}
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
