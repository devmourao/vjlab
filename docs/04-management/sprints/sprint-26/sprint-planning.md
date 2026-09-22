# Sprint Planning — Sprint 26

## 1. Sprint Identification

| Field | Information |
| ----- | ----------- |
| Project | VJ Lab |
| Sprint | Sprint 26 — Explicit Panel Controls |
| Milestone | M11 — Web Experience (follow-up polish) |
| Planned Version | 0.7.2-alpha |
| Start Date | 2027-01-11 |
| End Date | 2027-01-18 |
| Owner | Marcos Ferreira Mourão |
| Status | Planned |

## 2. Sprint Goal

Give hiding the interface and popping out controls separate, predictable commands.

Expected result: Hide UI only toggles panels and never opens popups or exits fullscreen, while an explicit pop-out action owns the second screen.

## 3. Relation to Project Brief

| Item | Reference |
| ---- | --------- |
| Project Objective | Browser instrument for VJs: playable, performant, and presentable live |
| Related Scope | Web Experience — predictable live direction |
| Success Criteria Impacted | Fullscreen reliability, live usability, trust in controls |

## 4. Relation to Milestone

| Field | Information |
| ----- | ----------- |
| Current Milestone | M11 — Web Experience (follow-up) |
| Milestone Objective | Controls that never surprise the performer |
| Expected Completion | VJLAB-65 fully |

## 5. Sprint Capacity

| Item | Value |
| ----- | ----- |
| Developers | 1 |
| Working Days | 5 |
| Available Hours | ~10 |
| Observations | Control semantics only; no 3D, audio, or protocol changes |

## 6. Selected Issues

| Issue | Type | Priority | Estimate | Owner |
| ----- | ---- | -------- | -------- | ----- |
| VJLAB-65 — Explicit hide vs pop-out controls | UX fix | High | M | Owner |

## 7. Prioritization

### High Priority

* VJLAB-65 — split Hide UI (docked / hidden only) from Pop out controls (explicit gesture, owns the popup).

### Medium Priority

* None in this sprint.

### Low Priority

* None in this sprint.

## 8. Dependencies

| Dependency | Impact | Owner |
| ---------- | ------ | ----- |
| Unified shell (VJLAB-63/64) | New semantics build on one panel surface | Owner |
| Shortcut map | U retargeted, D assigned, labels updated | Owner |

## 9. Sprint Risks

| Risk | Probability | Impact | Mitigation |
| ---- | ----------- | ------ | ---------- |
| U behavior change confuses muscle memory | Medium | Medium | Single-purpose keys with updated map and tour copy |
| Popup still blocked on some browsers | Low | Low | Explicit action keeps the in-page fallback |

## 10. Definition of Done (Sprint)

Standard project Definition of Done applies with no exceptions, plus fullscreen dogfood: hide, pop-out and exit flows verified without losing fullscreen unintentionally.

Sprint 26 succeeds when Hide UI never opens a popup or exits fullscreen, pop-out works only from its explicit control, `npm test`, `npm run build`, `npm run lint` are green, and docs match code.

## 11. Contingency Plan

* If the keymap change needs broader review, ship button behavior first and follow with the shortcut swap.

## 12. Approval

| Role | Name | Date |
| ---- | ---- | ---- |
| Author | Marcos Ferreira Mourão | 2026-09-23 |
| Approver | Marcos Ferreira Mourão | 2026-09-23 |

## 13. Revision History

| Version | Date | Change | Author |
| ------- | ---- | ------ | ------ |
| 1.0.0 | 2026-09-23 | Initial planning for Explicit Panel Controls | Marcos Ferreira Mourão |
