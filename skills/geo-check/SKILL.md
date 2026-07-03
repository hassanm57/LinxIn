---
name: geo-check
description: Determine whether a Pakistan-based / remote-anywhere candidate is actually eligible for a role, before they invest in an application. Use inside evaluate, or standalone when the user asks "can I even apply to this from Pakistan?".
---

# geo-check

The number-one filter for Global-South job hunting: many "remote" jobs are quietly geo-locked.
This skill reads a listing (and, where available, the ATS application form) and classifies
whether the user can realistically be hired.

## Input

A job record id (reads `data/reports/<id>.md` for the raw listing) or pasted listing text.
Also reads the user's constraints from `profile/profile.md` (citizenship, work authorization).

## Output

A `geo` classification plus a one-paragraph rationale and a 0–100 **geo-eligibility sub-score**
(feeds the Reality Score at weight 40).

| geo value | Meaning | geo-eligibility sub-score |
|---|---|---|
| `anywhere` | Explicitly hires globally / remote-anywhere / any timezone | 90–100 |
| `eor` | Hires internationally via Employer-of-Record or as a contractor | 70–90 |
| `restricted` | Remote but limited to regions/countries that may exclude Pakistan | 20–50 |
| `auth-required` | Requires work authorization / on-site in a country the user can't work in | 0–15 |
| `unknown` | Genuinely can't tell from available info | 40 (neutral, flagged) |

## Signals to read

- **Inclusive:** "remote (anywhere)", "work from any timezone", "global team", "we hire via
  Deel/Remote.com", "contractors welcome", "no visa sponsorship needed because remote".
- **Restrictive:** "US-only", "must be authorized to work in [country]", "EU/EEA residents",
  "within X hours of [timezone]", "hybrid — [city] office", "eligible to work in the UK",
  "background check / SSN required", state/province lists.
- **Ambiguous:** "remote" with no geography stated ⇒ do NOT assume anywhere. Mark `restricted`
  or `unknown` and say why. Optimism here wastes the user's time.

## Guardrails

- **Be conservative.** When unclear, prefer `restricted`/`unknown` over `anywhere`. A false
  "you're eligible" costs the user hours; a false "you're not" they can override.
- Never claim to have read an ATS form you didn't actually fetch. Say what you based it on.
- Geo-eligibility acts as a near-veto in the Reality Score: `auth-required` should make Reality
  fail regardless of other dimensions. Reflect that in the sub-score.
- This is not immigration advice — it's a practical hiring-eligibility read. Say so.
