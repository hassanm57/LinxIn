---
name: evaluate
description: Run the full three-score evaluation (Fit / Reality / Trust) on one or more jobs in the pipeline and write a decision report with a clear pursue/skip recommendation. Use when the user says "evaluate this job", "score the new jobs", or "should I apply to X?".
---

# evaluate

The orchestrator and the product's soul. Turns a raw job record into an honest decision.

## Input

One job id, several ids, or "all new" (every row with `status: new`). Reads:
`data/reports/<id>.md` (raw listing), `profile/profile.md`, `config/settings.yaml`,
`config/weights.yaml`.

## Procedure

For each job:

1. **Trust first.** Run `trust-check`. If Trust < `thresholds.scam_flag_below`, set
   `status: scam`, write the report, **skip the rest** (don't waste effort scoring a scam), and
   move on.
2. **Reality.** Run `geo-check` and `comp-reality`, then compute the **Reality Score** as the
   weighted sum of: geo-eligibility (40), timezone overlap (20), payment feasibility (20),
   comp purchasing power (15), interview-process fit (5). Remember geo acts as a near-veto:
   `auth-required` should drag Reality below its threshold regardless of the rest.
3. **Fit.** Compute the **Fit Score** as the weighted sum of the `config/weights.yaml` fit
   dimensions (skills, seniority, mission, growth, comp-vs-target, company health, work style,
   effort÷reward), grounded in the JD and the user's profile.
4. **Recommend.** A job is **pursue** only if all three clear their thresholds
   (`fit` ≥ 65, `reality` ≥ 50, `trust` ≥ 70 by default). Otherwise **skip**, naming the
   specific blocker ("great fit, but auth-required — skip").
5. **Write the report** to `data/reports/<id>.md` using `templates/report.template.md`:
   the three scores, per-dimension reasoning, CV-match gaps, suggested cover-letter angles, and
   the pursue/skip call with its reason.
6. **Update the tracker** via `track`: write `fit`, `reality`, `trust`, `geo`, `comp_pkr`, and
   set `status` to `evaluated` (then `pursue`/`skip`/`scam` per the recommendation).
7. **Summarize** to the user: a compact table of id · fit · reality · trust · verdict, newest
   first, with a one-line reason each.

## Guardrails

- **Never fabricate.** Anything you couldn't determine is `unknown`, and an `unknown` lowers
  confidence — it doesn't get an optimistic default. Say what you couldn't find.
- **Legible scoring.** Every score must be explained per dimension so the user can overrule it.
  Scores are guidance, not verdicts.
- **Respect the veto logic:** a scam short-circuits everything; `auth-required` fails Reality.
- Do not tailor CVs or letters here — that's `tailor-cv` / `cover-letter`, and only for jobs the
  user chooses to pursue. `evaluate` decides; it doesn't apply.
