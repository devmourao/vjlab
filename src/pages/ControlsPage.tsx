import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { createTrack } from '../audio/track';
import { SITE_META } from '../config/siteMeta';
import {
  CONTROL_CHANNEL,
  isControlMessage,
  type ControlCommand,
  type ControlSnapshot,
} from '../director/controlChannel';
import { useControlKeys } from '../director/useControlKeys';
import { FX_SLOTS, ZOOM_MAX, ZOOM_MIN, type FxSlot } from '../director/fx';
import type { BaseId, ScenePreset } from '../scenes/presets';
import { SceneList } from '../components/SceneList';
import { TrackCard } from '../components/TrackCard';
import { EffectSlotList } from '../components/controls/EffectSlotList';
import { FlagPills } from '../components/controls/FlagPills';
import { HueSlider } from '../components/controls/HueSlider';
import { MixRow } from '../components/controls/MixRow';
import { RemoteQueue } from '../components/controls/RemoteQueue';
import { GuideTeaser } from '../components/GuideTeaser';
import '../components/GuideTeaser.css';
import { SceneTransport } from '../components/controls/SceneTransport';
import { SectionHandle } from '../components/controls/SectionHandle';
import { sectionDropProps } from '../components/controls/sectionDrag';
import {
  moveOrderItem,
  readSectionOrder,
  writeSectionOrder,
} from '../director/sectionLayout';
import { StrobeControl } from '../components/controls/StrobeControl';
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
      if (!isControlMessage(message) || !('kind' in message)) return;
      if (message.kind === 'snapshot') {
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

  const send = useCallback((command: ControlCommand) => {
    try {
      channelRef.current?.postMessage({ type: 'command', command });
    } catch {
      // Lost main window is reported via the offline banner.
    }
  }, []);

  useControlKeys(send);

  return { snapshot, send };
}

const SECTION_TITLES: Record<string, string> = {
  track: 'Track',
  scenes: 'Scenes',
  stage: 'Stage',
  strobe: 'Strobe',
  effects: 'Effects',
  flags: 'Flags',
  overlay: 'Overlay and actions',
  guide: 'Guide',
};

