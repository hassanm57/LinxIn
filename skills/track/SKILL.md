---
name: track
description: Maintain data/tracker.md as the single source of truth — de-duplicate rows, normalize statuses, update a job's status or fields, and run integrity checks. Use when the user says "mark X as applied", "clean up my pipeline", "show my pipeline", or after ingest/scan/evaluate to keep the tracker consistent.
---

# track

The librarian of the pipeline. Every other skill leans on `track` to keep `data/tracker.md`
clean and trustworthy.

## Capabilities

- **Update status/fields** — e.g. "mark greenhouse-be-01 as applied" sets `status: applied` and
  `applied_on` to today. Validate the status against the allowed set.
- **De-duplicate** — detect rows sharing a url, or the same company+title, and merge them
  (keep the richest row, preserve any scores/notes, drop the empty duplicate).
- **Normalize** — enforce the allowed vocabularies for `status` and `geo`; fix casing/spacing.
- **Integrity check** — flag: malformed rows, evaluated jobs with no `data/reports/<id>.md`,
  reports with no matching row, scores outside 0–100, `status: applied` with no `applied_on`.
- **Query/report** — filter and sort the pipeline (by score, status, source, geo) for the user
  or for the dashboard.

## Allowed vocabularies

- `status`: `new` · `evaluated` · `pursue` · `skip` · `scam` · `applied` · `interview` · `offer` · `closed` · `rejected`
- `geo`: `anywhere` · `restricted` · `eor` · `auth-required` · `unknown`

## Procedure

1. Read `data/tracker.md` and parse the table.
2. Apply the requested operation (update / dedup / normalize / check / query).
3. Write the table back, preserving column order and all existing data you didn't intend to
   change. Keep the legend/header intact.
4. Report exactly what changed (rows touched, merges made, issues found). Be specific.

## Guardrails

- Never drop a row's scores, notes, or `applied_on` during a merge or normalize.
- Never invent data to "fill" a blank — blanks are valid and meaningful.
- If an operation is ambiguous (which of two rows is the real one?), ask before merging.
- `data/tracker.md` is the user's real search history — treat edits conservatively.
