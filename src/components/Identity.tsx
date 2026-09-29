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
