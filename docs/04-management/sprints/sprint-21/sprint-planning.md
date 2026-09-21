# Sprint Planning — Sprint 21

## 1. Sprint Identification

| Field | Information |
| ----- | ----------- |
| Project | VJ Lab |
| Sprint | Sprint 21 — Web Shell Foundation |
| Milestone | M11 — Web Experience 0.6.0 (part 1, proposed) |
| Planned Version | 0.6.0-alpha |
| Start Date | 2026-11-26 |
| End Date | 2026-12-03 |
| Owner | Marcos Ferreira Mourão |
| Status | Planned |

## 2. Sprint Goal

Deliver the web shell foundation that makes the deck presentable and shareable without breaking live performance.

Expected result: separate landing route `/` with hero and entry CTA plus deck route `/deck`, compact top bar with track status and global controls, and evolved panel visibility with an always-visible toggle that preserves the existing `U` keyboard cycle.

## 3. Relation to Project Brief

| Item | Reference |
| ---- | --------- |
| Project Objective | Browser instrument for VJs: playable, performant, and presentable live |
| Related Scope | Web Experience — landing, shell, panel visibility |
| Success Criteria Impacted | Portfolio quality, public demo shareability, live usability on desktop and mobile |

## 4. Relation to Milestone

| Field | Information |
| ----- | ----------- |
| Current Milestone | M11 — Web Experience 0.6.0 (proposed) |
| Milestone Objective | Landing page, responsive shell, guided onboarding |
| Expected Completion | 50% of M11 (VJLAB-56, VJLAB-57; VJLAB-58 bottom sheet and VJLAB-59 tour deferred to Sprint 22) |

## 5. Sprint Capacity

| Item | Value |
| ----- | ----- |
| Developers | 1 |
| Working Days | 5 |
| Available Hours | ~10 |
| Observations | Shell and routing only; no new 3D bases; no audio engine changes |

## 6. Selected Issues

| Issue | Type | Priority | Estimate | Owner |
| ----- | ---- | -------- | -------- | ----- |
| VJLAB-56 — Landing route with presentation page and deck entry | Feature | High | M | Owner |
| VJLAB-57 — Evolve panel visibility with floating toggle and top bar | Feature | High | M | Owner |

## 7. Prioritization

### High Priority

* VJLAB-56 — shareable entry point and portfolio hero; unblocks public demo narrative.
* VJLAB-57 — always-visible show/hide control without shortcut collision; fixes mobile overlap at the shell level.

### Medium Priority

* None in this sprint.

### Low Priority

* None in this sprint.

## 8. Dependencies

| Dependency | Impact | Owner |
| ---------- | ------ | ----- |
| Static hosting redirect (`/* /index.html 200`) | Browser routing requires fallback on static host | Owner |
| `directorStore.panelMode` and `useKeyboardDesk` (`U`, `G`) | Visibility evolution must preserve existing shortcuts | Owner |
| `SITE_META` and version seal | Landing footer reuses single source of truth | Owner |
| `AudioPanel` and `ShortcutMap` | Top bar composes existing panels; no logic duplication | Owner |

## 9. Sprint Risks

| Risk | Probability | Impact | Mitigation |
| ---- | ----------- | ------ | ---------- |
| Static host serves 404 on `/deck` refresh | Medium | High | Add redirect rule plus hash fallback documented |
| Routing breaks AudioContext user gesture | Low | High | Landing CTA counts as gesture; engine still starts only on explicit play |
| New router dependency increases bundle | Low | Low | Use minimal router; verify build size |

## 10. Definition of Done (Sprint)

Standard project Definition of Done applies with no exceptions, plus live dogfood on desktop and mobile viewport.

Sprint 21 succeeds when `/` renders without WebGL, `/deck` mounts the canvas once, the floating toggle mirrors `U`, the scene badge stays visible in hidden mode, `npm test`, `npm run build`, `npm run lint` are green, and docs match code.

## 11. Contingency Plan

* If browser routing needs host changes beyond scope, ship landing as view state on `/` with deep-link follow-up and document the limitation.

## 12. Approval

| Role | Name | Date |
| ---- | ---- | ---- |
| Author | Marcos Ferreira Mourão | 2026-09-21 |
| Approver | Marcos Ferreira Mourão | 2026-09-21 |

## 13. Revision History

| Version | Date | Change | Author |
| ------- | ---- | ------ | ------ |
| 1.0.0 | 2026-09-21 | Initial planning for Web Shell Foundation | Marcos Ferreira Mourão |
