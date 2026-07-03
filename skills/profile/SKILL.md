---
name: profile
description: Interactively build or update the user's LinxIn career profile and their two CV bases (local + international). Use when the user says "set up my profile", "onboard me", "update my CV base", or when other skills report that profile/ is missing or incomplete.
---

# profile

Build or update the single description of the user that every other LinxIn skill reads.

## What you produce

- `profile/profile.md` — targets, skills, comp expectations, constraints.
- `profile/cv-intl.md` — base CV for GLOBAL roles.
- `profile/cv-local.md` — base CV for DOMESTIC (Pakistan) roles.
- `profile/stories.md` — an empty-but-formatted STAR+Reflection story bank.

Templates for each live at `profile/*.template.md`. The real files are gitignored.

## Procedure

1. **Check state.** If a target file already exists, read it and offer to *update* rather than
   overwrite. Never silently clobber the user's real data.
2. **Interview the user**, section by section, using the questions in
   `profile/profile.template.md`. Ask in small batches, not one giant wall. Accept "skip" for
   anything they're not ready to answer and leave a clear TODO marker.
3. **Write `profile/profile.md`** from their answers.
4. **Build the two CV bases.** If the user pastes an existing CV, split its content into the
   local and international bases. If not, scaffold from the templates and fill what you learned.
5. **Enforce the PII rule on `cv-intl.md`:** no photo, CNIC, date of birth, marital status,
   religion, or gender — ever. If the user's pasted CV contains these, remove them from the
   international base and tell the user you did.
6. **Confirm** by summarizing what you wrote and what's still marked TODO.

## Guardrails

- These files contain personal data. Keep them local; never send CV contents anywhere except
  where the user is applying.
- Do not invent experience, skills, or metrics. Blanks stay blank (marked TODO) until the user
  fills them.
- The local CV may hold more PII by the user's choice; still remind them it's sensitive.
