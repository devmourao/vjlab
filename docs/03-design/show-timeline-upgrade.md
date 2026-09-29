# Show Timeline Upgrade — VJ Lab

## 1. Purpose & Status

Evolve the scene playlist from manual triggering (Session-style, Ableton analogy)
into a timed **Show** that can run a 40+ minute set with programmed scene durations,
auto-advance, a visual timeline, and — later — input recording and track binding.

**Status: planning (no code).** Agreed so far:

- Phase A (approved): per-occurrence duration + auto-advance + visual timeline.
  No recording yet.
- Recording is the heart of the upgrade, deferred until the concepts mature
  through real use.
- Time unit Phase A: absolute seconds (easy mode). Beats/BPM must coexist
  later without rewriting what was programmed in seconds.
- Seek/pause: cheap path now (audio clock + documented rebase policy),
  full policies later.
- Simultaneous multi-channel rendering is OUT of scope for the web app;
  composition needs are met by composite bases (section 6). True layering
  is a future Unreal project.
- Product motto: **progressive disclosure** (section 3). Golden rule:
  factory content and user content share one versioned format.

Prior art reviewed: Resolume Autopilot (per-clip duration in sec/beats,
countdown pies), QLab cue lists (pre-wait/duration, do-not-continue /
auto-continue / auto-follow, GO-takeover, timecode policies), Ableton
Session vs Arrangement (perform-then-capture), grandMA2 effect engine
(Form/Speed/Size/Phase/Width/Attack/Decay with BPM-Hz-seconds coexistence),
TouchDesigner Transform page (Translate/Rotate/Scale/Pivot, fixed order).

## 2. Vocabulary (Industry-aligned)

| Term | Industry equivalent | Meaning |
|------|---------------------|---------|
| Show | QLab workspace / theater show | Ordered list of cues, with its own total runtime, optionally bound to a track |
| Cue | QLab cue / theater cue | One playlist occurrence: a scene reference + duration + follow mode. Duration belongs to the cue (`key`), never to the scene |
| Clock | QLab timecode / Resolume global transport | The time source driving auto-advance and (later) recorded events |
| Takeover | QLab GO / Ableton touch mode | Manual trigger during auto-playback redirects the playhead instead of breaking the show |
| Burst | grandMA Flash button | Momentary impulse fired live; each base maps it to its own response with decay |
| Base (atomic) | Resolume Source, TouchDesigner OP | Code-backed render unit declaring a param schema |
| Composite base | Unity Prefab / Unreal Blueprint composition | Named content: ordered refs to atomic or composite bases + param overrides |
| Macro | Ableton Macro / Resolume Dashboard | One big knob driving several params (Shape disclosure level) |

> New terms must be registered in `docs/02-architecture/glossary.md`
> when implementation starts.

## 3. Product Motto — Progressive Disclosure

| Level | Name | Audience | Exposes |
|-------|------|----------|---------|
| 1 | Play | First-time user | Factory shows/modes, one-tap play, countdown, totals |
| 2 | Shape | Intermediate | Macro knobs (`Energy`, `Breath`, `Drift`), duration steppers, Manual/Auto per cue |
| 3 | Build | Author | Full param families, composite editor, proportional timeline, recording |

**Golden rule:** all three levels read and write the same versioned content
format. No factory-only format exists.

## 4. Global Param Contract (v2 target)

Every timed behavior (breathing, color cycling, XYZ drift) is the same
modulation engine applied to different attributes — the grandMA2 model.
Four families; every base honors the params that make sense for it.

| Family | Answers | Global params (all bases) | Precedent |
|--------|---------|---------------------------|-----------|
| Transport | How fast does time pass inside the base? | `speed` multiplier 0.5–2 | Resolume clip speed, MA Rate |
| Modulation | How much does the audio move the base? | `gain` 0.4–2, `audioSource`: bass/mids/treble/full | Resolume per-band FFT, MA Sound In |
| Color | How do colors behave? | `colorMode`: static/audio/beat/cycle; `colorRate` (s or beats); `colorFade` (s) | MA chaser step-fade, Resolume Hue Rotate |
| Spatial | Where/how is the base in space? | `translate` XYZ, `rotate` XYZ (degrees), `scale` XYZ, `pivot` XYZ | TouchDesigner Transform page |

Current mapping: `gain` → Modulation, `speed` → Transport,
`cameraSensitivity`/`zoom` → Spatial (per-instance),
`map` (image) → mesh-specific peculiar param.

Schema note (locked Sprint 33): `BaseParamSchema.family`
(`transport|modulation|color|spatial`, optional) carries the mapping in
`src/scenes/bases.ts`. Untagged = peculiar. Mapping only — no renderer
behavior change.

