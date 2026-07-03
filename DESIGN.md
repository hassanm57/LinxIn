# LinxIn — Design & Architecture

This is the in-depth spec behind [`README.md`](./README.md). It exists to make the vision
buildable: what each skill does, how the three scores are computed, what the data looks like,
and the order we build things in. It is a living document.

---

## 1. Design principles

1. **Local-first & legible.** All state is plain text (markdown / YAML / TSV) on the user's
   machine. No account, no server, no CV leaving disk unless the user sends it.
2. **Human-in-the-loop, always.** AI evaluates and drafts. The human decides and submits. There
   is no bulk auto-apply, ever.
3. **Honesty over volume.** LinxIn's job is to *reduce* the number of applications to the ones
   worth making, and make each one strong.
4. **Global-South-first framing.** Eligibility, legitimacy, and real take-home come *before*
   "is this a nice job." This is the reordering that defines the product.
5. **Legible AI.** Every score is explained. No black-box numbers — each skill writes down its
   reasoning so the user can overrule it.

---

## 2. The three-score model

Each evaluated role produces three independent 0–100 scores plus a short rationale for each.
The user sets thresholds in `config/settings.yaml`; defaults below. A role is "pursue-worthy"
only if **all three** clear their threshold.

### 2.1 Fit Score — *should I want this?*

Weighted sum of dimensions (default weights; user-tunable in `config/weights.yaml`):

| Dimension | Weight | Notes |
|---|---:|---|
| Skills & stack match | 25 | JD requirements vs. profile skills |
| Seniority fit | 15 | Under/over-leveled is a soft penalty |
| Mission / domain alignment | 10 | Do you care about the problem? |
| Growth & learning | 10 | Trajectory, mentorship, new skills |
| Compensation vs. target | 15 | Against *your* target (see comp-reality) |
| Company health | 10 | Funding, stability, layoffs, reviews |
| Work style | 10 | Remote/async/timezone expectations |
| Application effort ÷ reward | 5 | High-friction, low-payoff roles score down |

Default threshold: **65**.

### 2.2 Reality Score — *can a me-in-Pakistan land it and live on it?*

This is the LinxIn-specific score. Dimensions:

| Dimension | Weight | Notes |
|---|---:|---|
| Geo-eligibility | 40 | Output of `geo-check`. Authorization-required ⇒ near-zero. |
| Timezone overlap | 20 | Required sync hours vs. PKT (UTC+5). |
| Payment feasibility | 20 | Can you actually be paid? Payoneer/Wise/Deel/EOR/contractor. |
| Comp in PKR purchasing power | 15 | Output of `comp-reality`, vs. your local cost of living. |
| Interview-process fit | 5 | Onsite-only loops, timed live-coding at 3am PKT, etc. |

Default threshold: **50**. Geo-eligibility acts as a near-veto: an authorization-required role
can't clear this score regardless of the rest.

### 2.3 Trust Score — *is this legit?*

Starts at 100 and subtracts for red flags; adds confidence for verifiable signals. Tuned for
local-market fraud.

**Positive (verifiability):** resolvable company domain with real content; consistent LinkedIn
company + real employees; recruiter with a traceable identity; job also present on the company's
own careers page or a reputable ATS.

**Red flags (deductions):**
- Any request for money — "registration," "training kit," "security deposit," visa processing.
- Requests for CNIC, bank details, or OTPs *before* a written offer.
- WhatsApp/Telegram-only contact; personal Gmail instead of a company domain.
- "Online earning," "work from home, no experience, high pay," MLM / recruit-others framing.
- Comp wildly above market for the stated skills.
- Vague JD, no company name, "immediate joining," urgency/pressure tactics.
- Ghost-job signals: reposted for months, "always accepting applications," no real close date.

Default threshold: **70**. Below 40 ⇒ flagged as **likely scam**, quarantined in the tracker,
and excluded from tailoring skills.

> **Guardrail:** a high Trust score is *confidence, not a guarantee*. Every report restates that
> the user must verify before sharing PII, paying anyone, or accepting.

---

## 3. Skills

Each skill is a markdown definition (Claude Code skill / "mode") with: purpose, required inputs,
step-by-step procedure, output contract, and guardrails. Summary of each:

### `profile` (bootstrap)
Interactive. Captures target roles, seniority, skills, comp expectations (local + target
remote), locations/timezone, and builds the **two CV bases** — `profile/cv-local.md` and
`profile/cv-intl.md`. Records which PII the international base must never carry.

### `ingest`
Input: pasted raw listing text (+ optional URL). Output: a normalized job record (see §4) added
to the pipeline with `status: new`. Extracts title, company, location/remote policy, comp if
stated, requirements, and source. This is how Pakistani boards (Rozee, Mustakbil, LinkedIn PK)
enter the system without an API.

### `scan`
Input: source configs in `sources/`. Pulls fresh listings from Greenhouse/Ashby/Lever public
APIs, dedupes against the pipeline via `track`, adds new ones as `status: new`. Supports batch
parallel workers for large portal sets.

### `geo-check`
Input: a job record. Classifies eligibility for a Pakistan-based / remote-anywhere candidate:
`remote-anywhere` | `remote-restricted` | `contractor-eor-friendly` | `authorization-required`
| `unknown`. Reads the JD and, where available, the ATS application form's location/work-auth
questions. Feeds the Reality Score.

### `comp-reality`
Input: a job record (+ stated or estimated comp). Output: comp normalized to PKR
purchasing-power against the user's cost-of-living baseline, plus a payment-path assessment
(Payoneer / Wise / Deel / EOR / local contract) and the tax questions it raises. Explicitly not
tax advice — it raises questions, it doesn't answer them.

