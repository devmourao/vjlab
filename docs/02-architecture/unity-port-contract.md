# Unity Port Contract — VJ Lab

## 1. Purpose

Freeze the **portable show vocabulary** before a Unity rewrite. The
browser MVP proves interaction and composition; Unity reimplements the
same contracts with Prefabs / ScriptableObjects / Timeline. Renderer
details (Three.js, React) are **not** part of this contract.

## 2. Layer Map

| Web concept | Unity target | Owns |
| ----------- | ------------ | ---- |
| Base + capability schema | Prefab + ScriptableObject params | Geometry + reaction mechanics |
| Base instance | Clip / layer instance | Filled params for one use |
| Scene (preset) | Composition asset | 1..N instances + matter |
| Scene template | Prefab pack / starter composition | Opinionated instance recipe |
| Playlist / setlist | Playlist asset | Ordered scene refs |
| Show + cue | Timeline / QLab-style cue list | Timed occurrences |
| Audio bus bands | Reactive audio bus | `bass/mids/treble` in 0–1 |
| Director (burst, FX, transition) | Show director + input map | Live performance state |
| Artist pack (future) | Addressables / pack zip | Scenes + media + setlist |

## 3. Stable Input Contract (every base)

Every base receives the same inputs every frame. Interpretation is
base-specific; the bus is not.

| Input | Range | Notes |
| ----- | ----- | ----- |
| `bass`, `mids`, `treble` | 0–1 | Smoothed FFT bands |
| `boost` | 0–1 | Burst impulse with decay |
| `time`, `delta` | seconds | Frame clock |
| `palette.primary`, `palette.emissive` | color | Scene matter |
| `background` | color | Stage clear / fog tint |
| `gain`, `speed` | ~0.4–2 / 0.5–2 | Scene-level modulation |
| Host spatial | `cameraSensitivity`, `zoom` | Per-instance framing |

Unity rule: one `IAudioReactive` / bus reader; bases never own FFT.

## 4. Composition Rules

1. **Base** = reusable mechanic + declared params (no hardcoded show).
2. **Scene** = named composition of 1..N base instances + matter.
3. **Template** = starter scene recipe (slots + defaults). Saving a
   template produces a normal scene — templates are not a runtime type.
4. **Playlist** = ordered scenes (visual setlist, Winamp-style).
5. **Show** = timed cues over a playlist (optional track clock).
6. A scene feels new when **at least two puzzle pieces** change
   (base set, matter, behavior, camera, post) — not palette alone.

## 5. Base Categories (UI + packs)

| Category | Role | Current web bases |
| -------- | ---- | ----------------- |
| `field` | Ambient / volumetric motion | particles, tunnel, fractal |
| `form` | Focal deformable object | mesh |
| `media` | Image / video plane (focal art) | mesh + `map` slot |
| `fx` | Post and overlays (desk-level today) | PostRig / overlays |

Categories guide the template picker; they do not replace `BaseId`.

## 6. Named Mechanics (portable verbs)

Bases advertise how they spend audio energy:

| Mechanic | Typical mapping |
| -------- | --------------- |
| `pulse` | Scale / emissive on bass + boost |
| `orbit` | Angular motion on mids |
| `displace` | Vertex / noise offset on bass/mids |
| `scroll` | Depth travel (tunnel rings) on mids |
| `morph` | Shader shape / zoom on bass + boost |

Unity scripts should name methods after these verbs when possible.

## 7. Template Proof — DJ Cover

**Intent:** album/track art as the focal form, particles as the aura.

| Piece | Choice |
| ----- | ------ |
| Instances | `mesh` (media slot) + `particles` (field) |
| Matter | Neon cyan on deep navy |
| Behavior | Gain ≈ 1.2, speed ≈ 1.0 |
| Spatial | Mesh `zoom` 1.0; particles `zoom` 1.35, low camera sensitivity |
| Slot | `mesh.map` — drop album/track image |

Web ships this as a scene template and a built-in preset. Unity ports
it as a Prefab with an Image slot + ParticleSystem child.

## 8. Modes (product mental model)

| Mode | Job | Web today |
| ---- | --- | --------- |
| Perform | Direct the living stage | Keyboard desk / console |
| Compose | Build scenes from templates | Library builder |
| Program | Time cues to the track | Show timeline / pins |

Keep these modes distinct in Unity UI as well.

## 9. Pack Boundary (pre-profile)

Before DJ cloud profiles: **local artist packs** (versioned JSON +
media) that export/import scenes and setlists. Profiles later wrap the
same pack format.

## 10. Non-Goals for the Web Lab

* Pixel-identical Unity visuals
* Auth / multi-tenant DJ accounts
* Photoreal lighting or physics fidelity
* Rewriting Three scenes “for Unity” — only contracts and content packs

## 11. Exit Criteria (ready to port)

* Templates → scene → playlist path is obvious without a long tutorial
* DJ Cover (or equivalent media+field template) is playable end-to-end
* Capability registry lists every honored param (no shadow knobs)
* Pack export round-trips scene compositions
* This document and `glossary.md` stay the single vocabulary source

## 12. References

* `docs/03-design/bases-vs-scenes.md`
* `docs/03-design/scene-spec.md`
* `docs/02-architecture/glossary.md`
* `src/scenes/bases.ts`, `src/scenes/templates.ts`, `src/scenes/presets.ts`
