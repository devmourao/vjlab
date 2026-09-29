# Project Brief — VJ Lab

## 1. Project Identification

| Field | Information |
| ----- | ----------- |
| Project Name | VJ Lab |
| Project Code | VJLAB |
| Initial Version | 0.1.0 |
| Creation Date | 2026-09-11 |
| Owner | Marcos Ferreira Mourão (@devmourao) |
| Status | Approved |

## 2. Executive Summary

VJ Lab is an interactive web-based Video Jockeying application and audio-reactive generative art instrument. It runs entirely in the browser and turns live music into real-time 3D visuals that can be played like an instrument via keyboard.

In the short term, the project delivers a public portfolio MVP built with React, Three.js (via React Three Fiber) and the Web Audio API. In the long term, it serves as an architectural laboratory for a professional 3D engine version.

## 3. Elevator Pitch

A browser instrument for VJs: drop a local .mp3, watch three distinct 3D scenes pulse with bass, mids and treble, switch scenes and fire global effects live from the keyboard — engineered as clean, data-driven modules that can be ported to a game engine later.

## 4. Problem

Live visual performers and creative developers lack a web instrument that is simultaneously:

* playable live (low-latency keyboard direction, scene playlist, global post-processing),
* architecturally clean (no render logic mixed with audio math or input state),
* reusable as a learning bridge toward professional engine development.

Ad-hoc visualizers quickly become unmaintainable spaghetti when audio analysis, state and rendering are coupled.

## 5. Opportunity

A well-structured web MVP demonstrates advanced software engineering (real-time DSP, 60 FPS rendering, modular scene factory, automated tests, documented architecture) for portfolio evaluators and recruiters, while validating interaction and mapping models that transfer almost directly to C++ / Blueprints systems later.

## 6. Objectives

### 6.1 Primary Objective

Ship a public, zero-cost web MVP that is usable live by a VJ, showcases advanced engineering in a portfolio, and establishes a portable architecture for a future engine version.

### 6.2 Secondary Objectives

* Implement a pure audio engine that outputs normalized spectrum data (bass, mids, treble in 0.0–1.0) from a local .mp3 via FFT.
* Implement three distinct base scenes built on a shared scene contract to prove the factory model.
* Implement a director layer (active scene, playlist 1–3, global effects such as strobe, VHS glitch, blur) driven by keyboard.
* Achieve stable 60 FPS on desktop with no per-frame React re-render for audio data.
* Publish the repository and a live demo with documentation, tests and release notes.

## 7. Initial Scope

### 7.1 Included

* Local .mp3 upload and playback with Web Audio API analyser node.
* Audio engine hook returning smoothed spectrum bands with interpolation (lerp) for fluid motion.
* Three distinct base 3D scenes sharing the same input contract (`audioData`, `triggers`, `params`):
  * particle system,
  * deformable mesh pulsing on bass,
  * camera tunnel / field reacting to mids and treble.
* Preset system: visual variants created by parameters only (color, physics, reactivity target, speed), without duplicating components.
* Keyboard desk: scene switch (1–3), explosion / particle burst trigger, global strobe, camera nudge with arrows.
* Playlist management (active scene queue).
* Static deployment and public repository.

### 7.2 Out of Scope (Future Evolution)

* Dynamic DJ routes with embedded audio tracks.
* Tab / system audio capture.
* Photorealistic scenarios and procedural avatar animation.
* Hardware lighting integration (addressable LED) via network controller.


## 8. Stakeholders

| Stakeholder | Role | Interest / Influence |
| ----------- | ---- | -------------------- |
| Marcos Ferreira Mourão | Owner / Developer | Vision, architecture, delivery / High |
| Guest DJs (e.g. showcase set) | Content partner | Predefined showcase track / Medium |
| Portfolio evaluators / recruiters | Audience | Code quality, live demo, documentation / Medium |
| VJ users | End users | Playability, performance, reliability / High |

## 9. Technologies

### 9.1 Languages

* TypeScript
* GLSL (minimal, only if required for custom shaders)

### 9.2 Frameworks / Libraries

* React 19
* Three.js via React Three Fiber and Drei
* Vite (build)
* Tailwind CSS (UI shell)
* Zustand for low-frequency UI state plus mutable refs for per-frame audio data (no per-frame re-render)

### 9.3 Tools

* Git + GitHub (Conventional Commits, Code Review via Pull Requests)
* Vitest (unit baseline, colocated `*.test.ts`)
* ESLint + TypeScript strict
* Docsify for local documentation preview (development only)

### 9.4 Platforms

* Modern desktop browsers (Chrome / Edge / Firefox) with WebGL2
* Static hosting for the web MVP

## 10. Constraints

* Zero cost: client-side only, no paid backend or media server.
* Browser autoplay policy: audio can only start after an explicit user gesture.
* Sustained 60 FPS on typical desktop GPU; audio processing must not block the render loop.
* Local files only in the MVP: no hosted copyrighted audio.
* Photosensitivity: strobe effect requires visible warning and an instant toggle.

## 11. Assumptions

