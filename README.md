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

The root `Dockerfile` builds a single all-in-one image: nginx serves the `First`
file as the marketing site and reverse-proxies the client portal + billing API
(see below) to a Node backend running inside the same container.

## Client tracking & billing system (`backend/`)

A Node/Express + SQLite backend powers an **admin dashboard** and a
**client portal**, both styled to match the marketing site.

- **Admin** (staff) log in from the **Client Login** button in the nav and land
  on a dashboard of every client: their delivery **stage** (lead → discovery →
  proposal → building → launched → maintenance → churned), services, projects,
  invoices and quotes. Admins can create clients, raise quotes, convert a quote
  into an invoice, create invoices, and grant a client portal access.
- **Clients** log in to see their own services, projects, invoices and quotes;
  **pay invoices** online (via Stripe's hosted payment page), and accept or
  decline quotes.

Roles are separated: staff live in the `users` table, clients in the `clients`
table, and JWTs carry a `role` (`admin` vs `client`) that scopes every route.

### Run it (one container)

Build and run the root `Dockerfile` — it starts the backend and nginx together,
so the **Client Login** button works out of the box:

```bash
docker build -t prometheus .
docker run -p 8080:8080 -e JWT_SECRET=$(openssl rand -hex 32) \
  -v prometheus-data:/data prometheus
# open http://localhost:8080  →  Client Login is in the top-right nav
```

Or with compose (adds a persistent volume for you):

```bash
JWT_SECRET=$(openssl rand -hex 32) docker compose up --build
```

Default dev credentials (seeded on first run, non-production only):

- Admin: `admin@example.com` / `changeme`
- Demo client: `client@example.com` / `changeme`

Mount a volume at `/data` (as above) to persist the SQLite database across
restarts; without it, data is reset when the container is recreated.

#### Admin accounts

Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` (optionally `ADMIN_NAME`) and that admin
is created on startup (create-only — it won't overwrite a password you later
change in the app). The image ships with a default admin
(`simon@getprometheussolutions.com`); **override it at deploy time** and change
the password after first login for proper secret hygiene.

To create or reset an admin against a running/existing database:

```bash
# in the backend dir, or: docker exec <container> sh -c 'cd /usr/src/app/backend && ...'
npm run create-admin -- you@example.com 'a-strong-password' 'Your Name'
# omit the password to have a strong one generated and printed once
```

### Run just the backend (local dev)

```bash
cd backend
cp .env.example .env        # set JWT_SECRET, and Stripe keys for live billing
npm install
npm run migrate             # creates the SQLite DB + seeds admin (+ demo client)
npm start                   # serves the API + portal on PORT (default 3001)
```

### How the pieces fit / deployment

The portal pages are served by the backend at `/app/login.html`,
`/app/admin.html` and `/app/portal.html`. nginx reverse-proxies `/app` and the
API paths to the backend. In the all-in-one image the backend runs on
`127.0.0.1:3001`; two env vars control the wiring if you split them apart:

- `BACKEND_ORIGIN` — where the backend is reachable (default
  `http://127.0.0.1:3001`; set e.g. `http://backend:3001` to target another
  container).
- `NGINX_RESOLVER` — DNS used to resolve that host at request time (default
  `127.0.0.11`, Docker's embedded DNS; only used when `BACKEND_ORIGIN` is a
  hostname rather than an IP).

nginx resolves the backend **at request time**, so it still boots and serves the
marketing site even if the backend is unavailable (those paths return `502`
rather than nginx crashing at startup). Stripe is optional: without keys the
system runs in a "manual" mode (invoices/quotes are tracked but not charged
online).
