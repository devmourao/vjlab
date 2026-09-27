# Roadmap — VJ Lab

## Overview

Strategic evolution from blank stage to public MVP. Each phase has a clear exit criterion. No phase starts before the previous one is validated.

## Phases

### Phase 1 — Foundation

* Objective: blank 3D stage running at 60 FPS with tooling ready.
* Expected result: Vite + React + TypeScript + Tailwind verified; test runner green; ESLint clean; static cube rendering.
* Dependencies: none.
* Exit: `npm run dev` shows black stage + cube; `npm test`, `npm run build`, `npm run lint` pass.

### Phase 2 — Audio Engine

* Objective: prove the browser can read music.
* Expected result: local .mp3 upload; single AudioContext; analyser node; console spectrum showing bass pulsing with the beat.
* Dependencies: Phase 1.
* Exit: play track and observe normalized `{ bass, mids, treble }` in console.

### Phase 3 — Reactive Hello World

* Objective: first sound-reactive scene.
* Expected result: static cube connected to audio bus; scale pulses on bass with exponential smoothing; no per-frame React re-render.
* Dependencies: Phase 2.
* Exit: visual pulse in sync with kick, fluid motion.

### Phase 4 — VJ Desk

* Objective: turn the passive visualizer into a playable instrument.
* Expected result: keyboard desk (1–3 scenes, space strobe, B burst, arrows camera); global post-processing rig; strobe warning + kill switch.
* Dependencies: Phase 3.
* Exit: live direction without drop below 55 FPS on target machine.

### Phase 5 — Factory and Polish

* Objective: expand content and ship the portfolio MVP.
* Expected result: 3 base scenes + data presets; playlist queue; public deploy; release notes; documentation in sync.
* Dependencies: Phase 4.
* Exit: public URL + `v0.1.0` tag.

### Phase 6 — Live Control v0.2.0

* Objective: industry-standard live desk on top of the shipped MVP.
* Expected result: A/B transitions, palette system, continuous zoom, effect dry/wet, image texture on mesh, animated text overlay, strobe speed, global effects pack.
* Dependencies: Phase 5 released.
* Exit: v0.2.0 tag with live-control demo.

### Phase 7 — Stage Control v0.3.0 (planned)

* Objective: performance-ready control for live presentation without overwriting the existing keyboard desk.
* Expected result: panel visibility modes (docked / detached popup / hidden via U), fullscreen output (F11 + G alias), auto-pilot tour (A toggle, timed palette / camera / zoom / scene progression with guardrails).
* Dependencies: Phase 6 released (M6 closed).
* Exit: v0.3.0 tag with stage-control demo and updated keymap; no shortcut overlap verified in `useKeyboardDesk.ts`.

### Phase 8 — Show Timeline v0.12.0 (planned)

* Objective: turn the scene playlist into a timed Show that carries a full set.
* Expected result: Show/Cue model with per-occurrence duration and follow mode; Clock abstraction with documented seek policy; countdown queue UX; coverage meter against track or manual target; proportional timeline view; formalized per-base burst response (see `docs/03-design/show-timeline-upgrade.md`).
* Dependencies: Scene Packs and Library shipped (E12).
* Exit: v0.12.0 tag with a programmed set running ponta a ponta and updated glossary; manual takeover verified live.

## Out of Roadmap (Future Evolution)

* DJ routes with embedded audio, tab / system capture, photorealistic scenarios, procedural avatars, hardware LED integration.
* Show Phase B: beats/BPM coexistence (per-cue unit + tap-tempo), input recording engine on the same Clock, fit-show-to-track scaling, composite-base editor, true simultaneous multi-channel rendering (Unreal track).

## Revision History

| Version | Date | Change |
| ------- | ---- | ------ |
| 0.1.0 | 2026-09-11 | Initial roadmap |
| 0.2.0 | 2026-09-12 | Add Phase 6 Live Control v0.2.0 |
| 0.11.0 | 2026-09-27 | Add Phase 8 Show Timeline v0.12.0; park Phase B in Future Evolution |
