# Sprint Backlog — Sprint 25

## 1. Sprint Identification

| Field | Information |
| ----- | ----------- |
| Project | VJ Lab |
| Sprint | Sprint 25 — Unified Shell and Player |
| Milestone | M11 — Web Experience (follow-up polish) |
| Planned Version | 0.7.1-alpha |
| Start Date | 2026-12-28 |
| End Date | 2027-01-04 |
| Owner | Marcos Ferreira Mourão |

## 2. Sprint Goal

Unify panels and ship a dedicated player with a future-ready model.

## 3. Sprint Backlog Items

| Issue | Title | Type | Priority | Status |
| ----- | ----- | ---- | -------- | ------ |
| VJLAB-63 | Unify side panels — retire right desk, docked uses left tabbed scrollable panel | Refactor | High | New |
| VJLAB-64 | Dedicated player area with library / setlist / favorites scene model | Feature | High | New |

## 4. Acceptance Criteria

### VJLAB-63

* No information renders on the right side and the left side at once.
* Docked mode uses one left scrollable panel with Track / Scenes / FX / Guide tabs on every screen size.
* Keyboard shortcuts keep working exactly as before; guide content keeps a single source.
* Popup and bottom sheet keep working unchanged.

### VJLAB-64

* A dedicated player area shows track info, transport and status apart from effects.
* Scene data separates library (all), setlist (ordered session) and favorites (quick shortcuts) with reorder-ready structures.
* No setlist management UI is added; the model is forward-compatible only.
* Existing track loading behavior is preserved.

## 5. Dependencies

| Dependency | Impact | Status |
| ---------- | ------ | ------ |
| TrackCard | Player area composition | Done |
| Preset catalog | Library source | Ready |
| Popup round | Deferred improvements | Queued |

## 6. Risks and Mitigations

| Risk | Mitigation |
| ---- | ---------- |
| Desk retirement confusion | Same actions under tabs; shortcuts untouched |
| Model scope creep | No setlist UI in this sprint |

## 7. Definition of Done

* Code and docs updated together.
* `npm test`, `npm run build`, `npm run lint` green.
* Live dogfood on desktop and mobile widths.
* Release gate per project standards.

## 8. Revision History

| Version | Date | Change | Author |
| ------- | ---- | ------ | ------ |
| 1.0.0 | 2026-09-23 | Initial backlog for Sprint 25 | Marcos Ferreira Mourão |
