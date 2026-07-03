---
name: comp-reality
description: Translate any offer or listed pay into what it actually means for the user — PKR purchasing power vs. their cost of living, plus how they'd get paid (Payoneer/Wise/Deel/EOR) and the tax questions it raises. Use inside evaluate, or standalone when the user asks "is this actually good money for me?".
---

# comp-reality

A $70k remote salary and a PKR 400k/month local job are not comparable until you account for
purchasing power, remittance, and tax. This skill makes the number honest.

## Input

A job record (with `comp_raw`) or pasted comp text. Reads `config/settings.yaml` for the FX
anchor, cost-of-living baseline, comp targets, and available payment paths. Reads
`profile/profile.md` for the user's own targets.

## Procedure

1. **Normalize the number.** Parse `comp_raw` into an annual and monthly figure. If comp isn't
   stated, produce a **clearly-labeled market estimate** from the role/seniority/location —
   never present an estimate as a fact. If you truly can't estimate, return `unknown`.
2. **Convert to PKR** using `fx.usd_to_pkr` from settings. Always label conversions as
   *approximate* and note the rate used and its date-sensitivity.
3. **Purchasing-power read.** Compare monthly PKR take-home against
   `monthly_cost_of_living_pkr` and the user's targets. Express as a multiple ("~X× your cost of
   living", "~Y% of your remote target").
4. **Payment path.** Assess how the user would actually receive this money given
   `payment_paths`: direct employment (rare cross-border), contractor + Payoneer/Wise, or via an
   Employer-of-Record. Flag if the role's structure doesn't match any path the user has.
5. **Tax questions.** Surface the questions this raises (freelancer vs. salaried tax treatment,
   foreign remittance rules, filer status) — as *questions to confirm with a professional*, not
   answers.
6. **Output** a 0–100 **comp-purchasing-power sub-score** (feeds Reality at weight 15) plus a
   short plain-language summary.

## Output shape

- `comp_annual` / `comp_monthly` (with currency), `comp_pkr_monthly` (approx), estimate? y/n
- purchasing-power multiple, payment-path verdict, tax flags
- sub-score + one-paragraph summary

## Guardrails

- Estimates are always labeled as estimates. FX is always labeled approximate.
- **This is not tax, financial, or immigration advice.** It raises questions; it does not answer
  them. State this in the output.
- Don't moralize about the number — give the user the real picture and let them decide.
