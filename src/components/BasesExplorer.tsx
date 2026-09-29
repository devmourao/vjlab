import { BASE_CAPABILITIES, HOST_PARAM_SCHEMAS } from '../scenes/bases';
import './BasesExplorer.css';

/**
 * Library tab documenting every native base: what it renders and which
 * params it honors. Read-only reference for scene building.
 */
export function BasesExplorer() {
  return (
    <div className="bases-explorer" data-testid="bases-explorer">
      <ul className="bases-list">
        {Object.values(BASE_CAPABILITIES).map((capability) => (
          <li key={capability.base} className="bases-card">
            <strong>{capability.label}</strong>
            <span className="bases-id">{capability.base}</span>
            <p>{capability.description}</p>
            <ul className="bases-params">
              {capability.params.map((param) => (
                <li key={param.name}>
                  <code>{param.name}</code>
                  <span>
                    {param.type} · {param.scope}
                    {param.min !== undefined && param.max !== undefined
                      ? ` · ${param.min}–${param.max}`
                      : ''}
                    {` · default ${String(param.default)}`}
                  </span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      <div className="bases-card">
        <strong>Host params</strong>
        <p>Applied by the scene host around every instance.</p>
        <ul className="bases-params">
          {HOST_PARAM_SCHEMAS.map((param) => (
            <li key={param.name}>
              <code>{param.name}</code>
              <span>
                {param.type} · {param.scope}
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
