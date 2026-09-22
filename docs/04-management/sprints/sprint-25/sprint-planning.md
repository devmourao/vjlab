# Sprint Planning — Sprint 25

## 1. Sprint Identification

| Field | Information |
| ----- | ----------- |
| Project | VJ Lab |
| Sprint | Sprint 25 — Unified Shell and Player |
| Milestone | M11 — Web Experience (follow-up polish) |
| Planned Version | 0.7.1-alpha |
| Start Date | 2026-12-28 |
| End Date | 2027-01-04 |
| Owner | Marcos Ferreira Mourão |
| Status | Planned |

## 2. Sprint Goal

Remove duplicated surfaces and give the player a dedicated, future-ready home.

Expected result: one left tabbed panel for docked mode (right desk retired), a Winamp-style player area with track info and transport, and library / setlist / favorites scene data without setlist UI.

## 3. Relation to Project Brief

| Item | Reference |
| ---- | --------- |
| Project Objective | Browser instrument for VJs: playable, performant, and presentable live |
| Related Scope | Web Experience — shell unification and player model |
| Success Criteria Impacted | Interface clarity, onboarding focus, playlist readiness |

## 4. Relation to Milestone

| Field | Information |
| ----- | ----------- |
| Current Milestone | M11 — Web Experience (follow-up) |
| Milestone Objective | Single source per information, player ready for queues |
| Expected Completion | VJLAB-63 and VJLAB-64 fully; popup refinements stay queued for later rounds |

## 5. Sprint Capacity

| Item | Value |
| ----- | ----- |
| Developers | 1 |
| Working Days | 5 |
| Available Hours | ~10 |
| Observations | Shell refactor plus player area; no 3D, audio engine, or protocol changes |

## 6. Selected Issues

| Issue | Type | Priority | Estimate | Owner |
| ----- | ---- | -------- | -------- | ----- |
| VJLAB-63 — Unify side panels into one left tabbed scrollable panel | Refactor | High | M | Owner |
| VJLAB-64 — Dedicated player area with library / setlist / favorites model | Feature | High | M | Owner |

## 7. Prioritization

### High Priority

* VJLAB-63 — retire the right desk; docked reuses the scrollable tabbed pattern everywhere.
* VJLAB-64 — player area with track info and transport; data model only for library / setlist / favorites.

### Medium Priority

* None in this sprint.

### Low Priority

* None in this sprint.

## 8. Dependencies

| Dependency | Impact | Owner |
| ---------- | ------ | ----- |
| TrackCard and sheet tabs | Unification reuses existing patterns | Owner |
| Scene preset catalog | Library derives from existing presets | Owner |
| Popup refinements | Explicitly deferred to later rounds | Owner |

## 9. Sprint Risks

| Risk | Probability | Impact | Mitigation |
| ---- | ----------- | ------ | ---------- |
| Retiring the desk breaks muscle memory | Medium | Medium | Keyboard map unchanged; tabs expose the same actions |
| Player refactor touches three surfaces | Medium | Medium | One shared component, model without UI scope creep |

## 10. Definition of Done (Sprint)

Standard project Definition of Done applies with no exceptions, plus dogfood on desktop and mobile widths with cleared storage.

Sprint 25 succeeds when no information renders on both sides at once, the player area stands alone with full transport, setlist UI is absent by design, `npm test`, `npm run build`, `npm run lint` are green, and docs match code.

## 11. Contingency Plan

* If scope overruns, ship panel unification first and keep the current player for one more sprint.

## 12. Approval

| Role | Name | Date |
| ---- | ---- | ---- |
| Author | Marcos Ferreira Mourão | 2026-09-23 |
| Approver | Marcos Ferreira Mourão | 2026-09-23 |

## 13. Revision History

| Version | Date | Change | Author |
| ------- | ---- | ------ | ------ |
| 1.0.0 | 2026-09-23 | Initial planning for Unified Shell and Player | Marcos Ferreira Mourão |
