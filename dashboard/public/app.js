// LinxIn dashboard client. Fetches the parsed pipeline, renders the cards,
// handles filtering/sorting, and opens the evaluation report in a drawer.

const STATUS_ORDER = ["pursue", "interview", "offer", "evaluated", "applied", "new", "skip", "scam", "closed", "rejected"];
const state = { jobs: [], thresholds: { fit: 65, reality: 50, trust: 70 }, demo: false, status: "all", q: "", sort: "fit" };

const $ = (s, r = document) => r.querySelector(s);
const grid = $("#grid");

init();

async function init() {
  try {
    const res = await fetch("/api/pipeline");
    const data = await res.json();
    state.jobs = data.jobs || [];
    state.thresholds = data.thresholds || state.thresholds;
    state.demo = !!data.demo;
  } catch {
    grid.innerHTML = `<div class="empty">Couldn't load the pipeline. Is the server running?</div>`;
    return;
  }
  $("#demo-badge").hidden = !state.demo;
  $("#count").textContent = state.jobs.length;
  $("#src-path").textContent = state.demo ? "showing bundled demo data" : "data/tracker.md";
  renderStats();
  renderStatusFilters();
  wireControls();
  render();
}

const num = (v) => { const n = Number(v); return Number.isFinite(n) && String(v).trim() !== "" ? n : null; };

function verdictOf(j) {
  if ((j.status || "").toLowerCase() === "scam") return "scam";
  const f = num(j.fit), r = num(j.reality), t = num(j.trust);
  if (f === null || r === null || t === null) return "review";
  const { thresholds: th } = state;
  return f >= th.fit && r >= th.reality && t >= th.trust ? "pursue" : "skip";
}

function ringClass(val, threshold) {
  if (val === null) return "blank";
  if (val >= threshold) return "pass";
  if (val >= threshold * 0.7) return "mid";
  return "fail";
}

function renderStats() {
  const js = state.jobs;
  const avg = (key) => {
    const vals = js.map((j) => num(j[key])).filter((v) => v !== null);
    return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : "—";
  };
  const pursue = js.filter((j) => verdictOf(j) === "pursue").length;
  const scam = js.filter((j) => verdictOf(j) === "scam").length;
  const chips = [
    { k: "Worth pursuing", v: `${pursue}<small> / ${js.length}</small>` },
    { k: "Avg Fit", v: avg("fit") },
    { k: "Avg Reality", v: avg("reality") },
    { k: "Scams flagged", v: scam },
  ];
  $("#stats").innerHTML = chips.map((c) => `<div class="stat"><div class="k">${c.k}</div><div class="v">${c.v}</div></div>`).join("");
}

function renderStatusFilters() {
  const counts = {};
  for (const j of state.jobs) { const s = (j.status || "new").toLowerCase(); counts[s] = (counts[s] || 0) + 1; }
  const present = STATUS_ORDER.filter((s) => counts[s]);
  const pills = [`<button class="pill active" data-status="all">All <span class="n">${state.jobs.length}</span></button>`]
    .concat(present.map((s) => `<button class="pill" data-status="${s}"><span class="dot" style="background:${statusColor(s)}"></span>${s} <span class="n">${counts[s]}</span></button>`));
  $("#status-filters").innerHTML = pills.join("");
}

function statusColor(s) {
  return { pursue: "#34d399", interview: "#34d399", offer: "#34d399", evaluated: "#7c5cff", applied: "#22d3ee", new: "#8b93a7", skip: "#fbbf24", scam: "#f87171", closed: "#5b6270", rejected: "#f87171" }[s] || "#8b93a7";
}

