---
name: tailor-cv
description: Produce an ATS-optimized CV tailored to one specific job, starting from the right CV base (international vs local), then render it to PDF. Use when the user says "tailor my CV for X", "make a CV for this role", after a job is marked pursue.
---

# tailor-cv

Turns your base CV into a sharp, ATS-friendly CV aimed at one listing — from the correct base,
with the correct PII rules.

## Input

A job id (reads `data/reports/<id>.md` for the JD + evaluation, including the CV-match gaps).
Reads `profile/cv-intl.md` OR `profile/cv-local.md` and `profile/profile.md`.

## Procedure

1. **Refuse scams.** If the job's `status` is `scam` (or Trust < threshold), stop and say why.
   Don't tailor a CV for a likely fraud.
2. **Pick the base.** International/remote role ⇒ `cv-intl.md`. Domestic Pakistan role ⇒
   `cv-local.md`. If unsure, ask.
3. **Enforce PII rules for international CVs:** never include photo, CNIC, date of birth, marital
   status, religion, or gender. If the base somehow contains them, strip them and tell the user.
4. **Tailor honestly.** Reorder and rephrase real experience to match the JD's language and the
   report's CV-match gaps. Inject the JD's genuine keywords **only where they're true** of the
   user. Never invent employers, titles, dates, skills, or metrics.
5. **Render HTML.** Fill `templates/cv.html`: replace `{{TITLE}}` and `{{CONTENT}}` with semantic,
   ATS-safe markup (see the template's comment). Write to `output/<id>-cv.html`.
6. **Make the PDF:** `node scripts/render-pdf.mjs output/<id>-cv.html`. If Playwright isn't
   installed, the script says how to add it — relay that; the HTML is still usable (print to PDF
   from any browser).
7. **Report** what you changed vs. the base and which gaps you addressed vs. couldn't (because
   the experience genuinely isn't there — those are honesty flags, not things to fabricate).

## Guardrails

- **Truth is non-negotiable.** Tailoring = emphasis and phrasing, never fabrication. A tailored
  CV must survive an interview.
- Keep it ATS-safe: single column, real text, standard headings, no images or layout tables.
- International CVs never carry the sensitive PII listed above.
- Output stays in `output/` (gitignored). Nothing is sent anywhere — the user submits it.
