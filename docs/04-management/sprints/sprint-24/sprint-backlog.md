# Sprint Backlog — Sprint 24

## 1. Sprint Identification

| Field | Information |
| ----- | ----------- |
| Project | VJ Lab |
| Sprint | Sprint 24 — Deck Entry Sequence |
| Milestone | M11 — Web Experience (follow-up polish) |
| Planned Version | 0.6.2-alpha |
| Start Date | 2026-12-20 |
| End Date | 2026-12-27 |
| Owner | Marcos Ferreira Mourão |

## 2. Sprint Goal

Ship a focused entry sequence with a reusable track card.

## 3. Sprint Backlog Items

| Issue | Title | Type | Priority | Status |
| ----- | ----- | ---- | -------- | ------ |
| VJLAB-62 | Deck entry sequence — focus mode, staged reveal and reusable TrackCard ready for track queue | Enhancement | Medium | New |

## 4. Acceptance Criteria

### VJLAB-62

* Fresh deck with no track shows focus mode: hero player card plus tour step, with side desk panels collapsed.
* Loading a track advances the staged reveal toward scenes and performance controls.
* One TrackCard component renders the track on the empty state, the sheet audio tab and the control popup.
* The track model carries queue position so a future playlist plugs in without UI rewrite.
* No playlist UI is added in this sprint.

## 5. Dependencies

| Dependency | Impact | Status |
| ---------- | ------ | ------ |
| Tour and empty state | Entry phase hooks | Done |
| Audio engine | File loading contract | Ready |

## 6. Risks and Mitigations

| Risk | Mitigation |
| ---- | ---------- |
| Shared-card refactor sprawl | Single component with prop-driven rendering |
| Playlist scope creep | Model only; UI explicitly deferred |

## 7. Definition of Done

* Code and docs updated together.
* `npm test`, `npm run build`, `npm run lint` green.
* First-run dogfood with cleared storage on desktop and mobile.
* Release gate per project standards.

## 8. Revision History

| Version | Date | Change | Author |
| ------- | ---- | ------ | ------ |
| 1.0.0 | 2026-09-22 | Initial backlog for Sprint 24 | Marcos Ferreira Mourão |