function wireControls() {
  $("#search").addEventListener("input", (e) => { state.q = e.target.value.toLowerCase(); render(); });
  $("#sort").addEventListener("change", (e) => { state.sort = e.target.value; render(); });
  $("#status-filters").addEventListener("click", (e) => {
    const b = e.target.closest(".pill"); if (!b) return;
    state.status = b.dataset.status;
    $$(".pill").forEach((p) => p.classList.toggle("active", p === b));
    render();
  });
  $("#drawer").addEventListener("click", (e) => { if (e.target.dataset.close !== undefined) closeDrawer(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeDrawer(); });
}
const $$ = (s) => Array.from(document.querySelectorAll(s));

function currentJobs() {
  let js = state.jobs.slice();
  if (state.status !== "all") js = js.filter((j) => (j.status || "new").toLowerCase() === state.status);
  if (state.q) js = js.filter((j) => `${j.title} ${j.company} ${j.notes}`.toLowerCase().includes(state.q));
  const s = state.sort;
  js.sort((a, b) => s === "title" ? String(a.title).localeCompare(b.title) : (num(b[s]) ?? -1) - (num(a[s]) ?? -1));
  return js;
}

function render() {
  const js = currentJobs();
  if (!js.length) { grid.innerHTML = `<div class="empty">No roles match. Adjust filters, or ingest/scan some jobs.</div>`; return; }
  grid.innerHTML = js.map(card).join("");
  $$(".card").forEach((el) => {
    el.addEventListener("mousemove", (e) => { const r = el.getBoundingClientRect(); el.style.setProperty("--mx", `${e.clientX - r.left}px`); el.style.setProperty("--my", `${e.clientY - r.top}px`); });
    el.addEventListener("click", () => openDrawer(el.dataset.id));
  });
}

function ring(label, val, threshold) {
  const cls = ringClass(val, threshold);
  const shown = val === null ? "—" : val;
  const style = `--val:${val === null ? 0 : val}`;
  return `<div class="ring ${cls}"><div class="dial" style="${style}"><span class="num">${shown}</span></div><span class="lbl">${label}</span></div>`;
}

function card(j) {
  const th = state.thresholds;
  const v = verdictOf(j);
  // geo feeds a CSS class + label, so hard-restrict it to a safe slug.
  const geo = (j.geo || "unknown").toLowerCase().replace(/[^a-z-]/g, "") || "unknown";
  const comp = j.comp_pkr && j.comp_pkr !== "—" ? j.comp_pkr : (j.comp_raw || "");
  return `<article class="card" data-id="${esc(j.id)}">
    <div class="card-head">
      <div><h3 class="card-title">${esc(j.title || j.id)}</h3><div class="card-co">${esc(j.company || "")}${j.source ? " · " + esc(j.source) : ""}</div></div>
      <span class="verdict ${v}">${v}</span>
    </div>
    <div class="rings">
      ${ring("Fit", num(j.fit), th.fit)}
      ${ring("Reality", num(j.reality), th.reality)}
      ${ring("Trust", num(j.trust), th.trust)}
    </div>
    <div class="card-foot">
      <span class="badge geo-${geo}">${geo === "unknown" ? "geo ?" : geo}</span>
      ${j.remote_policy ? `<span class="badge">${esc(j.remote_policy)}</span>` : ""}
      ${comp ? `<span class="badge comp">${esc(comp)}</span>` : ""}
    </div>
  </article>`;
}

async function openDrawer(id) {
  const j = state.jobs.find((x) => x.id === id);
  const body = $("#drawer-body");
  $("#drawer").hidden = false;
  document.body.style.overflow = "hidden";
  body.innerHTML = `<div class="loader"><span></span><span></span><span></span></div>`;
  let md = null;
  try { md = (await (await fetch(`/api/report/${encodeURIComponent(id)}`)).json()).markdown; } catch {}
  const th = state.thresholds;
  const head = `<h1 class="md">${esc(j.title || id)}</h1>
    <div class="drawer-meta">
      <span class="verdict ${verdictOf(j)}">${verdictOf(j)}</span>
      <span class="badge">${esc(j.company || "")}</span>
      <span class="badge">Fit ${j.fit || "—"}/${th.fit}</span>
      <span class="badge">Reality ${j.reality || "—"}/${th.reality}</span>
      <span class="badge">Trust ${j.trust || "—"}/${th.trust}</span>
    </div>`;
  // only render the listing link for http(s) URLs — a scanned listing could carry a javascript: URL
  const safeUrl = /^https?:\/\//i.test(j.url || "") ? j.url : "";
  body.innerHTML = head + (md ? `<div class="md">${renderMarkdown(md)}</div>`
    : `<div class="no-report">No evaluation report yet for <code>${esc(id)}</code>.<br/>Run <code>evaluate</code> on this job to generate one.${safeUrl ? `<br/><br/><a href="${esc(safeUrl)}" target="_blank" rel="noopener">Open listing ↗</a>` : ""}</div>`);
}

function closeDrawer() { $("#drawer").hidden = true; document.body.style.overflow = ""; }

// tiny, safe-ish markdown renderer for report display
function renderMarkdown(md) {
  const lines = md.split(/\r?\n/); let html = ""; let inList = false; let inTable = false;
  const inline = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/`(.+?)`/g, "<code>$1</code>").replace(/\[(.+?)\]\((https?:[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  const closeList = () => { if (inList) { html += "</ul>"; inList = false; } };
  const closeTable = () => { if (inTable) { html += "</table>"; inTable = false; } };
  for (const raw of lines) {
    const l = raw.trimEnd();
    if (/^\|(.+)\|$/.test(l)) {
      if (/^\|[\s|:\-]+\|$/.test(l)) continue; // separator
      const cells = l.split("|").slice(1, -1).map((c) => c.trim());
      if (!inTable) { html += "<table>"; inTable = true; html += "<tr>" + cells.map((c) => `<th>${inline(c)}</th>`).join("") + "</tr>"; }
      else html += "<tr>" + cells.map((c) => `<td>${inline(c)}</td>`).join("") + "</tr>";
      continue;
    }
    closeTable();
    if (/^###\s+/.test(l)) { closeList(); html += `<h3>${inline(l.replace(/^###\s+/, ""))}</h3>`; }
    else if (/^##\s+/.test(l)) { closeList(); html += `<h2>${inline(l.replace(/^##\s+/, ""))}</h2>`; }
    else if (/^#\s+/.test(l)) { closeList(); html += `<h1 class="md">${inline(l.replace(/^#\s+/, ""))}</h1>`; }
    else if (/^[-*]\s+/.test(l)) { if (!inList) { html += "<ul>"; inList = true; } html += `<li>${inline(l.replace(/^[-*]\s+/, ""))}</li>`; }
    else if (l === "" ) { closeList(); }
    else if (/^-{3,}$/.test(l)) { closeList(); }
    else { closeList(); html += `<p>${inline(l)}</p>`; }
  }
  closeList(); closeTable();
  return html;
}

function esc(s) { return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