### Per-base peculiar params (never in the global contract)

- Tunnel: `shape` (rings / triangle / shards / star — named factory modes).
- Mesh: `renderMode` (solid / wireframe / image), `displace`.
- Particles: `count`, `spread`, `trail`.
- Fractal: `octaves`, `warp`.
- Factory mode = named bundle of peculiar + global params
  (e.g. `Tribal Bed`, `Pico Estelar`).

## 5. Spatial Reference Decisions

Decided before any code, so they never become chronic bugs:

1. **Pivot vs camera target are separate.** `pivot` = point a base rotates/
   scales around (default: object center). Camera `target` = point the
   camera orbits (default: world/scene center). TouchDesigner object-space
   vs world-space distinction.
2. **XY positioning is normalized + anchored.** Viewport coordinates,
   center origin, −1..1, plus a 9-point anchor preset
   (Center/Top/TopRight/…/BottomLeft, Unity RectTransform / Unreal UMG
   convention). The anchor states *which point of the element* sits on
   the coordinate. Never pixels, never absolute units.
3. **Aspect policy is explicit per scene:** `cover` (fill, crop — default
   for backgrounds), `fit`, `stretch`. Plus existing `safe-area` practice.
4. **Fixed transform order, documented:** Scale → Rotate → Translate
   (TouchDesigner default `srt`), rotate order XYZ. Not exposed in UI
   before the Build level.
5. **Z stays depth:** position/scale perspective, consistent with the
   existing Q/W axis mapping.

## 6. Composite Bases (3 levels, no infinite recursion)

| Level | Nature | Example |
|-------|--------|---------|
| Atomic base | Code + declared schema | `tunnel`, `particles` |
| Composite base | Named content: ordered refs + overrides + own defaults | `Tribal Bed` = tunnel(slow, zoom 1.2) + particles(high gain) |
| Scene | Final composition of atomic and/or composite + identity (palette, background) | `Pico Tribal` = Tribal Bed + mesh(image X) |

Engineering rules:

1. **Expand at the single resolve seam** (`resolveInstances` in
   `src/scenes/presets.ts`): composites flatten to a plain instance list,
   so the renderer never knows what is composite. Depth limit + cycle
   detection (a composite may never contain itself, directly or not).
2. **Overrides, not copies.** Composites store reference + overrides; base
   improvements propagate to every composite.
3. **Versioned declarative content**, same format as factory content
   (golden rule). Runtime-only handles (e.g. blob URLs) must never leak
   into the saved format — always asset references.

## 7. Burst Impulse (existing behavior, to be formalized)

Current state (working, undocumented): `burst.fire` (KeyB, Strobe section)
bumps `liveRefs.burstId`; each scene consumes `liveRefs.boost` with a
frame-rate independent `decayBurst` (`src/scenes/sceneMath.ts`) and a
hardcoded per-base coefficient:

| Base | File | Current response |
|------|------|------------------|
| Tunnel | `TunnelFieldScene.tsx` | scale `+0.5` |
| Mesh | `DeformableMeshScene.tsx` | displacement `+0.3` |
| Particles | `ParticleFieldScene.tsx` | scale `+0.6` |
| Fractal | `FractalScene.tsx` | morph speed `+1.5`, zoom `+0.9`, shader uniform |

Target: declare a per-base `burstResponse` (target attribute(s), peak
amount, decay seconds, curve) with the current coefficients as v1 defaults —
same feel today, tunable tomorrow. Notes:

- Burst is the live-dynamism instrument: it must stay on a big target,
  one gesture, zero menus (Play level).
- `burst.fire` already flows through `actionRegistry`, so it becomes
  recordable for free when the recording engine lands.
- Future: per-base burst amount as a Shape-level knob; beat-quantized
  burst as a Build-level option.

## 8. Show Model — Phase A

- **Cue fields:** scene reference, `durationSec` (playlist default, e.g. 30 s,
  editable per cue), `follow`: `manual` (hold until advanced — default,
  preserves current behavior) | `auto` (advance on expiry).
- **Timing:** in/out derived by accumulated sum; show total always visible.
- **Deck compatibility:** position = shortcut (Digit1..0) keeps firing the
  cue at that position; duration + follow travel with the position key.
- **Clock:** one abstraction from day one. Source = audio position when a
  track plays (pause comes free), wall clock when the show runs standalone.
- **Seek policy (cheap, explicit):** seek rebases — skipped cues do not
  fire; the show resumes at the cue under the playhead. Stated in the UI.
  Configurable policies later.
