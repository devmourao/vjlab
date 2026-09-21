# Sprint Backlog — Sprint 22

## 1. Sprint Identification

| Field | Information |
| ----- | ----------- |
| Project | VJ Lab |
| Sprint | Sprint 22 — Mobile Sheet, Tour and Second Screen |
| Milestone | M11 — Web Experience 0.6.0 (part 2, close) |
| Planned Version | 0.6.0-beta |
| Start Date | 2026-12-04 |
| End Date | 2026-12-11 |
| Owner | Marcos Ferreira Mourão |

## 2. Sprint Goal

Deliver mobile bottom sheet, guided tour, and second-screen popup.

## 3. Sprint Backlog Items

| Issue | Title | Type | Priority | Status |
| ----- | ----- | ---- | -------- | ------ |
| VJLAB-58 | Mobile bottom sheet with Audio / Scenes / FX / Guide tabs | Feature | High | New |
| VJLAB-59 | First-run tour with help drawer and empty-state guide | Feature | Medium | New |
| VJLAB-60 | Detached second-screen popup with synced controls for clean fullscreen output | Feature | Medium | New |

## 4. Acceptance Criteria

### VJLAB-58

* Bottom sheet offers `mini / half / expanded` states with 44px targets and drag handle.
* Canvas stays mounted and interactive across all sheet states on mobile viewport.
* Desktop `md:` layout keeps current docked panels; sheet is mobile-first enhancement.
* Tabs reuse `AudioPanel`, scene presets, effect mixes, and guide entry without logic duplication.

### VJLAB-59

* First visit shows a 3-step tour (load, perform, hide UI) with skip and do-not-show-again.
* Help entry stays available at all times and derives content from `SHORTCUT_MAP`.
* Empty state with no track shows centered upload CTA without blocking the visual.

### VJLAB-60

* Detached mode opens a control-only popup via user gesture with in-page fallback when blocked.
* Popup mirrors `AudioPanel`, desk shortcuts, and top bar controls without creating WebGL or audio contexts.
* Main window keeps clean canvas output suitable for fullscreen projection and recording.
* Closing the popup or cycling `U` returns to docked; no shortcut is overwritten.

## 5. Dependencies

| Dependency | Impact | Status |
| ---------- | ------ | ------ |
| Sprint 21 shell | Sheet and popup composition | Done |
| Director store | Mode and control source of truth | Ready |
| Hosting and browser popup policy | Second-screen availability | To verify |

## 6. Risks and Mitigations

| Risk | Mitigation |
| ---- | ---------- |
| Capacity overrun with three issues | Ship 58/59 first; defer 60 cleanly |
| Popup blocked | Gesture-initiated open plus fallback panel |
| Cross-window drift | Single-writer store with channel sync |

## 7. Definition of Done

* Code and docs updated together.
* `npm test`, `npm run build`, `npm run lint` green.
* Live dogfood on desktop and mobile viewport, dual-screen when available.
* Release gate per project standards.

## 8. Revision History

| Version | Date | Change | Author |
| ------- | ---- | ------ | ------ |
| 1.0.0 | 2026-09-22 | Initial backlog for Sprint 22 | Marcos Ferreira Mourão |
