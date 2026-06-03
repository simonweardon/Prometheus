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

The Dockerfile and nginx config serve the `First` file as the marketing site,
and reverse-proxy the client portal + billing API (see below) behind the same
origin.

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

### Running the backend

```bash
cd backend
cp .env.example .env        # set JWT_SECRET, and Stripe keys for live billing
npm install
npm run migrate             # creates the SQLite DB + a default admin
                            # (dev) also seeds a demo client you can log in as
npm start                   # serves the API + portal on PORT (default 3001)
```

Default dev credentials (created by `npm run migrate`):

- Admin: `admin@example.com` / `changeme`
- Demo client: `client@example.com` / `changeme`

The portal pages are served by the backend at `/app/login.html`,
`/app/admin.html` and `/app/portal.html`. In production, nginx proxies `/app`
and the API paths to the backend — set `BACKEND_ORIGIN` (default
`http://backend:3001`) to wherever the backend runs. Stripe is optional: without
keys the system runs in a "manual" mode (invoices/quotes are tracked but not
charged online).
