---
name: cover-letter
description: Draft a researched, specific cover letter for one job — pulling reusable narratives from the story bank and asking the user for the genuinely human bits rather than inventing them. Then render to PDF. Use when the user says "write a cover letter for X".
---

# cover-letter

A good cover letter is specific and human. This skill does the research and structure, but asks
*you* for the parts only you can supply — it does not fabricate motivation or memories.

## Input

A job id (reads `data/reports/<id>.md` for the JD + evaluation, including the suggested
cover-letter angles). Reads `profile/profile.md` and `profile/stories.md` (the story bank).

## Procedure

1. **Refuse scams.** If `status: scam` (or Trust below threshold), stop and explain.
2. **Gather angles.** Pull the suggested angles from the evaluation report and matching STAR
   stories from `profile/stories.md`.
3. **Ask the human questions.** Interactively ask the user 2–4 targeted questions you can't
   answer for them, e.g.: *why this company specifically? a concrete moment that shows the
   relevant strength? anything personal connecting you to their mission?* Wait for answers.
4. **Draft** a 3–4 paragraph letter: a specific hook (not "I am writing to apply"), why you fit
   (grounded in real experience + a story), why *this* company (from their answers/research), and
   a confident close. Keep it tight — under one page.
5. **Offer to save the story.** If the user shared a strong new narrative, offer to add it to
   `profile/stories.md` in STAR+Reflection form (via `story-bank`) so it's reusable.
6. **Render:** fill `templates/cover-letter.html` → `output/<id>-cover-letter.html`, then
   `node scripts/render-pdf.mjs output/<id>-cover-letter.html`. Relay the Playwright note if it's
   not installed.

## Guardrails

- **Never invent** the user's motivations, opinions, or experiences. If you don't have the human
  detail, ask — don't make it up. A fabricated "I've admired your mission since…" is worse than
  none.
- Specific over generic every time. Cut filler and clichés.
- Match the user's voice; offer options if tone is unclear rather than guessing.
- Output stays local in `output/`; the user sends it.
