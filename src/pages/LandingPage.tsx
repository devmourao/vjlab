import { Link } from 'react-router-dom';
import { OWNER_META, SITE_META } from '../config/siteMeta';
import { SHORTCUT_MAP } from '../director/directorStore';
import { PRESETS } from '../scenes/presets';
import './LandingPage.css';

const TEASER_SHORTCUTS = SHORTCUT_MAP.slice(0, 6);

export default function LandingPage() {
  return (
    <div className="landing-page" data-testid="landing-page">
      <header className="landing-hero">
        <p className="landing-kicker">
          {SITE_META.name} · v{SITE_META.version}
        </p>
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
        <p className="landing-note">
          Runs fully in the browser. Drop a local .mp3 — audio starts only
          after you press play.
        </p>
      </header>

      <section className="landing-section" aria-label="How it works">
        <h2>How it works</h2>
        <ol className="landing-steps">
          <li>
            <strong>1. Load</strong>
            <span>Drop a local .mp3 file into the deck.</span>
          </li>
          <li>
            <strong>2. Play</strong>
            <span>Watch bass, mids and treble drive the 3D stage.</span>
          </li>
          <li>
            <strong>3. Perform</strong>
            <span>Switch scenes and fire effects live from the keyboard.</span>
          </li>
        </ol>
      </section>

      <section className="landing-section" aria-label="Scenes">
        <h2>Live scenes</h2>
        <ul className="landing-cards">
          {PRESETS.slice(0, 3).map((preset) => (
            <li key={preset.id} className="landing-card">
              <span
                className="landing-swatch"
                style={{ background: preset.palette.primary }}
                aria-hidden
              />
              <strong>{preset.name}</strong>
              <span className="landing-card-sub">
                Gain {preset.gain.toFixed(1)} · Speed {preset.speed.toFixed(1)}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="landing-section" aria-label="Controls preview">
        <h2>Playable from the keyboard</h2>
        <ul className="landing-shortcuts">
          {TEASER_SHORTCUTS.map((shortcut) => (
            <li key={shortcut.key}>
              <code>{shortcut.key}</code>
              <span>{shortcut.action}</span>
            </li>
          ))}
        </ul>
        <Link className="landing-secondary" to="/deck">
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
