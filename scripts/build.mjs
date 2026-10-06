#!/usr/bin/env node
// Syncs the shared <head>, header and footer (from /partials) into every page in /site,
// regenerates sitemap.xml and robots.txt, checks internal links, and lists the
// placeholders that still need your real content.
//
// Run with:  node scripts/build.mjs      (no dependencies needed)

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// ---- Change this to your real domain before launch --------------------------
const SITE_URL = "https://www.yourdomain.com";
// Pages that should not appear in search results or the sitemap.
const NOINDEX = new Set(["404.html", "thank-you.html"]);
// ------------------------------------------------------------------------------

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE = path.join(ROOT, "site");
const read = (p) => fs.readFileSync(p, "utf8");
const PLACEHOLDER = /class="todo"|TODO|yourdomain\.com/;

const partials = {
  head: read(path.join(ROOT, "partials/head.html")).trim(),
  header: read(path.join(ROOT, "partials/header.html")).trim(),
  footer: read(path.join(ROOT, "partials/footer.html")).trim(),
};

const pages = fs.readdirSync(SITE).filter((f) => f.endsWith(".html")).sort();
const pageUrl = (file) => `${SITE_URL}/${file === "index.html" ? "" : file.replace(/\.html$/, "")}`;

let changed = 0;
const problems = [];
const todos = [];

for (const file of pages) {
  const full = path.join(SITE, file);
  const html = read(full);

  const title = (html.match(/<title>([\s\S]*?)<\/title>/) || [])[1]?.trim();
  const description = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1];
  const nav = (html.match(/<body[^>]*\sdata-nav="([^"]*)"/) || [])[1] || "";
  if (!title) problems.push(`${file}: missing <title>`);
  if (!description) problems.push(`${file}: missing meta description`);

  const head = partials.head
    .replaceAll("{{ROBOTS}}", NOINDEX.has(file) ? '<meta name="robots" content="noindex">\n' : "")
    .replaceAll("{{CANONICAL}}", pageUrl(file))
    .replaceAll("{{SITE_URL}}", SITE_URL)
    .replaceAll("{{TITLE}}", title || "Optimolds")
    .replaceAll("{{DESCRIPTION}}", description || "");
  const header = nav
    ? partials.header.replaceAll(`data-nav="${nav}"`, `data-nav="${nav}" aria-current="page"`)
    : partials.header;
  const blocks = { head, header, footer: partials.footer };

  let out = html;
  for (const [name, content] of Object.entries(blocks)) {
    const re = new RegExp(`(<!-- shared:${name} -->)[\\s\\S]*?(<!-- /shared:${name} -->)`);
    if (!re.test(out)) { problems.push(`${file}: missing <!-- shared:${name} --> markers`); continue; }
    out = out.replace(re, (_, open, close) => `${open}\n${content}\n${close}`);
  }
  if (out !== html) { fs.writeFileSync(full, out); changed++; }

  // Internal link + asset check (ignores HTML comments)
  const broken = new Set();
  for (const m of out.replace(/<!--[\s\S]*?-->/g, "").matchAll(/\s(?:href|src)="([^"]+)"/g)) {
    const url = m[1];
    if (/^(https?:|mailto:|tel:|data:|#|\/\/)/.test(url)) continue;
    const target = url.split(/[?#]/)[0];
    if (target && !fs.existsSync(path.join(SITE, target))) broken.add(url);
  }
  broken.forEach((url) => problems.push(`${file}: broken link -> ${url}`));

  // Placeholder report (shared blocks are reported once, via their partial files)
  let inShared = false;
  out.split("\n").forEach((line, i) => {
    if (/<!-- shared:/.test(line)) inShared = true;
    else if (/<!-- \/shared:/.test(line)) inShared = false;
    else if (!inShared && PLACEHOLDER.test(line)) todos.push({ file, line: i + 1 });
  });
}
for (const name of ["header", "footer"]) {
  partials[name].split("\n").forEach((line, i) => {
    if (PLACEHOLDER.test(line)) todos.push({ file: `../partials/${name}.html`, line: i + 1 });
  });
}

// sitemap.xml + robots.txt
const today = new Date().toISOString().slice(0, 10);
const urls = pages.filter((f) => !NOINDEX.has(f)).map((f) =>
  `  <url><loc>${pageUrl(f)}</loc><lastmod>${today}</lastmod></url>`);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;
const sitemapPath = path.join(SITE, "sitemap.xml");
const oldSitemap = fs.existsSync(sitemapPath) ? read(sitemapPath) : "";
// Only rewrite when the page list changes, so lastmod dates don't churn on every build.
if (oldSitemap.replace(/<lastmod>[^<]*<\/lastmod>/g, "") !== sitemap.replace(/<lastmod>[^<]*<\/lastmod>/g, "")) {
  fs.writeFileSync(sitemapPath, sitemap);
}
fs.writeFileSync(path.join(SITE, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);

// Report
console.log(`Synced ${pages.length} pages (${changed} updated).`);
if (problems.length) {
  console.log(`\n${problems.length} problem(s):`);
  problems.forEach((p) => console.log(`  ✗ ${p}`));
}
const byFile = todos.reduce((acc, t) => ((acc[t.file] ||= []).push(t.line), acc), {});
const total = todos.length;
if (total) {
  console.log(`\n${total} line(s) still contain placeholders (search for class="todo", TODO or yourdomain.com):`);
  for (const [file, lines] of Object.entries(byFile)) console.log(`  ${file.padEnd(32)} lines ${lines.join(", ")}`);
  if (SITE_URL.includes("yourdomain")) console.log(`\n  → Also set SITE_URL in scripts/build.mjs to your real domain.`);
} else {
  console.log("\nNo placeholders left. Ready to launch.");
}
process.exitCode = problems.length ? 1 : 0;
