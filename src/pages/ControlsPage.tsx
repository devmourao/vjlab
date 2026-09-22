import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { SITE_META } from '../config/siteMeta';
import {
  CONTROL_CHANNEL,
  isControlMessage,
  type ControlCommand,
  type ControlSnapshot,
} from '../director/controlChannel';
import { PRESETS } from '../scenes/presets';
import './ControlsPage.css';

function useControlDeck() {
  const [snapshot, setSnapshot] = useState<ControlSnapshot | null>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const seenRef = useRef(false);

  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return;
    const channel = new BroadcastChannel(CONTROL_CHANNEL);
    channelRef.current = channel;
    const sayHello = () => {
      try {
        channel.postMessage({ kind: 'hello', source: 'controls' });
      } catch {
        // A closed channel must never break the popup.
      }
    };
    channel.onmessage = (event: MessageEvent) => {
      const message = event.data;
      if (
        isControlMessage(message) &&
        'kind' in message &&
        message.kind === 'snapshot'
      ) {
        seenRef.current = true;
        setSnapshot(message.snapshot);
      }
    };
    sayHello();
    const timer = window.setInterval(() => {
      if (!seenRef.current) sayHello();
      else window.clearInterval(timer);
    }, 2000);
    return () => {
      window.clearInterval(timer);
      channel.close();
      channelRef.current = null;
    };
  }, []);

  const send = (command: ControlCommand) => {
    try {
      channelRef.current?.postMessage({ type: 'command', command });
    } catch {
      // Lost main window is reported via the offline banner.
    }
  };

  return { snapshot, send };
}

export default function ControlsPage() {
  const { snapshot, send } = useControlDeck();
  const [overlayDraft, setOverlayDraft] = useState('VJ LAB');

  const onOverlay = (event: ChangeEvent<HTMLInputElement>) => {
    const text = event.target.value.slice(0, 60);
    setOverlayDraft(text);
    send({ type: 'setOverlayText', text });
  };

  return (
    <div className="controls-page" data-testid="controls-page">
      <header className="controls-head">
        <strong>
          {SITE_META.name} · Controls
        </strong>
        <span
          className={snapshot ? 'controls-pill on' : 'controls-pill off'}
          data-testid="controls-connection"
        >
          {snapshot ? 'Linked' : 'Waiting'}
        </span>
      </header>

      {!snapshot && (
        <p className="controls-offline" data-testid="controls-offline">
          Waiting for the main deck — open the live deck first, then reopen
          this window from the deck Hide UI control.
        </p>
      )}

      {snapshot && (
        <>
          <section className="controls-section" aria-label="Track">
            <h2>Track</h2>
            <p className="controls-track" data-testid="controls-track">
              {snapshot.fileName ?? 'No file loaded'} ·{' '}
              {snapshot.isPlaying ? 'Playing' : 'Paused'}
            </p>
            <div className="controls-row">
              <button type="button" onClick={() => send({ type: 'togglePlayback' })}>
                Play / Pause
              </button>
              <span className="controls-hint">Upload stays on the main deck.</span>
            </div>
          </section>

          <section className="controls-section" aria-label="Scenes">
            <h2>Scenes</h2>
            <div className="controls-grid">
              {PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  className={
                    preset.id === snapshot.activePresetId
                      ? 'controls-button active'
                      : 'controls-button'
                  }
                  onClick={() => send({ type: 'dissolve', id: preset.id })}
                >
                  {preset.name}
                </button>
              ))}
            </div>
            <div className="controls-row">
              <button type="button" onClick={() => send({ type: 'prevPreset' })}>
                Prev
              </button>
              <button type="button" onClick={() => send({ type: 'nextPreset' })}>
                Next
              </button>
              <button type="button" onClick={() => send({ type: 'hardCut' })}>
                Cut
              </button>
              <button type="button" onClick={() => send({ type: 'cycleDuration' })}>
                {snapshot.transitionDuration.toFixed(1)}s
              </button>
            </div>
          </section>

          <section className="controls-section" aria-label="Strobe">
            <h2>Strobe</h2>
            <div className="controls-row">
              <button type="button" onClick={() => send({ type: 'toggleStrobe' })}>
                {snapshot.strobeOn ? 'On' : 'Off'}
              </button>
              <button type="button" onClick={() => send({ type: 'cycleStrobeMode' })}>
                {snapshot.strobeMode}
              </button>
              <button type="button" onClick={() => send({ type: 'strobeSlower' })}>
                −
              </button>
              <span>{snapshot.strobeRateHz}Hz</span>
              <button type="button" onClick={() => send({ type: 'strobeFaster' })}>
                +
              </button>
            </div>
          </section>

          <section className="controls-section" aria-label="Flags">
            <h2>Flags</h2>
            <div className="controls-grid">
              <button type="button" onClick={() => send({ type: 'toggleVhs' })}>
                VHS {snapshot.vhsOn ? 'on' : 'off'}
              </button>
              <button type="button" onClick={() => send({ type: 'toggleRgb' })}>
                RGB {snapshot.rgbOn ? 'on' : 'off'}
              </button>
              <button
                type="button"
                onClick={() => send({ type: 'toggleBeatFlash' })}
              >
                Beat {snapshot.beatFlashOn ? 'on' : 'off'}
              </button>
              <button
                type="button"
                onClick={() => send({ type: 'toggleFxBypass' })}
              >
                Bypass {snapshot.fxBypassed ? 'on' : 'off'}
              </button>
              <button type="button" onClick={() => send({ type: 'toggleLite' })}>
                Lite {snapshot.liteOn ? 'on' : 'off'}
              </button>
              <button
                type="button"
                onClick={() => send({ type: 'toggleAutoPilot' })}
              >
                Auto {snapshot.autoPilotOn ? 'on' : 'off'}
              </button>
            </div>
          </section>

          <section className="controls-section" aria-label="Effects">
            <h2>Effects</h2>
            <p className="controls-track">
              {snapshot.selectedFx} · {(snapshot.mixes[snapshot.selectedFx] ?? 0).toFixed(1)}
            </p>
            <div className="controls-row">
              <button type="button" onClick={() => send({ type: 'cycleFxSlot' })}>
                Slot
              </button>
              <button type="button" onClick={() => send({ type: 'fxDown' })}>
                −
              </button>
              <button type="button" onClick={() => send({ type: 'fxUp' })}>
                +
              </button>
              <button type="button" onClick={() => send({ type: 'stepHue' })}>
                Hue
              </button>
            </div>
            <div className="controls-row">
              <button type="button" onClick={() => send({ type: 'zoomOut' })}>
                Zoom −
              </button>
              <span>{snapshot.zoomTarget.toFixed(2)}x</span>
              <button type="button" onClick={() => send({ type: 'zoomIn' })}>
                Zoom +
              </button>
            </div>
            <label className="controls-overlay">
              <span>Overlay</span>
              <input
                type="text"
                maxLength={60}
                value={overlayDraft}
                onChange={onOverlay}
              />
            </label>
            <div className="controls-row">
              <button type="button" onClick={() => send({ type: 'fireText' })}>
                Fire text
              </button>
              <button type="button" onClick={() => send({ type: 'fireBurst' })}>
                Burst
              </button>
              <button type="button" onClick={() => send({ type: 'killAll' })}>
                Kill all
              </button>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
