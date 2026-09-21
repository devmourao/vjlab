# Sprint Backlog — Sprint 21

## 1. Sprint Identification

| Field | Information |
| ----- | ----------- |
| Project | VJ Lab |
| Sprint | Sprint 21 — Web Shell Foundation |
| Milestone | M11 — Web Experience 0.6.0 (part 1, proposed) |
| Planned Version | 0.6.0-alpha |
| Start Date | 2026-11-26 |
| End Date | 2026-12-03 |
| Owner | Marcos Ferreira Mourão |

## 2. Sprint Goal

Deliver landing route and shell foundation with evolved panel visibility.

## 3. Sprint Backlog Items

| Issue | Title | Type | Priority | Status |
| ----- | ----- | ---- | -------- | ------ |
| VJLAB-56 | Landing route with presentation page and deck entry | Feature | High | New |
| VJLAB-57 | Evolve panel visibility with floating toggle and top bar | Feature | High | New |

## 4. Acceptance Criteria

### VJLAB-56

* Routes `/` (landing) and `/deck` (live deck) render with static-host fallback documented.
* Landing shows hero, 3-step how it works, scene highlights, shortcuts teaser, and footer with real version.
* `Enter Live Deck` CTA navigates to `/deck` without remounting audio state; direct `/deck` load works on refresh.
* No WebGL context is created on `/`.

### VJLAB-57

* Floating show/hide button is always visible on desktop and mobile and mirrors the `U` cycle (`docked / detached / hidden`).
* No existing shortcut is overwritten (`H` stays hue, `I` stays about, `U` stays cycle, `G` stays fullscreen).
* `scene-badge` stays visible in hidden mode for performance monitoring.
* Detached popup placeholder is retired or documented as superseded; fallback floating panel remains if needed.
* Touch targets meet 44px minimum on mobile viewport.

## 5. Dependencies

| Dependency | Impact | Status |
| ---------- | ------ | ------ |
| Router library | Landing and deck separation | Ready to install |
| Hosting redirect | Deep-link reliability | To configure |
| Director store | Panel mode source of truth | Ready |
| Existing panels | Top bar composition | Ready |

## 6. Risks and Mitigations

| Risk | Mitigation |
| ---- | ---------- |
| Deep-link 404 on static host | Redirect rule plus documented fallback |
| Shortcut collision | Audit against `useKeyboardDesk.ts` before merge |
| Mobile overlap regression | Verify canvas stays mounted and interactive with sheet hidden |

## 7. Definition of Done

* Code and docs updated together.
* `npm test`, `npm run build`, `npm run lint` green.
* Live dogfood on desktop and mobile viewport.
* Release gate per project standards.

## 8. Revision History

| Version | Date | Change | Author |
| ------- | ---- | ------ | ------ |
| 1.0.0 | 2026-09-21 | Initial backlog for Sprint 21 | Marcos Ferreira Mourão |
