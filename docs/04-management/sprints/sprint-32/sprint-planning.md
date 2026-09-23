# Sprint Planning — Sprint 32

## 1. Sprint Identification

| Field | Information |
| ----- | ----------- |
| Project | VJ Lab |
| Sprint | Sprint 32 — Popup Polish Round |
| Milestone | M11 — Web Experience (follow-up polish) |
| Planned Version | 0.12.0-alpha |
| Start Date | 2027-02-26 |
| End Date | 2027-03-05 |
| Owner | Marcos Ferreira Mourão |
| Status | Planned |

## 2. Sprint Goal

Make deck and popup speak one control language and fix the fullscreen popup layout.

Expected result: shared control kit on both surfaces, strobe switch with color radio and swatches, colored active flags, one slider per effect slot, and a retired DETACHED pill.

## 3. Relation to Project Brief

| Item | Reference |
| ---- | --------- |
| Project Objective | Browser instrument for VJs: playable, performant, and presentable live |
| Related Scope | Second-screen polish and control standardization |
| Success Criteria Impacted | Dual-screen usability, visual consistency, intuitive selection mechanics |

## 4. Relation to Milestone

| Field | Information |
| ----- | ----------- |
| Current Milestone | M11 — Web Experience (follow-up) |
| Milestone Objective | One control language on every surface |
| Expected Completion | VJLAB-69 fully |

## 5. Sprint Capacity

| Item | Value |
| ----- | ----- |
| Developers | 1 |
| Working Days | 5 |
| Available Hours | ~10 |
| Observations | UI components plus popup route; no store shape or protocol changes |

## 6. Selected Issues

| Issue | Type | Priority | Estimate | Owner |
| ----- | ---- | -------- | -------- | ----- |
| VJLAB-69 — Popup polish round | Enhancement | Medium | L | Owner |

## 7. Prioritization

### High Priority

* Shared kit (slot rows, pills, sliders, lists) rendering on deck and popup.
* Strobe switch plus white/black/color radio with swatches; active flags colored.
* One slider per effect slot with value bars.

### Medium Priority

* Fullscreen popup layout with max-width container and responsive grid.
* Retire the DETACHED pill in favor of meaningful state.

## 8. Dependencies

| Dependency | Impact | Owner |
| ---------- | ------ | ----- |
| Control channel (VJLAB-60) | Popup data contract unchanged | Owner |
| Shared patterns (TrackCard, SceneInstances) | Kit follows proven extractions | Owner |

## 9. Sprint Risks

| Risk | Probability | Impact | Mitigation |
| ---- | ----------- | ------ | ---------- |
| Kit extraction churns deck styles | Medium | Medium | One component at a time with visual dogfood per surface |
| Fullscreen layout regressions | Low | Medium | Dogfood the popup at 460px and fullscreen widths |

## 10. Definition of Done (Sprint)

Standard project Definition of Done applies with no exceptions, plus side-by-side dogfood of deck and popup.

Sprint 32 succeeds when every control looks and behaves the same on both surfaces, strobe selection is single-choice with visible swatches, no dead pills remain, `npm test`, `npm run build`, `npm run lint` are green, and docs match code.

## 11. Contingency Plan

* If scope overruns, ship the kit plus strobe/flags first and follow with sliders and layout.

## 12. Approval

| Role | Name | Date |
| ---- | ---- | ---- |
| Author | Marcos Ferreira Mourão | 2026-09-23 |
| Approver | Marcos Ferreira Mourão | 2026-09-23 |

## 13. Revision History

| Version | Date | Change | Author |
| ------- | ---- | ------ | ------ |
| 1.0.0 | 2026-09-23 | Initial planning for Popup Polish Round | Marcos Ferreira Mourão |
