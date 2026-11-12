# Bases vs Scenes — VJ Lab

## 1. Purpose

Separate the reusable **Base** (mold without values) from the ready-to-play **Scene** (composition of 1..N base instances with concrete parameters). This enables the puzzle assembly described in `scene-spec.md` and allows a scene to combine multiple bases without creating a new base.

## 2. Definitions (Industry-aligned)

| Term | Industry equivalent | Meaning | Example |
|------|---------------------|---------|---------|
| Base | Resolume Source / Generator, VDMX Layer Source | Reusable template that declares its schema (which knobs exist and their ranges) | `TunnelBase`, `ParticleFieldBase`, `GridLedBase` |
| Base Instance | Resolume Clip | One use of a base with filled parameters | `{ base: 'tunnel', params: {shape:'doubleTri', ringCount:24, rotation:{axis:'z', speed:0.4}, cameraSensitivity:1, paletteMode:'multi'} }` |
| Scene | Resolume Composition / Deck | Ready-to-activate item in the playlist. Contains 1..N instances + global background/gain/speed. | `Neon Tri Tunnel` = `instances:[tunnel(mixed)]`, `Punch+Particles` = `instances:[gridLed, particles]` |

## 3. Catalog vs Playlist (what the user sees)

*   **Base Catalog (left panel, not yet implemented after revert):** list of 8 bases without values — `Particles`, `Mesh`, `Tunnel`, `Grid LED`, `Avatar`, `Fluid`, `Typography`, `Fog`. User picks a base to configure.
*   **Scene Playlist (right panel, already `VJ Desk 1–4`):** list of scenes ready to dissolve. Today `instances.length === 1` for all 4 presets; future scenes may have 2 instances (e.g., tunnel + particles).

## 4. Data Model Evolution (backward compatible)

```ts
// src/scenes/presets.ts
export interface BaseInstance {
  base: 'particles' | 'mesh' | 'tunnel' | 'gridLed' | 'avatar' | 'fluid'
  params: Record<string, unknown> // validated per base schema
}

export interface ScenePreset {
  id: number
  name: string
  scene: 0 | 1 | 2 | 3 // legacy single-base, kept for compatibility
  instances?: BaseInstance[] // if present, SceneHost composes instead of single base
  palette: ScenePalette
  background: string
  gain: number
  speed: number
}
```

*   If `instances` is undefined → legacy path (`scene` field) as today.
*   If `instances` has values → `SceneHost` renders a `<group>` with each base instance (Composite pattern). Order defines layering.
*   Migration: existing 4 presets remain with `scene` only; new multi-base scenes like `Tunnel + Particles` will use `instances`.

## 5. Engineering Best Practices Applied

*   **Factory + Composite:** bases are factories, scenes are composites — no duplication, single responsibility per base.
*   **Open/Closed:** add a new base by adding a file + schema, without touching existing bases.
*   **Immutability & Validation:** presets are pure data; `BaseInstance.params` validated against base schema before render.
*   **Strategy for Rotation:** rotation `{axis:'x'|'y'|'z', speed, reactivity}` is a standard mechanic for every base (tunnel wall spin, fractal z-spin), with base-specific visibility (circle vs tri/square/star).
*   **Living Docs:** `scene-spec.md` + this doc stay in sync with `presets.ts` via UPDF.

## 6. Next Step

Sprint 20 kept `instances` optional and added multi-base scenes
(`Tunnel + Dust`, later `DJ Cover`). Portable templates and the Unity
port contract live in `docs/02-architecture/unity-port-contract.md`
and `src/scenes/templates.ts`.

## 7. Revision History

| Version | Date | Change | Author |
| ------- | ---- | ------ | ------ |
| 1.0.0 | 2026-09-16 | Initial bases vs scenes separation | Marcos Ferreira Mourão |
| 1.1.0 | 2026-09-16 | Add rotation as standard base mechanic and doubleTri star example | Marcos Ferreira Mourão |
