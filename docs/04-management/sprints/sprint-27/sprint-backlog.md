# Sprint Backlog — Sprint 27

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

## 2. Sprint Goal

Ship the instance-scoped scene foundation.

## 3. Sprint Backlog Items

| Issue | Title | Type | Priority | Status |
| ----- | ----- | ---- | -------- | ------ |
| VJLAB-67 | Instance-scoped scene foundation — single instances[] composition, per-instance asset slots, base capability registry | Refactor | High | New |

## 4. Acceptance Criteria

### VJLAB-67

* All six presets compose through `instances[]` with pixel-identical visuals to the legacy path.
* The mesh image slot is owned by the instance (own cache key); no scene reads the global texture store.
* The capability registry declares every native base's editable params, ranges and asset slots.
* Cloned-base rule documented: new mechanics allowed under the input/output contract.

## 5. Dependencies

| Dependency | Impact | Status |
| ---------- | ------ | ------ |
| Scene components | Migration surface | Ready |
| Texture pipeline | Cache rework | Ready |

## 6. Risks and Mitigations

| Risk | Mitigation |
| ---- | ---------- |
| Visual drift | Per-preset before/after dogfood |
| Cache leaks | Instance-keyed dispose |

## 7. Definition of Done

* Code and docs updated together.
* `npm test`, `npm run build`, `npm run lint` green.
* Per-preset visual dogfood.
* Release gate per project standards.

## 8. Revision History

| Version | Date | Change | Author |
| ------- | ---- | ------ | ------ |
| 1.0.0 | 2026-09-23 | Initial backlog for Sprint 27 | Marcos Ferreira Mourão |
