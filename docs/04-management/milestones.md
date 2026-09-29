# Milestones — VJ Lab

## M1 — Stage Ready

* Objective: toolchain and blank stage validated.
* Expected deliveries: Vite dev server, static 3D stage, Vitest smoke test, ESLint baseline.
* Completion criteria: `npm test`, `npm run build`, `npm run lint` green; 60 FPS blank stage.
* Expected evidence: demo screenshot, test output.
* Approver: Owner.

## M2 — Sound Reactive

* Objective: audio engine validated end to end.
* Expected deliveries: .mp3 upload, FFT bands, console spectrum, first reactive geometry.
* Completion criteria: bass drives scale smoothly; no per-frame re-render; single AudioContext with dispose.
* Expected evidence: screen recording, console log sample.
* Approver: Owner.

## M3 — Playable Instrument

* Objective: live direction validated.
* Expected deliveries: keyboard desk, playlist 1–3, burst trigger, strobe / glitch / blur rig with warning and kill switch.
* Completion criteria: all shortcuts respond instantly; strobe defaults off; docs updated.
* Expected evidence: shortcut map, demo video.
* Approver: Owner.

## M4 — Public MVP 0.1.0

* Objective: portfolio release published.
* Expected deliveries: 3 base scenes + presets, deployed demo, release notes, synced docs.
* Completion criteria: public URL live; `v0.1.0` tag; release gate (tests, build, lint) green; documentation matches code.
* Expected evidence: URL, tag, release notes.
* Approver: Owner.

## M5 — Live Control 0.2.0

* Objective: industry-standard live desk on top of the shipped MVP.
* Expected deliveries: A/B transitions, palette system, continuous zoom, effect dry/wet, image texture on mesh, animated text overlay, strobe speed, global effects pack.
* Completion criteria: preset-driven direction with mix bars; transitions and palettes validated on live audio; release gate green.
* Expected evidence: demo video, keymap reference.
* Approver: Owner.

## M6 — Polish 0.2.1

* Objective: identity and weak-GPU safety closing the portfolio release.
* Expected deliveries: strobe modes, metadata module and version seal, About panel, lite mode with pixel-ratio and effect caps, rename and branding.
* Completion criteria: seal shows real version; About lists author links; lite mode visibly relieves weak GPUs; docs in sync.
* Expected evidence: deployed URL, release notes v0.2.1.
* Approver: Owner.

## M7 — Stage Control 0.3.0

* Objective: performance-ready stage control without breaking the existing keyboard desk.
* Expected deliveries: panel visibility modes (docked / detached popup / hidden), fullscreen output, auto-pilot tour with timed transitions.
* Completion criteria: U cycles panel states without overwriting any shortcut in `useKeyboardDesk.ts`; G/F11 enters fullscreen and coordinates with hidden panel; A toggles auto-pilot and respects post-processing isolation (no UV / convolution conflict); architecture and docs remain in sync.
* Expected evidence: keymap delta, stage control demo.
* Approver: Owner.

## M8 — Desk Research

* Objective: shortcut system audited against industry practice.
* Expected deliveries: Resolume/VDMX vs VJ Lab shortcut audit and optimization proposal.
* Completion criteria: keyboard ergonomics review published; no conflicting bindings.
* Expected evidence: `03-design/keyboard-ergonomics-review.md`.
* Approver: Owner.

## M9 — Playlists 0.4.0

* Objective: queues for music and effects presets.
* Expected deliveries: local music queue (session persistence, reorder, load), effects preset queue.
* Completion criteria: queue, reorder and load local tracks; save effect presets as playlist.
* Expected evidence: demo video, keymap reference.
* Approver: Owner.

## M10 — Builder & Media 0.5.0

