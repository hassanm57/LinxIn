// ATS adapters for LinxIn `scan`.
//
// Each adapter fetches a company's public job board and returns a list of
// NORMALIZED records with this shape:
//   {
//     ats, company, atsJobId, title, location,
//     remote: true | false | null,   // null = couldn't tell
//     url, compRaw, description       // description is plain text
//   }
//
// Adapters never throw for a single bad company — scan.mjs wraps them and keeps
// going. They only hit public, unauthenticated endpoints.

const DEFAULT_TIMEOUT_MS = 15000;

async function fetchJson(url, { timeout = DEFAULT_TIMEOUT_MS } = {}) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { accept: "application/json", "user-agent": "LinxIn/0.0.1 (job-search)" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}

const ENTITIES = {
  "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"',
  "&#39;": "'", "&apos;": "'", "&nbsp;": " ",
};

function decodeEntities(s = "") {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&[a-z#0-9]+;/gi, (m) => ENTITIES[m] ?? m);
}

// Cheap HTML -> readable plain text. Good enough for scanning/keyword matching;
// the raw listing is what the user verifies against later.
export function stripHtml(html = "") {
  return decodeEntities(
    String(html)
      .replace(/<\s*(br|\/p|\/div|\/li|\/h[1-6])\s*>/gi, "\n")
      .replace(/<[^>]+>/g, "")
  )
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+\n/g, "\n")
    .trim();
}

// Guess a remote policy from free text. Returns true / false / null (unknown).
export function detectRemote(...parts) {
  const text = parts.filter(Boolean).join(" ").toLowerCase();
  if (!text) return null;
  if (/\b(on-?site|in-?office|hybrid)\b/.test(text) && !/\bremote\b/.test(text)) return false;
  if (/\bremote\b/.test(text)) return true;
  return null;
}

// ---------------------------------------------------------------- Greenhouse
export async function greenhouse({ company, token }) {
  const data = await fetchJson(
    `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(token)}/jobs?content=true`
  );
  const jobs = Array.isArray(data?.jobs) ? data.jobs : [];
  return jobs.map((j) => {
    const location = j?.location?.name ?? "";
    const description = stripHtml(j?.content ?? "");
    return {
      ats: "greenhouse",
      company,
      atsJobId: String(j?.id ?? ""),
      title: j?.title ?? "",
      location,
      // Detect from title/location only — JD bodies mention "remote" incidentally.
      // geo-check does the authoritative eligibility read later.
      remote: detectRemote(j?.title, location),
      url: j?.absolute_url ?? "",
      compRaw: "",
      description,
    };
  });
}

// ---------------------------------------------------------------------- Lever
export async function lever({ company, token }) {
  const data = await fetchJson(
    `https://api.lever.co/v0/postings/${encodeURIComponent(token)}?mode=json`
  );
  const jobs = Array.isArray(data) ? data : [];
  return jobs.map((j) => {
    const c = j?.categories ?? {};
    const location = c.location ?? "";
    const sr = j?.salaryRange;
    const compRaw = sr?.min
      ? `${sr.currency ?? ""} ${sr.min}-${sr.max ?? ""} ${sr.interval ?? ""}`.trim()
      : "";
    return {
      ats: "lever",
      company,
      atsJobId: String(j?.id ?? ""),
      title: j?.text ?? "",
      location,
      remote: detectRemote(j?.workplaceType, location, c.commitment),
      url: j?.hostedUrl ?? "",
      compRaw,
      description: j?.descriptionPlain ?? stripHtml(j?.description ?? ""),
    };
  });
}

// ---------------------------------------------------------------------- Ashby
export async function ashby({ company, token }) {
  const data = await fetchJson(
    `https://api.ashbyhq.com/posting-api/job-board/${encodeURIComponent(token)}?includeCompensation=true`
  );
  const jobs = Array.isArray(data?.jobs) ? data.jobs : [];
  return jobs.map((j) => {
    const location = j?.location ?? "";
    const compRaw = j?.compensation?.compensationTierSummary ?? "";
    return {
      ats: "ashby",
      company,
      atsJobId: String(j?.id ?? ""),
      title: j?.title ?? "",
      location,
      remote: typeof j?.isRemote === "boolean" ? j.isRemote : detectRemote(j?.title, location),
      url: j?.jobUrl ?? "",
      compRaw,
      description: j?.descriptionPlain ?? stripHtml(j?.descriptionHtml ?? ""),
    };
  });
}

export const ADAPTERS = { greenhouse, lever, ashby };
