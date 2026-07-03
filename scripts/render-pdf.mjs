#!/usr/bin/env node
// LinxIn PDF renderer — turns a self-contained HTML file (a filled cv.html or
// cover-letter.html) into an ATS-clean PDF via Playwright/Chromium.
//
// Usage:
//   node scripts/render-pdf.mjs <input.html> [output.pdf] [--letter]
//
// Defaults to A4; pass --letter for US Letter. Output defaults to the input
// path with a .pdf extension.
//
// Playwright is an optional dependency (it downloads a browser). If it's not
// installed, this prints exactly how to add it and exits — it never pretends
// to have produced a PDF.

import { access } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const argv = process.argv.slice(2);
const flags = new Set(argv.filter((a) => a.startsWith("--")));
const positional = argv.filter((a) => !a.startsWith("--"));
const [input, outputArg] = positional;

if (!input) {
  console.error("usage: node scripts/render-pdf.mjs <input.html> [output.pdf] [--letter]");
  process.exit(1);
}

try {
  await access(resolve(input));
} catch {
  console.error(`Input not found: ${input}`);
  process.exit(1);
}

const output = outputArg ?? input.replace(/\.html?$/i, "") + ".pdf";
const format = flags.has("--letter") ? "Letter" : "A4";

let chromium;
try {
  ({ chromium } = await import("playwright"));
} catch {
  console.error(
    "Playwright isn't installed. To enable PDF export, run:\n" +
      "  npm install playwright && npx playwright install chromium\n" +
      "Meanwhile your tailored HTML is ready and can be printed to PDF from any browser."
  );
  process.exit(2);
}

const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  await page.goto(pathToFileURL(resolve(input)).href, { waitUntil: "networkidle" });
  await page.pdf({
    path: output,
    format,
    printBackground: true,
    margin: { top: "14mm", bottom: "14mm", left: "14mm", right: "14mm" },
  });
  console.error(`PDF written → ${output} (${format})`);
} finally {
  await browser.close();
}