- **End of show:** `hold` last cue (default, live-safe) | `loop` | `stop`
  (return to first cue without firing).
- **Takeover (proposed, awaiting confirmation):** any manual trigger moves
  the playhead to that cue and the pilot continues from there (QLab GO
  style). Alternative: manual pauses the pilot until resumed.
- **Coverage meter:** show total vs a reference with three states —
  under / covered / over. Reference priority: bound track duration, else
  manual target (e.g. user types 40:00), else total only. A scene playlist
  therefore always has its own ruler, with or without a track — matching
  QLab cue-list totals and Ableton Arrangement length.
- **Future (not Phase A):** "fit show to track" proportional scaling;
  per-cue `durationBeats` + unit selector + global tap-tempo BPM;
  recorded `{t, actionId, args}` events on the same Clock.

## 9. Timeline UX — Phase A (three disclosure levels)

- **Play:** queue rows show name + `mm:ss` + live countdown on the active cue.
- **Shape:** tap a duration → stepper +/− (no touch-drag in Phase A:
  precise dragging on mobile is a classic trap); Manual/Auto toggle per cue.
- **Build:** proportional-bar timeline view with accumulated in/out ruler
  and show total — NLE reading conventions without NLE editing cost
  (no clip drag-and-drop, no multi-track).
- Constraints carried over: deck↔popup parity in canonical section order,
  44 px targets, responsive panels, countdown feedback à la Resolume pies.

## 10. Evolution & Unreal Seams (protect now, pay later)

1. **Content as declarative versioned data** (packs, composites, shows,
   cues) — maps to Unreal DataAssets later.
2. **Renderer behind the host seam** (`SceneHost` today): the content
   contract must never know about three.js, so the same contract can feed
   Sequencer/Actors later.
3. **Stable vocabulary** (section 2): maps 1:1 to Unreal Level Sequence /
   tracks / sections if kept clean.

## 11. Pinned Ends, Conflicts and Gaps (locked Sprint 39)

* A body cue may pin its start, its end, or both (`startSec`, `endSec`;
  additive, persisted, sanitized). End wins over duration; both pinned
  derives duration (`end − start`) and disables duration steppers.
* Locked intervals `[start, end)` are checked pairwise on computed body
  windows (`windowConflicts`). Overlaps render red rows, name both cues
  in the manager header and block Distribute until resolved. Editing is
  never silently refused: conflicts stay visible instead.
* End pins shrink unfixed predecessors to fit (min 1 s each) during
  distribution; leftovers surface as conflicts. The first body cue may
  only end-pin (its start is implicitly track 0:00).
* `showDirty` (runtime-only, never persisted) marks the show after any
  duration/pin edit; Distribute clears it and shows a dot while dirty.
* Anchored gaps render as amber labeled voids (`vão mm:ss sem cue`);
  one tap fills the void by duplicating the previous cue trimmed to it.
  Gaps are programmed silence, never auto-filled.
* Unprogrammed track remainder renders as a dashed placeholder unit
  (`Espaço livre mm:ss`); one tap distributes the body over the track.
  It is not a cue: pilot, countdown and coverage ignore it.
* Body rows are cue units (pill + row) at compressive heights
  (`88 + 24·ln(1+d)`, capped 248 px); per-pill progress fill replaces
  any global playhead line, which cannot align with uniform rows.

## 12. Decisions (locked 2026-09-27 with Owner)

1. Takeover: manual **redirects** the pilot — a manual trigger moves the
   playhead to that cue and the pilot continues from there (QLab GO style).
2. Occurrence name: **Cue** ("cue 3, 45 seconds, auto").
3. Timeline editing v1: **steppers only** (no drag); bars are proportional
   reading + stepper editing. Drag may come later if use demands it.
4. First two factory macros: **Energy** (gain+speed) + **Breath**
   (scale-pulse depth).

Sprint 33 preconditions met — implementation may start.

## 12. Revision History

| Version | Date | Change | Author |
|---------|------|--------|--------|
| 0.1 | 2026-09-27 | Planning doc from brainstorming sessions; no code | VJLab crew |
| 1.0 | 2026-09-27 | Implemented (Sprints 33-35, v0.12.0): timed cues, Clock + pilot, queue UX, coverage, timeline view, declared burst. Decisions §12 locked. Phase B still future. | VJLab crew |
| 1.1 | 2026-09-29 | Implemented (Sprints 36-39, v0.13.0): anchored pilot, pool/body, Resume, fixed starts, distribution, transport, units. Rules §11 locked. | VJLab crew |
