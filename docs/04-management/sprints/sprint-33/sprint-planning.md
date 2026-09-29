# Sprint Planning — Sprint 33

## 1. Sprint Identification

| Field | Information |
| ----- | ----------- |
| Project | VJ Lab |
| Sprint | Sprint 33 — Show Foundation |
| Milestone | M13 — Show Timeline 0.12.0 |
| Planned Version | 0.12.0-alpha |
| Start Date | 2026-09-28 |
| End Date | 2026-10-05 |
| Owner | Marcos Ferreira Mourão |
| Status | Planned |

## 2. Sprint Goal

Lay the foundation every later Show feature consumes: vocabulary, model, clock.

Expected result: capability registry mapped to the 4 param families with spatial
reference decisions locked; Show/Cue versioned model persisted; Clock abstraction
running auto-advance on audio position with a documented seek policy.

## 3. Relation to Project Brief

| Item | Reference |
| ---- | --------- |
| Project Objective | Browser instrument for VJs: playable, performant, and presentable live |
| Related Scope | Timed show programming for long sets (40-minute tribal arc) |
| Success Criteria Impacted | Programmable sets, live takeover safety, deck/popup parity |

## 4. Relation to Milestone

| Field | Information |
| ----- | ----------- |
| Current Milestone | M13 — Show Timeline 0.12.0 |
| Milestone Objective | Timed Show runs a full set ponta a ponta |
| Expected Completion | VJLAB-75, VJLAB-70, VJLAB-73 fully |

## 5. Preconditions

The 4 open questions in `docs/03-design/show-timeline-upgrade.md` section 11
(takeover redirect vs pause, "Cue" naming, stepper-only editing, first macros)
are resolved before implementation starts. Unresolved items stay design notes,
never guessed in code.

## 6. Sprint Capacity

| Item | Value |
| ----- | ----- |
| Developers | 1 |
| Working Days | 5 |
| Available Hours | ~10 |
| Observations | Model + store + clock; no queue UX changes yet (Sprint 34) |

## 7. Selected Issues

| Issue | Type | Priority | Estimate | Owner |
| ----- | ---- | -------- | -------- | ----- |
| VJLAB-75 — Capability registry v2 | Refactor | Medium | M | Owner |
| VJLAB-70 — Show/Cue data model | Feature | High | L | Owner |
| VJLAB-73 — Clock abstraction | Feature | High | L | Owner |

## 8. Prioritization

### High Priority

* Show/Cue model with occurrence-owned durationSec + follow, versioned
  persistence with migration, deck positional compatibility.
* Clock on audio position with wall fallback, seek-rebase, end-of-show hold.

### Medium Priority

* 4-family capability mapping; spatial decisions (pivot/target, normalized
  anchored coords, aspect policy, fixed transform order) recorded in the
  design doc.

## 9. Dependencies

| Dependency | Impact | Owner |
| ---------- | ------ | ----- |
| Design doc section 11 answers | Unblocks model + clock semantics | Owner |
| Pack/CRUD model (VJLAB-66/67/68) | Show entries reference scenes, not duplicate them | Owner |

## 10. Sprint Risks

| Risk | Probability | Impact | Mitigation |
| ---- | ----------- | ------ | ---------- |
| Clock semantics debated mid-sprint | Medium | Medium | Lock section 11 answers as preconditions, not sprint work |
| Model churn ripples to queue UI early | Low | Medium | Queue UX is Sprint 34; model stays additive and optional |

## 11. Definition of Done (Sprint)

Standard project Definition of Done applies with no exceptions, plus a timed
fixture show advancing on the Clock in a dogfood session.

Sprint 33 succeeds when a Show with N cues auto-advances on audio position,
seek visibly rebases it, pause freezes it, `npm test`, `npm run build`,
`npm run lint` are green, and docs match code.

## 12. Contingency Plan

* If scope overruns, ship VJLAB-75 + VJLAB-70 first and follow with VJLAB-73.

## 13. Approval

| Role | Name | Date |
| ---- | ---- | ---- |
| Author | Marcos Ferreira Mourão | 2026-09-27 |
| Approver | Marcos Ferreira Mourão | 2026-09-27 |

## 14. Revision History

| Version | Date | Change | Author |
| ------- | ---- | ------ | ------ |
| 1.0.0 | 2026-09-27 | Initial planning for Show Foundation | Marcos Ferreira Mourão |
