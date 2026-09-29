# Initial Backlog — VJ Lab

> Consolidated view. Operational detail lives in the issue tracker. Status: `New` unless noted.

## Epics

* E01 — Foundation and tooling
* E02 — Audio engine
* E03 — Reactive stage
* E04 — VJ desk and effects
* E05 — Factory, playlist and release
* E06 — Live Control v0.2.0 (industry desk: transitions, palettes, zoom, mix, image, text, global effects)
* E07 — Polish and identity v0.2.1 (color, strobe modes, site metadata, rename)
* E08 — Stage Control v0.3.0 (panel modes, fullscreen output, auto-pilot tour, desk status HUD)
* E09 — Playlists v0.4.0 (local music queue and effects preset queue)
* E10 — Builder & Media v0.5.0 (preset builder, video frame, elemental library, export/import)
* E11 — Web Experience v0.6.0 (landing, responsive shell, panel visibility, onboarding guide)
* E12 — Scene Packs and Library v0.9.0 (instance foundation, pack format, scene CRUD)
* E13 — Show Timeline v0.12.0 (timed cues, auto-advance, clock, coverage, visual timeline)
* E14 — Anchored Show v0.13.0 (track-anchored pilot, interrupt pool/body split, resume)
* E15 — Programmed Show v0.14.0 (fixed cues, redistribution, state slots, track binding, film-strip timeline)
* E16 — Audio Provider v0.15.0 (provider abstraction, local refactor, state events, second source)

## Items

