# Sprint Backlog — Sprint 31

## 1. Sprint Identification

| Field | Information |
| ----- | ----------- |
| Project | VJ Lab |
| Sprint | Sprint 31 — Preset Builder |
| Milestone | M10 — Builder & Media 0.11.0 (revived, part 1) |
| Planned Version | 0.11.0-alpha |
| Start Date | 2027-02-18 |
| End Date | 2027-02-25 |
| Owner | Marcos Ferreira Mourão |

## 2. Sprint Goal

Ship the redesigned visual preset builder.

## 3. Sprint Backlog Items

| Issue | Title | Type | Priority | Status |
| ----- | ----- | ---- | -------- | ------ |
| VJLAB-50 | Preset builder UI — browser, preview and knobs to assemble and save presets (redesigned) | Feature | Medium | New |

## 4. Acceptance Criteria

### VJLAB-50

* Base browser lists all native bases from the capability registry with descriptions.
* Live preview renders the draft in isolation (own mini canvas, read-only audio) without touching the live stage or store.
* Knobs render generically from registry schemas (numbers, image slots) and edit per-instance params.
* Save persists through create/update custom scene actions; saved presets validate through the pack validator.
* Reverted legacy builder stays untouched (already removed); no new data model is introduced.

## 5. Dependencies

| Dependency | Impact | Status |
| ---------- | ------ | ------ |
| Registry and CRUD | Browser, knobs and save path | Done |
| Pack validator | Save-time safety | Ready |

## 6. Risks and Mitigations

| Risk | Mitigation |
| ---- | ---------- |
| Live stage disturbance | Isolated preview, no writes until save |
| Per-base bespoke UI | Generic schema controls only |

## 7. Definition of Done

* Code and docs updated together.
* `npm test`, `npm run build`, `npm run lint` green.
* Builder dogfood with save and round-trip.
* Release gate per project standards.

## 8. Revision History

| Version | Date | Change | Author |
| ------- | ---- | ------ | ------ |
| 1.0.0 | 2026-09-23 | Initial backlog for Sprint 31 | Marcos Ferreira Mourão |
