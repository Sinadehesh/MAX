#!/usr/bin/env node
// Builds the site in /site:
//  1. Syncs the shared <head>, header and footer (from /partials) into every English page.
//  2. Generates the Italian (/site/it) and German (/site/de) pages from the English ones,
//     using the translations in /i18n/it.json and /i18n/de.json.
//  3. Regenerates sitemap.xml and robots.txt, checks internal links, and lists the
//     placeholders and translations that still need your input.
//
// Run with:  node scripts/build.mjs            (no dependencies needed)
//            node scripts/build.mjs --missing  (also writes i18n/<lang>.missing.json
//                                               listing English text with no translation)

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// ---- Settings ------------------------------------------------------------------
const SITE_URL = "https://optimolds.com";
// Pages that should not appear in search results or the sitemap.
const NOINDEX = new Set(["404.html", "thank-you.html"]);
// English is the default (site root); the others live in a sub-folder.
const LANGS = [
  { code: "en", dir: "", locale: "en_GB", label: "English", short: "EN", word: "Language" },
  { code: "it", dir: "it", locale: "it_IT", label: "Italiano", short: "IT", word: "Lingua" },
  { code: "de", dir: "de", locale: "de_DE", label: "Deutsch", short: "DE", word: "Sprache" },
];
// ---------------------------------------------------------------------------------

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE = path.join(ROOT, "site");
const read = (p) => fs.readFileSync(p, "utf8");
const PLACEHOLDER = /class="todo"|TODO|yourdomain\.com/;
const WRITE_MISSING = process.argv.includes("--missing");

const partials = {
  head: read(path.join(ROOT, "partials/head.html")).trim(),
  header: read(path.join(ROOT, "partials/header.html")).trim(),
  footer: read(path.join(ROOT, "partials/footer.html")).trim(),
};

const pages = fs.readdirSync(SITE).filter((f) => f.endsWith(".html")).sort();
const prefix = (lang) => (lang.dir ? `${lang.dir}/` : "");
const pageUrl = (file, lang) =>
  `${SITE_URL}/${prefix(lang)}${file === "index.html" ? "" : file.replace(/\.html$/, "")}`;

let changed = 0;
const problems = [];
const todos = [];
const linkChecks = []; // checked at the end, once every language's files exist

// ---- Shared blocks ----------------------------------------------------------------

function renderHead(file, lang, title, description) {
  const hreflang = [
    ...LANGS.map((l) => `<link rel="alternate" hreflang="${l.code}" href="${pageUrl(file, l)}">`),
    `<link rel="alternate" hreflang="x-default" href="${pageUrl(file, LANGS[0])}">`,
  ].join("\n");
  return partials.head
    .replaceAll("{{ROBOTS}}", NOINDEX.has(file) ? '<meta name="robots" content="noindex">\n' : "")
    .replaceAll("{{CANONICAL}}", pageUrl(file, lang))
    .replaceAll("{{HREFLANG}}", hreflang)
    .replaceAll("{{OG_LOCALE}}", lang.locale)
    .replaceAll("{{SITE_URL}}", SITE_URL)
    .replaceAll("{{TITLE}}", title || "Optimolds")
    .replaceAll("{{DESCRIPTION}}", description || "");
}

// The language menu links to the same page in each language. On the 404 page
// (served at any missing URL) it links to each language's home page instead.
function renderSwitcher(file, lang) {
  const items = LANGS.map((l) => {
    const href = file === "404.html"
      ? `/${prefix(l)}`
      : `${lang.dir ? "../" : ""}${prefix(l)}${file}`;
    const current = l === lang ? ' aria-current="true"' : "";
    return `      <li><a href="${href}" hreflang="${l.code}" lang="${l.code}"${current}>${l.label}</a></li>`;
  }).join("\n");
  return `<!-- lang:start --><details class="lang" translate="no">
    <summary aria-label="${lang.word}: ${lang.label}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.5 2.6 3.5 5.5 3.5 8.5s-1 5.9-3.5 8.5c-2.5-2.6-3.5-5.5-3.5-8.5s1-5.9 3.5-8.5z"/></svg><span>${lang.short}</span></summary>
    <ul>
${items}
    </ul>
  </details><!-- lang:end -->`;
}

function replaceBlock(html, name, content, file) {
  const re = new RegExp(`(<!-- shared:${name} -->)[\\s\\S]*?(<!-- /shared:${name} -->)`);
  if (!re.test(html)) { problems.push(`${file}: missing <!-- shared:${name} --> markers`); return html; }
  return html.replace(re, (_, open, close) => `${open}\n${content}\n${close}`);
}

const getTitle = (html) => (html.match(/<title>([\s\S]*?)<\/title>/) || [])[1]?.trim();
const getDescription = (html) => (html.match(/<meta name="description" content="([^"]*)"/) || [])[1];

