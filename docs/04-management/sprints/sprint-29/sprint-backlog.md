# Sprint Backlog — Sprint 29

## 1. Sprint Identification

| Field | Information |
| ----- | ----------- |
| Project | VJ Lab |
| Sprint | Sprint 29 — Scene CRUD |
| Milestone | M12 — Scene Packs and Library v0.9.0 (part 3, close) |
| Planned Version | 0.9.0 |
| Start Date | 2027-02-02 |
| End Date | 2027-02-09 |
| Owner | Marcos Ferreira Mourão |

## 2. Sprint Goal

Ship scene CRUD v1 with text export/import.

## 3. Sprint Backlog Items

| Issue | Title | Type | Priority | Status |
| ----- | ----- | ---- | -------- | ------ |
| VJLAB-68 | Scene CRUD v1 — create, edit and delete on native bases with text export/import | Feature | High | New |

## 4. Acceptance Criteria

### VJLAB-68

* Users create scenes from native bases, edit per-instance params from registry schemas, and delete custom scenes; native scenes are protected.
* Save exports a text file through the pack format; import validates with readable per-item reports.
* A re-imported scene plays identically with its per-instance config intact.
* No backend or account is required at any step.

## 5. Dependencies

| Dependency | Impact | Status |
| ---------- | ------ | ------ |
| Pack format | Export/import path | Planned (Sprint 28) |
| Registry | Editable fields | Planned (Sprint 27) |

## 6. Risks and Mitigations

| Risk | Mitigation |
| ---- | ---------- |
| Editor scope creep | Schema-driven generic controls only |
| Broken customs | Validator gate before save |

## 7. Definition of Done

* Code and docs updated together.
* `npm test`, `npm run build`, `npm run lint` green.
* Full authoring loop dogfood.
* Release gate per project standards.

## 8. Revision History

| Version | Date | Change | Author |
| ------- | ---- | ------ | ------ |
| 1.0.0 | 2026-09-23 | Initial backlog for Sprint 29 | Marcos Ferreira Mourão |
