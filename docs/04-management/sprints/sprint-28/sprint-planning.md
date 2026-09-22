# Sprint Planning — Sprint 28

## 1. Sprint Identification

| Field | Information |
| ----- | ----------- |
| Project | VJ Lab |
| Sprint | Sprint 28 — Pack Format |
| Milestone | M12 — Scene Packs and Library v0.9.0 (part 2) |
| Planned Version | 0.9.0-beta |
| Start Date | 2027-01-26 |
| End Date | 2027-02-02 |
| Owner | Marcos Ferreira Mourão |
| Status | Planned |

## 2. Sprint Goal

Make scene and media packs a validated, shareable data format.

Expected result: versioned pack schema with a tested validator that accepts complete deck-reactive scenes, normalizes per-instance params, and rejects bad packs with readable reasons.

## 3. Relation to Project Brief

| Item | Reference |
| ---- | --------- |
| Project Objective | Browser instrument for VJs: playable, performant, and presentable live |
| Related Scope | Importable packs from local files, URLs and a future static gallery |
| Success Criteria Impacted | Shareability, robustness against bad files, zero-cost distribution |

## 4. Relation to Milestone

| Field | Information |
| ----- | ----------- |
| Current Milestone | M12 — Scene Packs and Library v0.9.0 |
| Milestone Objective | Instance foundation, pack format, scene CRUD |
| Expected Completion | VJLAB-66 fully; VJLAB-68 unblocked next |

## 5. Sprint Capacity

| Item | Value |
| ----- | ----- |
| Developers | 1 |
| Working Days | 5 |
| Available Hours | ~10 |
| Observations | Pure data layer with unit coverage; no UI, no backend |

## 6. Selected Issues

| Issue | Type | Priority | Estimate | Owner |
| ----- | ---- | -------- | -------- | ----- |
| VJLAB-66 — Importable scene and media packs | Feature | High | M | Owner |

## 7. Prioritization

### High Priority

* Pack schema with mandatory header, per-base item rules and compatibility fields.
* Validator with per-item accept/reject report, clamping, id namespacing and unknown-base rejection.

### Medium Priority

* None in this sprint.

### Low Priority

* None in this sprint.

## 8. Dependencies

| Dependency | Impact | Owner |
| ---------- | ------ | ----- |
| VJLAB-67 registry | Validator checks against declared capabilities | Owner |
| Behavior standard v1 | Imported scenes stay deck-reactive | Owner |

## 9. Sprint Risks

| Risk | Probability | Impact | Mitigation |
| ---- | ----------- | ------ | ---------- |
| Schema churn late in the sprint | Medium | Medium | Freeze header fields first; iterate on item rules |
| Over-validation rejects legit packs | Low | Medium | Golden-file fixtures from shipped presets |

## 10. Definition of Done (Sprint)

Standard project Definition of Done applies with no exceptions, plus fixture dogfood: every shipped preset round-trips through export, validation and import.

Sprint 28 succeeds when malformed packs fail loudly with reasons, valid packs merge without collisions, `npm test`, `npm run build`, `npm run lint` are green, and docs match code.

## 11. Contingency Plan

* If scope overruns, ship scene packs first and defer media packs with sources intact.

## 12. Approval

| Role | Name | Date |
| ---- | ---- | ---- |
| Author | Marcos Ferreira Mourão | 2026-09-23 |
| Approver | Marcos Ferreira Mourão | 2026-09-23 |

## 13. Revision History

| Version | Date | Change | Author |
| ------- | ---- | ------ | ------ |
| 1.0.0 | 2026-09-23 | Initial planning for Pack Format | Marcos Ferreira Mourão |
