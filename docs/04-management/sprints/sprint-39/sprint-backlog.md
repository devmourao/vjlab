# Sprint Backlog — Sprint 39

## 1. Sprint Identification

| Field | Information |
| ----- | ----------- |
| Project | VJ Lab |
| Sprint | Sprint 39 — Pinned Ends |
| Milestone | M15 — Programmed Show 0.14.0 |
| Planned Version | 0.14.0-alpha |
| Start Date | 2026-11-10 |
| End Date | 2026-11-16 |
| Owner | Marcos Ferreira Mourão |

## 2. Sprint Goal

Pin both ends of a cue and keep the show consistent.

## 3. Sprint Backlog Items

| Issue | Title | Type | Priority | Status |
| ----- | ----- | ---- | -------- | ------ |
| VJLAB-90 | End pins with overlap guard — endSec, mm:ss inputs, named refusals | Feature | High | Done |
| VJLAB-91 | Distribution v2 — shrink-to-fit, dirty dot, gap disclaimer with fill | Feature | High | Done |

## 4. Acceptance Criteria

### VJLAB-90

* `endSec` per body cue (additive, persisted, sanitized); end wins over
  duration; both-pinned derives duration and disables duration steppers.
* Locked intervals checked pairwise on body windows; conflicts render
  red rows, name both cues and block Distribute.
* mm:ss inputs (numeric keyboard) for start/end; invalid reverts.
* Pool ignores end pins; popup parity via whitelisted commands.

### VJLAB-91

* End pins shrink unfixed predecessors to fit (min 1 s); leftovers stay
  visible as conflicts, never silent overlaps.
* Distribute carries a dirty dot after any duration/pin change.
* Anchored gaps warn amber ("gap mm:ss, no cue") with one-tap fill
  duplicating the previous cue trimmed to the gap.

## 5. Dependencies

| Dependency | Impact | Status |
| ---------- | ------ | ------ |
| VJLAB-80/81 | Anchor model + distribution base | Done |

## 6. Risks and Mitigations

| Risk | Mitigation |
| ---- | ---------- |
| Row crowding | Inputs inside unit rows (room by design) |
| Punitive refusals | Named cues + offered fix |

## 7. Definition of Done

* Code and docs updated together.
* `npm test`, `npm run build`, `npm run lint` green.
* Anchored dogfood on deck + popup.
* Release gate per project standards.

## 8. Revision History

| Version | Date | Change | Author |
| ------- | ---- | ------ | ------ |
| 1.0.0 | 2026-09-29 | Initial backlog for Sprint 39 | Marcos Ferreira Mourão |
