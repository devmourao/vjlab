# Sprint Backlog — Sprint 28

## 1. Sprint Identification

| Field | Information |
| ----- | ----------- |
| Project | VJ Lab |
| Sprint | Sprint 28 — Pack Format |
| Milestone | M12 — Scene Packs and Library v0.9.0 (part 2) |
| Planned Version | 0.9.0-beta |
| Start Date | 2027-01-26 |
| End Date | 2027-02-02 |
| Owner | Marcos Ferreira Mourão |

## 2. Sprint Goal

Ship the validated pack format.

## 3. Sprint Backlog Items

| Issue | Title | Type | Priority | Status |
| ----- | ----- | ---- | -------- | ------ |
| VJLAB-66 | Importable scene and media packs — versioned pack format with validator | Feature | High | New |

## 4. Acceptance Criteria

### VJLAB-66

* Header fields (format, version, kind, name, author, compatibility) are mandatory; missing headers reject the file.
* Every scene item is complete and deck-reactive with per-instance params inside declared ranges.
* The validator returns per-item accept/reject reasons, clamps out-of-range numbers with warnings, namespaces ids per pack, and rejects unknown bases without breaking the stage.
* Shipped presets round-trip through export and import unchanged.

## 5. Dependencies

| Dependency | Impact | Status |
| ---------- | ------ | ------ |
| Capability registry | Validation source | Planned (Sprint 27) |
| Behavior standard | Deck-reactive guarantee | Ready |

## 6. Risks and Mitigations

| Risk | Mitigation |
| ---- | ---------- |
| False rejections | Golden fixtures from shipped presets |
| Schema drift | Versioned format with additive-only minors |

## 7. Definition of Done

* Code and docs updated together.
* `npm test`, `npm run build`, `npm run lint` green.
* Fixture round-trip dogfood.
* Release gate per project standards.

## 8. Revision History

| Version | Date | Change | Author |
| ------- | ---- | ------ | ------ |
| 1.0.0 | 2026-09-23 | Initial backlog for Sprint 28 | Marcos Ferreira Mourão |
