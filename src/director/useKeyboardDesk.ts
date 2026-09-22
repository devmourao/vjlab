import { useEffect } from 'react';
import {
  toggleControlsDetachment,
  toggleInterfaceVisibility,
} from './controlChannel';
import { liveRefs, useDirectorStore } from './directorStore';
import { PRESET_COUNT } from '../scenes/presets';

const CAMERA_STEP = 0.12;

export function useKeyboardDesk() {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      // Shortcuts must not fire while typing in a field.
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT')
      ) {
        return;
      }
      const store = useDirectorStore.getState();

      switch (event.code) {
        case 'Digit1':
          store.requestDissolve(0);
          break;
        case 'Digit2':
          store.requestDissolve(1);
          break;
        case 'Digit3':
          store.requestDissolve(2);
          break;
        case 'Digit4':
          store.requestDissolve(3);
          break;
        case 'Digit5':
          store.requestDissolve(4);
          break;
        case 'Digit6':
          store.requestDissolve(5);
          break;
        case 'KeyN':
          store.requestDissolve(
            (store.activePresetId + 1) % PRESET_COUNT,
          );
          break;
        case 'KeyP':
          store.requestDissolve(
            (store.activePresetId - 1 + PRESET_COUNT) % PRESET_COUNT,
          );
          break;
        case 'KeyX':
          store.hardCutNext();
          break;
        case 'KeyY':
          store.cycleDuration();
          break;
        case 'KeyT':
          store.fireText();
          break;
        case 'KeyH':
          store.stepHue();
          break;
        case 'Equal':
        case 'NumpadAdd':
          event.preventDefault();
          store.zoomIn();
          break;
        case 'Minus':
        case 'NumpadSubtract':
          event.preventDefault();
          store.zoomOut();
          break;
        case 'Backslash':
        case 'KeyE':
          store.cycleFxSlot();
          break;
        case 'BracketLeft':
        case 'KeyF':
          store.fxDown();
          break;
        case 'BracketRight':
        case 'KeyR':
          store.fxUp();
          break;
        case 'Comma':
          store.strobeSlower();
          break;
        case 'Period':
          store.strobeFaster();
          break;
        case 'KeyV':
          store.toggleVhs();
          break;
        case 'KeyC':
          store.toggleRgb();
          break;
        case 'KeyJ':
          store.toggleBeatFlash();
          break;
        case 'Digit0':
          store.toggleFxBypass();
          break;
        case 'KeyI':
          store.toggleAbout();
          break;
        case 'KeyL':
          store.toggleLite();
          break;
        case 'Escape':
          if (store.aboutOpen) store.toggleAbout();
          if (store.helpOpen) store.setHelpOpen(false);
          break;
        case 'Space':
          event.preventDefault();
          store.toggleStrobe();
          break;
        case 'KeyO':
          store.cycleStrobeMode();
          break;
        case 'KeyB':
          store.fireBurst();
          break;
        case 'KeyS':
          store.killAll();
          break;
        case 'KeyU':
          toggleInterfaceVisibility();
          break;
        case 'KeyD':
          toggleControlsDetachment();
          break;
        case 'KeyG':
        case 'F11':
          {
            const el = document.documentElement;
            if (!document.fullscreenElement) {
              void el.requestFullscreen().catch(() => {});
            } else {
              void document.exitFullscreen().catch(() => {});
            }
          }
          break;
        case 'KeyA':
          store.toggleAutoPilot();
          break;
        case 'KeyQ':
          if (store.activePresetId === 5) {
            event.preventDefault();
            store.rotateFractalZ(1);
          }
          break;
        case 'KeyW':
          if (store.activePresetId === 5) {
            event.preventDefault();
            store.rotateFractalZ(-1);
          }
          break;
        case 'ArrowLeft':
          if (store.activePresetId === 5) {
            event.preventDefault();
            store.cycleFractalInner(-1);
            break;
          }
          event.preventDefault();
          liveRefs.azimuth -= CAMERA_STEP;
          break;
        case 'ArrowRight':
          if (store.activePresetId === 5) {
            event.preventDefault();
            store.cycleFractalInner(1);
            break;
          }
          event.preventDefault();
          liveRefs.azimuth += CAMERA_STEP;
          break;
        case 'ArrowUp':
          if (store.activePresetId === 5) {
            event.preventDefault();
            store.cycleFractalShape(1);
            break;
          }
          event.preventDefault();
          liveRefs.elevation = Math.min(1.2, liveRefs.elevation + CAMERA_STEP);
          break;
        case 'ArrowDown':
          if (store.activePresetId === 5) {
            event.preventDefault();
            store.cycleFractalShape(-1);
            break;
          }
          event.preventDefault();
          liveRefs.elevation = Math.max(-1.2, liveRefs.elevation - CAMERA_STEP);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);
}
