# Sprint Backlog — Sprint 34

## 1. Sprint Identification

| Field | Information |
| ----- | ----------- |
| Project | VJ Lab |
| Sprint | Sprint 34 — Timed Queue |
| Milestone | M13 — Show Timeline 0.12.0 |
| Planned Version | 0.12.0-alpha |
| Start Date | 2026-10-06 |
| End Date | 2026-10-12 |
| Owner | Marcos Ferreira Mourão |

## 2. Sprint Goal

Make show timing visible and editable where the playlist already lives.

## 3. Sprint Backlog Items

| Issue | Title | Type | Priority | Status |
| ----- | ----- | ---- | -------- | ------ |
| VJLAB-71 | Timed queue UX — per-row duration stepper, Manual/Auto toggle, active-cue countdown (deck + popup) | Feature | High | Done |
| VJLAB-74 | Coverage meter — show total vs loaded track, manual target, or total only | Feature | Medium | Done |

## 4. Acceptance Criteria

### VJLAB-71

* Every cue row (shared `SceneList`, entries mode) shows its duration as
  `mm:ss` plus accumulated in/out on the Build-level detail.
* Duration edits through +/− steppers only (no drag); 44 px targets,
  isolated from the drag-reorder handle.
* Manual/Auto toggle per cue, persisted via `setCueTiming`.
* Active cue shows a live countdown (`remaining mm:ss`) on the deck at
  1 Hz; popup shows static durations, plus countdown when audio-bound
  (derived from snapshot position).
* Popup parity through the shared component: `SnapshotEntry` carries
  timing, `setCueTiming` is a whitelisted command; protocol stays additive.
* Manual cues keep today's hold behavior; switching follow never
  reorders, renames, or drops cues.

### VJLAB-74

* Coverage meter reads `showTotalSec` against the reference with priority:
  loaded deck track duration, else manual `ScenePlaylist.targetSec`
  (additive, clamped, persisted), else total only.
* Three states: under / covered (within ±5 s) / over, live-readable at
  a glance (Play disclosure level).
* Manual target editable on the deck; popup displays the meter read-only.
* No explicit track↔show link UI (Phase B); the loaded track is the
  implicit reference and the meter states so.

## 5. Dependencies

| Dependency | Impact | Status |
| ---------- | ------ | ------ |
| VJLAB-70 + VJLAB-73 | Model, windows, Clock | Done |
| Shared `SceneList` | Single implementation | Ready |
| Control channel | Additive snapshot/command | Planned in 71 |

## 6. Risks and Mitigations

| Risk | Mitigation |
| ---- | ---------- |
| Countdown re-render churn | 1 Hz hook, static rows |
| Popup without local clock | Audio-derived countdown, else static durations |
| Stepper vs drag-handle conflicts | Isolated 44 px targets |

## 7. Definition of Done

* Code and docs updated together.
* `npm test`, `npm run build`, `npm run lint` green.
* Deck + popup side-by-side dogfood with a live-expiring `auto` cue.
* Release gate per project standards.

## 8. Revision History

| Version | Date | Change | Author |
| ------- | ---- | ------ | ------ |
| 1.0.0 | 2026-09-27 | Initial backlog for Sprint 34 | Marcos Ferreira Mourão |
