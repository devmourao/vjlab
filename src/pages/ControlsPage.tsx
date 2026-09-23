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
  FX_SLOTS,
  strobeStepsTo,
  type FxSlot,
  type StrobeMode,
} from '../director/fx';
import { PRESETS } from '../scenes/presets';
import { SceneList } from '../components/SceneList';
import { TrackCard } from '../components/TrackCard';
import { EffectSlotList } from '../components/controls/EffectSlotList';
import { FlagPills } from '../components/controls/FlagPills';
import { StrobeControl } from '../components/controls/StrobeControl';
import { TransportRows } from '../components/controls/TransportRows';
import '../components/controls/ControlsKit.css';
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
          this window with the deck Pop out control.
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
            <SceneList
              items={PRESETS}
              favoriteIds={[]}
              manage={false}
              onSelect={(id) => send({ type: 'dissolve', id })}
            />
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
            <StrobeControl
              on={snapshot.strobeOn}
              mode={snapshot.strobeMode}
              hz={snapshot.strobeRateHz}
              onToggle={() => send({ type: 'toggleStrobe' })}
              onMode={(mode: StrobeMode) => {
                const steps = strobeStepsTo(
                  snapshot.strobeMode as StrobeMode,
                  mode,
                );
                for (let i = 0; i < steps; i += 1) {
                  send({ type: 'cycleStrobeMode' });
                }
              }}
              onHz={(value) => send({ type: 'setStrobeHz', value })}
            />
          </section>

          <section className="controls-section" aria-label="Flags">
            <h2>Flags</h2>
            <FlagPills
              flags={[
                { id: 'vhs', label: `VHS ${snapshot.vhsOn ? 'on' : 'off'}`, on: snapshot.vhsOn, tone: 'vhs' },
                { id: 'rgb', label: `RGB ${snapshot.rgbOn ? 'on' : 'off'}`, on: snapshot.rgbOn, tone: 'rgb' },
                { id: 'beat', label: `Beat ${snapshot.beatFlashOn ? 'on' : 'off'}`, on: snapshot.beatFlashOn, tone: 'beat' },
                { id: 'bypass', label: `Bypass ${snapshot.fxBypassed ? 'on' : 'off'}`, on: snapshot.fxBypassed, tone: 'bypass' },
                { id: 'lite', label: `Lite ${snapshot.liteOn ? 'on' : 'off'}`, on: snapshot.liteOn, tone: 'lite' },
                { id: 'auto', label: `Auto ${snapshot.autoPilotOn ? 'on' : 'off'}`, on: snapshot.autoPilotOn, tone: 'auto' },
              ]}
              onToggle={(id) => {
                if (id === 'vhs') send({ type: 'toggleVhs' });
                else if (id === 'rgb') send({ type: 'toggleRgb' });
                else if (id === 'beat') send({ type: 'toggleBeatFlash' });
                else if (id === 'bypass') send({ type: 'toggleFxBypass' });
                else if (id === 'lite') send({ type: 'toggleLite' });
                else send({ type: 'toggleAutoPilot' });
              }}
            />
          </section>

          <section className="controls-section" aria-label="Effects">
            <h2>Effects</h2>
            <EffectSlotList
              slots={[...FX_SLOTS]}
              values={snapshot.mixes}
              selected={snapshot.selectedFx}
              onSelect={(slot: FxSlot) => send({ type: 'selectFxSlot', slot })}
              onMix={(slot: FxSlot, value: number) =>
                send({ type: 'setMix', slot, value })
              }
            />
          </section>

          <section className="controls-section" aria-label="Color and zoom">
            <h2>Color and zoom</h2>
            <TransportRows
              duration={snapshot.transitionDuration}
              hue={snapshot.hueShift}
              zoom={snapshot.zoomTarget}
              onCycleDuration={() => send({ type: 'cycleDuration' })}
              onStepHue={() => send({ type: 'stepHue' })}
              onZoom={(value) => send({ type: 'setZoom', value })}
            />
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
