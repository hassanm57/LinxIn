# LinxIn dashboard

A local, zero-dependency web dashboard for your pipeline. It reads `../data/tracker.md`
directly, renders each role with animated **Fit / Reality / Trust** rings and a
pursue / skip / scam verdict, and lets you open the full evaluation report in a drawer.

Local-first: it serves only to your machine and never phones home.

## Run it

```bash
npm run dashboard              # from the repo root → http://localhost:4173
# or:
node dashboard/server.mjs
PORT=8080 node dashboard/server.mjs
LINXIN_TRACKER=/path/to/tracker.md node dashboard/server.mjs
```

If your real `data/tracker.md` has no jobs yet, the dashboard shows the bundled
`sample-tracker.md` (with a "demo data" badge) so you can see the layout. Ingest or scan real
jobs and it switches to your actual pipeline automatically.

## What's here

| File | Role |
|---|---|
| `server.mjs` | Zero-dep Node HTTP server: parses the tracker table, reads thresholds from `config/settings.yaml`, serves `/api/pipeline`, `/api/report/:id`, and static assets. |
| `public/index.html` | The shell. |
| `public/styles.css` | The design system. |
| `public/app.js` | Fetch, filter, sort, render cards, and the report drawer. |
| `sample-tracker.md` | Demo data shown when your real tracker is empty. |

## Design credit

The component aesthetic is built in the spirit of two libraries:

- **[21st.dev](https://21st.dev)** — the gradient-border "spotlight" cards, badge + stat-chip
  system, and the shadcn-flavored dark surfaces.
- **[UI Verse](https://uiverse.io)** — the animated conic score rings, the segmented filter
  pills, the three-dot loader, and the glow interactions.

Everything is re-implemented as dependency-free HTML/CSS/JS so the dashboard runs offline.

## A note on security

The dashboard renders text that can originate from external job listings (via `scan`), so all
untrusted fields are HTML-escaped before display, the mini markdown renderer escapes before
formatting and only allows `http(s)` links, and report ids are validated server-side to prevent
path traversal. It's still a local single-user tool — run it on your own machine.
