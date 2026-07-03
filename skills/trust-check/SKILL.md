---
name: trust-check
description: Assess whether a listing is legit or a likely scam / ghost job, tuned for local-market fraud patterns. Use inside evaluate, or standalone when the user asks "is this a scam?" / "is this recruiter real?".
---

# trust-check

Local boards and WhatsApp recruiters are full of scams, advance-fee fraud, MLM traps, and ghost
jobs that exist only to harvest CVs. This skill scores legitimacy and itemizes the evidence.

## Input

A job record id (reads `data/reports/<id>.md`) or pasted listing / recruiter message. Any
company name, domain, or recruiter contact the user has.

## Scoring

Start at **100**, subtract for red flags, and note verifications that raise confidence. Output a
0–100 **Trust Score** plus an itemized list of flags and verifications.

### Verifications (raise confidence)
- Resolvable company domain with real, consistent content.
- LinkedIn company page with real, plural employees; recruiter is a traceable person there.
- The same job appears on the company's own careers page or a reputable ATS (Greenhouse/Ashby/Lever).
- Company-domain email (not personal Gmail), professional and specific communication.

### Red flags (deduct)
- **Any request for money** — "registration fee", "training kit", "security deposit", "visa/processing fee". *Legit employers never charge you.* Large deduction.
- Requests for **CNIC, bank details, card numbers, or OTPs before a written offer**. Large deduction.
- **WhatsApp/Telegram-only** contact; personal Gmail instead of a company domain.
- **"Online earning" / "work from home, no experience, high pay" / MLM / recruit-others** framing.
- Comp **wildly above market** for the stated skills ("too good to be true").
- Vague JD, no real company name, "immediate joining", urgency/pressure tactics.
- **Ghost-job signals:** reposted for months, "always accepting applications", no close date, generic reqs that never fill.

## Verdict bands

- **≥ 70:** looks legit (still: verify before sharing PII).
- **40–69:** proceed with caution — list what to verify first.
- **< 40:** **likely scam** — recommend `status: scam`, quarantine, and exclude from tailoring.

## Guardrails

- **A high Trust score is confidence, not a guarantee.** Always restate that the user must
  verify before sharing personal info, paying anyone, or accepting an offer. Scams still slip
  through.
- Do not accuse a real company of fraud on thin evidence — separate "unverified" from "red flag".
- When you couldn't verify something (e.g. no internet access to the domain), say so plainly
  rather than assuming legitimacy.
