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
| VJLAB-50 | Preset builder UI — browser, preview and knobs to assemble and save presets (reverted, needs redesign) | Feature | Medium | E10 | M10 | New |
| VJLAB-51 | Grid LED scene — Punch Club image + LED points reactive to bass/mids (Octagon Pulse) | Feature | Medium | E10 | M10 | New |
| VJLAB-52 | Avatar low-poly scene — human GLB with edge/fill materials and audio-driven bounce/sway (Chroma Bouncer) | Feature | Medium | E10 | M10 | New |
| VJLAB-53 | Preset export/import — JSON file without DB, versioned schema | Feature | Medium | E10 | M10 | New |
| VJLAB-54 | Video frame — local video as VideoTexture in scene frame with audio analysis | Feature | Medium | E10 | M10 | New |
| VJLAB-55 | Fractal full-screen — Mandelbrot/Julia shader with zoom/rotation reactive to bass/mids | Feature | Medium | E10 | M10 | New |
| VJLAB-56 | Landing route with presentation page and deck entry | Feature | High | E11 | M11 | New |
| VJLAB-57 | Evolve panel visibility with floating toggle and top bar | Feature | High | E11 | M11 | New |
| VJLAB-58 | Mobile bottom sheet with Audio / Scenes / FX / Guide tabs | Feature | High | E11 | M11 | New |
| VJLAB-59 | First-run tour with help drawer and empty-state guide | Feature | Medium | E11 | M11 | New |

## Dependencies

* VJLAB-05 blocks VJLAB-07.
* VJLAB-08 blocks VJLAB-11 to VJLAB-15.
* VJLAB-07 blocks VJLAB-09.
* VJLAB-11 to VJLAB-13 block VJLAB-14.
* VJLAB-14 and VJLAB-15 block the v0.1.0 release.
* VJLAB-18 blocks beat-synced auto-cut (follow-up).
* VJLAB-19 blocks VJLAB-22 (image blend uses palettes).

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
