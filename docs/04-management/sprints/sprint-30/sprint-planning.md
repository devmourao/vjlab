# Sprint Planning — Sprint 30

## 1. Sprint Identification

| Field | Information |
| ----- | ----------- |
| Project | VJ Lab |
| Sprint | Sprint 30 — Playlists |
| Milestone | M9 — Playlists 0.10.0 (revived) |
| Planned Version | 0.10.0-alpha |
| Start Date | 2027-02-10 |
| End Date | 2027-02-17 |
| Owner | Marcos Ferreira Mourão |
| Status | Planned |

## 2. Sprint Goal

Ship session queues for media and scenes that feel like a native player.

Expected result: local media queue with reorder and load, plus scene setlist and favorites built on the existing library model — both without backend.

## 3. Relation to Project Brief

| Item | Reference |
| ---- | --------- |
| Project Objective | Browser instrument for VJs: playable, performant, and presentable live |
| Related Scope | Playlists — media queue and scene setlist |
| Success Criteria Impacted | Show preparation, many-scene ergonomics, playlist shareability |

## 4. Relation to Milestone

| Field | Information |
| ----- | ----------- |
| Current Milestone | M9 — Playlists 0.10.0 |
| Milestone Objective | Local queues for tracks and presets |
| Expected Completion | VJLAB-45 and VJLAB-46 fully (library CRUD already delivered via VJLAB-68) |

## 5. Sprint Capacity

| Item | Value |
| ----- | ----- |
| Developers | 1 |
| Working Days | 5 |
| Available Hours | ~10 |
| Observations | Store + UI only; packs already validate, no 3D or audio engine changes |

## 6. Selected Issues

| Issue | Type | Priority | Estimate | Owner |
| ----- | ---- | -------- | -------- | ----- |
| VJLAB-45 — Local media queue — add, reorder, load local tracks (session, url revoke) | Feature | Medium | M | Owner |
| VJLAB-46 — Scene setlist and favorites — queue, reorder, save and surface as shortcuts | Feature | Medium | M | Owner |

## 7. Prioritization

### High Priority

* VJLAB-45 — media queue is the daily driver; must handle object URLs safely.
* VJLAB-46 — setlist and favorites make many scenes navigable without new shortcuts.

### Medium Priority

* None in this sprint.

### Low Priority

* None in this sprint.

## 8. Dependencies

| Dependency | Impact | Owner |
| ---------- | ------ | ----- |
| Track model and TrackCard | Media queue reuses existing identity and card | Owner |
| Library model and pack validator | Setlist reuses ordering and favorites | Owner |
| Scene CRUD (VJLAB-68) | Custom scenes appear in setlist automatically | Owner |

## 9. Sprint Risks

| Risk | Probability | Impact | Mitigation |
| ---- | ----------- | ------ | ---------- |
| Object URL leaks on reorder/remove | Medium | Medium | Revoke on remove, clear on unload |
| Shortcut confusion for favorites | Low | Medium | Keep 1–6 as favorites chip, document in guide |

## 10. Definition of Done (Sprint)

Standard project Definition of Done applies with no exceptions, plus queue dogfood: load a pack, reorder, play through, persist across reload in session, export re-import.

Sprint 30 succeeds when a track queue survives reorder and load, a scene setlist reorders and favorites surface as 1–6, `npm test`, `npm run build`, `npm run lint` are green, and docs match code.

## 11. Contingency Plan

* If scope overruns, ship VJLAB-45 first (media queue) and defer setlist reorder to a follow-up without changing the model.

## 12. Approval

| Role | Name | Date |
| ---- | ---- | ---- |
| Author | Marcos Ferreira Mourão | 2026-09-23 |
| Approver | Marcos Ferreira Mourão | 2026-09-23 |

## 13. Revision History

| Version | Date | Change | Author |
| ------- | ---- | ------ | ------ |
| 1.0.0 | 2026-09-23 | Initial planning for Playlists | Marcos Ferreira Mourão |
