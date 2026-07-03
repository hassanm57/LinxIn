# LinxIn

**Your AI-run war room for your job hunt!**

LinxIn turns your AI coding CLI (Claude Code, and friends) into a local, private job-search
operations system. It reads listings, scores them honestly, tells you which ones are real,
tells you what they'd actually pay *you* in rupees, then tailors your CV, drafts your cover
letter or proposal, and preps you for the interview — all on your machine, all human-in-the-loop.

It **never** applies for you. AI evaluates and drafts; **you** decide and hit submit.

> **Status: `v0` — early build.** This repo ships the design and philosophy (this README +
> [`DESIGN.md`](./DESIGN.md)) plus a working core: onboarding (`profile`), pipeline intake
> (`ingest` / `track`), and the full three-score evaluation engine (`evaluate` with `geo-check`,
> `comp-reality`, `trust-check`), plus a working ATS `scan`er (`scripts/scan.mjs`, live against
> Greenhouse/Ashby/Lever), the output layer (`tailor-cv` + `cover-letter` → ATS-clean PDFs via
> Playwright), and the freelance + prep track (`proposal`, `story-bank`, `interview-prep`). That
> means the whole search loop works today — discover, evaluate, tailor, apply, and prep — all
> local and human-in-the-loop, and there's a local web dashboard (`npm run dashboard`) to browse
> it all. Every roadmap milestone is now built; see the [Roadmap](#roadmap). Nothing here
> silently pretends to run; if you're here to contribute, you're early — welcome.

---

## Why this exists

Most job-search tooling is built for someone applying to jobs *in the country they live in*,
paid in the local currency, already authorized to work there. If that's you, great — tools
like [career-ops](https://github.com/santifer/career-ops) (the project that inspired this one)
are excellent.

But if you're job-hunting from Pakistan — or anywhere in the Global South chasing global remote
roles — the hard questions are different, and they come *before* "is this a good job?":

1. **Can I even get this?** A huge share of "remote" postings are quietly *US-only* or
   *EU-only*. Geo-eligibility is the number-one filter, not skills.
2. **Is this even real?** Local boards and "online earning" WhatsApp recruiters are full of
   scams, advance-fee fraud, MLM traps, and ghost jobs that exist only to harvest CVs.
3. **What does this actually pay *me*?** A $70k remote salary and a PKR 400k/month local job
   aren't comparable until you factor in purchasing power, how you'd get paid
   (Payoneer / Wise / Deel / EOR), and tax.

LinxIn is built around *those* questions first — while still doing everything a great
application co-pilot should. It's for Pakistanis, and for anyone, anywhere, playing the same
uphill game.

---

## The core idea: three scores, not one

Every job LinxIn evaluates gets **three independent scores**. You pursue a role only when it
clears your thresholds on all three. This is the heart of LinxIn.

| Score | The question it answers | What goes into it |
|---|---|---|
| **Fit** `0–100` | *Should I want this?* | Skills & stack match, seniority fit, mission/domain, growth, company health, work style, comp vs. your target |
| **Reality** `0–100` | *Can a me-in-Pakistan actually land it and live on it?* | Geo-eligibility, timezone overlap, remittance/payment feasibility, PKR purchasing power, interview-process fit |
| **Trust** `0–100` | *Is this legit — or a scam / ghost job?* | Verifiable company & recruiter, ghost-job signals, fraud red flags, data-ask red flags |

A dream role you can't legally be hired for scores high on Fit and near-zero on Reality — and
LinxIn tells you *not to waste your evening on it*. A "$$$, easy, work from home, message on
WhatsApp" listing scores near-zero on Trust and gets flagged as a likely scam. **Your time is
worth protecting. So is the recruiter's.**

See [`DESIGN.md`](./DESIGN.md) for the full dimension-by-dimension weighting.

---

## What LinxIn is (and isn't)

**It is** a filter and a force-multiplier. It helps you find the *few genuinely worth-it*
opportunities among hundreds of listings, and then makes each application dramatically stronger.

**It is not** a spray-and-pray machine. There is no bulk auto-apply. LinxIn will actively
discourage you from applying to low-scoring roles. Mass applications waste your time, annoy
recruiters, and — for cross-border roles — burn goodwill Pakistani applicants can't spare.

---

## The skills

LinxIn is organized as a set of focused **skills** ("modes") your AI CLI can invoke. Each is a
self-contained instruction set with its own inputs, outputs, and guardrails.

| Skill | What it does |
|---|---|
| `evaluate` | Runs the full three-score evaluation on a listing and writes a structured report |
| `geo-check` | Determines whether a Pakistan-based / remote-anywhere candidate is actually eligible |
| `comp-reality` | Converts any offer into PKR purchasing-power terms; flags remittance & tax realities |
| `trust-check` | Legitimacy & scam / ghost-job detection, tuned for local-market fraud patterns |
| `tailor-cv` | Produces an ATS-optimized CV tailored to one listing, from the right CV base |
| `cover-letter` | Drafts a researched, angle-driven cover letter — asks *you* for the human bits |
| `proposal` | Freelance track: Upwork / Fiverr / Toptal proposals & profile optimization |
| `scan` | Pulls fresh listings from configured ATS portals (Greenhouse / Ashby / Lever) |
| `ingest` | Paste any listing (Rozee, Mustakbil, LinkedIn PK…) → clean structured job record |
| `interview-prep` | Role-specific prep: likely questions, company research, your talking points |
| `story-bank` | Accumulates your STAR + Reflection stories across evaluations, reusable everywhere |
| `track` | Maintains the pipeline: dedup, status, integrity — the single source of truth |

---

## Built for Pakistan + global remote

These are the pieces that make LinxIn different from a Western job-tracker:

- **Geo-eligibility, front and center.** `geo-check` reads the listing (and, where possible, the
  ATS application form) to classify a role as *remote-anywhere*, *remote-with-restrictions*,
  *contractor/EOR-friendly*, or *authorization-required* — before you invest in an application.
- **Comp in real terms.** `comp-reality` translates USD/EUR/GBP offers into PKR
  purchasing-power, and surfaces *how* you'd actually get paid (Payoneer, Wise, Deel, an
  Employer-of-Record) and the tax questions that follow. No more "wow $$$" without context.
- **Trust hardened for the local market.** `trust-check` knows the local patterns: upfront
  "registration/training fees," WhatsApp-only recruiters, requests for CNIC or bank details
  before an offer, MLM/"online earning" framing, and reposted-forever ghost jobs.
- **Dual-CV profiles.** LinxIn keeps two CV bases: a **local-format** CV (the Pakistani norm)
  and an **international ATS** CV. When tailoring for global roles it *strips PII* — photo,
  CNIC, marital status, religion, date of birth — and warns you when a local board asks for
  more than it should.
- **A freelance track, not an afterthought.** For many people here, Upwork/Fiverr/Toptal *is*
  the income path. `proposal` treats it as first-class.
- **Local boards aren't second-class.** No clean API? `ingest` turns a copy-pasted listing into
  the same structured record an ATS scan produces, so Rozee and Greenhouse live in one pipeline.

---

## Sources

- **ATS portals** — Greenhouse, Ashby, Lever public job APIs, across a starter set of
  remote-friendly companies (configurable in `sources/`).
- **Global remote boards** — recipes for the big remote aggregators.
- **Pakistan boards** — Rozee.pk, Mustakbil.com, Indeed PK, LinkedIn — via `ingest`
  (paste-and-parse) until/unless clean access exists.
- **Anything else** — if you can copy the text, LinxIn can structure it.

---

## Quick start (planned)

> Aspirational — this is the intended first-run experience, not yet wired up. Track progress in
> the [Roadmap](#roadmap).

```bash
# 1. Get the toolkit
npx linxin init

# 2. Build your profile (interactive): your target roles, skills,
#    comp expectations, and your two CV bases (local + international)
#    -> writes to profile/

# 3. Bring in some jobs
#    From an ATS portal:
#      "scan the configured portals for backend roles"
#    Or paste a Rozee/LinkedIn listing:
#      "ingest this listing: <paste>"

# 4. Evaluate — get the three scores + a report
#      "evaluate the newest jobs in my pipeline"

# 5. For anything that clears your thresholds:
#      "tailor my CV and draft a cover letter for <job>"

# 6. Browse everything in the visual dashboard
npm run dashboard      # opens http://localhost:4173
```

Everything runs inside your AI CLI and on your disk. See [`DESIGN.md`](./DESIGN.md) for how the
skills map onto Claude Code (and portability notes for other agent CLIs).

---

## The pipeline & dashboard

Your entire search lives in one human-readable markdown file (`data/tracker.md`) — the single
source of truth. `track` keeps it clean: de-duplicating, normalizing statuses, and running
integrity checks so nothing silently rots.

A local web dashboard (`dashboard/`) gives you a fast, visual way to browse, filter, and sort
your pipeline by any of the three scores, status, source, or geo-eligibility. Run
`npm run dashboard` and open the printed `localhost` URL — it reads your `data/tracker.md`
directly, serves only to your machine, and never phones home. Each role shows animated Fit /
Reality / Trust rings and a pursue / skip / scam verdict; click any card to read its full
evaluation report. It's a zero-dependency Node server, so there's nothing heavy to install. (If
your tracker is empty, it shows bundled demo data so you can see the layout.)

---

## Architecture & tech stack

| Layer | Choice |
|---|---|
| Brain | AI coding CLIs — **Claude Code** first-class; portable to OpenCode, Codex, Gemini CLI |
| Skills | Markdown skill/mode definitions with explicit guardrails |
| Scripts | Node.js for scanning, parsing, and orchestration |
| Documents | Playwright + HTML templating for ATS-clean PDF output |
| Data | Markdown tables (tracker), YAML (config), TSV (batch) — all diff-able, all yours |
| Dashboard | Zero-dependency local Node web server + a hand-built UI (components in the [21st.dev](https://21st.dev) / [UI Verse](https://uiverse.io) aesthetic — gradient-border cards, conic score rings) |

Design principle: **local-first and legible.** Your data is plain text on your machine. No
account, no cloud lock-in, no CV leaving your disk unless *you* send it.

---

## Data & privacy

- Everything lives locally. `data/` and `output/` are gitignored by default.
- Your CVs, profile, and pipeline never leave your machine except through the AI CLI you've
  chosen and the applications *you* choose to submit.
- The dual-CV / PII-stripping behavior exists precisely so you don't over-share sensitive
  personal data (CNIC, DOB, photo) with international employers or sketchy boards.

---

## Roadmap

- [x] Design & three-score model (`DESIGN.md`)
- [x] Repo scaffold + config defaults (`config/`)
- [x] `profile` + dual-CV bootstrap (skill + templates)
- [x] `ingest` (paste-and-parse for local boards) + `track` (pipeline)
- [x] `evaluate` (Fit / Reality / Trust) + report template
- [x] `trust-check` local-fraud ruleset
- [x] `geo-check` + `comp-reality`
- [x] `scan` (Greenhouse / Ashby / Lever) — Node scanner + `sources/` config
- [x] `tailor-cv` + `cover-letter` + PDF render (Playwright)
- [x] `proposal` (freelance track)
- [x] `story-bank` + `interview-prep`
- [x] `track` (pipeline) + local web dashboard (three-score rings, verdicts, report drawer)

---

## Disclaimers

- LinxIn is a decision-support tool. Scores are **guidance**, not verdicts. The AI can be wrong
  — about fit, about eligibility, and especially about legitimacy. **Do your own due diligence
  before sharing personal information, paying anyone anything, or accepting an offer.** A high
  Trust score is not a guarantee; a scam can still slip through.
- Nothing here is legal, tax, immigration, or financial advice. Remittance, tax, and work-
  authorization rules change and vary by case — confirm with a qualified professional.
- Respect the terms of service and rate limits of any job board or ATS you point LinxIn at.
- You are responsible for everything you submit. LinxIn drafts; you sign.

---

## Contributing

Early days — the most valuable contributions right now are to the **design**: sharpening the
three-score model, the local-fraud ruleset, geo-eligibility heuristics, and source recipes for
Pakistani boards. Open an issue with your idea before large changes. See [`DESIGN.md`](./DESIGN.md).

## Credits

Inspired by [career-ops](https://github.com/santifer/career-ops) by santifer — a genuinely
great locally-run job-search system. LinxIn takes the human-in-the-loop, local-first philosophy
and re-centers it on the realities of hunting from Pakistan and the wider Global South.

## License

MIT (see [`LICENSE`](./LICENSE)).
