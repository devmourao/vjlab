# Scene Specification — VJ Lab

## 1. Purpose

Standardize how a scene is composed so every new idea is a puzzle of reusable pieces with the same music interaction contract. This replaces color-only variations with element combinations.

## 2. Standard Input Contract (every base receives the same)

Provided by `src/audio/audioBus.ts` + `src/director/directorStore.ts` + `src/scenes/SceneHost.tsx`:

| Input | Type | Range | Source |
|-------|------|-------|--------|
| bass, mids, treble | number | 0–1 | FFT bands, smoothed |
| boost / burstId | number | 0–1 / int | `liveRefs.boost` on `B` |
| time, delta | number | seconds | `useFrame` clock |
| palette {primary, emissive}, background | hex | — | `ScenePreset` |
| gain, speed | number | 0.4–2.0 / 0.5–2.0 | `ScenePreset` |
| hueShift, zoomTarget, strobeOn | number/bool | — | `directorStore` |
| transition state | bool/number | — | `transitionRef` |

Interpretation is base-specific (particles scale with bass, tunnel advances with mids) but the input is identical.

## 3. Five-Piece Puzzle (every scene = Base + Matter + Behavior + Camera + Post)

| Piece | Role | Typical params | Lives in |
|-------|------|----------------|----------|
| Base | Geometry / structure | scene id, count/density, scaleRange | Scene component |
| Matter | Color & light | palette, background, emissiveIntensity | ScenePreset |
| Behavior | How it reacts to music | gain, speed, reactivity: bass|mids|treble, boost mapping | ScenePreset + liveRefs |
| Camera | Framing | zoom via +/− globally (all bases), azimuth/elevation via Arrows for 3D bases | CameraRig / liveRefs |
| Rotation | Object spin (standard for all bases) | axis:'x'|'y'|'z', keys Q/W for +/−, speed, reactivity | Base component + BaseInstance.params |
| Shape | Geometry variant (standard for 2D bases) | shape:'tri'|'square'|'star'|'doubleTri', keys Arrows ↑/↓ next/prev, ←/→ innerScale/paletteShift | BaseInstance.params |
| Post | What can be stacked | VHS / RGB / beatFlash on/off | PostRig |

A scene feels new when at least two pieces change, not just `palette`.

## 4. Base Catalog (parametrized families)

| Family | Geometry | Parametrized knobs (preset) | Example preset |
|--------|----------|-----------------------------|----------------|
| Particle Field (existing) | Points | count, size, gain, speed | Nebula Drift |
| Deformable Mesh (existing) | Icosahedron | displacement, gain, speed | Neon Bloom |
| Tunnel Field (existing) | Rings (circle/tri/square/star/doubleTri) | count, spacing, speed, shape, rotation {axis:'x'|'y'|'z', speed, reactivity} | Hyper Tunnel (circle) / Neon Tri (doubleTri star with z-spin) |
| Grid LED (image + LEDs) | Plane + instanced points | imageTexture, ledCount, ledMap, ledPalette, chaseSpeed | Punch Club orange chase on bass |
| Avatar Low-Poly | GLB + 2 materials | edgeColor, fillColor, bounceScale, sway | Human edges flash on burst, body pulses on bass |
| Fluid / Water | Plane + noise | noiseScale, flowSpeed, foamColor | Surface ripples on mids |
| Typography / Graffiti | Text geometry | text, font, outlineColor, jitter | PUNCH CLUB letters shake on bass |
| Volumetric Fog | Fog volume | density, scatterColor | Orange fog thickens on bass |
| Ribbon / Strings | Lines | count, thickness, waveAmp | Ribbons whip on mids |

Each base exposes only 3–4 knobs; the rest is fixed in the base component for performance (instancing, pooling).

## 5. How to Assemble a New Idea (puzzle)

1. Pick Base (e.g., Grid LED)
2. Pick Matter (e.g., palette #ff5a00 on Punch Club photo)
3. Pick Behavior (e.g., gain 1.4 on bass, chase on)
4. Pick Camera (e.g., zoom 0.9, orbit slow)
5. Pick Post (e.g., RGB on)

Result = one row in `src/scenes/presets.ts:16` (`ScenePreset`). No new component unless geometry changes.

## 6. Template for a New Scene Idea

```md
Name:
Base: (one of catalog)
Matter: palette / background
Behavior: gain, speed, reactivity -> mapping
Camera: zoom / orbit
Post: VHS/RGB/beat
Why it feels new (which 2 pieces changed):
```

## 7. Instance Composition (single path)

Every preset composes through `instances[]` resolved by `resolveInstances`
(one equivalent instance for legacy rows). The host applies host-level
params (`cameraSensitivity`, `zoom`) around each instance and injects
per-instance assets (mesh `map`) from the preset or the session override
table — scenes never read global customization state.

Editable params per base live in the capability registry
(`src/scenes/bases.ts`) with preset vs instance scope. A cloned base may
reinvent its mechanics as long as it honors the input contract (§2) and
registers its schemas.

## 8. References

*   `src/scenes/presets.ts:6` — ScenePreset interface
*   `src/scenes/SceneHost.tsx` — host that injects contract
*   `src/scenes/bases.ts` — native base capability registry and instance keys
*   Industry: Resolume clip = base + preset, VDMX layer = base + composition

## 9. Revision History

| Version | Date | Change | Author |
| ------- | ---- | ------ | ------ |
| 1.0.0 | 2026-09-16 | Initial scene spec and base catalog | Marcos Ferreira Mourão |
| 1.1.0 | 2026-09-16 | Add cameraSensitivity per base for parallax in multi-base scenes | Marcos Ferreira Mourão |
| 1.2.0 | 2026-09-16 | Add rotation as standard base mechanic and doubleTri star shape for Tunnel | Marcos Ferreira Mourão |
| 1.3.0 | 2026-09-16 | Standardize Q/W for Z rotation and Arrows for shape/innerScale (2D) with Zoom on +/− | Marcos Ferreira Mourão |
| 1.4.0 | 2026-09-23 | Single instances[] composition, per-instance assets, capability registry | Marcos Ferreira Mourão |
