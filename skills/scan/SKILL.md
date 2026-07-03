---
name: scan
description: Pull fresh listings from the configured ATS portals (Greenhouse / Ashby / Lever), then add the genuinely new ones to the pipeline. Use when the user says "scan for jobs", "check the portals", "find new backend roles", etc.
---

# scan

Bulk intake from company job boards. Where `ingest` is one pasted listing, `scan` fetches many
from the ATS portals in `sources/companies.yaml`. Pairs a deterministic Node script (the
fetching) with your judgment (the deduping and filing).

## Prerequisites

- `sources/companies.yaml` has real, curated companies (not the placeholder examples).
- Dependencies installed once: `npm install` (the script uses `js-yaml`; needs Node ≥ 18).

## Procedure

1. **Run the scanner**, passing filters the user asked for:
   ```
   node scripts/scan.mjs [--keywords "backend,node,python"] [--remote-only] [--source greenhouse|lever|ashby]
   ```
   It fetches every configured board, normalizes results, applies the filters, and writes a
   staging file: `data/staging/scan-<timestamp>.json`. Read that file.
2. **Report the raw haul** first: how many candidates per board, and any boards that errored
   (a 404 usually means a wrong `token` in `sources/companies.yaml` — tell the user which one).
3. **De-dupe against the pipeline.** For each staged job, apply `track`'s dedup logic: if its
   `url`, or its company+title, already exists in `data/tracker.md`, skip it (don't re-add).
4. **File the new ones.** For each genuinely new job:
   - Write a row to `data/tracker.md` with `status: new`, `geo: unknown`, scores + `comp_pkr`
     blank, `remote_policy` from the scan, and `comp_raw` if the ATS provided it.
   - Save the normalized record + full `description` to `data/reports/<id>.md` under
     `## Raw listing`, so `evaluate` has the source text later.
5. **Summarize:** "N new, M duplicates skipped, K boards errored." Then prompt:
   "Run `evaluate` on the new jobs?"

## Guardrails

- **Respect the boards.** These are public endpoints — don't hammer them; scan on demand, not in
  a tight loop. Honor each board's terms of service.
- `scan` only *collects and files*. It does NOT score — that's `evaluate`. Missing fields stay
  `unknown`; never guess comp or location.
- The scanner already skips boards that fail, so one bad token won't abort a run — but surface
  those failures so the user can fix their config.
- Don't silently overwrite an existing row's data during dedup; prefer keeping the richer record
  (defer to `track`).
