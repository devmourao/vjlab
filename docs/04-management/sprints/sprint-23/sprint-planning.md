# Sprint Planning — Sprint 23

## 1. Sprint Identification

| Field | Information |
| ----- | ----------- |
| Project | VJ Lab |
| Sprint | Sprint 23 — Responsive Standard |
| Milestone | M11 — Web Experience (follow-up polish) |
| Planned Version | 0.6.1-alpha |
| Start Date | 2026-12-12 |
| End Date | 2026-12-19 |
| Owner | Marcos Ferreira Mourão |
| Status | Planned |

## 2. Sprint Goal

Unify the responsive shell so every viewport follows the same breakpoint, safe-area and control-surface rules.

Expected result: one breakpoint source, consistent insets on all overlays, and feature parity between the mobile sheet and the desktop dock — with no new shortcuts and no store shape changes.

## 3. Relation to Project Brief

| Item | Reference |
| ---- | --------- |
| Project Objective | Browser instrument for VJs: playable, performant, and presentable live |
| Related Scope | Web Experience — responsive standard |
| Success Criteria Impacted | Mobile and desktop usability, portfolio polish, fewer viewport-specific defects |

## 4. Relation to Milestone

| Field | Information |
| ----- | ----------- |
| Current Milestone | M11 — Web Experience (follow-up) |
| Milestone Objective | Harden the shipped 0.6.0 shell across viewports |
| Expected Completion | VJLAB-61 fully; VJLAB-62 stays queued |

## 5. Sprint Capacity

| Item | Value |
| ----- | ----- |
| Developers | 1 |
| Working Days | 5 |
| Available Hours | ~10 |
| Observations | CSS and layout only; no 3D, audio, or protocol changes |

## 6. Selected Issues

| Issue | Type | Priority | Estimate | Owner |
| ----- | ---- | -------- | -------- | ----- |
| VJLAB-61 — Responsive shell standard | Enhancement | Medium | M | Owner |

## 7. Prioritization

### High Priority

* Single breakpoint token replacing scattered 767/768px queries.

### Medium Priority

* Safe-area audit across top bar, sheet, badge, drawer, tour, empty state, landing and controls page.
* Control-surface parity review (sheet tabs vs desktop dock actions).

### Low Priority

* None in this sprint.

## 8. Dependencies

| Dependency | Impact | Owner |
| ---------- | ------ | ----- |
| Shipped 0.6.0 shell | Standard applies to existing surfaces | Owner |
| Dogfood devices | 360px, 768px and 1280px viewports plus fullscreen | Owner |

## 9. Sprint Risks

| Risk | Probability | Impact | Mitigation |
| ---- | ----------- | ------ | ---------- |
| Breakpoint consolidation regresses one viewport | Medium | Medium | Dogfood matrix before merge with screenshots |
| Parity review grows scope | Low | Medium | Review documents gaps; fixes stay minimal |

## 10. Definition of Done (Sprint)

Standard project Definition of Done applies with no exceptions, plus dogfood on 360px, 768px and 1280px widths, fullscreen, and hidden mode.

Sprint 23 succeeds when no control is reachable on one viewport but missing on another without a documented reason, `npm test`, `npm run build`, `npm run lint` are green, and docs match code.

## 11. Contingency Plan

* If the audit surfaces large gaps, document them as follow-up issues and ship the token plus safe-area fixes only.

## 12. Approval

| Role | Name | Date |
| ---- | ---- | ---- |
| Author | Marcos Ferreira Mourão | 2026-09-22 |
| Approver | Marcos Ferreira Mourão | 2026-09-22 |

## 13. Revision History

| Version | Date | Change | Author |
| ------- | ---- | ------ | ------ |
| 1.0.0 | 2026-09-22 | Initial planning for Responsive Standard | Marcos Ferreira Mourão |
