---
name: ingest
description: Turn a pasted job listing (from Rozee, Mustakbil, LinkedIn, or anywhere you can copy text) into a clean, structured record added to the LinxIn pipeline. Use when the user pastes a job post or says "ingest this listing" / "add this job".
---

# ingest

The paste-and-parse entry point. Local Pakistani boards have no clean API, so this is how they —
and anything else copy-pasteable — enter the pipeline as first-class records.

## Input

Raw listing text (required) and a source URL (optional but preferred). The user may paste several
at once; process each into its own record.

## Procedure

1. **Extract** the following fields. Use `unknown` for anything genuinely absent — never guess:
   - `title`, `company`, `source` (e.g. rozee / linkedin / greenhouse / referral), `url`
   - `remote_policy` (onsite / hybrid / remote), `location`
   - `comp_raw` (verbatim comp text if stated, else `unknown`)
   - key requirements / stack (kept in the report, not the table)
2. **Assign an id.** Short, stable, human-readable: `company-role-NN` (lowercase, hyphenated),
   unique against existing ids in `data/tracker.md`.
3. **Duplicate check.** Before adding, call `track` (or apply its dedup logic): if the same
   company+title or url already exists, update that row instead of creating a new one and tell
   the user.
4. **Write the row** to `data/tracker.md` with `status: new`, scores blank, `geo: unknown`,
   `comp_pkr` blank (populated later by `evaluate`/`comp-reality`).
5. **Stash the full text.** Save the raw listing + extracted fields to
   `data/reports/<id>.md` under a `## Raw listing` heading so later skills have the source.
6. **Report** what you added (id, title, company) and prompt: "Run `evaluate` on it?"

## Guardrails

- Do not fabricate comp, location, or requirements. Missing ⇒ `unknown`.
- Do not score the job here — `ingest` only structures and stores. Scoring is `evaluate`'s job.
- Preserve the original text verbatim in the report; users need it to verify later.
