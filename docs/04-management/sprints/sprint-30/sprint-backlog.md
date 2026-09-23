# Sprint Backlog — Sprint 30

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

## 2. Sprint Goal

Ship local queues for media and scenes.

## 3. Sprint Backlog Items

| Issue | Title | Type | Priority | Status |
| ----- | ----- | ---- | -------- | ------ |
| VJLAB-45 | Local media queue — queue, reorder and load local tracks (session) | Feature | Medium | New |
| VJLAB-46 | Scene setlist and favorites — queue, reorder and surface as shortcuts | Feature | Medium | New |

## 4. Acceptance Criteria

### VJLAB-45

* Add local files via picker adds to queue (name + object URL + Track id) and shows in list with position.
* Reorder via up/down, remove with revoke, load via click calls `engine.loadFile` and updates nowIndex.
* Queue is session-only (localStorage) with hint about local-file limitation; URLs revoked on remove and unload.
* PlayerBar and TrackCard show queue position `3/12` when applicable.

### VJLAB-46

* Setlist derives from all presets (native + custom) with library order; reorder via up/down updates persisted order.
* Favorites flag surfaces as numeric shortcuts 1–6 and as chips in the scene list; toggle favorite persists.
* No new scene geometry is added; reuses existing library model.

## 5. Dependencies

| Dependency | Impact | Status |
| ---------- | ------ | ------ |
| Track and library models | Queue foundations | Done |
| Pack validator | Import path for future packs | Ready |
| Scene CRUD | Custom scenes in queues | Done |

## 6. Risks and Mitigations

| Risk | Mitigation |
| ---- | ---------- |
| URL leaks | Revoke on remove/unload |
| Shortcut confusion | Guide copy and chip highlights |

## 7. Definition of Done

* Code and docs updated together.
* `npm test`, `npm run build`, `npm run lint` green.
* Live dogfood on desktop and mobile with local files.
* Release gate per project standards.

## 8. Revision History

| Version | Date | Change | Author |
| ------- | ---- | ------ | ------ |
| 1.0.0 | 2026-09-23 | Initial backlog for Sprint 30 | Marcos Ferreira Mourão |