* Objective: preset authoring and new media-capable bases.
* Expected deliveries: preset builder redesign, Grid LED and Avatar scenes, preset export/import (versioned JSON), video frame, fractal full-screen.
* Completion criteria: create/edit/delete presets on native bases; export/import round-trips; release gate green.
* Expected evidence: builder demo, sample pack file.
* Approver: Owner.

## M11 — Web Experience 0.6.0

* Objective: presentable, responsive, onboardable browser instrument.
* Expected deliveries: landing route, responsive shell standard, unified side panels, dedicated player area, explicit hide vs pop-out, detached second-screen popup + polish round.
* Completion criteria: one control language on deck and popup; first-run tour live; docs in sync.
* Expected evidence: deployed URL, release notes.
* Approver: Owner.

## M12 — Scene Packs and Library 0.9.0

* Objective: shareable scene content on a solid instance foundation.
* Expected deliveries: `instances[]` composition, per-instance asset slots, base capability registry, versioned pack format with validator, scene CRUD with export/import.
* Completion criteria: packs import through the validator with clean rejection; playlist born from CRUD.
* Expected evidence: sample pack, validator test output.
* Approver: Owner.

## M13 — Show Timeline 0.12.0

* Objective: a timed Show runs a full set ponta a ponta with programmed scene durations.
* Expected deliveries: Show/Cue versioned model, Clock abstraction (audio/wall) with seek-rebase policy, timed queue UX with countdown, coverage meter vs track or manual target, proportional timeline view, declared per-base burst response, glossary sync.
* Completion criteria: 40-minute-style set runs with auto-advance and live countdown; any manual trigger redirects the pilot without breaking it; seek visibly rebases the show; deck and popup stay in parity; release gate green.
* Expected evidence: full-set demo video, timeline screenshot, test output.
* Approver: Owner.

## M14 — Anchored Show 0.13.0

* Objective: the track position alone predicts the stage, with live interrupts.
* Expected deliveries: track-anchored pilot (audio = clock, wall fallback), interrupt pool (positions 1–10) with timed return, body timeline (11+) from track 0:00, Resume action (Z) plus transport button on both surfaces.
* Completion criteria: play-from-start and play-from-middle land on the right cue; auto pool cues return on time; manual pool cues hold for Z; ≤10-cue shows stay pure manual; release gate green.
* Expected evidence: anchored-set demo video, test output.
* Approver: Owner.

## M15 — Programmed Show 0.14.0

* Objective: shows authored against the track clock, not just played on it.
* Expected deliveries: fixed cue timestamps with predecessor redistribution, proportional auto-distribution, pre/pause/post state slots, explicit track-to-playlists binding with auto-generation, film-strip timeline (both orientations, granularity zoom, playhead), per-cue transition modes.
* Completion criteria: anchoring a cue at 1:43 refills predecessors; empty space divides evenly; pause shows the pause cue; film-strip reads proportionally with a moving playhead; release gate green.
* Expected evidence: programmed-set demo video, test output.
* Approver: Owner.

## M16 — Audio Provider 0.15.0

* Objective: the core no longer knows where audio comes from.
* Expected deliveries: AudioProvider contract, local player refactored onto it, player-state events driving timeline slots, a second source plugin.
* Completion criteria: local playback byte-identical in feel; pause/pre states fire timeline slots; a second origin plugs without core changes.
* Expected evidence: provider test output, demo video.
* Approver: Owner.

## Revision History

| Version | Date | Change |
| ------- | ---- | ------ |
| 0.1.0 | 2026-09-11 | Initial milestones |
| 0.2.1 | 2026-09-16 | Add M5 Live Control, M6 Polish, M7 Stage Control for panel / fullscreen / auto-pilot |
| 0.11.0 | 2026-09-27 | Backfill M8 Playlists-era through M12 Packs/Library; add M13 Show Timeline 0.12.0 |
| 0.13.0 | 2026-09-29 | Add M14 Anchored Show 0.13.0, M15 Programmed Show 0.14.0, M16 Audio Provider 0.15.0 |
