# Sprint Backlog — Sprint 38

## 1. Sprint Identification

| Field | Information |
| ----- | ----------- |
| Project | VJ Lab |
| Sprint | Sprint 38 — Show Editor |
| Milestone | M15 — Programmed Show 0.14.0 |
| Planned Version | 0.14.0-alpha |
| Start Date | 2026-11-03 |
| End Date | 2026-11-09 |
| Owner | Marcos Ferreira Mourão |

## 2. Sprint Goal

Read the show against the track and drive it from below.

## 3. Sprint Backlog Items

| Issue | Title | Type | Priority | Status |
| ----- | ----- | ---- | -------- | ------ |
| VJLAB-84 | Film-strip timeline part 1 — track ruler, playhead, visible in/out | Feature | High | Done |
| VJLAB-89 | Bottom transport — full TrackCard wiring plus show progress readout | Feature | High | Done |

## 4. Acceptance Criteria

### VJLAB-84 (part 1)

* Timeline bars keep proportional widths; each bar shows name, duration
  and explicit in/out (`1:43→2:13`).
* Track ruler behind/below the bars (0:00 → track end) with a playhead
  at the current position; without a track, ruler spans the body total
  and the playhead hides.
* Deck Library passes engine duration/position; popup passes snapshot
  values; no protocol change.
* Clicking a bar still dissolves to that cue on both surfaces.

### VJLAB-89

* Bottom-center bar scrubs (range input), ±10 s, elapsed/total times,
  queue prev/next, play/pause — Spotify-like, 44 px targets.
* Show readout beside transport: cue position i/n, scene name and
  show elapsed/total from the shared Clock.
* Hidden on small screens (bottom sheet owns playback) and hidden mode,
  as today; wider rounded-rectangle shell fits the scrub.

## 5. Dependencies

| Dependency | Impact | Status |
| ---------- | ------ | ------ |
| TrackCard props | Reuse | Done |
| Snapshot track fields | Popup ruler | Done |

## 6. Risks and Mitigations

| Risk | Mitigation |
| ---- | ---------- |
| Pill layout breaks | Rounded rect, wider shell |
| No track loaded | Body-total ruler, hidden playhead |

## 7. Definition of Done

* Code and docs updated together.
* `npm test`, `npm run build`, `npm run lint` green.
* Program-while-scrubbing dogfood on deck.
* Release gate per project standards.

## 8. Revision History

| Version | Date | Change | Author |
| ------- | ---- | ------ | ------ |
| 1.0.0 | 2026-09-29 | Initial backlog for Sprint 38 | Marcos Ferreira Mourão |
