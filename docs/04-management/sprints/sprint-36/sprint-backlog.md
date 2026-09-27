# Sprint Backlog — Sprint 36

## 1. Sprint Identification

| Field | Information |
| ----- | ----------- |
| Project | VJ Lab |
| Sprint | Sprint 36 — Track-Anchored Show |
| Milestone | M14 — Anchored Show 0.13.0 |
| Planned Version | 0.13.0-alpha |
| Start Date | 2026-10-20 |
| End Date | 2026-10-26 |
| Owner | Marcos Ferreira Mourão |

## 2. Sprint Goal

Anchor the show to the track and split pool from body.

## 3. Sprint Backlog Items

| Issue | Title | Type | Priority | Status |
| ----- | ----- | ---- | -------- | ------ |
| VJLAB-78 | Track-anchored pilot — elapsed IS track position, pool/body split, timed return | Feature | High | Done |
| VJLAB-79 | Resume action (Z) — re-sync to track point, transport button both surfaces | Feature | Medium | Done |

## 4. Acceptance Criteria

### VJLAB-78

* Audio mode: pilot reads track position directly (no anchor drift);
  play-from-start lands on the first body cue, play-from-middle on the
  cue of that timestamp, pause freezes, seek lands correctly.
* Pool = first 10 positions (manual-only, off-timeline); body = 11+
  with windows from track 0:00; ≤10 cues keeps today's pure-manual show.
* Auto pool cue: stage holds it for its duration, then dissolves to
  `cueIndexAt(trackNow)`; manual pool cue: holds with HOLD chip.
* Leaving a pool cue without an interrupt record resolves to the body
  cue (show start / playlist switch cases).
* Countdown, coverage total and timeline bars read body windows.
* Wall mode (no track): anchor math preserved, body from show start.

### VJLAB-79

* `show.resume` in `actionRegistry` (KeyZ, category Show, guide row):
  dissolves to the body cue under the playhead and clears interrupts;
  safe to hit anytime (re-sync gesture).
* Resume button beside Prev/Next/Cut on deck and popup (popup via
  existing `runAction` — no protocol change).
* `docs/03-design/keymap.md` updated (sync test); glossary gains
  Pool, Body, Resume.

## 5. Dependencies

| Dependency | Impact | Status |
| ---------- | ------ | ------ |
| VJLAB-73 | Pilot rework base | Done |
| runAction | Popup path | Done |

## 6. Risks and Mitigations

| Risk | Mitigation |
| ---- | ---------- |
| Wall-mode regression | Anchor path kept, audio short-circuits |
| Gesture confusion | Only Resume is new; Next/Prev stay positional |

## 7. Definition of Done

* Code and docs updated together.
* `npm test`, `npm run build`, `npm run lint` green.
* Track-anchored dogfood set on deck + popup.
* Release gate per project standards.

## 8. Revision History

| Version | Date | Change | Author |
| ------- | ---- | ------ | ------ |
| 1.0.0 | 2026-09-27 | Initial backlog for Sprint 36 | Marcos Ferreira Mourão |
