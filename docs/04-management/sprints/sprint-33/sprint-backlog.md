# Sprint Backlog — Sprint 33

## 1. Sprint Identification

| Field | Information |
| ----- | ----------- |
| Project | VJ Lab |
| Sprint | Sprint 33 — Show Foundation |
| Milestone | M13 — Show Timeline 0.12.0 |
| Planned Version | 0.12.0-alpha |
| Start Date | 2026-09-28 |
| End Date | 2026-10-05 |
| Owner | Marcos Ferreira Mourão |

## 2. Sprint Goal

Lay the foundation every later Show feature consumes: vocabulary, model, clock.

## 3. Sprint Backlog Items

| Issue | Title | Type | Priority | Status |
| ----- | ----- | ---- | -------- | ------ |
| VJLAB-75 | Capability registry v2 — 4 param families mapping + spatial reference decisions | Refactor | Medium | Done |
| VJLAB-70 | Show/Cue data model — occurrence owns durationSec + follow, versioned persistence | Feature | High | Done |
| VJLAB-73 | Clock abstraction — audio/wall sources, seek-rebase policy, end-of-show, manual takeover | Feature | High | Done |

## 4. Acceptance Criteria

### VJLAB-75

* Every current param (`gain`, `speed`, `cameraSensitivity`, `zoom`, `map`)
  is mapped to one of the 4 families (Transport/Modulation/Color/Spatial).
* Spatial reference decisions (pivot vs camera target, normalized anchored
  XY, aspect policy, fixed Scale→Rotate→Translate order) are recorded in
  `docs/03-design/show-timeline-upgrade.md`.
* No renderer behavior changes; mapping only.

### VJLAB-70

* Cue = scene reference + `durationSec` (playlist default, editable per cue)
  + `follow` (`manual` default | `auto`).
* Duration belongs to the occurrence key, never to the scene; duplicate
  scenes may carry different durations.
* In/out derived by accumulated sum; show total exposed to UI.
* Persistence versioned with migration; deck positional shortcuts keep
  firing the cue at each position.

### VJLAB-73

* Single Clock abstraction; audio position source when a track plays,
  wall clock when the show runs standalone.
* Pause freezes auto-advance; seek rebases (skipped cues do not fire).
* End of show holds the last cue by default.
* Manual trigger moves the playhead to that cue and the pilot continues
  from there (pending section 11 confirmation).

## 5. Dependencies

| Dependency | Impact | Status |
| ---------- | ------ | ------ |
| Design doc section 11 answers | Model + clock semantics | Open |
| Pack/CRUD model (E12) | Show entries reference scenes | Done |

## 6. Risks and Mitigations

| Risk | Mitigation |
| ---- | ---------- |
| Clock semantics debated mid-sprint | Locked as preconditions before code |
| Model churn ripples to queue UI | Queue UX deferred to Sprint 34 |

## 7. Definition of Done

* Code and docs updated together.
* `npm test`, `npm run build`, `npm run lint` green.
* Timed fixture show dogfooded on deck (popup parity follows in Sprint 34).
* Release gate per project standards.

## 8. Revision History

| Version | Date | Change | Author |
| ------- | ---- | ------ | ------ |
| 1.0.0 | 2026-09-27 | Initial backlog for Sprint 33 | Marcos Ferreira Mourão |
