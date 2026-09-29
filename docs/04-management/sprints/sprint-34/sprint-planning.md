# Sprint Planning — Sprint 34

## 1. Sprint Identification

| Field | Information |
| ----- | ----------- |
| Project | VJ Lab |
| Sprint | Sprint 34 — Timed Queue |
| Milestone | M13 — Show Timeline 0.12.0 |
| Planned Version | 0.12.0-alpha |
| Start Date | 2026-10-06 |
| End Date | 2026-10-12 |
| Owner | Marcos Ferreira Mourão |
| Status | Planned |

## 2. Sprint Goal

Make show timing visible and editable where the playlist already lives.

Expected result: every cue row shows its duration with stepper editing and a
Manual/Auto toggle, the active cue counts down, and a coverage meter reads
show total against the loaded track (or a manual target, or the total alone).

## 3. Relation to Project Brief

| Item | Reference |
| ---- | --------- |
| Project Objective | Browser instrument for VJs: playable, performant, and presentable live |
| Related Scope | Program a 40-minute tribal arc without touching anything mid-set |
| Success Criteria Impacted | One control language on every surface, live-readable timing |

## 4. Relation to Milestone

| Field | Information |
| ----- | ----------- |
| Current Milestone | M13 — Show Timeline 0.12.0 |
| Milestone Objective | Timed Show runs a full set ponta a ponta |
| Expected Completion | VJLAB-71, VJLAB-74 fully |

## 5. Sprint Capacity

| Item | Value |
| ----- | ----- |
| Developers | 1 |
| Working Days | 5 |
| Available Hours | ~10 |
| Observations | Shared-component UI plus snapshot/command extension; no Clock changes |

## 6. Selected Issues

| Issue | Type | Priority | Estimate | Owner |
| ----- | ---- | -------- | -------- | ----- |
| VJLAB-71 — Timed queue UX | Feature | High | L | Owner |
| VJLAB-74 — Coverage meter | Feature | Medium | M | Owner |

## 7. Prioritization

### High Priority

* Cue rows (shared `SceneList`): per-row `mm:ss`, duration stepper +/−,
  Manual/Auto toggle, live countdown on the active cue.
* Timing flows to the popup: `SnapshotEntry` gains timing, `setCueTiming`
  becomes a whitelisted control command — parity through the shared component.

### Medium Priority

* Coverage meter: show total vs loaded-track duration, else manual target
  (`ScenePlaylist.targetSec`, additive), else total only; under / covered
  (±5 s) / over states.
* Track binding v1 is implicit: the currently loaded deck track is the
  reference. Explicit track↔show links are Phase B.

## 8. Dependencies

| Dependency | Impact | Owner |
| ---------- | ------ | ----- |
| VJLAB-70 model + VJLAB-73 Clock | Queue UX consumes `cueTiming`, `cueWindows`, `elapsedSec` | Done (Sprint 33) |
| Shared `SceneList` (deck, popup, library) | One implementation, every surface | Owner |
| Control channel contract | Snapshot + command extension stays additive | Owner |

## 9. Sprint Risks

| Risk | Probability | Impact | Mitigation |
| ---- | ----------- | ------ | ---------- |
| Countdown re-renders churn the list | Medium | Medium | 1 Hz countdown hook, no per-frame state; static rows otherwise |
| Popup countdown without a local clock | Medium | Low | Popup derives elapsed from snapshot position when audio-bound; wall-mode shows durations without countdown |
| Stepper fights drag-reorder rows | Low | Medium | Steppers are 44 px targets isolated from the drag handle |

## 10. Definition of Done (Sprint)

Standard project Definition of Done applies with no exceptions, plus
side-by-side dogfood of deck and popup with an `auto` cue expiring live.

Sprint 34 succeeds when durations edit from both surfaces, the active cue
counts down on the deck, coverage reads correctly in all three reference
modes (track / target / total), `npm test`, `npm run build`, `npm run lint`
are green, and docs match code.

## 11. Contingency Plan

* If scope overruns, ship VJLAB-71 first (rows + countdown on deck, popup
  static durations) and follow with VJLAB-74.

## 12. Approval

| Role | Name | Date |
| ---- | ---- | ---- |
| Author | Marcos Ferreira Mourão | 2026-09-27 |
| Approver | Marcos Ferreira Mourão | 2026-09-27 |

## 13. Revision History

| Version | Date | Change | Author |
| ------- | ---- | ------ | ------ |
| 1.0.0 | 2026-09-27 | Initial planning for Timed Queue | Marcos Ferreira Mourão |
