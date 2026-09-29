# ADR-001 — Audio Source Provider Abstraction

| Field | Value |
| ----- | ----- |
| Status | Accepted (refactor scheduled, not started) |
| Date | 2026-09-27 |
| Scope | `src/audio/*` vs director engine and timeline |

## Context

Visual reactivity and the show timeline are coupled to the local audio
player (`.mp3` files via a single `AudioContext` + analyser node). The
long-term vision requires microphone, browser-tab capture and external
links (SoundCloud/YouTube) as interchangeable audio origins, each with
its own lifecycle but one shared contract downstream.

## Decision

Introduce an `AudioProvider` interface between audio origins and the
core. The timeline, cues and pilot consume a standardized stream only —
frequency bands, BPM (when known), transport status (pre/playing/paused/
post) and position seconds. They never know where the audio comes from.
Each origin (local player first, then mic/tabs/links) implements the
interface as an independent plugin behind the same seam.

## Positive Consequences

* New timeline UI and show logic grow without breaking the current player.
* New audio origins land as isolated plugins (one epic per source).
* Player states become timeline events (pre-show, pause, post-show cues).

## Negative Consequences

* The local player must be refactored onto the new contract (engine owns
  no analyser internals anymore).
* Transport edge cases (unmeasurable duration on streams, mic with no
  position) need explicit per-provider policies.

## References

* Project Brief §§20–23 (vision, domain, playlist rules, special states).
* `docs/03-design/show-timeline-upgrade.md` §§3–10 (Clock, takeover, coverage).
