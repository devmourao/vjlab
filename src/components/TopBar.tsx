import { Link } from 'react-router-dom';
import { SITE_META } from '../config/siteMeta';
import { requestDetachedMode } from '../director/controlChannel';
import { useDirectorStore } from '../director/directorStore';
import './TopBar.css';

function toggleFullscreen() {
  const el = document.documentElement;
  if (!document.fullscreenElement) {
    void el.requestFullscreen().catch(() => {});
  } else {
    void document.exitFullscreen().catch(() => {});
  }
}

export function TopBar() {
  const panelMode = useDirectorStore((s) => s.panelMode);

  if (panelMode === 'hidden') return null;

  return (
    <header className="top-bar" data-testid="top-bar">
      <Link className="top-bar-brand" to="/" data-testid="back-landing">
        {SITE_META.name} · v{SITE_META.version}
      </Link>
      <div className="top-bar-actions">
        <span className="top-bar-mode" data-testid="panel-mode">
          {panelMode.toUpperCase()}
        </span>
        <button
          type="button"
          className="top-bar-button"
          data-testid="panel-toggle"
          title="Cycle panel visibility (U)"
          onClick={requestDetachedMode}
        >
          Hide UI
        </button>
        <button
          type="button"
          className="top-bar-button"
          data-testid="fullscreen-toggle"
          title="Toggle fullscreen output (G)"
          onClick={toggleFullscreen}
        >
          Fullscreen
        </button>
        <button
          type="button"
          className="top-bar-button"
          data-testid="help-toggle"
          title="Open usage guide"
          onClick={() => useDirectorStore.getState().toggleHelp()}
        >
          Guide
        </button>
      </div>
    </header>
  );
}

export function FloatingPanelToggle() {
  const panelMode = useDirectorStore((s) => s.panelMode);
  const isHidden = panelMode === 'hidden';

  return (
    <button
      type="button"
      className="panel-toggle"
      data-testid="floating-panel-toggle"
      title="Cycle panel visibility (U)"
      onClick={requestDetachedMode}
    >
      {isHidden ? 'Show UI' : 'Hide UI'}
    </button>
  );
}
