import {
  BASE_CAPABILITIES,
  HOST_PARAM_SCHEMAS,
  paramLabel,
  type BaseCategory,
} from '../scenes/bases';
import { BASE_IDS } from '../scenes/presets';
import './BasesExplorer.css';

const CATEGORY_ORDER: BaseCategory[] = ['field', 'form', 'media', 'fx'];

/**
 * Library tab: the puzzle-piece catalog. Read-only reference for which
 * bases exist, what they do, and which knobs the host applies to every
 * instance (placement, lock, per-piece colors).
 */
export function BasesExplorer() {
  return (
    <div className="bases-explorer" data-testid="bases-explorer">
      <div className="bases-intro">
        <strong>Bases = puzzle pieces</strong>
        <p>
          Scenes are stacks of bases. Manage the catalog here; assemble and
          place pieces in Compose (position, rotation, lock motion, colors).
        </p>
      </div>

      {CATEGORY_ORDER.map((category) => {
        const bases = BASE_IDS.filter(
          (id) => BASE_CAPABILITIES[id].category === category,
        );
        if (bases.length === 0) return null;
        return (
          <section key={category} className="bases-section">
            <h3 className="bases-section-title">{category}</h3>
            <ul className="bases-list">
              {bases.map((id) => {
                const capability = BASE_CAPABILITIES[id];
                return (
                  <li key={capability.base} className="bases-card">
                    <strong>{capability.label}</strong>
                    <span className="bases-id">
                      {capability.base} · {capability.category}
                    </span>
                    <p>{capability.description}</p>
                    <p className="bases-mechanics">
                      mechanics: {capability.mechanics.join(', ')}
                    </p>
                    <ul className="bases-params">
                      {capability.params.map((param) => (
                        <li key={param.name}>
                          <code>{param.name}</code>
                          <span>
                            {paramLabel(param)} · {param.type}
                            {param.min !== undefined && param.max !== undefined
                              ? ` · ${param.min}–${param.max}`
                              : ''}
                            {` · default ${String(param.default)}`}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}

      <div className="bases-card">
        <strong>Host params (every piece)</strong>
        <p>
          Placement, lock, camera follow, zoom, and optional per-piece colors
          applied by the scene host around every base instance.
        </p>
        <ul className="bases-params">
          {HOST_PARAM_SCHEMAS.map((param) => (
            <li key={param.name}>
              <code>{param.name}</code>
              <span>
                {paramLabel(param)} · {param.type}
                {param.family ? ` · ${param.family}` : ''}
                {param.min !== undefined && param.max !== undefined
                  ? ` · ${param.min}–${param.max}`
                  : ''}
                {` · default ${String(param.default)}`}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
