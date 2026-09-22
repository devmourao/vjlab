import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { createTrack } from '../audio/track';
import { SITE_META } from '../config/siteMeta';
import {
  CONTROL_CHANNEL,
  isControlMessage,
  type ControlCommand,
  type ControlSnapshot,
} from '../director/controlChannel';
import {
  CONTRAST_MAX,
  CONTRAST_MIN,
  FX_SLOTS,
  SATURATION_MAX,
  STROBE_MAX_HZ,
  STROBE_MIN_HZ,
  ZOOM_MAX,
  ZOOM_MIN,
} from '../director/fx';
import { PRESETS } from '../scenes/presets';
import { TrackCard } from '../components/TrackCard';
import './ControlsPage.css';

function slotRange(slot: string): { min: number; max: number; step: number } {
  if (slot === 'contrast')
    return { min: CONTRAST_MIN, max: CONTRAST_MAX, step: 0.01 };
  if (slot === 'saturation') return { min: 0, max: SATURATION_MAX, step: 0.01 };
  return { min: 0, max: 1, step: 0.01 };
}

function slotFraction(slot: string, value: number): number {
  const { min, max } = slotRange(slot);
  if (max === min) return 0;
  return Math.max(0, Math.min(1, (value - min) / (max - min)));
}

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
  const fileName = snapshot?.fileName ?? null;
  const track = useMemo(
    () => (fileName ? createTrack(fileName) : null),
    [fileName],
  );

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
            <TrackCard
              track={track}
              isPlaying={snapshot.isPlaying}
              variant="status"
              onTogglePlayback={() => send({ type: 'togglePlayback' })}
            />
            <p className="controls-hint">Upload stays on the main deck.</p>
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
              <span>{snapshot.strobeRateHz}Hz</span>
            </div>
            <label className="controls-slider">
              <span>Speed</span>
              <input
                type="range"
                min={STROBE_MIN_HZ}
                max={STROBE_MAX_HZ}
                step={1}
                value={snapshot.strobeRateHz}
                aria-label="Strobe speed"
                onChange={(event) =>
                  send({
                    type: 'setStrobeHz',
                    value: Number(event.target.value),
                  })
                }
              />
            </label>
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
            <h2>Effect slot</h2>
            <div className="controls-grid">
              {FX_SLOTS.map((slot) => {
                const value = snapshot.mixes[slot] ?? 0;
                return (
                  <button
                    key={slot}
                    type="button"
                    className={
                      slot === snapshot.selectedFx
                        ? 'controls-button slot active'
                        : 'controls-button slot'
                    }
                    onClick={() => send({ type: 'selectFxSlot', slot })}
                  >
                    <span className="slot-name">{slot}</span>
                    <span className="slot-value">{value.toFixed(2)}</span>
                    <span className="slot-bar" aria-hidden>
                      <span
                        style={{
                          width: `${Math.round(slotFraction(slot, value) * 100)}%`,
                        }}
                      />
                    </span>
                  </button>
                );
              })}
            </div>
            <label className="controls-slider">
              <span>Mix · {snapshot.selectedFx}</span>
              <input
                type="range"
                min={slotRange(snapshot.selectedFx).min}
                max={slotRange(snapshot.selectedFx).max}
                step={slotRange(snapshot.selectedFx).step}
                value={snapshot.mixes[snapshot.selectedFx] ?? 0}
                aria-label="Selected effect mix"
                onChange={(event) =>
                  send({
                    type: 'setMix',
                    slot: snapshot.selectedFx,
                    value: Number(event.target.value),
                  })
                }
              />
            </label>
          </section>

          <section className="controls-section" aria-label="Color and zoom">
            <h2>Color and zoom</h2>
            <div className="controls-row">
              <button type="button" onClick={() => send({ type: 'stepHue' })}>
                Hue step
              </button>
              <span>{Math.round(snapshot.hueShift * 8)}/8</span>
            </div>
            <label className="controls-slider">
              <span>Zoom · {snapshot.zoomTarget.toFixed(2)}x</span>
              <input
                type="range"
                min={ZOOM_MIN}
                max={ZOOM_MAX}
                step={0.01}
                value={snapshot.zoomTarget}
                aria-label="Zoom"
                onChange={(event) =>
                  send({ type: 'setZoom', value: Number(event.target.value) })
                }
              />
            </label>
          </section>

          <section className="controls-section" aria-label="Overlay and actions">
            <h2>Overlay and actions</h2>
            <label className="controls-overlay stacked">
              <span>Overlay text</span>
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
          <div className="controls-end" aria-hidden />
        </>
      )}
    </div>
  );
}
