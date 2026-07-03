---
name: proposal
description: Freelance track — write a tailored proposal for an Upwork / Fiverr / Toptal job and give profile/gig optimization notes, with freelance-specific scam checks. Use when the user says "write a proposal for this Upwork job", "help me bid on this", or "optimize my freelance profile".
---

# proposal

For many people hunting from Pakistan, freelancing *is* the income path — so LinxIn treats it as
first-class, not an afterthought. This skill drafts a proposal that stands out and flags the
freelance-specific traps.

## Input

A freelance job post (pasted, or an ingested job id) and `profile/profile.md`. Reads
`profile/stories.md` for reusable proof, and `config/settings.yaml` for rate/payment context.

## Procedure

1. **Trust-check, freelance flavor.** Run `trust-check`, then add freelance-specific red flags:
   - Client asks to **move off-platform** (WhatsApp/Telegram/email) before hiring — a top way
     freelancers get scammed and lose platform protection.
   - **Free "test task"** that looks like real deliverable work.
   - Requests to **pay for anything** (a "starter kit", tools, Connects on your behalf).
   - Payment method that bypasses escrow; vague scope with urgent, oversized promises.
   - New client, no payment verified, no history / reviews.
   If it smells like a scam, say so plainly before writing anything.
2. **Comp reality, freelance rate.** Sanity-check the budget against a fair rate for the scope
   and the user's target (via `comp-reality`), noting Payoneer/withdrawal realities. Warn on
   race-to-the-bottom budgets.
3. **Read the post like a human.** Identify the client's actual problem and any explicit
   instruction (many posts hide a keyword/first-line request to filter spammers — honor it).
4. **Draft the proposal:** open with *their problem restated*, not "I am an expert with X years".
   Then a specific, credible plan + one piece of proof (a matching story/portfolio item), a
   clarifying question or two, and a clear next step. Keep it short — clients skim.
5. **Profile/gig notes (optional).** If asked, give concrete tweaks: headline, specialization,
   portfolio ordering, gig packaging.
6. **Save** to `output/<id>-proposal.md` (or print for pasting). Offer to bank any new proof
   story via `story-bank`.

## Guardrails

- **No fabrication** — real skills, real portfolio, real availability. Never claim experience the
  user doesn't have.
- Protect the user: never advise going off-platform to "save fees" before payment protection
  exists; explain why.
- Specific and concise beats long and generic — clients reward signal.
- Output stays local; the user submits it.