* Vite + React project scaffold already exists and will be reused.
* Target devices have WebGL2 and a keyboard.
* Users provide their own .mp3 files for local analysis.
* Documentation is maintained alongside code (living documentation).

## 12. Initial Risks

| Risk | Impact | Initial Mitigation |
| ---- | ------ | ------------------ |
| Per-frame React re-render kills performance | High | Keep FFT data in refs; UI store holds only director state |
| Jittery motion without smoothing | Medium | Apply lerp / exponential smoothing in the audio engine |
| AudioContext leaks on track change | Medium | Single context with explicit dispose and reuse |
| Scope creep (routes, capture, photorealism in MVP) | High | Freeze MVP to local upload + 3 scenes; defer rest to backlog |
| Strobe accessibility incident | High | Warning banner + default off + single-key kill switch |

## 13. Success Criteria

The project is considered successful when:

* the live demo is publicly accessible with a local .mp3 driving all three scenes;
* bass pulses scale, mids / treble modulate color, lights and camera motion smoothly;
* keyboard direction (scene switch, burst, strobe) responds with imperceptible latency;
* automated tests, build and lint pass before every merge;
* documentation reflects the shipped code and architecture decisions.

## 14. High-Level Roadmap

| Phase | Objective |
| ----- | --------- |
| Foundation | Blank 3D stage at 60 FPS, static cube, tooling ready |
| Audio Engine | Local .mp3 FFT validated via console spectrum |
| Reactive Hello World | Cube pulsing on bass with smoothing |
| VJ Desk | Keyboard listeners, strobe post-processing, camera control |
| Factory and Polish | 3 base scenes + presets, playlist, public deploy |

## 15. Initial Milestones

| Milestone | Objective |
| --------- | --------- |
| Stage Ready | Toolchain, 60 FPS blank stage, test runner green |
| Sound Reactive | First geometry reacting to bass/mids/treble |
| Playable Instrument | Full keyboard desk with global effects |
| Public MVP 0.1.0 | Three scenes, playlist, deployed demo and release notes |

## 16. Dependencies

* Web Audio API analyser node availability.
* React Three Fiber / Drei compatibility with React 19.
* Static hosting for the demo.
* User-provided audio files.

## 17. Approval Criteria

This brief is approved when scope, objectives, stakeholders, technologies and initial risks above are accepted by the owner.

## 18. Approval

| Role | Name | Date |
| ---- | ---- | ---- |
| Author | Marcos Ferreira Mourão | 2026-09-11 |
| Reviewer | TBD |  |
| Approver | Marcos Ferreira Mourão | 2026-09-11 |

## 20. Long-Term Vision (Show Instrument)

VJLab evolves from a local-audio visualizer into a modular web instrument
for audio-reactive visuals: it interprets multiple audio sources (local
files, microphone, browser tabs, external links) and orchestrates them
through a dynamic, reactive timeline. The web app is the concept laboratory;
the Unreal engine version is the long-term professional target. Same
domain vocabulary, same content contracts, renderer behind a host seam.

## 21. Domain Dictionary (Core Concepts)

* Base: atomic visual element (particles, image mesh, fractal, tunnel and
  more) with its own params and a unique audio reaction. Split into atomic
  bases (code-backed) and composite bases (named content: ordered base
  refs plus param overrides).
* Scene: a combination of bases driven by shared global params. Authoring
  a base combination may save it as a Scene or as a composite base for
  reuse inside another composition.
* Cue: one occurrence of a Scene in a Show playlist. Carries individual
  params, a computed duration and entry/exit timestamps. Duration belongs
  to the occurrence (`key`), never to the scene.
* Show: a smart playlist composed of cues, with its own total runtime,
  read against a track duration, a manual target, or alone.

## 22. Playlist Rules

* Slots 1–10: favorite cues (hotkeys Digit1–Digit0). Fired manually, off
  the timed automation; the pilot never auto-targets them.
* Slot 11 onward: execution playlist (timeline). Cues bound to music time;
  with audio, show elapsed IS the track position.
* Hybrid behavior: automatic pilot by default. A manual trigger takes over
  (redirect); an `auto` interrupt returns to the cue programmed for that
  exact audio timestamp on expiry, a `manual` one holds for Resume (Z).
* A show may bind one or more playlists to a track; a playlist can be
  auto-generated to mirror a track duration (with pre-show, pause and
  post-show slots).

## 23. Special States

The show owns dedicated cues for Pre-show (track loaded, not started),
Pause (audio paused) and Post-show. Player states (pre/playing/paused/
post) fire timeline events; pause freezes the timeline instead of
rebasing it.

## 24. Revision History

| Version | Date | Change | Author |
| ------- | ---- | ------ | ------ |
| 0.1.0 | 2026-09-11 | Initial creation | Marcos Ferreira Mourão |
| 0.1.1 | 2026-09-11 | Trim future plans disclosure; add LED hardware as future evolution; approve | Marcos Ferreira Mourão |
| 0.2.0 | 2026-09-27 | Long-term show-instrument vision, domain dictionary, playlist rules, special states | Marcos Ferreira Mourão |
