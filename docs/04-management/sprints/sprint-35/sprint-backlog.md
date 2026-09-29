# Sprint Backlog — Sprint 35

## 1. Sprint Identification

| Field | Information |
| ----- | ----------- |
| Project | VJ Lab |
| Sprint | Sprint 35 — Show Close |
| Milestone | M13 — Show Timeline 0.12.0 |
| Planned Version | 0.12.0 |
| Start Date | 2026-10-13 |
| End Date | 2026-10-19 |
| Owner | Marcos Ferreira Mourão |

## 2. Sprint Goal

Close M13: read the show as a timeline, formalize the burst, sync the words.

## 3. Sprint Backlog Items

| Issue | Title | Type | Priority | Status |
| ----- | ----- | ---- | -------- | ------ |
| VJLAB-72 | Proportional timeline view — duration bars, in/out ruler, total, click-to-cue (deck + popup) | Feature | High | Done |
| VJLAB-76 | Burst formalization — declared burstResponse per base, current coefficients as v1 defaults | Enhancement | Medium | Done |
| VJLAB-77 | Glossary + docs sync — Show/Cue/Clock/Takeover/Burst/Macro/Coverage | Documentation | Small | Done |

## 4. Acceptance Criteria

### VJLAB-72

* Shared `TimelineView`: one bar per cue, width proportional to its share
  of the show total, labeled with scene name + `mm:ss`.
* Accumulated in/out ruler plus show total; active bar shows the countdown.
* Clicking a bar dissolves to that cue (same action as row select).
* Deck feeds the live Clock; popup derives elapsed from snapshot position
  when audio-bound, static otherwise — no protocol change.
* Reading only: no drag, no editing in the view (steppers own that).
* 44 px bar targets minimum height; responsive panels; deck/popup parity.

### VJLAB-76

* `BaseCapability` declares `burst` with the current per-base response:
  same coefficients as today, moved verbatim, no feel change.
* All four scenes consume the registry value instead of literals.
* Global decay (`decayBurst`) and trigger path (`burst.fire` → liveRefs)
  unchanged; `burst.fire` stays recordable via `actionRegistry`.
* Shape-level burst amount knob explicitly deferred (documented, not built).

### VJLAB-77

* `docs/02-architecture/glossary.md` registers Show, Cue, Clock, Takeover,
  Burst, Macro, Coverage with industry equivalents.
* Guide/keymap verified: no new shortcuts in this epic, docs state so.
* `docs/03-design/show-timeline-upgrade.md` marked implemented with
  version + date; backlog statuses reflect Done.

## 5. Dependencies

| Dependency | Impact | Status |
| ---------- | ------ | ------ |
| VJLAB-70/71/73/74 | Windows, rows, Clock, coverage | Done |
| Snapshot timing | Popup needs nothing new | Done |

## 6. Risks and Mitigations

| Risk | Mitigation |
| ---- | ---------- |
| Timeline duplicates logic | Same helpers, no new state |
| Burst feel drift | Verbatim coefficients + dogfood |
| Glossary drift | Verify terms against code |

## 7. Definition of Done

* Code and docs updated together.
* `npm test`, `npm run build`, `npm run lint` green.
* M13 exit criteria met; v0.12.0 tag.
* Release gate per project standards.

## 8. Revision History

| Version | Date | Change | Author |
| ------- | ---- | ------ | ------ |
| 1.0.0 | 2026-09-27 | Initial backlog for Sprint 35 | Marcos Ferreira Mourão |
