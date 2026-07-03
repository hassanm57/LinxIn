#!/usr/bin/env node
// LinxIn `scan` — pull fresh listings from the ATS portals in sources/companies.yaml,
// normalize them, filter, and stage them for the `scan` skill to ingest.
//
// Usage:
//   node scripts/scan.mjs [--keywords "backend,node"] [--remote-only]
//                         [--source greenhouse|lever|ashby] [--json]
//
// Writes a normalized result set to data/staging/scan-<timestamp>.json and prints
// a human summary. The `scan` skill reads that file, dedups against the tracker,
// and adds new rows. This script does NOT touch the tracker itself.

import { readFile, mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createHash } from "node:crypto";
import { load as parseYaml } from "js-yaml";
import { ADAPTERS } from "./lib/ats.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

function parseArgs(argv) {
  const args = { keywords: [], remoteOnly: false, source: null, json: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--keywords") args.keywords = (argv[++i] ?? "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
    else if (a === "--remote-only") args.remoteOnly = true;
    else if (a === "--source") args.source = argv[++i];
    else if (a === "--json") args.json = true;
    else if (a === "--help" || a === "-h") { printHelp(); process.exit(0); }
  }
  return args;
}

function printHelp() {
  console.log(`LinxIn scan
  --keywords "a,b"   only keep jobs whose title/description match ANY term
  --remote-only      only keep jobs detected as remote
  --source <ats>     limit to one ATS: greenhouse | lever | ashby
  --json             also print the full result set as JSON to stdout`);
}

const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

function makeId(rec) {
  const hash = createHash("md5").update(`${rec.ats}:${rec.company}:${rec.atsJobId}`).digest("hex").slice(0, 4);
  return `${slug(rec.company)}-${slug(rec.title).slice(0, 28)}-${hash}`.replace(/-+/g, "-");
}

function matchesKeywords(rec, keywords) {
  if (keywords.length === 0) return true;
  const hay = `${rec.title} ${rec.description}`.toLowerCase();
  return keywords.some((k) => hay.includes(k));
}

async function loadSources() {
  const raw = await readFile(join(ROOT, "sources", "companies.yaml"), "utf8");
  const doc = parseYaml(raw) ?? {};
  const entries = [];
  for (const ats of Object.keys(ADAPTERS)) {
    for (const c of doc[ats] ?? []) {
      if (c?.token) entries.push({ ats, company: c.company ?? c.token, token: c.token });
    }
  }
  return entries;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  let sources = await loadSources();
  if (args.source) sources = sources.filter((s) => s.ats === args.source);

  if (sources.length === 0) {
    console.error("No sources found. Add companies to sources/companies.yaml (or check --source).");
    process.exit(1);
  }

  console.error(`Scanning ${sources.length} board(s)...`);
  const results = await Promise.allSettled(
    sources.map(async (s) => ({ source: s, jobs: await ADAPTERS[s.ats](s) }))
  );

  const jobs = [];
  const perBoard = [];
  results.forEach((r, i) => {
    const s = sources[i];
    if (r.status === "fulfilled") {
      const kept = r.value.jobs
        .filter((rec) => matchesKeywords(rec, args.keywords))
        .filter((rec) => (args.remoteOnly ? rec.remote === true : true))
        .map((rec) => ({ id: makeId(rec), source: rec.ats, ...rec }));
      jobs.push(...kept);
      perBoard.push({ board: `${s.company} (${s.ats})`, fetched: r.value.jobs.length, kept: kept.length });
    } else {
      perBoard.push({ board: `${s.company} (${s.ats})`, fetched: 0, kept: 0, error: r.reason?.message ?? String(r.reason) });
    }
  });

  // De-dupe within this run by id.
  const seen = new Set();
  const unique = jobs.filter((j) => (seen.has(j.id) ? false : seen.add(j.id)));

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const outDir = join(ROOT, "data", "staging");
  await mkdir(outDir, { recursive: true });
  const outFile = join(outDir, `scan-${stamp}.json`);
  await writeFile(outFile, JSON.stringify({ scannedAt: new Date().toISOString(), args, jobs: unique }, null, 2));

  // Human summary (to stderr so --json stdout stays clean).
  console.error("\nBoard results:");
  for (const b of perBoard) {
    if (b.error) console.error(`  ✗ ${b.board}: ${b.error}`);
    else console.error(`  ✓ ${b.board}: ${b.kept}/${b.fetched} kept`);
  }
  console.error(`\n${unique.length} candidate job(s) staged → ${outFile}`);
  console.error(`Next: have the \`scan\` skill dedup these against data/tracker.md and add the new ones.`);

  if (args.json) process.stdout.write(JSON.stringify(unique, null, 2) + "\n");
}

main().catch((err) => {
  console.error("scan failed:", err?.message ?? err);
  process.exit(1);
});
