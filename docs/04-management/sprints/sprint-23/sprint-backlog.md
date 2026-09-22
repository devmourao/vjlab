# Sprint Backlog — Sprint 23

## 1. Sprint Identification

| Field | Information |
| ----- | ----------- |
| Project | VJ Lab |
| Sprint | Sprint 23 — Responsive Standard |
| Milestone | M11 — Web Experience (follow-up polish) |
| Planned Version | 0.6.1-alpha |
| Start Date | 2026-12-12 |
| End Date | 2026-12-19 |
| Owner | Marcos Ferreira Mourão |

## 2. Sprint Goal

Ship one responsive standard across all shell surfaces.

## 3. Sprint Backlog Items

| Issue | Title | Type | Priority | Status |
| ----- | ----- | ---- | -------- | ------ |
| VJLAB-61 | Responsive shell standard — unify breakpoints, safe-area and control surface per UX best practices | Enhancement | Medium | New |

## 4. Acceptance Criteria

### VJLAB-61

* One breakpoint token drives all shell media queries; no scattered 767/768px values remain.
* Top bar, bottom sheet, scene badge, help drawer, tour, empty state, landing and controls page all clear notches, browser chrome and overlays.
* Every primary action is reachable on 360px, 768px and 1280px widths or has a documented reason for viewport scoping.
* No new shortcuts and no store shape changes.

## 5. Dependencies

| Dependency | Impact | Status |
| ---------- | ------ | ------ |
| 0.6.0 shell | Standard surface set | Done |
| Dogfood matrix | Verification | To run |

## 6. Risks and Mitigations

| Risk | Mitigation |
| ---- | ---------- |
| Viewport regression | Matrix dogfood with screenshots |
| Scope growth from parity gaps | Document gaps as follow-ups |

## 7. Definition of Done

* Code and docs updated together.
* `npm test`, `npm run build`, `npm run lint` green.
* Live dogfood on the full viewport matrix.
* Release gate per project standards.

## 8. Revision History

| Version | Date | Change | Author |
| ------- | ---- | ------ | ------ |
| 1.0.0 | 2026-09-22 | Initial backlog for Sprint 23 | Marcos Ferreira Mourão |
