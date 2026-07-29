#!/usr/bin/env node
// check-seo.mjs — guards the SEO invariants of the built site.
//
//   npm run build && npm run check
//
// Every check here exists because something was actually wrong, or would have
// silently broken later. This is not a linter for its own sake:
//
//  - The sitemap and the canonical tags genuinely drifted: the sitemap advertised
//    "/" while the home page declared "/index.html" as canonical. Two URLs for one
//    page splits its ranking signals, and nothing surfaced it.
//  - track.html carries a bearer token in its URL and had NO robots directive at
//    all, despite a build comment claiming it did.
//  - Duplicate titles and descriptions across pages are the single most common way
//    a small site ends up with pages competing against each other.
//
// Exits non-zero on failure, so it can gate a deploy.

import { readdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, 'dist');

if (!existsSync(dist)) {
  console.error('No dist/ — run `npm run build` first.');
  process.exit(1);
}

const failures = [];
const warnings = [];
const fail = (msg) => failures.push(msg);
const warn = (msg) => warnings.push(msg);

const pick = (html, re) => (html.match(re) || [])[1];

const files = (await readdir(dist)).filter((f) => f.endsWith('.html'));
const pages = [];

for (const file of files) {
  const html = await readFile(join(dist, file), 'utf8');
  pages.push({
    file,
    html,
    canonical: pick(html, /<link rel="canonical" href="([^"]*)"/),
    robots: pick(html, /<meta name="robots" content="([^"]*)"/),
    title: pick(html, /<title>([^<]*)<\/title>/),
    description: pick(html, /<meta name="description" content="([^"]*)"/),
    ogUrl: pick(html, /<meta property="og:url" content="([^"]*)"/),
    ogImage: pick(html, /<meta property="og:image" content="([^"]*)"/),
    h1s: (html.match(/<h1[^>]*>/g) || []).length,
    jsonLd: pick(html, /<script type="application\/ld\+json">([\s\S]*?)<\/script>/),
  });
}

// ---- 1. Canonicals present and absolute --------------------------------------
for (const p of pages) {
  if (!p.canonical) fail(`${p.file}: no <link rel="canonical">`);
  else if (!/^https?:\/\//.test(p.canonical)) fail(`${p.file}: canonical is not absolute (${p.canonical})`);
  if (p.ogUrl && p.canonical && p.ogUrl !== p.canonical) {
    fail(`${p.file}: og:url (${p.ogUrl}) disagrees with canonical (${p.canonical})`);
  }
}

// ---- 2. Sitemap exactly matches the indexable canonicals ---------------------
const sitemapPath = join(dist, 'sitemap.xml');
if (!existsSync(sitemapPath)) {
  fail('no sitemap.xml');
} else {
  const sitemap = await readFile(sitemapPath, 'utf8');
  const locs = [...sitemap.matchAll(/<loc>([^<]*)<\/loc>/g)].map((m) => m[1]).sort();
  const indexable = pages
    .filter((p) => !/noindex/.test(p.robots || ''))
    .map((p) => p.canonical)
    .sort();

  const missing = indexable.filter((u) => !locs.includes(u));
  const extra = locs.filter((u) => !indexable.includes(u));
  for (const u of missing) fail(`indexable page missing from sitemap: ${u}`);
  for (const u of extra) fail(`sitemap lists a URL that is noindex or does not exist: ${u}`);
  if (!/<lastmod>/.test(sitemap)) warn('sitemap has no <lastmod> entries');
}

// ---- 3. The token-bearing tracker must never be indexable --------------------
const track = pages.find((p) => p.file === 'track.html');
if (track) {
  if (!/noindex/.test(track.robots || '')) {
    fail('track.html is NOT noindex — its URL carries a live-location bearer token');
  }
  const robotsTxt = join(dist, 'robots.txt');
  if (existsSync(robotsTxt)) {
    const txt = await readFile(robotsTxt, 'utf8');
    if (!/Disallow:\s*\/track\.html/.test(txt)) warn('robots.txt does not disallow /track.html');
  }
}

// ---- 4. JSON-LD parses -------------------------------------------------------
for (const p of pages) {
  if (!p.jsonLd) {
    fail(`${p.file}: no JSON-LD structured data`);
    continue;
  }
  try {
    const parsed = JSON.parse(p.jsonLd.replace(/\\u003c/g, '<'));
    if (!parsed['@graph'] || !parsed['@graph'].length) fail(`${p.file}: JSON-LD has an empty @graph`);
  } catch (e) {
    fail(`${p.file}: JSON-LD does not parse — ${e.message}`);
  }
}

// ---- 5. Unique titles and descriptions ---------------------------------------
for (const field of ['title', 'description']) {
  const byValue = new Map();
  for (const p of pages) {
    if (!p[field]) {
      fail(`${p.file}: missing ${field}`);
      continue;
    }
    if (!byValue.has(p[field])) byValue.set(p[field], []);
    byValue.get(p[field]).push(p.file);
  }
  for (const [value, owners] of byValue) {
    if (owners.length > 1) {
      fail(`duplicate ${field} across ${owners.join(', ')} — "${value.slice(0, 60)}…"`);
    }
  }
}

// ---- 6. Exactly one <h1> per page --------------------------------------------
for (const p of pages) {
  if (p.h1s === 0) fail(`${p.file}: no <h1>`);
  else if (p.h1s > 1) warn(`${p.file}: ${p.h1s} <h1> elements (expected 1)`);
}

// ---- 7. Social image is absolute ---------------------------------------------
for (const p of pages) {
  if (p.ogImage && !/^https?:\/\//.test(p.ogImage)) {
    fail(`${p.file}: og:image must be an absolute URL (${p.ogImage})`);
  }
}

// ---- 8. Images carry intrinsic dimensions (prevents layout shift) ------------
for (const p of pages) {
  const imgs = p.html.match(/<img\b[^>]*>/g) || [];
  const bad = imgs.filter((t) => !/\bwidth=/.test(t) || !/\bheight=/.test(t));
  if (bad.length) warn(`${p.file}: ${bad.length} <img> without width/height (causes layout shift)`);
}

// ---- 8b. Search Console verification tag survives ----------------------------
// Google re-checks the verification tag periodically. If it is ever removed, the
// property un-verifies and every scrap of search data stops arriving — silently,
// with no error anywhere. Since the token lives in site.config.mjs, a careless
// edit is all it would take, so the build refuses to ship without it.
{
  const { site: cfg } = await import('../site.config.mjs');
  if (cfg.verification?.google) {
    const home = pages.find((p) => p.file === 'index.html');
    if (home && !home.html.includes(cfg.verification.google)) {
      fail('the Google Search Console verification token is configured but missing from the home page');
    }
  } else {
    warn('no Google Search Console verification token set — search data will not be collected');
  }
}

// ---- 8c. Image rules that set width must also set height ---------------------
// Every <img> carries width and height attributes so the browser can reserve the
// right box before the file arrives. Those attributes are presentational hints:
// a CSS rule that sets `width` but no `height` leaves the height attribute in
// force, so the image renders at its full intrinsic height. That shipped once —
// the gallery screenshots rendered 248px wide by 2622px tall, stretched roughly
// five times vertically — and it is invisible in the markup, so it needs a guard.
{
  const css = await readFile(join(root, 'public', 'styles.css'), 'utf8');
  for (const m of css.matchAll(/([^{}\n]*(?:\bimg\b|-img\b)[^{}\n]*)\{([^}]*)\}/g)) {
    const sel = m[1].trim();
    const body = m[2];
    if (sel.startsWith('/*') || sel.startsWith('@')) continue;
    const setsWidth = /(?:^|;|\s)width\s*:/.test(body);
    const setsHeight = /(?:^|;|\s)height\s*:/.test(body);
    // A rule that only overrides width is fine IF a base rule on the same element
    // already supplies height — that is true for `.hero-device .device-img`, which
    // rides on `.device-img { height: auto }`. Only flag rules with no such base.
    if (setsWidth && !setsHeight) {
      const base = sel.split(/\s+/).pop();
      const baseHasHeight = new RegExp(`(^|\\})\\s*${base.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}\\s*\\{[^}]*height\\s*:`, 'm').test(css);
      if (!baseHasHeight) {
        fail(`CSS rule "${sel}" sets width on an image without height — the height attribute will distort it. Add height: auto.`);
      }
    }
  }
}

