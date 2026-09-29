# Sprint Planning — Sprint 35

## 1. Sprint Identification

| Field | Information |
| ----- | ----------- |
| Project | VJ Lab |
| Sprint | Sprint 35 — Show Close |
| Milestone | M13 — Show Timeline 0.12.0 |
| Planned Version | 0.12.0 |
| Start Date | 2026-10-13 |
| End Date | 2026-10-19 |
| Owner | Marcos Ferreira Mourão |
| Status | Planned |

## 2. Sprint Goal

Close M13: read the show as a timeline, formalize the burst, sync the words.

Expected result: proportional-bar timeline view on both surfaces, per-base
burst response declared in the capability registry (same feel, no magic
numbers), and the glossary carrying every new domain term.

## 3. Relation to Project Brief

| Item | Reference |
| ---- | --------- |
| Project Objective | Browser instrument for VJs: playable, performant, and presentable live |
| Related Scope | Build-level show reading plus the live-dynamism instrument |
| Success Criteria Impacted | Intuitive timeline reading, documented vocabulary, release gate |

## 4. Relation to Milestone

| Field | Information |
| ----- | ----------- |
| Current Milestone | M13 — Show Timeline 0.12.0 |
| Milestone Objective | Timed Show runs a full set ponta a ponta |
| Expected Completion | VJLAB-72, VJLAB-76, VJLAB-77 fully; v0.12.0 tag |

## 5. Sprint Capacity

| Item | Value |
| ----- | ----- |
| Developers | 1 |
| Working Days | 5 |
| Available Hours | ~10 |
| Observations | One new shared view, registry formalization, docs sync |

## 6. Selected Issues

| Issue | Type | Priority | Estimate | Owner |
| ----- | ---- | -------- | -------- | ----- |
| VJLAB-72 — Proportional timeline view | Feature | High | L | Owner |
| VJLAB-76 — Burst formalization | Enhancement | Medium | M | Owner |
| VJLAB-77 — Glossary + docs sync | Documentation | Small | S | Owner |

## 7. Prioritization

### High Priority

* Shared `TimelineView`: bars proportional to cue durations, accumulated
  in/out ruler, show total; click a bar dissolves to that cue; active bar
  carries the countdown. Deck feeds the Clock, popup derives it — same
  pattern as Sprint 34 rows. Read-only proportional reading, no drag.

### Medium Priority

* `burstResponse` declared per base in `BASE_CAPABILITIES` with the
  current coefficients as v1 defaults; the four scenes consume the
  registry instead of magic numbers. Same feel, tunable tomorrow.
  Global `decayBurst` unchanged.

### Small Priority

* Glossary registers Show, Cue, Clock, Takeover, Burst, Macro, Coverage;
  Guide/keymap verified untouched (no new shortcuts this epic);
  design doc marked implemented.

## 8. Dependencies

| Dependency | Impact | Owner |
| ---------- | ------ | ----- |
| VJLAB-70/71 windows + countdown | Timeline reads `cueWindows`, `countdownAt` | Done |
| Snapshot entries with timing | Popup timeline needs no protocol change | Done (Sprint 34) |
| liveRefs.boost + decayBurst | Burst behavior preserved byte-for-byte | Owner |

## 9. Sprint Risks

| Risk | Probability | Impact | Mitigation |
| ---- | ----------- | ------ | ---------- |
| Timeline duplicates SceneList logic | Medium | Low | View reads the same windows/countdown helpers, adds no state |
| Burst refactor changes the feel | Low | High | Coefficients move verbatim; A/B dogfood against a recorded burst |
| Glossary drifts from code | Low | Low | Terms verified against implementation before closing |

## 10. Definition of Done (Sprint)

Standard project Definition of Done applies with no exceptions, plus the
M13 exit: a programmed set runs ponta a ponta with countdown, manual
takeover redirects the pilot, coverage reads against a track, burst feels
identical, `npm test`, `npm run build`, `npm run lint` green, v0.12.0 tag.

## 11. Contingency Plan

* If scope overruns, ship VJLAB-72 + VJLAB-77 (visible value + words) and
  follow with VJLAB-76.

## 12. Approval

| Role | Name | Date |
| ---- | ---- | ---- |
| Author | Marcos Ferreira Mourão | 2026-09-27 |
| Approver | Marcos Ferreira Mourão | 2026-09-27 |

## 13. Revision History

| Version | Date | Change | Author |
| ------- | ---- | ------ | ------ |
| 1.0.0 | 2026-09-27 | Initial planning for Show Close | Marcos Ferreira Mourão |