### `trust-check`
Input: a job record. Output: Trust Score + itemized flags and verifications (§2.3). Can be run
standalone ("is this listing a scam?") or as part of `evaluate`.

### `evaluate`
The orchestrator. Runs `geo-check`, `comp-reality`, and `trust-check`, computes all three scores,
and writes a full report to `data/reports/<job-id>.md`: the scores, per-dimension reasoning,
CV-match gaps, suggested cover-letter angles, and a clear pursue / skip recommendation. Updates
the job's row in the tracker. Never fabricates data it couldn't find — gaps are marked
`unknown`, not guessed.

### `tailor-cv`
Input: a pursue-worthy job + the correct CV base (intl for global, local for domestic). Output:
an ATS-optimized, keyword-aligned CV as markdown → PDF (via `scripts/` + Playwright). Enforces
the PII-strip rules for international roles. Refuses to run on scam-flagged jobs.

### `cover-letter`
Input: a job + evaluation report. Drafts a researched letter but **interactively asks the user**
for the genuinely human bits (why this company, a specific story) rather than inventing them.
Pulls reusable narratives from `story-bank`.

### `proposal` (freelance track)
Input: an Upwork/Fiverr/Toptal job post + user profile. Output: a tailored proposal and profile
optimization notes. Same guardrails; freelance-specific scam heuristics.

### `story-bank`
A growing store (`profile/stories.md`) of STAR + Reflection narratives, accumulated as the user
evaluates roles and does interview prep. Reused by `cover-letter`, `proposal`, and
`interview-prep`.

### `interview-prep`
Input: a job. Output: likely questions, company research summary, and the user's best talking
points mapped to their story bank.

### `track`
Maintains `data/tracker.md` as the single source of truth: de-duplication, status
normalization, integrity checks (no orphan reports, no malformed rows). Runs implicitly after
`ingest`/`scan`/`evaluate` and on demand.

---

## 4. Data model

**`data/tracker.md`** — one markdown table, human-editable, the source of truth. Columns:

`id | title | company | source | url | remote_policy | geo | comp_raw | comp_pkr | fit | reality | trust | status | applied_on | notes`

- `status` ∈ `new` · `evaluated` · `pursue` · `skip` · `scam` · `applied` · `interview` ·
  `offer` · `closed` · `rejected`.
- Each evaluated job also has `data/reports/<id>.md` with the full write-up.

**`config/settings.yaml`** — thresholds, PKT timezone, currency baselines, cost-of-living anchor.
**`config/weights.yaml`** — the Fit/Reality dimension weights.
**`sources/*.yaml`** — ATS org slugs and board recipes.
**`profile/`** — `profile.md`, `cv-local.md`, `cv-intl.md`, `stories.md`.

All plain text, all diffable, all git-friendly (though `data/` and `output/` are gitignored).

---

## 5. How it maps onto the AI CLI

- **Claude Code (first-class):** each skill ships as a Claude Code skill under `skills/`, invoked
  by name in natural language ("evaluate the newest jobs"). Node scripts in `scripts/` do the
  deterministic work (API calls, PDF render); skills orchestrate and reason.
- **Portability:** skill definitions are plain markdown with explicit procedures, so they port to
  OpenCode, Codex, or Gemini CLI with thin adapters. The scripts are runtime-agnostic Node.
- **Determinism boundary:** anything that must be exact (fetching, parsing IDs, rendering PDFs,
  writing tracker rows) lives in scripts. Anything judgment-based (scoring, drafting) lives in
  skills. This keeps the AI out of the business of, e.g., inventing a salary.

---

## 6. Build order (milestones)

1. **Foundation** — repo scaffold, `config/` defaults, `profile` bootstrap + dual CV bases.
2. **Ingest & track** — `ingest`, `track`, tracker schema. Get jobs into the system by hand
   first; it's the fastest path to a usable loop.
3. **Evaluate core** — `geo-check`, `comp-reality`, `trust-check`, then `evaluate` to tie them
   together and produce reports. This is the product's soul; get it right before scaling input.
4. **Scale input** — `scan` for Greenhouse/Ashby/Lever + source configs + batch workers.
5. **Output** — `tailor-cv`, `cover-letter`, PDF pipeline.
6. **Freelance + prep** — `proposal`, `story-bank`, `interview-prep`.
7. **Dashboard** — a local web dashboard over the tracker. (Originally planned as a Go/Bubble
   Tea TUI; built instead as a zero-dependency Node web server + browser UI so it could use the
   richer visual components — gradient-border cards, animated conic score rings — in the
   [21st.dev](https://21st.dev) / [UI Verse](https://uiverse.io) aesthetic. Still fully local:
   it reads `data/tracker.md`, serves only to localhost, and never phones home.)

Rationale: value shows up at milestone 3 with zero scraping infrastructure — a user can paste
jobs and get honest three-score reports immediately. Everything after that is leverage.

---

## 7. Open design questions

- **Geo-eligibility accuracy.** JDs lie or omit. How aggressively should `geo-check` read the ATS
  application form vs. stay conservative and mark `unknown`? Leaning conservative.
- **Comp estimation** when the listing hides pay — estimate from market data (and label the
  estimate) or refuse? Leaning: estimate, clearly labeled, never presented as fact.
- **Local-board access.** Start paste-only (`ingest`); revisit automated collection only within
  each board's ToS.
- **Scam ruleset maintenance.** The local-fraud list needs to stay current — a strong candidate
  for community contribution.

---

*Companion to [`README.md`](./README.md). Changes to the scoring model or data schema should be
reflected in both.*
