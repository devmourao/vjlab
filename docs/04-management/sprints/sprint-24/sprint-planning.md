# Sprint Planning — Sprint 24

## 1. Sprint Identification

| Field | Information |
| ----- | ----------- |
| Project | VJ Lab |
| Sprint | Sprint 24 — Deck Entry Sequence |
| Milestone | M11 — Web Experience (follow-up polish) |
| Planned Version | 0.6.2-alpha |
| Start Date | 2026-12-20 |
| End Date | 2026-12-27 |
| Owner | Marcos Ferreira Mourão |
| Status | Planned |

## 2. Sprint Goal

Focus first-run attention on one thing at a time and prepare the player for a future track queue.

Expected result: focus mode without side-desk pollution when no track is loaded, staged reveal as the session progresses, and a single reusable track card feeding every surface.

## 3. Relation to Project Brief

| Item | Reference |
| ---- | --------- |
| Project Objective | Browser instrument for VJs: playable, performant, and presentable live |
| Related Scope | Web Experience — entry sequence and player model |
| Success Criteria Impacted | Onboarding clarity, future playlist readiness, portfolio polish |

## 4. Relation to Milestone

| Field | Information |
| ----- | ----------- |
| Current Milestone | M11 — Web Experience (follow-up) |
| Milestone Objective | Harden onboarding and player architecture |
| Expected Completion | VJLAB-62 fully |

## 5. Sprint Capacity

| Item | Value |
| ----- | ----- |
| Developers | 1 |
| Working Days | 5 |
| Available Hours | ~10 |
| Observations | Player refactor plus entry flow; no 3D, audio engine, or protocol changes |

## 6. Selected Issues

| Issue | Type | Priority | Estimate | Owner |
| ----- | ---- | -------- | -------- | ----- |
| VJLAB-62 — Deck entry sequence with reusable queue-ready TrackCard | Enhancement | Medium | M | Owner |

## 7. Prioritization

### High Priority

* Focus mode with no side-desk pollution before a track loads.

### Medium Priority

* Staged reveal tied to session progress and tour steps.
* Single TrackCard reused across empty state, sheet and popup, backed by a queue-ready track model.

### Low Priority

* None in this sprint.

## 8. Dependencies

| Dependency | Impact | Owner |
| ---------- | ------ | ----- |
| Shipped tour and empty state | Entry phases build on existing onboarding | Owner |
| Audio engine file contract | Track model wraps local files without changing analysis | Owner |

## 9. Sprint Risks

| Risk | Probability | Impact | Mitigation |
| ---- | ----------- | ------ | ---------- |
| Refactor touches three surfaces at once | Medium | Medium | One shared component with snapshot tests of props |
| Playlist scope creeps in | Low | High | Queue UI stays out; only the model is forward-compatible |

## 10. Definition of Done (Sprint)

Standard project Definition of Done applies with no exceptions, plus first-run dogfood with cleared storage on desktop and mobile widths.

Sprint 24 succeeds when a fresh deck shows exactly one focus, loading a track reveals the next stage, the same card renders on every surface, `npm test`, `npm run build`, `npm run lint` are green, and docs match code.

## 11. Contingency Plan

* If the shared card overruns, ship focus mode first and keep per-surface players for one more sprint.

## 12. Approval

| Role | Name | Date |
| ---- | ---- | ---- |
| Author | Marcos Ferreira Mourão | 2026-09-22 |
| Approver | Marcos Ferreira Mourão | 2026-09-22 |

## 13. Revision History

| Version | Date | Change | Author |
| ------- | ---- | ------ | ------ |
| 1.0.0 | 2026-09-22 | Initial planning for Deck Entry Sequence | Marcos Ferreira Mourão |
