# Prometheus

A single-page marketing site served by nginx (`First` → `index.html`).

## Current theme: Renaissance Dynamics

The live site (`First`) is styled as **Renaissance Dynamics** — a Renaissance
visual language (Brunelleschi's Florence Cathedral dome, marble sculpture in the
atelier, the Creation-of-Adam "divine spark", a perspective loggia) paired with a
luminous, future-facing palette of gilt gold, fresco azure and marble.

### Reverting to the original "Prometheus Solutions" theme

The original fire-themed site is preserved verbatim at
[`prometheus-original.html`](./prometheus-original.html). To switch back:

```sh
cp prometheus-original.html First
```

Then commit. Nothing else changes — the Dockerfile and nginx config always serve
the `First` file.
