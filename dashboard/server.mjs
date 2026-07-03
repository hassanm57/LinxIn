#!/usr/bin/env node
// LinxIn dashboard — a tiny, zero-dependency local web server that visualizes
// your pipeline (data/tracker.md) with a beautiful browser UI.
//
// Local-first by design: it reads the same plain-text files the skills write,
// serves them only to your machine, and never phones home. Run it, open the
// printed URL, close it when you're done.
//
// Usage:
//   node dashboard/server.mjs            # http://localhost:4173
//   PORT=8080 node dashboard/server.mjs
//   LINXIN_TRACKER=/path/to/tracker.md node dashboard/server.mjs
//
// If your real tracker has no jobs yet, the dashboard falls back to a bundled
// sample so you can see what it looks like (with a clear "demo data" banner).

import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join, extname, normalize } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const PUBLIC = join(HERE, "public");
const PORT = Number(process.env.PORT) || 4173;
// Bind to loopback by default — this serves your private pipeline, so it must
// not be reachable from the network. Override with HOST only if you know why.
const HOST = process.env.HOST || "127.0.0.1";
const TRACKER = process.env.LINXIN_TRACKER || join(ROOT, "data", "tracker.md");
const SAMPLE = join(HERE, "sample-tracker.md");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
};

// ---- parse the markdown pipeline table into structured rows -----------------
function parseTracker(md) {
  const rows = md.split(/\r?\n/).filter((l) => l.trim().startsWith("|"));
  const isSep = (r) => /^[\s|:\-]+$/.test(r);
  const cells = (r) => r.split("|").slice(1, -1).map((c) => c.trim());
  if (rows.length < 2) return [];

  let headerIdx = rows.findIndex((r) => /\bid\b/i.test(r) && /\btitle\b/i.test(r));
  if (headerIdx === -1) headerIdx = 0;
  const headers = cells(rows[headerIdx]).map((h) => h.toLowerCase());

  const jobs = [];
  for (const r of rows.slice(headerIdx + 1)) {
    if (isSep(r)) continue;
    const c = cells(r);
    if (c.length < 2) continue;
    if (c.join("").toLowerCase().includes("no jobs yet")) continue;
    const obj = {};
    headers.forEach((h, i) => (obj[h] = c[i] ?? ""));
    if (!obj.id) continue;
    jobs.push(obj);
  }
  return jobs;
}

// ---- read thresholds from config/settings.yaml (light regex, zero-dep) ------
async function readThresholds() {
  const fallback = { fit: 65, reality: 50, trust: 70 };
  try {
    const y = await readFile(join(ROOT, "config", "settings.yaml"), "utf8");
    const grab = (k, d) => {
      const m = y.match(new RegExp(`${k}:\\s*(\\d+)`));
      return m ? Number(m[1]) : d;
    };
    return { fit: grab("fit", fallback.fit), reality: grab("reality", fallback.reality), trust: grab("trust", fallback.trust) };
  } catch {
    return fallback;
  }
}

async function loadPipeline() {
  const thresholds = await readThresholds();
  let jobs = [];
  try {
    jobs = parseTracker(await readFile(TRACKER, "utf8"));
  } catch {
    /* tracker missing — fall through to sample */
  }
  let demo = false;
  if (jobs.length === 0) {
    demo = true;
    try {
      jobs = parseTracker(await readFile(SAMPLE, "utf8"));
    } catch {
      jobs = [];
    }
  }
  return { demo, thresholds, jobs };
}

async function serveStatic(res, filePath) {
  try {
    const body = await readFile(filePath);
    res.writeHead(200, { "content-type": MIME[extname(filePath)] || "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(404, { "content-type": "text/plain" });
    res.end("Not found");
  }
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const path = url.pathname;

  if (path === "/api/pipeline") {
    const data = await loadPipeline();
    res.writeHead(200, { "content-type": MIME[".json"] });
    return res.end(JSON.stringify(data));
  }

  if (path.startsWith("/api/report/")) {
    const id = path.slice("/api/report/".length);
    if (!/^[a-z0-9-]+$/i.test(id)) {
      res.writeHead(400, { "content-type": MIME[".json"] });
      return res.end(JSON.stringify({ error: "bad id" }));
    }
    try {
      const md = await readFile(join(ROOT, "data", "reports", `${id}.md`), "utf8");
      res.writeHead(200, { "content-type": MIME[".json"] });
      return res.end(JSON.stringify({ id, markdown: md }));
    } catch {
      res.writeHead(200, { "content-type": MIME[".json"] });
      return res.end(JSON.stringify({ id, markdown: null }));
    }
  }

  // static: map "/" -> index.html, prevent path traversal
  const rel = normalize(path === "/" ? "/index.html" : path).replace(/^(\.\.[/\\])+/, "");
  return serveStatic(res, join(PUBLIC, rel));
});

server.listen(PORT, HOST, () => {
  console.log(`\n  LinxIn dashboard  →  http://localhost:${PORT}`);
  console.log(`  Reading pipeline  →  ${TRACKER}`);
  console.log(`  (Ctrl-C to stop)\n`);
});
