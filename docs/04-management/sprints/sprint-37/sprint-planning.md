# Sprint Planning — Sprint 37

## 1. Sprint Identification

| Field | Information |
| ----- | ----------- |
| Project | VJ Lab |
| Sprint | Sprint 37 — Fixed Cues |
| Milestone | M15 — Programmed Show 0.14.0 |
| Planned Version | 0.14.0-alpha |
| Start Date | 2026-10-27 |
| End Date | 2026-11-02 |
| Owner | Marcos Ferreira Mourão |
| Status | Planned |

## 2. Sprint Goal

Pin cues to timestamps and fill the gaps automatically.

Expected result: any body cue anchors at an absolute `mm:ss`; unfixed
predecessors split the gap evenly (rounded, remainder to the last);
a Distribute action evens unfixed cues over a reference space; rows show
fixed markers with anchor editing on both surfaces.

## 3. Relation to Project Brief

| Item | Reference |
| ---- | --------- |
| Project Objective | Browser instrument for VJs: playable, performant, and presentable live |
| Related Scope | Programmed Show: author against the track clock (§§21–22 of the brief) |
| Success Criteria Impacted | Anchoring a cue at 1:43 refills predecessors; empty space divides evenly |

## 4. Relation to Milestone

| Field | Information |
| ----- | ----------- |
| Current Milestone | M15 — Programmed Show 0.14.0 |
| Milestone Objective | Shows authored against the track clock |
| Expected Completion | VJLAB-80, VJLAB-81 fully |

## 5. Sprint Capacity

| Item | Value |
| ----- | ----- |
| Developers | 1 |
| Working Days | 5 |
| Available Hours | ~10 |
| Observations | Model plus row/manager UI; no Clock or protocol redesign |

## 6. Selected Issues

| Issue | Type | Priority | Estimate | Owner |
| ----- | ---- | -------- | -------- | ----- |
| VJLAB-80 — Fixed cue timestamps | Feature | High | L | Owner |
| VJLAB-81 — Proportional auto-distribution | Feature | High | M | Owner |

## 7. Prioritization

### High Priority

* `startSec` per body cue (additive, persisted, sanitized); fixed wins on
  conflict (explicit overlap allowed, documented).
* `cueWindows` honors anchors; gaps read as holds of the previous cue.
* Predecessor redistribution on demand: unfixed cues between anchors
  split the gap evenly (rounded seconds, remainder to the last).
* Row UI: fixed marker `◈ m:ss`, anchor steppers, clear; Distribute
  button on the manager; popup parity via additive snapshot/command.

### Medium Priority

* Distribute space priority: explicit space, else playlist target, else
  current total (equalize). Trailing unfixed cues keep durations.

## 8. Dependencies

| Dependency | Impact | Owner |
| ---------- | ------ | ----- |
| VJLAB-78 anchored timeline | Anchors extend body windows | Done |
| Shared SceneList + PlaylistManager | Single implementation | Owner |

## 9. Sprint Risks

| Risk | Probability | Impact | Mitigation |
| ---- | ----------- | ------ | ---------- |
| Anchor before cursor confuses windows | Medium | Medium | Fixed wins documented; redistribution skips negative gaps |
| Row crowding regresses on narrow panels | Medium | Medium | Marker reuses timing chip slot; steppers stay in actions |
| Popup editing doubles protocol work | Low | Low | Same `setCueTiming`-style command pattern |

## 10. Definition of Done (Sprint)

Standard project Definition of Done applies with no exceptions, plus an
anchored dogfood: fix a cue at 1:43, watch predecessors refill 1:42,
distribute the rest, all mirrored on the popup.

Sprint 37 succeeds when anchors persist, gaps divide evenly, fixed
markers read on both surfaces, `npm test`, `npm run build`, `npm run lint`
are green, and docs match code.

## 11. Contingency Plan

* If scope overruns, ship VJLAB-80 (anchors + markers) and follow with
  VJLAB-81 (distribution).

## 12. Approval

| Role | Name | Date |
| ---- | ---- | ---- |
| Author | Marcos Ferreira Mourão | 2026-09-29 |
| Approver | Marcos Ferreira Mourão | 2026-09-29 |

## 13. Revision History

| Version | Date | Change | Author |
| ------- | ---- | ------ | ------ |
| 1.0.0 | 2026-09-29 | Initial planning for Fixed Cues | Marcos Ferreira Mourão |
