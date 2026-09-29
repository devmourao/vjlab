# Sprint Backlog — Sprint 37

## 1. Sprint Identification

| Field | Information |
| ----- | ----------- |
| Project | VJ Lab |
| Sprint | Sprint 37 — Fixed Cues |
| Milestone | M15 — Programmed Show 0.14.0 |
| Planned Version | 0.14.0-alpha |
| Start Date | 2026-10-27 |
| End Date | 2026-11-02 |
| Owner | Marcos Ferreira Mourão |

## 2. Sprint Goal

Pin cues to timestamps and fill the gaps automatically.

## 3. Sprint Backlog Items

| Issue | Title | Type | Priority | Status |
| ----- | ----- | ---- | -------- | ------ |
| VJLAB-80 | Fixed cue timestamps — anchor at mm:ss, predecessors refill, markers both surfaces | Feature | High | Done |
| VJLAB-81 | Proportional auto-distribution — even split over a reference space | Feature | High | Done |

## 4. Acceptance Criteria

### VJLAB-80

* Body cue anchors at absolute seconds (`startSec`, additive, clamped,
  persisted); fixed wins on conflict with documented overlap.
* `cueWindows` pins anchored starts; pilot, countdown, coverage and
  timeline read anchored windows with no extra work.
* Rows show a fixed marker `◈ m:ss` in the timing chip slot with anchor
  steppers (±5 s) and clear; popup edits via whitelisted command.
* Pool cues ignore anchors (off-timeline); anchor controls hidden there.

### VJLAB-81

* Distribute action evens unfixed body cues: gaps before fixed anchors
  split among unfixed predecessors (rounded, remainder to the last);
  negative gaps skipped; trailing unfixed cues untouched.
* Space priority: explicit space, else playlist target, else current
  total (equalize in place).
* Distribute button on the deck manager; pure helper fully tested.

## 5. Dependencies

| Dependency | Impact | Status |
| ---------- | ------ | ------ |
| VJLAB-78 | Anchored timeline base | Done |
| Shared lists | Single implementation | Ready |

## 6. Risks and Mitigations

| Risk | Mitigation |
| ---- | ---------- |
| Anchor/cursor conflict | Fixed wins, documented |
| Narrow-panel crowding | Marker reuses chip slot |
| Protocol doubling | Same command pattern as timing |

## 7. Definition of Done

* Code and docs updated together.
* `npm test`, `npm run build`, `npm run lint` green.
* Anchored dogfood on deck + popup.
* Release gate per project standards.

## 8. Revision History

| Version | Date | Change | Author |
| ------- | ---- | ------ | ------ |
| 1.0.0 | 2026-09-29 | Initial backlog for Sprint 37 | Marcos Ferreira Mourão |
