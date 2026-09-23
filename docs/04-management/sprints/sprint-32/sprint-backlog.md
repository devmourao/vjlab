# Sprint Backlog — Sprint 32

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

## 2. Sprint Goal

Ship one control language on deck and popup.

## 3. Sprint Backlog Items

| Issue | Title | Type | Priority | Status |
| ----- | ----- | ---- | -------- | ------ |
| VJLAB-69 | Popup polish round — shared control kit, strobe switch and color radio with swatches, active flags, per-slot sliders, fullscreen layout, retire DETACHED pill | Enhancement | Medium | New |

## 4. Acceptance Criteria

### VJLAB-69

* Slot rows, pills, sliders and scene/media lists render from shared components on deck and popup.
* Strobe uses an on/off switch plus a single-choice white/black/color radio with visible swatches.
* Active flags show colored treatment on both surfaces.
* Every effect slot exposes its own slider with value bar, not only the selected one.
* The popup constrains to a max-width container with a responsive grid at fullscreen widths.
* The DETACHED pill is retired; remaining state indicators carry actionable meaning.
* No store shape or protocol changes.

## 5. Dependencies

| Dependency | Impact | Status |
| ---------- | ------ | ------ |
| Control channel | Popup data contract | Done |
| Shared components | Extraction pattern | Done |

## 6. Risks and Mitigations

| Risk | Mitigation |
| ---- | ---------- |
| Deck style churn | Per-component dogfood on both surfaces |
| Fullscreen regressions | 460px and fullscreen dogfood |

## 7. Definition of Done

* Code and docs updated together.
* `npm test`, `npm run build`, `npm run lint` green.
* Side-by-side deck and popup dogfood.
* Release gate per project standards.

## 8. Revision History

| Version | Date | Change | Author |
| ------- | ---- | ------ | ------ |
| 1.0.0 | 2026-09-23 | Initial backlog for Sprint 32 | Marcos Ferreira Mourão |
