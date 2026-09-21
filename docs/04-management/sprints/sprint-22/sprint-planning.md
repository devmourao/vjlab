# Sprint Planning — Sprint 22

## 1. Sprint Identification

| Field | Information |
| ----- | ----------- |
| Project | VJ Lab |
| Sprint | Sprint 22 — Mobile Sheet, Tour and Second Screen |
| Milestone | M11 — Web Experience 0.6.0 (part 2, close) |
| Planned Version | 0.6.0-beta |
| Start Date | 2026-12-04 |
| End Date | 2026-12-11 |
| Owner | Marcos Ferreira Mourão |
| Status | Planned |

## 2. Sprint Goal

Close the web experience milestone with a mobile-first control surface, guided onboarding, and a second-screen control popup for clean fullscreen output.

Expected result: bottom sheet with Audio / Scenes / FX / Guide tabs that never unmounts the canvas, first-run tour with help drawer and empty-state guide, and detached popup with synced controls for dual-screen performance.

## 3. Relation to Project Brief

| Item | Reference |
| ---- | --------- |
| Project Objective | Browser instrument for VJs: playable, performant, and presentable live |
| Related Scope | Web Experience — responsive shell, onboarding, second-screen control |
| Success Criteria Impacted | Mobile usability, public demo clarity, live dual-screen direction |

## 4. Relation to Milestone

| Field | Information |
| ----- | ----------- |
| Current Milestone | M11 — Web Experience 0.6.0 |
| Milestone Objective | Landing page, responsive shell, guided onboarding, second-screen control |
| Expected Completion | 100% of M11 (VJLAB-58, VJLAB-59, VJLAB-60; Sprint 21 delivered VJLAB-56/57) |

## 5. Sprint Capacity

| Item | Value |
| ----- | ----- |
| Developers | 1 |
| Working Days | 5 |
| Available Hours | ~10 |
| Observations | Three issues planned; VJLAB-60 is stretch if sheet or tour overruns |

## 6. Selected Issues

| Issue | Type | Priority | Estimate | Owner |
| ----- | ---- | -------- | -------- | ----- |
| VJLAB-58 — Mobile bottom sheet with Audio / Scenes / FX / Guide tabs | Feature | High | M | Owner |
| VJLAB-59 — First-run tour with help drawer and empty-state guide | Feature | Medium | M | Owner |
| VJLAB-60 — Detached second-screen popup with synced controls for clean fullscreen output | Feature | Medium | M | Owner |

## 7. Prioritization

### High Priority

* VJLAB-58 — viewer-first mobile surface; fixes overlap on small viewports.

### Medium Priority

* VJLAB-59 — onboarding and discoverability for new users.
* VJLAB-60 — dual-screen direction with clean main output; depends on gesture-initiated popup.

### Low Priority

* None in this sprint.

## 8. Dependencies

| Dependency | Impact | Owner |
| ---------- | ------ | ----- |
| `DeckPage` shell from Sprint 21 | Sheet and popup compose existing panels | Owner |
| `directorStore.panelMode` and `U` cycle | Modes stay docked / detached / hidden without collision | Owner |
| `SHORTCUT_MAP` single source | Tour and help derive from existing map | Owner |
| Popup sync channel | Second-screen controls mirror main store; audio stays on main window | Owner |

## 9. Sprint Risks

| Risk | Probability | Impact | Mitigation |
| ---- | ----------- | ------ | ---------- |
| Three issues exceed ~10h capacity | Medium | Medium | Deliver 58/59 first; defer 60 to Sprint 23 if needed |
| Popup blockers prevent second screen | Medium | Medium | Gesture-initiated open plus in-page fallback panel |
| Sync drift between windows | Low | Medium | Single-writer main store with channel plus storage fallback |

## 10. Definition of Done (Sprint)

Standard project Definition of Done applies with no exceptions, plus live dogfood on desktop, mobile viewport, and dual-screen when available.

Sprint 22 succeeds when the canvas stays mounted across sheet states, the tour shows once with persistent help entry, the popup mirrors controls without moving audio, `npm test`, `npm run build`, `npm run lint` are green, and docs match code.

## 11. Contingency Plan

* If capacity overruns, ship VJLAB-58/59 and move VJLAB-60 to Sprint 23 with no scope change.

## 12. Approval

| Role | Name | Date |
| ---- | ---- | ---- |
| Author | Marcos Ferreira Mourão | 2026-09-22 |
| Approver | Marcos Ferreira Mourão | 2026-09-22 |

## 13. Revision History

| Version | Date | Change | Author |
| ------- | ---- | ------ | ------ |
| 1.0.0 | 2026-09-22 | Initial planning for Mobile Sheet, Tour and Second Screen | Marcos Ferreira Mourão |
