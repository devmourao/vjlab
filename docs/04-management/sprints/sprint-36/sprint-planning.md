# Sprint Planning — Sprint 36

## 1. Sprint Identification

| Field | Information |
| ----- | ----------- |
| Project | VJ Lab |
| Sprint | Sprint 36 — Track-Anchored Show |
| Milestone | M14 — Anchored Show 0.13.0 |
| Planned Version | 0.13.0-alpha |
| Start Date | 2026-10-20 |
| End Date | 2026-10-26 |
| Owner | Marcos Ferreira Mourão |
| Status | Planned |

## 2. Sprint Goal

Anchor the show to the track and split pool from body.

Expected result: with audio, show time IS track position (play, seek and
pause land on the right cue with no separate anchor); positions 1–10 are
the manual-only interrupt pool with timed return; positions 11+ are the
timed body from track 0:00; Resume (Z) re-syncs to the track point.

## 3. Relation to Project Brief

| Item | Reference |
| ---- | --------- |
| Project Objective | Browser instrument for VJs: playable, performant, and presentable live |
| Related Scope | 40-minute tribal set: program once, interrupt live, return on time |
| Success Criteria Impacted | Predictable live behavior, discoverable resume, deck/popup parity |

## 4. Relation to Milestone

| Field | Information |
| ----- | ----------- |
| Current Milestone | M14 — Anchored Show 0.13.0 |
| Milestone Objective | Track-anchored timeline with interrupt pool and explicit resume |
| Expected Completion | VJLAB-78, VJLAB-79 fully |

## 5. Sprint Capacity

| Item | Value |
| ----- | ----- |
| Developers | 1 |
| Working Days | 5 |
| Available Hours | ~10 |
| Observations | Pilot rework plus one new action; no pack/model format change |

## 6. Selected Issues

| Issue | Type | Priority | Estimate | Owner |
| ----- | ---- | -------- | -------- | ----- |
| VJLAB-78 — Track-anchored pilot with pool/body split | Feature | High | L | Owner |
| VJLAB-79 — Resume action (Z) with transport button | Feature | Medium | M | Owner |

## 7. Prioritization

### High Priority

* Audio mode: `elapsed ≡ track.position`; wall mode keeps the anchor.
  Pool (first 10 positions) never auto-targeted; body (11+) windows run
  from track 0:00; ≤10 cues means pure manual (today's behavior).
* Interrupt with timed return: auto pool cue returns to
  `cueIndexAt(trackNow)` on expiry; manual pool cue holds with HOLD chip.
* Countdown, coverage and timeline read body windows; pool cues stay
  visible (and editable) in the rows.

### Medium Priority

* `show.resume` action (KeyZ, category Show): dissolves to the body cue
  under the playhead, clears interrupts; doubles as re-sync gesture.
* Resume button beside Prev/Next/Cut on both surfaces (popup via the
  existing `runAction` command — no protocol change).
* Keymap doc updated (registry test enforces sync); glossary extended
  (Pool, Body, Resume).

## 8. Dependencies

| Dependency | Impact | Owner |
| ---------- | ------ | ----- |
| VJLAB-73 Clock + pilot | Reworked, not replaced; wall mode preserved | Done |
| `runAction` command | Popup Resume needs nothing new | Done |
| Keymap sync test | New action updates `docs/03-design/keymap.md` | Owner |

## 9. Sprint Risks

| Risk | Probability | Impact | Mitigation |
| ---- | ----------- | ------ | ---------- |
| Anchor removal breaks wall mode | Medium | Medium | Wall path keeps anchor math; audio path short-circuits |
| Next/Prev confusion near pool edge | Low | Medium | Positional navigation unchanged; Resume is the only new gesture |
| KeyZ collides in popup focus | Low | Low | `preventDefault` registry pattern; inputs keep priority |

## 10. Definition of Done (Sprint)

Standard project Definition of Done applies with no exceptions, plus a
dogfood set: play from 0:00 and mid-track, interrupt with auto and manual
pool cues, Resume from hold, all mirrored on the popup.

Sprint 36 succeeds when track position alone predicts the stage, pool
interrupts return on time, manual holds wait for Z, `npm test`,
`npm run build`, `npm run lint` are green, and docs match code.

## 11. Contingency Plan

* If scope overruns, ship VJLAB-78 (anchor + pool + timed return) and
  follow with VJLAB-79 (Resume surfaces as store action + key only).

## 12. Approval

| Role | Name | Date |
| ---- | ---- | ---- |
| Author | Marcos Ferreira Mourão | 2026-09-27 |
| Approver | Marcos Ferreira Mourão | 2026-09-27 |

## 13. Revision History

| Version | Date | Change | Author |
| ------- | ---- | ------ | ------ |
| 1.0.0 | 2026-09-27 | Initial planning for Track-Anchored Show | Marcos Ferreira Mourão |
