# Sprint Backlog — Sprint 40

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

## 2. Sprint Goal

Tie shows to tracks and cover player states.

## 3. Sprint Backlog Items

| Issue | Title | Type | Priority | Status |
| ----- | ----- | ---- | -------- | ------ |
| VJLAB-82 | Player state slots — pre/pause/post cues answering the engine | Feature | High | Done |
| VJLAB-83 | Binding plus autogen v1 — name-bound playlists, library-order fill | Feature | High | Done |

## 4. Acceptance Criteria

### VJLAB-82

* `audioStatus` derived once per change (empty/pre/playing/paused/ended).
* Playlist carries optional `preCue`, `pauseCue`, `postCue` scene refs;
  manager assigns via scene selects; unset slots change nothing.
* Pilot dissolves to the state cue on paused/ended/loaded-idle and
  never fights playback; playing resumes the timeline untouched.

### VJLAB-83

* `trackBindings` persisted (name→playlistId); manager binds/unbinds;
  loading a bound track switches the playlist (on load only).
* Autogen v1 fills the body from library order at the default duration
  over track/target/total space, on explicit tap only.

## 5. Dependencies

| Dependency | Impact | Status |
| ---------- | ------ | ------ |
| Engine readings | Status bridge | Ready |
| Pilot/takeover | State dissolves | Done |

## 6. Risks and Mitigations

| Risk | Mitigation |
| ---- | ---------- |
| Status flapping | Ended gated on position at duration |
| Surprise autoswitch | On load only |

## 7. Definition of Done

* Code and docs updated together.
* `npm test`, `npm run build`, `npm run lint` green.
* Bound dogfood on deck.
* Release gate per project standards.

## 8. Revision History

| Version | Date | Change | Author |
| ------- | ---- | ------ | ------ |
| 1.0.0 | 2026-09-29 | Initial backlog for Sprint 40 | Marcos Ferreira Mourão |
