# vezz.io — brand & tokens

This is a **brand/tokens-only** design system: the visual language of vezz.io
(a personal site/portfolio), with **no importable components**. Build UI with
plain HTML/JSX/React and style everything with these tokens so the result is
on-brand and maps onto the real site's code.

The aesthetic is **Apple-minimal**: lots of white space, a single blue accent
(`#0066cc`) over a grayscale ramp, the system font stack, restrained motion,
and soft low-contrast shadows.

## Setup

Link the one stylesheet — it pulls in every token via `@import`:

```html
<link rel="stylesheet" href="styles.css">
```

No JavaScript, no provider, no font loading. `_ds_bundle.js` is intentionally
empty (the namespace `window.VezzIo` resolves to `{}`).

## The styling idiom: CSS custom properties

Style with `var(--token)` — **never hard-code** hex, font sizes, or spacing.
The token families (full lists in `tokens/*.css` and the `Foundations`
prompt docs):

- **Color** — `--color-primary` `#0066cc`, `--color-primary-hover` `#004c99`,
  `--color-text`, `--color-foreground`, `--color-text-secondary`,
  `--color-background`, `--color-border`, `--color-border-light`,
  `--color-hover`.
- **Typography** — `--font-family-base` (system stack); sizes
  `--font-size-display|title|h2|h3|subtitle|body|base|sm|xs`; weights
  `--font-weight-regular|medium|semibold|bold`; tracking
  `--letter-spacing-tightest…wider`.
- **Spacing** — `--space-1…24` (0.25rem step), `--section-padding-x|y`,
  `--container-max` (1200px), `--container-narrow` (980px).
- **Effects** — `--radius-sm|md|lg|xl|full`, `--shadow-card`,
  `--shadow-accent`, `--duration-fast|base`, `--ease-out`,
  `--gradient-accent`.

Apply the accent sparingly (links, one highlighted heading word, active
states) — most of the surface is black/gray text on white.

## Where the truth lives

- `styles.css` — the entry; read it and its `@import`ed `tokens/*.css` before
  styling.
- `components/Foundations/<Colors|Typography|Spacing|Effects>/*.prompt.md` —
  per-family token tables, usage notes, and snippets. The matching `.html` is
  a visual swatch card.

## Idiomatic snippet

```jsx
<section style={{ padding: 'var(--section-padding-y) var(--section-padding-x)' }}>
  <div style={{ maxWidth: 'var(--container-narrow)', margin: '0 auto' }}>
    <h1 style={{
      fontSize: 'var(--font-size-title)',
      fontWeight: 'var(--font-weight-bold)',
      letterSpacing: 'var(--letter-spacing-tightest)',
    }}>
      Francesco <span style={{ color: 'var(--color-primary)' }}>Vezzani</span>
    </h1>
    <p style={{ fontSize: 'var(--font-size-subtitle)', color: 'var(--color-text-secondary)' }}>
      Subtitle goes here.
    </p>
  </div>
</section>
```