function checkLinks(html, file, dir) {
  const broken = new Set();
  for (const m of html.replace(/<!--[\s\S]*?-->/g, "").matchAll(/\s(?:href|src)="([^"]+)"/g)) {
    const url = m[1];
    if (/^(https?:|mailto:|tel:|data:|#|\/\/)/.test(url)) continue;
    const target = url.split(/[?#]/)[0];
    if (!target) continue;
    const resolved = target.startsWith("/") ? path.join(SITE, target) : path.join(SITE, dir, target);
    if (!fs.existsSync(resolved)) broken.add(url);
  }
  broken.forEach((url) => problems.push(`${path.join(dir, file)}: broken link -> ${url}`));
}

// ---- Translation ---------------------------------------------------------------------
// Every visible English text fragment and the alt / placeholder / aria-label / title
// attributes are looked up in the language's dictionary (keys are the English text,
// with whitespace collapsed). Anything without a translation stays in English and is
// reported. Content inside <script>, <style>, <svg> and translate="no" is left alone.

const VOID = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"]);
const hasWords = (s) => /[A-Za-z]/.test(s.replace(/&[a-z]+;|&#\d+;/gi, ""));

function makeTranslator(dict, missing, used) {
  const lookup = (raw) => {
    const key = raw.replace(/\s+/g, " ").trim();
    if (!key || !hasWords(key)) return raw;
    if (Object.hasOwn(dict, key) && dict[key] !== "") {
      used.add(key);
      return raw.match(/^\s*/)[0] + dict[key] + raw.match(/\s*$/)[0];
    }
    missing.add(key);
    return raw;
  };
  const attrs = (tag) => {
    let out = tag.replace(/(\s(?:alt|placeholder|aria-label|title)=")([^"]*)"/g, (_, a, v) => `${a}${lookup(v)}"`);
    if (/^<meta\s+name="description"/.test(out)) {
      out = out.replace(/(\scontent=")([^"]*)"/, (_, a, v) => `${a}${lookup(v)}"`);
    }
    return out;
  };
  return function translate(html) {
    const parts = html.split(/(<!--[\s\S]*?-->|<[^>]+>)/);
    let skipTag = null;
    let depth = 0;
    let out = "";
    for (const part of parts) {
      if (!part) continue;
      if (part.startsWith("<!--")) { out += part; continue; }
      if (part.startsWith("<")) {
        const name = (part.match(/^<\/?([a-zA-Z][\w-]*)/) || [])[1]?.toLowerCase() || "";
        const closing = part.startsWith("</");
        const selfClosing = part.endsWith("/>") || VOID.has(name);
        if (skipTag) {
          if (name === skipTag) {
            if (closing) depth--;
            else if (!selfClosing) depth++;
            if (depth === 0) skipTag = null;
          }
          out += part;
          continue;
        }
        if (!closing && (["script", "style", "svg"].includes(name) || /\stranslate="no"/.test(part))) {
          if (!selfClosing) { skipTag = name; depth = 1; }
          out += part;
          continue;
        }
        out += closing ? part : attrs(part);
        continue;
      }
      out += skipTag ? part : lookup(part);
    }
    return out;
  };
}

// ---- 1. English pages -------------------------------------------------------------------
const english = new Map();

for (const file of pages) {
  const full = path.join(SITE, file);
  const html = read(full);
  const lang = LANGS[0];
  const title = getTitle(html);
  const description = getDescription(html);
  const nav = (html.match(/<body[^>]*\sdata-nav="([^"]*)"/) || [])[1] || "";
  if (!title) problems.push(`${file}: missing <title>`);
  if (!description) problems.push(`${file}: missing meta description`);

  let header = nav
    ? partials.header.replaceAll(`data-nav="${nav}"`, `data-nav="${nav}" aria-current="page"`)
    : partials.header;
  header = header.replace("{{LANG_SWITCHER}}", renderSwitcher(file, lang));

  let out = html;
  out = replaceBlock(out, "head", renderHead(file, lang, title, description), file);
  out = replaceBlock(out, "header", header, file);
  out = replaceBlock(out, "footer", partials.footer, file);
  // The 404 page is served at any missing URL (e.g. /old/page), so its links and
  // assets must be root-relative or they'd resolve under the missing path.
  if (file === "404.html") {
    out = out.replace(/(\s(?:href|src)=")(?!https?:|mailto:|tel:|data:|#|\/)([^"]+)"/g, '$1/$2"');
  }
  if (out !== html) { fs.writeFileSync(full, out); changed++; }
  english.set(file, out);
  linkChecks.push([out, file, ""]);

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

// ---- 2. Translated pages -----------------------------------------------------------------
const missingByLang = {};
const unusedByLang = {};

for (const lang of LANGS.slice(1)) {
  const dictPath = path.join(ROOT, "i18n", `${lang.code}.json`);
  const dict = fs.existsSync(dictPath) ? JSON.parse(read(dictPath)) : {};
  const missing = new Set();
  const used = new Set();
  const translate = makeTranslator(dict, missing, used);
  const outDir = path.join(SITE, lang.dir);
  fs.mkdirSync(outDir, { recursive: true });

  for (const [file, source] of english) {
    let out = translate(source).replace(/<html lang="[^"]*"/, `<html lang="${lang.code}"`);
    out = replaceBlock(out, "head", renderHead(file, lang, getTitle(out), getDescription(out)), file);
    if (file === "404.html") {
      out = out
        .replace(/(\s(?:href|src)=")(?!https?:|mailto:|tel:|data:|#|\/)([^"]+)"/g, '$1/$2"')
        .replace(/(\s(?:href|src)=")\/(?!assets\/)([^"]*)"/g, `$1/${lang.dir}/$2"`);
    } else {
      out = out.replace(/(\s(?:href|src)=")assets\//g, "$1../assets/");
    }
    out = out.replace(/<!-- lang:start -->[\s\S]*?<!-- lang:end -->/, renderSwitcher(file, lang));

    const target = path.join(outDir, file);
    if (!fs.existsSync(target) || read(target) !== out) { fs.writeFileSync(target, out); changed++; }
    linkChecks.push([out, file, lang.dir]);
  }
  // Remove translated pages whose English page no longer exists
  for (const f of fs.readdirSync(outDir)) {
    if (f.endsWith(".html") && !english.has(f)) fs.unlinkSync(path.join(outDir, f));
  }

  missingByLang[lang.code] = missing;
  unusedByLang[lang.code] = Object.keys(dict).filter((k) => !used.has(k));
  const missingPath = path.join(ROOT, "i18n", `${lang.code}.missing.json`);
  if (WRITE_MISSING && missing.size) {
    fs.mkdirSync(path.dirname(missingPath), { recursive: true });
    fs.writeFileSync(missingPath, JSON.stringify(Object.fromEntries([...missing].map((k) => [k, ""])), null, 2) + "\n");
  } else if (fs.existsSync(missingPath) && !missing.size) {
    fs.unlinkSync(missingPath);
  }
}

for (const args of linkChecks) checkLinks(...args);

// ---- 3. sitemap.xml + robots.txt ---------------------------------------------------------
const today = new Date().toISOString().slice(0, 10);
const urls = [];
for (const lang of LANGS) {
  for (const f of pages.filter((p) => !NOINDEX.has(p))) {
    const alternates = LANGS.map((l) => `<xhtml:link rel="alternate" hreflang="${l.code}" href="${pageUrl(f, l)}"/>`).join("");
    urls.push(`  <url><loc>${pageUrl(f, lang)}</loc>${alternates}<lastmod>${today}</lastmod></url>`);
  }
}
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join("\n")}\n</urlset>\n`;
const sitemapPath = path.join(SITE, "sitemap.xml");
const oldSitemap = fs.existsSync(sitemapPath) ? read(sitemapPath) : "";
// Only rewrite when the page list changes, so lastmod dates don't churn on every build.
if (oldSitemap.replace(/<lastmod>[^<]*<\/lastmod>/g, "") !== sitemap.replace(/<lastmod>[^<]*<\/lastmod>/g, "")) {
  fs.writeFileSync(sitemapPath, sitemap);
}
fs.writeFileSync(path.join(SITE, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);

// ---- Report -------------------------------------------------------------------------------
console.log(`Built ${pages.length} pages × ${LANGS.length} languages (${changed} files updated).`);
if (problems.length) {
  console.log(`\n${problems.length} problem(s):`);
  problems.forEach((p) => console.log(`  ✗ ${p}`));
}
for (const [code, missing] of Object.entries(missingByLang)) {
  if (!missing.size) { console.log(`${code}: all text translated.`); continue; }
  console.log(`\n${code}: ${missing.size} English text(s) have no translation yet (shown in English):`);
  [...missing].slice(0, 8).forEach((k) => console.log(`  - ${k.length > 90 ? k.slice(0, 87) + "…" : k}`));
  if (missing.size > 8) console.log(`  … and ${missing.size - 8} more.`);
  console.log(`  → Run "node scripts/build.mjs --missing" to list them in i18n/${code}.missing.json, then add them to i18n/${code}.json.`);
}
for (const [code, unused] of Object.entries(unusedByLang)) {
  if (!unused.length) continue;
  console.log(`\n${code}: ${unused.length} translation(s) in i18n/${code}.json no longer match any English text (safe to delete, or fix the English key):`);
  unused.slice(0, 5).forEach((k) => console.log(`  - ${k.length > 90 ? k.slice(0, 87) + "…" : k}`));
}
const byFile = todos.reduce((acc, t) => ((acc[t.file] ||= []).push(t.line), acc), {});
if (todos.length) {
  console.log(`\n${todos.length} line(s) still contain placeholders (search for class="todo", TODO or yourdomain.com):`);
  for (const [file, lines] of Object.entries(byFile)) console.log(`  ${file.padEnd(32)} lines ${lines.join(", ")}`);
} else {
  console.log("\nNo placeholders left. Ready to launch.");
}
process.exitCode = problems.length ? 1 : 0;
