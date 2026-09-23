# Sprint Planning — Sprint 31

## 1. Sprint Identification

| Field | Information |
| ----- | ----------- |
| Project | VJ Lab |
| Sprint | Sprint 31 — Preset Builder |
| Milestone | M10 — Builder & Media 0.11.0 (revived, part 1) |
| Planned Version | 0.11.0-alpha |
| Start Date | 2027-02-18 |
| End Date | 2027-02-25 |
| Owner | Marcos Ferreira Mourão |
| Status | Planned |

## 2. Sprint Goal

Let users assemble presets visually from the native base catalog.

Expected result: base browser, isolated live preview and schema-driven knobs that save through the existing custom scene pipeline — a redesign of the reverted builder on the new foundation.

## 3. Relation to Project Brief

| Item | Reference |
| ---- | --------- |
| Project Objective | Browser instrument for VJs: playable, performant, and presentable live |
| Related Scope | Builder — visual preset assembly |
| Success Criteria Impacted | Creative ownership, catalog discovery, preset shareability |

## 4. Relation to Milestone

| Field | Information |
| ----- | ----------- |
| Current Milestone | M10 — Builder & Media (revived) |
| Milestone Objective | Visual builder first, media bases next |
| Expected Completion | VJLAB-50 fully; VJLAB-51/52/54 stay queued |

## 5. Sprint Capacity

| Item | Value |
| ----- | ----- |
| Developers | 1 |
| Working Days | 5 |
| Available Hours | ~10 |
| Observations | UI on top of registry, packs and CRUD — no new data model |

## 6. Selected Issues

| Issue | Type | Priority | Estimate | Owner |
| ----- | ---- | -------- | -------- | ----- |
| VJLAB-50 — Preset builder UI redesigned | Feature | Medium | L | Owner |

## 7. Prioritization

### High Priority

* Base browser from the capability registry with descriptions.
* Isolated live preview rendering the draft without touching the live stage.
* Schema-driven knobs saving through create/update custom scene actions.

### Medium Priority

* None in this sprint.

### Low Priority

* None in this sprint.

## 8. Dependencies

| Dependency | Impact | Owner |
| ---------- | ------ | ----- |
| Capability registry | Browser and knob source | Done |
| Scene CRUD actions | Save path | Done |
| Pack validator | Saved presets stay import-safe | Done |

## 9. Sprint Risks

| Risk | Probability | Impact | Mitigation |
| ---- | ----------- | ------ | ---------- |
| Preview disturbs live audio/visuals | Medium | High | Isolated render, read-only audio, no store writes until save |
| Knob matrix explodes per base | Low | Medium | Generic schema-driven controls only |

## 10. Definition of Done (Sprint)

Standard project Definition of Done applies with no exceptions, plus builder dogfood: browse, preview, tweak, save, export, re-import.

Sprint 31 succeeds when a preset built visually plays identically after save and round-trip, `npm test`, `npm run build`, `npm run lint` are green, and docs match code.

## 11. Contingency Plan

* If scope overruns, ship browser plus preview first and follow with knobs.

## 12. Approval

| Role | Name | Date |
| ---- | ---- | ---- |
| Author | Marcos Ferreira Mourão | 2026-09-23 |
| Approver | Marcos Ferreira Mourão | 2026-09-23 |

## 13. Revision History

| Version | Date | Change | Author |
| ------- | ---- | ------ | ------ |
| 1.0.0 | 2026-09-23 | Initial planning for Preset Builder | Marcos Ferreira Mourão |
