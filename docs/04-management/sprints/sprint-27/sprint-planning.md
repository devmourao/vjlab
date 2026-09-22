# Sprint Planning — Sprint 27

## 1. Sprint Identification

| Field | Information |
| ----- | ----------- |
| Project | VJ Lab |
| Sprint | Sprint 27 — Instance Foundation |
| Milestone | M12 — Scene Packs and Library v0.9.0 (part 1) |
| Planned Version | 0.9.0-alpha |
| Start Date | 2027-01-19 |
| End Date | 2027-01-26 |
| Owner | Marcos Ferreira Mourão |
| Status | Planned |

## 2. Sprint Goal

Give every scene one composition path with per-instance customization.

Expected result: all presets migrated to `instances[]`, image slots owned by instances instead of global state, and a capability registry declaring each native base's editable params.

## 3. Relation to Project Brief

| Item | Reference |
| ---- | --------- |
| Project Objective | Browser instrument for VJs: playable, performant, and presentable live |
| Related Scope | Scene library foundation for packs and CRUD |
| Success Criteria Impacted | Scalable scene authoring, pack readiness, no global leaks |

## 4. Relation to Milestone

| Field | Information |
| ----- | ----------- |
| Current Milestone | M12 — Scene Packs and Library v0.9.0 |
| Milestone Objective | Instance foundation, pack format, scene CRUD |
| Expected Completion | VJLAB-67 fully; VJLAB-66 unblocked next |

## 5. Sprint Capacity

| Item | Value |
| ----- | ----- |
| Developers | 1 |
| Working Days | 5 |
| Available Hours | ~10 |
| Observations | Scene-layer refactor; no UI editor, no audio or protocol changes |

## 6. Selected Issues

| Issue | Type | Priority | Estimate | Owner |
| ----- | ---- | -------- | -------- | ----- |
| VJLAB-67 — Instance-scoped scene foundation | Refactor | High | M | Owner |

## 7. Prioritization

### High Priority

* Migrate all presets to `instances[]` with identical visuals (no behavior change).
* Move the image slot from global store into instance params with per-instance cache.
* Ship the native base capability registry (params, ranges, asset slots).

### Medium Priority

* None in this sprint.

### Low Priority

* None in this sprint.

## 8. Dependencies

| Dependency | Impact | Owner |
| ---------- | ------ | ----- |
| Scene catalog and contract | Registry derives from existing specs | Owner |
| Global texture path | Must keep working until migration lands | Owner |

## 9. Sprint Risks

| Risk | Probability | Impact | Mitigation |
| ---- | ----------- | ------ | ---------- |
| Visual regression on migrated presets | Medium | High | Before/after dogfood per preset, one composition path eases review |
| Texture cache leaks on preset switch | Low | Medium | Instance-keyed cache with explicit dispose |

## 10. Definition of Done (Sprint)

Standard project Definition of Done applies with no exceptions, plus per-preset visual dogfood.

Sprint 27 succeeds when every preset renders identically through `instances[]`, no scene reads global customization state, the registry covers all four native bases, `npm test`, `npm run build`, `npm run lint` are green, and docs match code.

## 11. Contingency Plan

* If migration overruns, land the registry first and migrate presets in review-sized batches.

## 12. Approval

| Role | Name | Date |
| ---- | ---- | ---- |
| Author | Marcos Ferreira Mourão | 2026-09-23 |
| Approver | Marcos Ferreira Mourão | 2026-09-23 |

## 13. Revision History

| Version | Date | Change | Author |
| ------- | ---- | ------ | ------ |
| 1.0.0 | 2026-09-23 | Initial planning for Instance Foundation | Marcos Ferreira Mourão |