| ID | Title | Category | Priority | Epic | Milestone | Status |
| -- | ----- | -------- | -------- | ---- | --------- | ------ |
| VJLAB-01 | Scaffold blank 3D stage at 60 FPS | Infrastructure | High | E01 | M1 | New |
| VJLAB-02 | Install 3D and state stack (three, fiber, drei, zustand, postprocessing) | Chore | High | E01 | M1 | New |
| VJLAB-03 | Add Vitest smoke test + lint baseline | Test | High | E01 | M1 | New |
| VJLAB-04 | Implement local .mp3 upload + AudioContext lifecycle | Feature | High | E02 | M2 | New |
| VJLAB-05 | Implement spectrum engine with smoothing (bass/mids/treble 0–1) | Feature | High | E02 | M2 | New |
| VJLAB-06 | Validate spectrum via console log | Test | High | E02 | M2 | New |
| VJLAB-07 | Connect spectrum to static cube with lerp | Feature | High | E03 | M2 | New |
| VJLAB-08 | Define shared scene contract + audio bus | Refactor | High | E03 | M2 | New |
| VJLAB-09 | Implement keyboard desk (1–3, space, B, arrows, S) | Feature | High | E04 | M3 | New |
| VJLAB-10 | Implement global post-processing rig with strobe warning | Feature | High | E04 | M3 | New |
| VJLAB-11 | Implement particle field base scene | Feature | Medium | E05 | M4 | New |
| VJLAB-12 | Implement deformable mesh base scene | Feature | Medium | E05 | M4 | New |
| VJLAB-13 | Implement tunnel field base scene | Feature | Medium | E05 | M4 | New |
| VJLAB-14 | Implement preset system (variants as data) | Feature | Medium | E05 | M4 | New |
| VJLAB-15 | Implement playlist queue | Feature | Medium | E05 | M4 | New |
| VJLAB-16 | Publish demo + release notes v0.1.0 | Documentation | Medium | E05 | M4 | New |
| VJLAB-17 | Sync docs with shipped code | Documentation | Medium | E05 | M4 | New |
| VJLAB-18 | A/B scene transition with duration + hard cut | Feature | High | E06 | M5 | New |
| VJLAB-19 | Palette system (background vs mesh + hue shift) | Feature | High | E06 | M5 | New |
| VJLAB-20 | Continuous zoom control (damped) | Feature | Medium | E06 | M5 | New |
| VJLAB-21 | Effect intensity dry/wet per effect + master | Feature | Medium | E06 | M5 | New |
| VJLAB-22 | Image texture layer on mesh (upload + blend) | Feature | Medium | E06 | M5 | New |
| VJLAB-23 | Text overlay global effect (editable, animated) | Feature | Medium | E06 | M5 | New |
| VJLAB-24 | Strobe speed configuration | Feature | Medium | E06 | M5 | New |
| VJLAB-25 | Global effects pack (VHS glitch, RGB split, mirror, shake, pixelate, grain, beat flash) | Feature | Low | E06 | M5 | New |
| VJLAB-26 | Layout-independent keymap aliases + visible mix bars | UX fix | High | E06 | M5 | New |
| VJLAB-27 | Stronger color controls (future reflection) | Research | Low | E06 | M6 | New |
| VJLAB-28 | Strobe modes white/black/color flash | Feature | Medium | E06 | M6 | New |
| VJLAB-29 | Lite performance mode (pixel ratio + effect caps for weak GPUs) | Feature | Medium | E06 | M6 | New |
| VJLAB-30 | Site metadata module + version seal + About panel | Feature | Small | E06 | M6 | New |
| VJLAB-31 | Rename repo and domain music to vjlab | Chore | Small | E07 | M6 | New |
| VJLAB-32 | Beat flash color treatment (washed on saturated palettes) | UX fix | Small | E06 | M6 | New |
| VJLAB-33 | Product wordmark and custom favicon for brand identity | Design | Small | E07 | M6 | New |
| VJLAB-34 | Package version follows releases (seal shows real version) | Fix | Small | E07 | M6 | New |
| VJLAB-35 | Post-chain freeze when combining VHS and chromatic aberration | Bug | High | E07 | M6 | New |
| VJLAB-36 | Industry-standard post-effect labels in UI and keymap | UX | Small | E07 | M6 | New |
| VJLAB-37 | Panel visibility modes — docked / detached popup / hidden (cycle via U, no overlap with existing desk) | Feature | Medium | E08 | M7 | New |
| VJLAB-38 | Fullscreen output — native F11 plus G alias with safe exit and hidden-panel coordination | Feature | Medium | E08 | M7 | New |
| VJLAB-39 | Auto-pilot tour — timed palette / camera / zoom / scene tour with pause and audio-reactive guardrails | Feature | Medium | E08 | M7 | New |
| VJLAB-40 | Desk status pills and mode color — VHS/RGB/BEAT/BYPASS/LITE and strobe mode as color-coded pills | Enhancement | Medium | E08 | M7 | New |
| VJLAB-41 | Desk mini-bars for continuous params — strobe Hz, zoom, hue and transition duration as bars reusing mix-track | Enhancement | Medium | E08 | M7 | New |
| VJLAB-42 | Desk grouping and burst badge — grouped sections, burst counter badge, remove master duplication | Enhancement | Medium | E08 | M7 | New |
| VJLAB-43 | Keyboard ergonomics review — Resolume/VDMX vs VJ Lab shortcut audit and optimization proposal | Research | Medium | E08 | M8 | New |
| VJLAB-44 | Strobe color reinforcement — swatch, glow and Hz bar tint for strobe mode | Enhancement | Small | E08 | M7 | New |
| VJLAB-45 | Local music playlist — queue, reorder and load local tracks (session) | Feature | Medium | E09 | M9 | New |
| VJLAB-46 | Effects preset playlist — queue, reorder and save effect presets as playlist | Feature | Medium | E09 | M9 | New |
| VJLAB-50 | Preset builder UI redesigned — base browser, isolated live preview and schema knobs on registry/CRUD foundation (Sprint 31) | Feature | Medium | E10 | M10 | New |
| VJLAB-51 | Grid LED scene — Punch Club image + LED points reactive to bass/mids (Octagon Pulse) | Feature | Medium | E10 | M10 | New |
| VJLAB-52 | Avatar low-poly scene — human GLB with edge/fill materials and audio-driven bounce/sway (Chroma Bouncer) | Feature | Medium | E10 | M10 | New |
| VJLAB-53 | Preset export/import — JSON file without DB, versioned schema | Feature | Medium | E10 | M10 | New |
| VJLAB-54 | Video frame — local video as VideoTexture in scene frame with audio analysis | Feature | Medium | E10 | M10 | New |
| VJLAB-55 | Fractal full-screen — Mandelbrot/Julia shader with zoom/rotation reactive to bass/mids | Feature | Medium | E10 | M10 | New |
| VJLAB-56 | Landing route with presentation page and deck entry | Feature | High | E11 | M11 | New |
| VJLAB-57 | Evolve panel visibility with floating toggle and top bar | Feature | High | E11 | M11 | New |
| VJLAB-58 | Mobile bottom sheet with Audio / Scenes / FX / Guide tabs | Feature | High | E11 | M11 | New |
| VJLAB-59 | First-run tour with help drawer and empty-state guide | Feature | Medium | E11 | M11 | New |
| VJLAB-60 | Detached second-screen popup with synced controls for clean fullscreen output | Feature | Medium | E11 | M11 | New |
| VJLAB-61 | Responsive shell standard — unify breakpoints, safe-area and control surface per UX best practices (queued after Sprint 22) | Enhancement | Medium | E11 | M11 | New |
| VJLAB-62 | Deck entry sequence — focus mode, staged reveal and reusable TrackCard ready for track queue (queued after Sprint 22) | Enhancement | Medium | E11 | M11 | New |
| VJLAB-63 | Unify side panels — retire right desk, docked uses left tabbed scrollable panel (Track / Scenes / FX / Guide) | Refactor | High | E11 | M11 | New |
| VJLAB-64 | Dedicated player area with track info and transport plus library / setlist / favorites scene model (UI setlist deferred) | Feature | High | E11 | M11 | New |
| VJLAB-65 | Explicit hide vs pop-out controls — Hide UI never opens popups or exits fullscreen (Sprint 26) | UX fix | High | E11 | M11 | New |
| VJLAB-66 | Importable scene and media packs — versioned pack format with validator (complete deck-reactive scenes, per-instance params, clean rejection) | Feature | High | E12 | M12 | New |
| VJLAB-67 | Instance-scoped scene foundation — single instances[] composition, per-instance asset slots, base capability registry | Refactor | High | E12 | M12 | New |
| VJLAB-68 | Scene CRUD v1 — create, edit and delete on native bases with text export/import (playlist born here) | Feature | High | E12 | M12 | New |
| VJLAB-69 | Popup polish round — shared control kit, strobe switch and color radio with swatches, active flags, per-slot sliders, fullscreen layout, retire DETACHED pill | Enhancement | Medium | E11 | M11 | New |
| VJLAB-70 | Show/Cue data model — occurrence owns durationSec + follow, versioned persistence (design doc `03-design/show-timeline-upgrade.md` D1) | Feature | High | E13 | M13 | Done |
| VJLAB-71 | Timed queue UX — inline duration stepper, Manual/Auto toggle per cue, countdown, show totals (D2 Play/Shape) | Feature | High | E13 | M13 | Done |
| VJLAB-72 | Proportional timeline view — duration bars, accumulated in/out ruler, show total (D2 Build) | Feature | Medium | E13 | M13 | Done |
| VJLAB-73 | Clock abstraction — audio/wall sources, seek-rebase policy, end-of-show, manual takeover (D3) | Feature | High | E13 | M13 | Done |
| VJLAB-74 | Coverage meter — bound-track duration, else manual target, else total only | Feature | Medium | E13 | M13 | Done |
| VJLAB-75 | Capability registry v2 — 4 param families mapping + spatial reference decisions (D4 design spike) | Refactor | Medium | E13 | M13 | Done |
| VJLAB-76 | Burst formalization — declared burstResponse per base, current coefficients as v1 defaults | Enhancement | Medium | E13 | M13 | Done |
| VJLAB-77 | Glossary + docs sync — Show/Cue/Clock/Takeover/Burst/macros | Documentation | Small | E13 | M13 | Done |
| VJLAB-78 | Track-anchored pilot — elapsed IS track position, pool/body split, timed return | Feature | High | E14 | M14 | Done |
| VJLAB-79 | Resume action (Z) — re-sync to track point, transport button both surfaces | Feature | Medium | E14 | M14 | Done |
| VJLAB-80 | Fixed cue timestamps with predecessor redistribution (anchor at mm:ss, fill the gap) | Feature | High | E15 | M15 | Done |
| VJLAB-81 | Proportional auto-distribution of unfixed cues into empty space | Feature | High | E15 | M15 | Done |
| VJLAB-82 | Pre-show, pause and post-show state slots bound to player states | Feature | Medium | E15 | M15 | New |
| VJLAB-83 | Explicit track-to-playlists binding plus auto-generate playlist from track | Feature | Medium | E15 | M15 | New |
| VJLAB-84 | Film-strip timeline (horizontal/vertical, proportional thumbs, alternating borders, granularity zoom, playhead) | Feature | High | E15 | M15 | New |
| VJLAB-85 | Per-cue transition modes (cut/dissolve select) | Enhancement | Low | E15 | M15 | New |
| VJLAB-86 | AudioProvider interface plus local player refactor onto the contract | Refactor | High | E16 | M16 | New |
| VJLAB-87 | Player-state events (pre/playing/paused/post) driving timeline slots | Feature | Medium | E16 | M16 | New |
| VJLAB-88 | Second audio source plugin on the provider contract | Feature | Medium | E16 | M16 | New |

