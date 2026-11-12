import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { publishBands } from '../audio/audioBus';
import { IDLE_BANDS } from '../audio/spectrum';
import { PreviewStage } from '../components/PreviewStage';
import { OWNER_META, SITE_META } from '../config/siteMeta';
import { deriveShortcutMap } from '../director/actionRegistry';
import { PRESETS, resolveInstances } from '../scenes/presets';
import './LandingPage.css';

const TEASER_SHORTCUTS = deriveShortcutMap().slice(0, 6);
const HERO_PRESET = PRESETS[0];

export default function LandingPage() {
  useEffect(() => {
    let frame = 0;
    let raf = 0;
    const tick = (now: number) => {
      // Soft demo pulse so the hero stage breathes without a track.
      const t = now * 0.001;
      publishBands({
        bass: 0.35 + Math.sin(t * 1.7) * 0.25 + Math.max(0, Math.sin(t * 0.9)) * 0.28,
        mids: 0.28 + Math.sin(t * 2.2 + 1.2) * 0.2,
        treble: 0.3 + Math.sin(t * 3.6 + 0.4) * 0.22,
      });
      frame += 1;
      raf = requestAnimationFrame(tick);
      void frame;
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      publishBands({ ...IDLE_BANDS });
    };
  }, []);

  return (
    <div className="landing-page" data-testid="landing-page">
      <section className="landing-hero" aria-label="VJ Lab">
        <div className="landing-hero-stage" aria-hidden>
          <PreviewStage
            instances={resolveInstances(HERO_PRESET)}
            palette={HERO_PRESET.palette}
            background={HERO_PRESET.background}
            gain={HERO_PRESET.gain}
            speed={HERO_PRESET.speed}
            sticky={false}
            variant="hero"
          />
          <div className="landing-hero-veil" />
        </div>

        <div className="landing-hero-copy">
          <p className="landing-brand">{SITE_META.name}</p>
          <h1>Play music. Perform visuals live.</h1>
          <p className="landing-tagline">{SITE_META.tagline}</p>
          <div className="landing-cta-row">
            <Link
              className="landing-cta"
              data-testid="enter-deck"
              to="/deck"
            >
              Enter Live Deck
            </Link>
            <a
              className="landing-secondary"
              href={SITE_META.repoUrl}
              target="_blank"
              rel="noreferrer"
            >
              View Repository
            </a>
          </div>
        </div>
      </section>

      <section className="landing-section" aria-label="How it works">
        <h2>How it works</h2>
        <p className="landing-section-lead">
          Drop a local .mp3, watch the stage react, then direct the show from
          the keyboard.
        </p>
        <ol className="landing-steps">
          <li>
            <strong>Load</strong>
            <span>Import a local track — audio starts only when you press play.</span>
          </li>
          <li>
            <strong>React</strong>
            <span>Bass, mids and treble drive particles, mesh and tunnel scenes.</span>
          </li>
          <li>
            <strong>Perform</strong>
            <span>Cut presets, fire bursts and ride the post FX desk live.</span>
          </li>
        </ol>
      </section>

      <section className="landing-section" aria-label="Scenes">
        <h2>Live scenes</h2>
        <p className="landing-section-lead">
          Six presets on four bases — switch mid-track without breaking the flow.
        </p>
        <ul className="landing-scene-list">
          {PRESETS.slice(0, 3).map((preset) => (
            <li key={preset.id}>
              <span
                className="landing-swatch"
                style={{ background: preset.palette.primary }}
                aria-hidden
              />
              <div>
                <strong>{preset.name}</strong>
                <span>
                  Gain {preset.gain.toFixed(1)} · Speed {preset.speed.toFixed(1)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="landing-section" aria-label="Controls preview">
        <h2>Playable from the keyboard</h2>
        <p className="landing-section-lead">
          The desk stays under your hands — presets, strobe, burst and camera.
        </p>
        <ul className="landing-shortcuts">
          {TEASER_SHORTCUTS.map((shortcut) => (
            <li key={shortcut.key}>
              <code>{shortcut.key}</code>
              <span>{shortcut.action}</span>
            </li>
          ))}
        </ul>
        <Link className="landing-secondary landing-inline" to="/deck">
          Open the deck to see the full desk
        </Link>
      </section>

      <footer className="landing-footer">
        <span>
          {SITE_META.name} · v{SITE_META.version} · {SITE_META.stack.join(' · ')}
        </span>
        <span>
          <a href={OWNER_META.github} target="_blank" rel="noreferrer">
            {OWNER_META.name} on GitHub
          </a>
          {' · '}
          <a href={OWNER_META.portfolio} target="_blank" rel="noreferrer">
            Portfolio
          </a>
        </span>
      </footer>
    </div>
  );
}
