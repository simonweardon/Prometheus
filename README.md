# Prometheus

A single-page marketing site served by nginx (`First` → `index.html`).

## Current state: Prometheus Solutions (fire theme), trimmed

The live site (`First`) uses the original **Prometheus Solutions** fire-themed
styling and copy, with two content sections removed:

- the large decorative illustrations, and
- the "Companies we've transformed" client logos section.

The manifesto section uses a single-column layout (its portrait illustration was
removed).

### Backups / history

- [`prometheus-original.html`](./prometheus-original.html) is the untouched
  original Prometheus Solutions page, illustrations included. Restore it with
  `cp prometheus-original.html First`.
- The short-lived "Renaissance Dynamics" restyle lives in git history if it is
  ever wanted again.

The Dockerfile and nginx config always serve the `First` file.
