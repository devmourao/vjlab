# Sprint Planning — Sprint 29

## 1. Sprint Identification

| Field | Information |
| ----- | ----------- |
| Project | VJ Lab |
| Sprint | Sprint 29 — Scene CRUD |
| Milestone | M12 — Scene Packs and Library v0.9.0 (part 3, close) |
| Planned Version | 0.9.0 |
| Start Date | 2027-02-02 |
| End Date | 2027-02-09 |
| Owner | Marcos Ferreira Mourão |
| Status | Planned |

## 2. Sprint Goal

Let users build their own scene library from native bases.

Expected result: create, edit and delete custom scenes on native bases with text export/import — the playlist is born here as a collection of scene files.

## 3. Relation to Project Brief

| Item | Reference |
| ---- | --------- |
| Project Objective | Browser instrument for VJs: playable, performant, and presentable live |
| Related Scope | User-authored library on top of native bases |
| Success Criteria Impacted | Creative ownership, shareability, playlist readiness |

## 4. Relation to Milestone

| Field | Information |
| ----- | ----------- |
| Current Milestone | M12 — Scene Packs and Library v0.9.0 |
| Milestone Objective | Instance foundation, pack format, scene CRUD |
| Expected Completion | 100% of M12 (VJLAB-68 closes the milestone) |

## 5. Sprint Capacity

| Item | Value |
| ----- | ----- |
| Developers | 1 |
| Working Days | 5 |
| Available Hours | ~10 |
| Observations | First authoring UI; builds on the registry and validator |

## 6. Selected Issues

| Issue | Type | Priority | Estimate | Owner |
| ----- | ---- | -------- | -------- | ----- |
| VJLAB-68 — Scene CRUD v1 on native bases | Feature | High | L | Owner |

## 7. Prioritization

### High Priority

* Create from native bases, edit instance params, delete customs (natives protected).
* Text export/import through the pack format with readable validation reports.

### Medium Priority

* None in this sprint.

### Low Priority

* None in this sprint.

## 8. Dependencies

| Dependency | Impact | Owner |
| ---------- | ------ | ----- |
| Pack format and validator | Import path | Planned (Sprint 28) |
| Capability registry | Editable fields source | Planned (Sprint 27) |

## 9. Sprint Risks

| Risk | Probability | Impact | Mitigation |
| ---- | ----------- | ------ | ---------- |
| Editor UI balloons | Medium | High | Params render from registry schemas; no bespoke controls per base |
| Custom scenes break the stage | Low | High | All customs pass the validator before save |

## 10. Definition of Done (Sprint)

Standard project Definition of Done applies with no exceptions, plus authoring dogfood: build a scene from scratch, export, delete, re-import.

Sprint 29 succeeds when a custom scene survives the full loop with its per-instance config intact, `npm test`, `npm run build`, `npm run lint` are green, and docs match code.

## 11. Contingency Plan

* If scope overruns, ship create/edit/export first and follow with delete/import.

## 12. Approval

| Role | Name | Date |
| ---- | ---- | ---- |
| Author | Marcos Ferreira Mourão | 2026-09-23 |
| Approver | Marcos Ferreira Mourão | 2026-09-23 |

## 13. Revision History

| Version | Date | Change | Author |
| ------- | ---- | ------ | ------ |
| 1.0.0 | 2026-09-23 | Initial planning for Scene CRUD | Marcos Ferreira Mourão |
