# Prometheus design system

Aesthetic: high-end aerospace/defense, luxury editorial, dark-mode technical
HUD. Forest noir ground, one electric-lime accent, Baroque oil paintings graded
into the palette. Implemented as plain CSS custom properties in `First` — the
site is a single self-contained HTML file served by nginx, so there is no build
step and no Tailwind. A Tailwind mapping is at the bottom if the stack ever
moves.

## 1. Tokens

```css
/* Surfaces */
--noir:        #0B130E;   /* page ground — deep forest noir       */
--noir-deep:   #070C09;   /* wells, footer, overlay drawer        */
--panel:       #121D16;   /* cards, nested containers             */
--panel-hi:    #16241A;   /* panel hover                          */

/* Accent — used sparingly: CTAs, active states, telemetry only */
--lime:        #D0FF00;
--lime-dim:    #C4FA00;   /* CTA hover                            */
--lime-soft:   rgba(208, 255, 0, 0.14);
--lime-line:   rgba(208, 255, 0, 0.34);   /* HUD bracket resting  */

/* Type colour */
--bone:        #F3F4ED;   /* titles, primary body                 */
--moss:        #6E8273;   /* metadata, subtitles, telemetry       */
--moss-lt:     #93A598;   /* body copy on dark panels             */

/* Rules & grid */
--line:        rgba(243, 244, 237, 0.10);
--line-strong: rgba(243, 244, 237, 0.20);

/* Rhythm */
--gut:     clamp(1.5rem, 5vw, 6rem);   /* page gutter             */
--band:    clamp(5rem, 11vw, 10rem);   /* vertical section rhythm */
--bracket: 18px;                       /* HUD corner arm length   */
--ease:    cubic-bezier(0.22, 1, 0.36, 1);
```

## 2. Typography

| Role | Face | Notes |
| --- | --- | --- |
| Display | **Fraunces** (variable) | `wght 300`, `opsz 144`, `WONK 1`. High vertical contrast, editorial. Italic + lime for emphasis words. |
| Body / UI | **Inter** | `300` for prose, `400–500` for UI. |
| Telemetry | **IBM Plex Mono** | All-caps, `letter-spacing: 0.16–0.26em`. Section tags, step numbers, spec lines, buttons. |

Fraunces and Inter substitute for the reference site's commercial **Flecha** and
**Founders Grotesk**. Both are on Google Fonts and free to use commercially.
Fraunces's `WONK` axis supplies the editorial quirk that separates it from a
generic Playfair look; `opsz 144` is what gives the hairline-thin serifs at
display sizes.

Headline scale is fluid: `h1` `clamp(3rem, 8.5vw, 7.5rem)`, `h2`
`clamp(2.25rem, 5.2vw, 4.5rem)`. Line-height `1.02–1.05`, tracking `-0.02em` —
tight, the way display serifs want to be set.

**Licensing note:** if you buy Flecha and Founders Grotesk, swap them by
changing `--display` and `--sans` and self-hosting the files. Nothing else in
the system needs to change.

## 3. HUD corner brackets

The signature component. A full 1px border masked down to four corner squares —
one pseudo-element, four brackets, no extra markup.

```css
.framed { position: relative; }

.framed::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 2;
  border: 1px solid var(--lime-line);
  -webkit-mask:
    linear-gradient(#000 0 0) top    left  / var(--bracket) var(--bracket) no-repeat,
    linear-gradient(#000 0 0) top    right / var(--bracket) var(--bracket) no-repeat,
    linear-gradient(#000 0 0) bottom left  / var(--bracket) var(--bracket) no-repeat,
    linear-gradient(#000 0 0) bottom right / var(--bracket) var(--bracket) no-repeat;
  mask: /* …same four layers… */;
}

.framed:hover::before { border-color: var(--lime); }
```

Where `mask` is unsupported the whole hairline border shows — a clean,
deliberate degradation rather than a broken one.

**Use it on gap-separated elements only.** On a `gap: 1px` grid (the "How We
Work" trio) per-card brackets land on top of the dividers and read as clutter,
so there the frame goes on the *container* and the dividers do the separating.

## 4. Painting bands

Two stacked layers behind the content, both `position: absolute`, at `z-index`
`-2` and `-1` inside an `isolate` context:

```css
.band-art {
  background-image: var(--art);
  background-size: cover;
  filter: saturate(0.45) contrast(1.1) brightness(0.78);
}
```

The `saturate(0.45)` is what pulls warm Baroque oil toward the forest palette so
the paintings sit *inside* the page rather than on top of it. `.band-scrim`
then layers directional gradients to protect the text.

Every art slot renders a gradient **underneath** the image rather than relying
on it, so a missing painting leaves a deliberate unlit plate instead of a void:

```css
background-image:
  var(--art),                                                   /* painting  */
  radial-gradient(ellipse at 50% 30%, rgba(208,255,0,0.06), transparent 62%),
  linear-gradient(160deg, #16241A 0%, #0C1410 100%);            /* fallback  */
```

Slots and filenames are in [`ART-DIRECTION.md`](./ART-DIRECTION.md).

## 5. Component patterns

- **Section head** — asymmetric `1.05fr / 0.95fr` grid, title left, standfirst
  right, `align-items: end`, hairline underneath. Collapses to one column below
  900px.
- **Nav** — minimal chrome: logo, status pill, Login, lime CTA, Menu. All
  navigation lives in the full-screen drawer. Gains a blurred solid background
  past 40px of scroll.
- **Drawer** — full-viewport `--noir-deep`, menu items at
  `clamp(2rem, 5.5vw, 4.25rem)` Fraunces with mono numerals, staggered
  transition delays, hover slides right and reveals a lime arrow. Quick links
  pinned at the bottom.
- **Sticky rail** — the engagement timeline uses `position: sticky` on the rail
  and an IntersectionObserver with `rootMargin: -45% 0px -45% 0px` to light the
  step whose block is crossing the viewport middle.
- **Industry rows** — hairline-divided, hover adds `padding-left` and reveals a
  lime arrow. No cards, no boxes.

## 6. Motion

One easing curve everywhere: `cubic-bezier(0.22, 1, 0.36, 1)`. Reveals are
`opacity` + `translateY(1.5rem)` over `0.9s`, triggered by IntersectionObserver
and unobserved after firing. `prefers-reduced-motion: reduce` disables reveals
and collapses all durations.

## 7. If this ever moves to Tailwind

```js
// tailwind.config.js
theme: {
  extend: {
    colors: {
      noir:  { DEFAULT: '#0B130E', deep: '#070C09' },
      panel: { DEFAULT: '#121D16', hi: '#16241A' },
      lime:  { DEFAULT: '#D0FF00', dim: '#C4FA00' },
      bone:  '#F3F4ED',
      moss:  { DEFAULT: '#6E8273', lt: '#93A598' },
    },
    fontFamily: {
      display: ['Fraunces', 'serif'],
      sans:    ['Inter', 'sans-serif'],
      mono:    ['IBM Plex Mono', 'monospace'],
    },
    letterSpacing: { telemetry: '0.22em' },
    transitionTimingFunction: { ease: 'cubic-bezier(0.22,1,0.36,1)' },
  },
}
```

The corner brackets stay a plain CSS utility — the four-layer mask is not worth
expressing in arbitrary-value syntax.
