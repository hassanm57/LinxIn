# Contributing to LinxIn

Thanks for being here. LinxIn is free and open source, built for job seekers in Pakistan and
anywhere in the world. It gets better every time someone who's actually job-hunting sharpens it.
You don't need to be an expert to help.

## Ways to contribute

You don't have to write code. Some of the most valuable contributions aren't code at all:

- **Sharpen the scam ruleset.** `skills/trust-check` encodes the fraud patterns we know about.
  If you've seen a scam or ghost-job pattern it misses (local boards, WhatsApp recruiters,
  freelance traps), add it — this protects real people.
- **Improve geo-eligibility heuristics.** `skills/geo-check` guesses whether a Pakistan-based
  candidate can actually be hired. Real signals from real listings make it more accurate.
- **Add source recipes.** Curate `sources/companies.yaml` with remote-friendly employers, or help
  extend `scripts/lib/ats.mjs` to more job boards.
- **Tune the scoring.** The weights and thresholds in `config/` are opinions. If your experience
  says they're off, open an issue and make the case.
- **Docs, translations, examples.** Clearer docs help everyone; Urdu (or other language) notes
  would help a lot of people.
- **Report bugs and rough edges.** Especially anything that could mislead someone into applying
  to a bad role, or trusting a scam.

## Ground rules that keep LinxIn honest

These aren't bureaucracy — they're the whole point of the project. Please keep them:

1. **Local-first.** User data (CVs, profile, pipeline) stays on the user's machine. Don't add
   anything that phones home, uploads, or requires an account to use the core.
2. **Human-in-the-loop.** LinxIn never auto-applies. It evaluates and drafts; the human decides.
   Don't add bulk auto-apply.
3. **No fabrication.** Skills must never invent experience, comp, company facts, or eligibility.
   Unknown stays unknown. A tool that bluffs on someone's behalf can cost them a job or worse.
4. **Protect the user.** Especially around scams, PII (CNIC, DOB, bank details), and money.
   When in doubt, warn.
5. **Keep the deterministic boundary.** Fetching/parsing/PDF live in `scripts/` (Node). Judgment
   (scoring, eligibility, drafting) lives in `skills/` (markdown). Don't blur them.

## How to submit a change

1. Open an issue first for anything non-trivial, so we can agree on the approach.
2. Fork, branch, make your change. Keep it focused — one concern per PR.
3. If you touched the scanner or dashboard scripts, run them locally and say what you tested:
   ```bash
   npm install
   npm run scan -- --keywords "backend" --remote-only
   npm run dashboard
   ```
4. If you changed the scoring model or data schema, update **both** `README.md` and `DESIGN.md`
   so they stay in sync.
5. Open a PR describing what changed and why. Screenshots help for dashboard changes.

## Code style

- Match the surrounding code — no new frameworks or heavy dependencies without discussion
  (the tooling is intentionally minimal: Node, one dependency, dependency-free dashboard).
- Skills are plain markdown with explicit procedures and guardrails; follow the shape of the
  existing ones in `skills/`.

## Licensing

By contributing, you agree your contributions are licensed under the project's
[MIT License](LICENSE).

Be kind — see the [Code of Conduct](CODE_OF_CONDUCT.md). Welcome aboard. 🟦