## Dependencies

* VJLAB-05 blocks VJLAB-07.
* VJLAB-08 blocks VJLAB-11 to VJLAB-15.
* VJLAB-07 blocks VJLAB-09.
* VJLAB-11 to VJLAB-13 block VJLAB-14.
* VJLAB-14 and VJLAB-15 block the v0.1.0 release.
* VJLAB-18 blocks beat-synced auto-cut (follow-up).
* VJLAB-19 blocks VJLAB-22 (image blend uses palettes).
* VJLAB-63 and VJLAB-64 block VJLAB-65 (explicit controls build on the unified shell).
* VJLAB-67 blocks VJLAB-66 (pack validator needs the per-instance model and capability registry).
* VJLAB-66 blocks VJLAB-68 (CRUD imports through the pack format).
* VJLAB-68 supports VJLAB-45 and VJLAB-46 (playlists build on packs and CRUD).
* VJLAB-60 blocks VJLAB-69 (popup polish builds on the control channel).
* VJLAB-75 blocks VJLAB-70 (capability mapping fixes the param vocabulary the model uses).
* VJLAB-70 blocks VJLAB-71, VJLAB-73 and VJLAB-74 (queue UX, clock and coverage consume the Show/Cue model).
* VJLAB-73 blocks VJLAB-71 (auto-advance runs on the Clock abstraction).
* VJLAB-71 blocks VJLAB-72 (timeline view reads the timed queue).
* VJLAB-70 to VJLAB-76 block VJLAB-77 (docs sync closes the epic).
* VJLAB-73 blocks VJLAB-78 (anchored pilot reworks the Clock pilot).
* VJLAB-78 blocks VJLAB-79 (resume targets the body timeline).
* VJLAB-78 blocks VJLAB-80 and VJLAB-81 (fixed cues extend the anchored timeline).
* VJLAB-80 blocks VJLAB-81 (distribution fills around anchors).
* VJLAB-87 blocks VJLAB-82 (state slots consume player-state events).
* VJLAB-86 blocks VJLAB-87 and VJLAB-88 (events and sources ride the contract).

