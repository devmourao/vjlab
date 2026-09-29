import { OWNER_META, SITE_META } from '../config/siteMeta';
import { useDirectorStore } from '../director/directorStore';

export function Seal() {
  return (
    <a
      className="seal"
      href={SITE_META.demoUrl}
      target="_blank"
      rel="noreferrer"
      data-testid="seal"
    >
      {SITE_META.name} · v{SITE_META.version}
    </a>
  );
}

export function UnauthorizedVeil({ hostname }: { hostname: string }) {
  return (
    <div
      data-testid="unauthorized-veil"
      role="alert"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#000',
        color: '#fff',
        padding: 24,
        textAlign: 'center',
      }}
    >
      <div>
        <h1 style={{ fontSize: 20, marginBottom: 12 }}>
          {SITE_META.name} — unauthorized copy
        </h1>
        <p style={{ opacity: 0.8, maxWidth: 480 }}>
          This host ({hostname || 'unknown'}) is not authorized to run this
          software. VJ Lab is proprietary intellectual property of{' '}
          {OWNER_META.name}. All rights reserved — contact {OWNER_META.email}{' '}
          for licensing.
        </p>
      </div>
    </div>
  );
}

export function AboutPanel() {
  const aboutOpen = useDirectorStore((s) => s.aboutOpen);
  if (!aboutOpen) return null;

  return (
    <div className="about-veil" data-testid="about-panel">
      <div className="about-card">
        <h2>
          {SITE_META.name} · v{SITE_META.version}
        </h2>
        <p>{SITE_META.tagline}</p>
        <p>Stack: {SITE_META.stack.join(' · ')}</p>
        <ul>
          <li>
            <a href={SITE_META.demoUrl} target="_blank" rel="noreferrer">
              {new URL(SITE_META.demoUrl).hostname}
            </a>
          </li>
          <li>
            <a href={SITE_META.repoUrl} target="_blank" rel="noreferrer">
              Repository
            </a>
          </li>
          <li>
            <a href={OWNER_META.github} target="_blank" rel="noreferrer">
              {OWNER_META.name} on GitHub
            </a>
          </li>
          <li>
            <a href={OWNER_META.portfolio} target="_blank" rel="noreferrer">
              Portfolio
            </a>
          </li>
          <li>
            <a href={`mailto:${OWNER_META.email}`}>{OWNER_META.email}</a>
          </li>
        </ul>
        <p className="about-legal">
          © 2026 {OWNER_META.name}. All rights reserved. Unauthorized use
          prohibited (see LICENSE).
        </p>
        <p className="about-hint">Press I or Esc to close.</p>
      </div>
    </div>
  );
}
