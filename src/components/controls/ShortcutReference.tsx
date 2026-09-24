import { SHORTCUT_GROUPS, rowsFor } from './shortcutGroups';
import './ShortcutReference.css';

/**
 * Static keyboard reference shared by the deck guide and the
 * second-screen popup. Shortcuts always run on the main deck window.
 */
export function ShortcutReference({ note }: { note?: string }) {
  return (
    <div className="shortcut-ref" data-testid="shortcut-reference">
      {SHORTCUT_GROUPS.map((group) => (
        <div key={group.title} className="shortcut-group">
          <h3>{group.title}</h3>
          <ul className="shortcut-rows">
            {rowsFor(group.keys).map((row) => (
              <li key={row.key}>
                <code>{row.key}</code>
                <span>{row.action}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
      {note ? <p className="shortcut-note">{note}</p> : null}
    </div>
  );
}