export default function ControlsPage() {
  const { snapshot, send } = useControlDeck();
  const [overlayDraft, setOverlayDraft] = useState('VJ LAB');
  const [sectionOrder, setSectionOrder] = useState<string[]>(() =>
    readSectionOrder(),
  );
  const moveSectionLocal = (from: number, to: number) => {
    setSectionOrder((prev) => {
      const next = moveOrderItem(prev, from, to);
      if (next !== prev) writeSectionOrder(next);
      return next;
    });
  };

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
        {snapshot && (
          <button
            type="button"
            data-testid="controls-stage-toggle"
            title={
              snapshot.panelMode === 'hidden'
                ? 'Show the main-screen interface'
                : 'Hide the main-screen interface (stage only)'
            }
            onClick={() =>
              send(
                snapshot.panelMode === 'hidden'
                  ? { type: 'setPanelMode', mode: 'detached' }
                  : { type: 'setPanelMode', mode: 'hidden' },
              )
            }
          >
            {snapshot.panelMode === 'hidden' ? 'Show UI' : 'Hide UI'}
          </button>
        )}
      </header>

      {!snapshot && (
        <p className="controls-offline" data-testid="controls-offline">
          Waiting for the main deck — open the live deck first, then reopen
          this window with the deck Pop out control.
        </p>
      )}

      {snapshot && (
        <div className="controls-sections">
          {sectionOrder.map((sectionId, index) => (
            <section
              key={sectionId}
              className="controls-section"
              aria-label={SECTION_TITLES[sectionId] ?? sectionId}
              {...sectionDropProps(index, moveSectionLocal)}
            >
              <div className="section-head">
                <h2>{SECTION_TITLES[sectionId] ?? sectionId}</h2>
                <SectionHandle
                  index={index}
                  total={sectionOrder.length}
                  onMove={moveSectionLocal}
                />
              </div>
              {sectionId === 'track' && (
                <>
                  <TrackCard
                    track={track}
                    isPlaying={snapshot.isPlaying}
                    variant="status"
                    onTogglePlayback={() => send({ type: 'togglePlayback' })}
                  />
                  {snapshot.audioError ? (
                    <p className="controls-error" data-testid="controls-audio-error">
                      {snapshot.audioError}
                    </p>
                  ) : null}
                  <RemoteQueue
                    items={snapshot.queue}
                    activeIndex={snapshot.mediaIndex}
                    onPlay={(id) => send({ type: 'playQueueTrack', id })}
                    onMove={(from, to) => send({ type: 'moveQueueTrack', from, to })}
                    onRemove={(id) => send({ type: 'removeQueueTrack', id })}
                  />
                  <label className="controls-upload">
                    <span>Load audio here</span>
                    <input
                      type="file"
                      accept=".mp3,audio/*"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (!file) return;
                        void file.arrayBuffer().then((data) =>
                          send({
                            type: 'uploadTrack',
                            name: file.name,
                            mime: file.type || 'audio/mpeg',
                            data,
                          }),
                        );
                        event.target.value = '';
                      }}
                    />
                  </label>
                  <p className="controls-hint">
                    Files sent here join the deck queue; if silent, press Play.
                  </p>
                </>
              )}
              {sectionId === 'scenes' && (
                <>
                  <label className="controls-playlist">
                    <span>Playlist</span>
                    <select
                      value={snapshot.activePlaylistId}
                      aria-label="Active playlist"
                      onChange={(event) =>
                        send({ type: 'switchPlaylist', id: event.target.value })
                      }
                    >
                      {snapshot.playlists.map((entry) => (
                        <option key={entry.id} value={entry.id}>
                          {entry.name} ({entry.sceneCount} · deck {entry.deckCount})
                        </option>
                      ))}
                    </select>
                  </label>
                  <SceneList
                    manage={false}
                    items={snapshot.presets.map(
                      (preset): ScenePreset => ({
                        ...preset,
                        scene: 0 as const,
                        instances: preset.instances.map((instance) => ({
                          base: instance.base as BaseId,
                          params: { ...(instance.params ?? {}) },
                        })),
                      }),
                    )}
                    entries={snapshot.entries}
                    activeId={snapshot.activePresetId}
                    activeKey={snapshot.activeEntryKey}
                    onSelect={(id, key) => send({ type: 'dissolve', id, key: key ?? null })}
                    ops={{
                      onMove: (from, to) => send({ type: 'moveScene', from, to }),
                      onPin: (key) => send({ type: 'pinScene', key }),
                    }}
                  />
                  <div className="controls-row">
                    <button type="button" onClick={() => send({ type: 'openLibrary' })}>
                      Manage scenes…
                    </button>
                  </div>
                  <SceneTransport
                    durationLabel={`${snapshot.transitionDuration.toFixed(1)}s`}
                    onPrev={() => send({ type: 'prevPreset' })}
                    onNext={() => send({ type: 'nextPreset' })}
                    onCut={() => send({ type: 'hardCut' })}
                    onCycleDuration={() => send({ type: 'cycleDuration' })}
                  />
                </>
              )}
              {sectionId === 'stage' && (
                <MixRow
                  name="Stage zoom"
                  display={`${snapshot.zoomTarget.toFixed(2)}x`}
                  min={ZOOM_MIN}
                  max={ZOOM_MAX}
                  step={0.01}
                  value={snapshot.zoomTarget}
                  inputLabel="Stage zoom"
                  onChange={(value) => send({ type: 'setZoom', value })}
                />
              )}
              {sectionId === 'strobe' && (
                <StrobeControl
                  on={snapshot.strobeOn}
                  mode={snapshot.strobeMode}
                  hz={snapshot.strobeRateHz}
                  mix={snapshot.mixes['strobe'] ?? 0}
                  onToggle={() => send({ type: 'toggleStrobe' })}
                  onCycleMode={() => send({ type: 'cycleStrobeMode' })}
                  onHz={(value) => send({ type: 'setStrobeHz', value })}
                  onMix={(value) => send({ type: 'setMix', slot: 'strobe', value })}
                />
              )}
              {sectionId === 'effects' && (
                <>
                  <EffectSlotList
                    slots={[...FX_SLOTS]}
                    values={snapshot.mixes}
                    selected={snapshot.selectedFx}
                    onSelect={(slot: FxSlot) => send({ type: 'selectFxSlot', slot })}
                    onMix={(slot: FxSlot, value: number) =>
                      send({ type: 'setMix', slot, value })
                    }
                    trailing={
                      <HueSlider
                        value={snapshot.hueShift}
                        onChange={(value) => send({ type: 'setHue', value })}
                      />
                    }
                  />
                  <div className="controls-row">
                    <button type="button" onClick={() => send({ type: 'fireBurst' })}>
                      Burst
                    </button>
                  </div>
                </>
              )}
              {sectionId === 'flags' && (
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
              )}
              {sectionId === 'overlay' && (
                <>
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
                    <button type="button" onClick={() => send({ type: 'killAll' })}>
                      Kill all
                    </button>
                  </div>
                </>
              )}
              {sectionId === 'guide' && (
                <GuideTeaser
                  onOpenGuide={() => send({ type: 'showGuide' })}
                  onReplayTour={() => send({ type: 'replayTour' })}
                />
              )}
            </section>
          ))}
          <div className="controls-end" aria-hidden />
        </div>
      )}
    </div>
  );
}
