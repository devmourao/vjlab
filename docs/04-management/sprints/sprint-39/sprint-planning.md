# Sprint Planning — Sprint 39

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
| Status | Planned |

## 2. Sprint Goal

Pin both ends of a cue and keep the show consistent.

Expected result: cues pin start, end or both (mm:ss inputs); overlaps
refuse with a named message; distribution shrinks predecessors to fit
end pins and carries a dirty dot; blank gaps warn in amber with
one-tap fill by duplicating the previous cue trimmed to the gap.

## 3. Relation to Project Brief

| Item | Reference |
| ---- | --------- |
| Project Objective | Browser instrument for VJs: playable, performant, and presentable live |
| Related Scope | Programmed Show: author against the track clock (§§21–22 of the brief) |
| Success Criteria Impacted | A cue runs exactly 0:43→1:11; conflicts never go silent |

## 4. Relation to Milestone

| Field | Information |
| ----- | ----------- |
| Current Milestone | M15 — Programmed Show 0.14.0 |
| Milestone Objective | Shows authored against the track clock |
| Expected Completion | VJLAB-90, VJLAB-91 fully |

## 5. Sprint Capacity

| Item | Value |
| ----- | ----- |
| Developers | 1 |
| Working Days | 5 |
| Available Hours | ~10 |
| Observations | Model plus row inputs; pilot untouched |

## 6. Selected Issues

| Issue | Type | Priority | Estimate | Owner |
| ----- | ---- | -------- | -------- | ----- |
| VJLAB-90 — End pins with overlap guard | Feature | High | L | Owner |
| VJLAB-91 — Distribution v2 with dirty dot and gap fill | Feature | High | L | Owner |

## 7. Prioritization

### High Priority

* `endSec` per body cue (additive, persisted, sanitized); end = fixed
  or start + duration; both-pinned derives duration and disables
  duration steppers with tooltip.
* Overlap guard: locked intervals `[start, end)` checked pairwise on
  computed body windows; conflicts render red, name both cues and block
  Distribute until resolved.
* Distribution v2: end pins shrink unfixed predecessors to fit (min 1 s
  each); leftovers surface as conflicts instead of silent overlaps.
* Dirty dot on Distribute after any duration/pin change; cleared by
  distributing.
* mm:ss masked inputs (numeric keyboard on mobile) for start/end;
  invalid input reverts with a hint, never writes garbage.
* Gap disclaimer: amber dashed spacer with "gap mm:ss, no cue" plus
  one-tap fill (duplicate previous cue trimmed to the gap); popup parity
  via whitelisted commands.

## 8. Dependencies

| Dependency | Impact | Owner |
| ---------- | ------ | ----- |
| VJLAB-80/81 anchors + distribution | Extended, not replaced | Done |
| cueWindows as single truth | Pilot, countdown, coverage follow | Done |

## 9. Sprint Risks

| Risk | Probability | Impact | Mitigation |
| ---- | ----------- | ------ | ---------- |
| Row crowding with two inputs | Medium | Medium | Inputs live in the anchor group (unit rows have room) |
| Refusal UX feels punitive | Low | Medium | Refusals name cues and offer the fix (clear/shrink) |
| Popup editing doubles work | Low | Low | Same command pattern as anchors |

## 10. Definition of Done (Sprint)

Standard project Definition of Done applies with no exceptions, plus an
anchored dogfood: pin 0:43→1:11, overlap a neighbor (refused + named),
shrink predecessors via Distribute, fill a gap in one tap.

Sprint 39 succeeds when pins persist, conflicts never go silent,
distribution respects every pin, gaps warn and fill, `npm test`,
`npm run build`, `npm run lint` are green, and docs match code.

## 11. Contingency Plan

* If scope overruns, ship VJLAB-90 (pins + guard) and follow with
  VJLAB-91 (distribution v2 + gaps).

## 12. Approval

| Role | Name | Date |
| ---- | ---- | ---- |
| Author | Marcos Ferreira Mourão | 2026-09-29 |
| Approver | Marcos Ferreira Mourão | 2026-09-29 |

## 13. Revision History

| Version | Date | Change | Author |
| ------- | ---- | ------ | ------ |
| 1.0.0 | 2026-09-29 | Initial planning for Pinned Ends | Marcos Ferreira Mourão |
