---
name: interview-prep
description: Prepare the user for an interview for a specific role — likely questions, company research, and their best talking points mapped to the story bank. Use when the user says "prep me for this interview", "I got a call for X", or a job moves to interview status.
---

# interview-prep

Turns a role into a focused prep pack, grounded in what you actually know about the company and
the stories you've already banked.

## Input

A job id (reads `data/reports/<id>.md` for the JD + evaluation). Reads `profile/profile.md`,
`profile/stories.md`, and any company notes from the trust/eval steps.

## Procedure

1. **Company research summary.** Pull together what's known: what they do, product, stage,
   recent news, and how the role fits. Flag what you *couldn't* verify rather than guessing.
2. **Likely questions**, in three buckets:
   - **Behavioral** — mapped to competencies in the JD.
   - **Role/technical** — the actual skills the JD demands.
   - **Their-context** — questions specific to this company/product/stage.
3. **Map to your stories.** For each behavioral competency, name the best-fit story from
   `story-bank`. Flag competencies with **no matching story** — those are prep gaps to fill
   (offer to build the story via `story-bank`).
4. **Your questions for them.** Suggest sharp questions the user can ask — including the
   Reality-Score ones that matter for a Pakistan-based candidate: geo/work-eligibility
   confirmation, timezone/async expectations, how contractors/EOR get paid, equipment/onboarding.
5. **Logistics reality check.** Note timezone of the likely interview slot vs. PKT (from
   `config/settings.yaml`) so the user isn't blindsided by a 2am live-coding round.
6. **Save** to `data/reports/<id>-prep.md` and summarize the top things to rehearse.

## Guardrails

- **Don't fabricate** company facts or news — if you're not sure, say "verify this". Walking in
  with a confidently-wrong "fact" is worse than not knowing it.
- Prep the user to be *honest and prepared*, not to bluff. Gaps get flagged, not papered over.
- Keep it actionable: a few strong stories rehearsed beats a wall of generic advice.