## Notes for Sprint 1 Candidates

* VJLAB-01 to VJLAB-03 (foundation) plus VJLAB-04 start if capacity allows.

## Revision History

| Version | Date | Change |
| ------- | ---- | ------ |
| 0.1.0 | 2026-09-11 | Initial backlog |
| 0.2.0 | 2026-09-12 | Add E06 Live Control v0.2.0 (VJLAB-18 to VJLAB-25) |
| 0.3.0 | 2026-09-16 | Add VJLAB-40/41/42 desk HUD enhancements (E08 M7) |
| 0.3.1 | 2026-09-16 | Add VJLAB-44 strobe color reinforcement (E08 M7) |
| 0.3.2 | 2026-09-16 | Add VJLAB-43 keyboard ergonomics review (E08 M8) |
| 0.4.0 | 2026-09-16 | Add E09 Playlists with VJLAB-45/46 (M9) |
| 0.5.0 | 2026-09-16 | Add E10 Builder & Media with VJLAB-50/51/52/53 (M10) |
| 0.5.1 | 2026-09-16 | Refine VJLAB-51/52 to Grid LED Octagon Pulse and Avatar Chroma Bouncer |
| 0.5.2 | 2026-09-16 | Add VJLAB-55 Fractal full-screen |
| 0.6.0 | 2026-09-21 | Add E11 Web Experience with VJLAB-56/57/58/59 (Sprint 21-22) |
| 0.6.1 | 2026-09-22 | Add VJLAB-60 detached second-screen popup with synced controls |
| 0.6.2 | 2026-09-22 | Queue VJLAB-61 responsive shell standard after Sprint 22 |
| 0.6.3 | 2026-09-22 | Queue VJLAB-62 deck entry sequence with reusable TrackCard after Sprint 22 |
| 0.7.1 | 2026-09-23 | Add VJLAB-63/64 unified panels and player model (Sprint 25) |
| 0.7.2 | 2026-09-23 | Add VJLAB-65 explicit hide vs pop-out controls (Sprint 26) |
| 0.8.1 | 2026-09-23 | Add E12 Scene Packs and Library with VJLAB-66/67/68 (Sprints 27-29) |
| 0.9.1 | 2026-09-23 | Refresh VJLAB-50 builder redesign scope (Sprint 31) |
| 0.10.1 | 2026-09-23 | Add VJLAB-69 popup polish round with shared control kit (Sprint 32) |
| 0.11.0 | 2026-09-27 | Add E13 Show Timeline with VJLAB-70 to VJLAB-77 (Sprints 33-35) |
| 0.12.0 | 2026-09-27 | Add E14 Anchored Show with VJLAB-78/79 (Sprint 36) |
| 0.13.0 | 2026-09-29 | Add E15 Programmed Show (VJLAB-80 to VJLAB-85) and E16 Audio Provider (VJLAB-86 to VJLAB-88) |
