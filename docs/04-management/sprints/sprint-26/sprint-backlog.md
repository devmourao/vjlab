# Sprint Backlog — Sprint 26

## 1. Sprint Identification

| Field | Information |
| ----- | ----------- |
| Project | VJ Lab |
| Sprint | Sprint 26 — Explicit Panel Controls |
| Milestone | M11 — Web Experience (follow-up polish) |
| Planned Version | 0.7.2-alpha |
| Start Date | 2027-01-11 |
| End Date | 2027-01-18 |
| Owner | Marcos Ferreira Mourão |

## 2. Sprint Goal

Split hiding the interface from popping out controls.

## 3. Sprint Backlog Items

| Issue | Title | Type | Priority | Status |
| ----- | ----- | ---- | -------- | ------ |
| VJLAB-65 | Explicit hide vs pop-out controls — Hide UI never opens popups or exits fullscreen | UX fix | High | New |

## 4. Acceptance Criteria

### VJLAB-65

* Hide UI toggles docked and hidden only: it never opens a popup and never exits fullscreen.
* A dedicated pop-out control (button plus D shortcut) is the only way to open the second-screen popup.
* Closing the popup or leaving detached returns to docked without touching fullscreen.
* The U key toggles visibility only; the shortcut map documents U and D with the new meanings.
* Panel actions never call fullscreen APIs outside the explicit fullscreen control.

## 5. Dependencies

| Dependency | Impact | Status |
| ---------- | ------ | ------ |
| Unified shell | Single surface for new semantics | In review |
| Control channel | Popup open/close coordination | Done |

## 6. Risks and Mitigations

| Risk | Mitigation |
| ---- | ---------- |
| Changed U semantics | Updated map, tour copy and dogfood |
| Blocked popups | Explicit action keeps in-page fallback |

## 7. Definition of Done

* Code and docs updated together.
* `npm test`, `npm run build`, `npm run lint` green.
* Fullscreen dogfood on hide, pop-out and exit flows.
* Release gate per project standards.

## 8. Revision History

| Version | Date | Change | Author |
| ------- | ---- | ------ | ------ |
| 1.0.0 | 2026-09-23 | Initial backlog for Sprint 26 | Marcos Ferreira Mourão |
