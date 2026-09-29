# Sprint Planning — Sprint 40

## 1. Sprint Identification

| Field | Information |
| ----- | ----------- |
| Project | VJ Lab |
| Sprint | Sprint 40 — Bound Shows |
| Milestone | M15 — Programmed Show 0.14.0 |
| Planned Version | 0.14.0-alpha |
| Start Date | 2026-11-17 |
| End Date | 2026-11-23 |
| Owner | Marcos Ferreira Mourão |
| Status | Planned |

## 2. Sprint Goal

Tie shows to tracks and cover player states.

Expected result: playlists bind to tracks by name (auto-switch on
load), one-tap autogen fills a show from the library order, and
pre/pause/post state cues answer the player (loaded-but-idle, paused,
ended).

## 3. Relation to Project Brief

| Item | Reference |
| ---- | --------- |
| Project Objective | Browser instrument for VJs: playable, performant, and presentable live |
| Related Scope | Programmed Show §§22–23: bindings plus special states |
| Success Criteria Impacted | A track without a show plays a generated one; pause shows pause |

## 4. Relation to Milestone

| Field | Information |
| ----- | ----------- |
| Current Milestone | M15 — Programmed Show 0.14.0 |
| Milestone Objective | Shows authored against the track clock |
| Expected Completion | VJLAB-82, VJLAB-83 (binding + autogen v1) fully |

## 5. Sprint Capacity

| Item | Value |
| ----- | ----- |
| Developers | 1 |
| Working Days | 5 |
| Available Hours | ~10 |
| Observations | Store plus manager UI; energy analysis stays in VJLAB-92 |

## 6. Selected Issues

| Issue | Type | Priority | Estimate | Owner |
| ----- | ---- | -------- | -------- | ----- |
| VJLAB-82 — Player state slots | Feature | High | L | Owner |
| VJLAB-83 — Binding plus autogen v1 | Feature | High | L | Owner |

## 7. Prioritization

### High Priority

* `audioStatus` (empty/pre/playing/paused/ended) bridged from the
  engine once per change; pilot answers paused→pause cue, ended→post
  cue, loaded-idle→pre cue; playing resumes the timeline untouched.
* Playlist carries optional `preCue`, `pauseCue`, `postCue` scene refs
  (additive, persisted, sanitized); manager assigns them via scene
  selects; unset slots change nothing (today's behavior).
* `trackBindings` (name→playlistId, versioned key) with bind/unbind on
  the manager; loading a bound track auto-switches the playlist.
* Autogen v1: body filled from library order at the playlist default
  duration over track/target/total space; no energy analysis yet
  (VJLAB-92), no tags yet — order is deterministic and documented.

## 8. Dependencies

| Dependency | Impact | Owner |
| ---------- | ------ | ----- |
| Engine fileName/isPlaying/position | Status bridge reads them | Done |
| Pilot + takeover | State cues dissolve through it | Done |

## 9. Sprint Risks

| Risk | Probability | Impact | Mitigation |
| ---- | ----------- | ------ | ---------- |
| Status flapping (pause vs ended) | Medium | Medium | Ended requires position at duration; pause is the rest |
| Autoswitch surprises mid-set | Low | High | Switch only on track load, never mid-playback |
| Autogen overwrites curation | Medium | Medium | Autogen only on explicit tap, into the active playlist body |

## 10. Definition of Done (Sprint)

Standard project Definition of Done applies with no exceptions, plus a
bound dogfood: bind a track, reload it (playlist follows), generate,
pause (pause cue), end (post cue).

Sprint 40 succeeds when states answer visibly, bindings persist,
autogen fills deterministically, `npm test`, `npm run build`,
`npm run lint` are green, and docs match code.

## 11. Contingency Plan

* If scope overruns, ship VJLAB-82 (states) and follow with VJLAB-83.

## 12. Approval

| Role | Name | Date |
| ---- | ---- | ---- |
| Author | Marcos Ferreira Mourão | 2026-09-29 |
| Approver | Marcos Ferreira Mourão | 2026-09-29 |

## 13. Revision History

| Version | Date | Change | Author |
| ------- | ---- | ------ | ------ |
| 1.0.0 | 2026-09-29 | Initial planning for Bound Shows | Marcos Ferreira Mourão |