// ---- 9. Every referenced image actually exists -------------------------------
// The <picture> elements reference three formats at three widths each, all
// generated by `npm run images`. Forgetting to run it, or renaming a capture,
// produces a page that builds cleanly and renders a broken image to every visitor.
for (const p of pages) {
  const refs = new Set();
  for (const m of p.html.matchAll(/<img\b[^>]*\bsrc="([^"]+)"/g)) refs.add(m[1]);
  for (const m of p.html.matchAll(/\bsrcset="([^"]+)"/g)) {
    for (const entry of m[1].split(',')) {
      const url = entry.trim().split(/\s+/)[0];
      if (url) refs.add(url);
    }
  }
  for (const ref of refs) {
    if (/^(https?:)?\/\//.test(ref) || ref.startsWith('data:')) continue;
    if (!existsSync(join(dist, ref))) fail(`${p.file}: references a missing image — ${ref}`);
  }
}

// ---- 10. Published figures match the committed live data ---------------------
const stats = JSON.parse(await readFile(join(root, 'src', 'data', 'stats.json'), 'utf8'));
const home = pages.find((p) => p.file === 'index.html');
if (home) {
  const zonesFormatted = String(stats.totals.zones).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  if (!home.html.includes(zonesFormatted)) {
    warn(`home page does not mention the live zone count (${zonesFormatted}) — figures may be stale`);
  }
  // Catch the specific stale numbers this site shipped for weeks.
  for (const stale of ['2,500+', '1,100+', 'five metros']) {
    if (home.html.includes(stale)) fail(`home page still contains the stale figure "${stale}"`);
  }
}

// ---- Report ------------------------------------------------------------------
console.log(`\nChecked ${pages.length} pages in dist/\n`);
if (warnings.length) {
  console.log('  Warnings:');
  for (const w of warnings) console.log(`    ~ ${w}`);
  console.log();
}
if (failures.length) {
  console.log('  Failures:');
  for (const f of failures) console.log(`    ✗ ${f}`);
  console.log(`\n  ${failures.length} check(s) failed.\n`);
  process.exit(1);
}
console.log(`  All checks passed${warnings.length ? ` (${warnings.length} warning(s))` : ''}.\n`);
