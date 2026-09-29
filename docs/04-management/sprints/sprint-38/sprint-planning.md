# Sprint Planning — Sprint 38

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
| Status | Planned |

## 2. Sprint Goal

Read the show against the track and drive it from below.

Expected result: wider scenes column without overlap, bottom-center
transport with scrub plus show progress, and the Library Timeline as a
full edit mode — track ruler, playhead, explicit in/out per bar.

## 3. Relation to Project Brief

| Item | Reference |
| ---- | --------- |
| Project Objective | Browser instrument for VJs: playable, performant, and presentable live |
| Related Scope | Quick playlist (rows) vs full edit mode (timeline); program while watching |
| Success Criteria Impacted | Legible cue positions on the track; one-glance show progress |

## 4. Relation to Milestone

| Field | Information |
| ----- | ----------- |
| Current Milestone | M15 — Programmed Show 0.14.0 |
| Milestone Objective | Shows authored against the track clock |
| Expected Completion | VJLAB-84 (part 1: ruler, playhead, in/out), VJLAB-89 fully |

## 5. Sprint Capacity

| Item | Value |
| ----- | ----- |
| Developers | 1 |
| Working Days | 5 |
| Available Hours | ~10 |
| Observations | Shared components only; no model or protocol change |

## 6. Selected Issues

| Issue | Type | Priority | Estimate | Owner |
| ----- | ---- | -------- | -------- | ----- |
| VJLAB-84 — Film-strip timeline (part 1) | Feature | High | L | Owner |
| VJLAB-89 — Bottom transport with show progress | Feature | High | M | Owner |

## 7. Prioritization

### High Priority

* Scenes column 380 → 420 px (max-width guard kept); wrap stays as safety.
* PlayerBar becomes full transport: scrub, ±10 s, times, prev/next queue,
  plus show readout (cue i/n, name, elapsed/total) — same TrackCard
  wiring as the AudioPanel.
* TimelineView gains track ruler (0:00 → track end), playhead at the
  track position, and visible in/out per bar; Library passes engine
  values, popup passes snapshot values.

### Out of Scope

* Alternating border colors, granularity zoom, thumbnails (VJLAB-84
  remainder, next sprint); anchor editing inside bars (rows own it).

## 8. Dependencies

| Dependency | Impact | Owner |
| ---------- | ------ | ----- |
| TrackCard transport props | Reused verbatim in PlayerBar | Done |
| Snapshot duration/position | Popup ruler needs nothing new | Done |

## 9. Sprint Risks

| Risk | Probability | Impact | Mitigation |
| ---- | ----------- | ------ | ---------- |
| PlayerBar pill breaks with scrub | Medium | Low | Rounded rect + wider max-width, dogfood at 1280 px |
| Playhead without track | Low | Low | Ruler falls back to body total, playhead hidden |

## 10. Definition of Done (Sprint)

Standard project Definition of Done applies with no exceptions, plus
dogfood: program cues while scrubbing the bottom transport and reading
positions on the timeline ruler.

Sprint 38 succeeds when cue in/out read on the ruler, the playhead
tracks the track, the bottom bar scrubs with show progress, `npm test`,
`npm run build`, `npm run lint` are green, and docs match code.

## 11. Contingency Plan

* If scope overruns, ship transport + ruler first, in/out labels follow.

## 12. Approval

| Role | Name | Date |
| ---- | ---- | ---- |
| Author | Marcos Ferreira Mourão | 2026-09-29 |
| Approver | Marcos Ferreira Mourão | 2026-09-29 |

## 13. Revision History

| Version | Date | Change | Author |
| ------- | ---- | ------ | ------ |
| 1.0.0 | 2026-09-29 | Initial planning for Show Editor | Marcos Ferreira Mourão |
