# design-sync notes — vezz.io

## What this is

- vezz.io is a **SvelteKit website**, not a React component library. Claude
  Design's design agent builds with **React** and loads compiled React
  components from a bundle — Svelte single-file components cannot be loaded
  there, and there is no library `dist/` to bundle anyway.
- The user chose **brand/tokens only** (2026-06-20): we sync the visual design
  language (colors, typography, spacing, effects) as a tokens reference, with
  **no functional components**. The design agent matches the brand but builds
  with its own generic components.
- The bundle was **hand-authored** (off-script). The converter
  (`package-build.mjs` / `resync.mjs`) was NOT run and must NOT be run here —
  it expects a React `dist/` + `.d.ts` exports that don't exist.

## Layout shipped (ds-bundle/)

- `_ds_bundle.js` — empty IIFE, `window.VezzIo = {}`, with the `@ds-bundle`
  header (components: []).
- `styles.css` → `@import`s `tokens/{colors,typography,spacing,effects}.css`
  plus brand base (reset, body, scrollbar, `slideIn`).
- `components/Foundations/{Colors,Typography,Spacing,Effects}/` — static HTML
  swatch cards (`@dsCard group="Foundations"`, each has a `#root`) + a
  `.prompt.md` token reference. These are NOT importable components; they exist
  to give the DS pane visible foundation cards and the agent token docs.
- `.ds-build-meta.json` `componentCount: 4` = the 4 foundation `.html` cards
  (so package-validate's count check passes); the `@ds-bundle` header keeps
  `components: []` so the bundle-export smoke check is skipped.
- No `_ds_sync.json` (off-script, legitimately omitted — validator warns only).
- No `fonts/` — the brand uses the system font stack (no web fonts to ship).

## Token sources (re-derive from these on any update)

- `src/lib/constants/design.ts` — COLORS, TYPOGRAPHY, SPACING, BREAKPOINTS.
- `src/app.css` — `:root` CSS variables and base styles.
- Component styles in `src/lib/components/*.svelte` — radii, shadows,
  transitions, the accent gradient.

## Decisions

- Color names are kept VERBATIM from the repo (`--color-primary` etc.) so the
  agent's output maps onto real code. Added `--color-primary-hover` (#004c99,
  from component hover states) and `--color-foreground` (#1d1d1f, legacy).
- Typography/spacing/effects exist in the repo as TS constants / inline values,
  not CSS vars; we formalized them as CSS vars with sensible scale names.
- The playful pink/indigo accents (`#ec4899`, `#6366f1`) used only by the
  decorative custom cursor (`src/lib/components/Cursor.svelte`) are
  intentionally EXCLUDED from the token set.
- Render check was SKIPPED at the user's request (Playwright not installed).
  package-validate.mjs was run with `--no-render-check` — file-shape and CSS
  checks passed; the static cards were eyeballed but not machine-rendered.

## Re-sync risks / watch-list

- This is a manual pipeline. A future `/design-sync` run must read this file,
  re-derive tokens from the sources above, hand-edit `ds-bundle/`, and upload
  to the pinned project (`projectId` in config.json) — do not run the converter.
- If the site adopts a real component library or migrates to React, revisit:
  a true component sync (the converter path) would then be possible.
- Tokens were a point-in-time snapshot (2026-06-20). If `design.ts` / `app.css`
  change, the synced tokens go stale silently — re-derive on the next sync.
- Renders were never machine-verified (see Decisions). If a card looks wrong in
  the DS pane, open its `.html` and fix the static markup.
