#!/usr/bin/env node
// build.mjs — assembles the static Tsamaya site into dist/.
// Zero dependencies: uses only Node built-ins, so CI needs nothing but Node.
//   node build.mjs            → build into ./dist
// Every page module in src/pages/ exports a { slug, title, description, body }.

import { readdir, mkdir, rm, copyFile, writeFile, readFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, extname } from 'node:path';
import { renderPage } from './src/layout.mjs';
import { site, baseUrl, canonicalFor } from './site.config.mjs';

const root = dirname(fileURLToPath(import.meta.url));
const dist = join(root, 'dist');
const pagesDir = join(root, 'src', 'pages');
const publicDir = join(root, 'public');

// Date stamped into <lastmod>. Honours SOURCE_DATE_EPOCH so a rebuild of the same
// commit produces byte-identical output when that matters.
const buildDate = new Date(
  process.env.SOURCE_DATE_EPOCH ? Number(process.env.SOURCE_DATE_EPOCH) * 1000 : Date.now(),
)
  .toISOString()
  .slice(0, 10);

async function copyDir(from, to) {
  await mkdir(to, { recursive: true });
  for (const entry of await readdir(from, { withFileTypes: true })) {
    const src = join(from, entry.name);
    const dst = join(to, entry.name);
    if (entry.isDirectory()) await copyDir(src, dst);
    else await copyFile(src, dst);
  }
}

async function build() {
  // Clean slate
  if (existsSync(dist)) await rm(dist, { recursive: true, force: true });
  await mkdir(dist, { recursive: true });

  // 1. Copy static assets (css, js, images) verbatim.
  if (existsSync(publicDir)) await copyDir(publicDir, dist);

  // 2. Render every page module.
  // A page module's default export is either one page object, or an array of them
  // (used by metros.mjs, which builds one page per metro from shared data — seven
  // near-identical files would be seven places to forget to update).
  const files = (await readdir(pagesDir)).filter((f) => extname(f) === '.mjs');
  const pages = [];
  for (const f of files) {
    const mod = await import(join(pagesDir, f));
    const emitted = Array.isArray(mod.default) ? mod.default : [mod.default];
    for (const page of emitted) {
      if (!page || !page.slug) throw new Error(`Page ${f} has no default { slug }`);
      pages.push(page);
    }
  }
  // A duplicate slug means one page silently overwrites another — fail loudly.
  const seen = new Set();
  for (const p of pages) {
    if (seen.has(p.slug)) throw new Error(`Duplicate slug "${p.slug}" — two pages would write the same file`);
    seen.add(p.slug);
  }

  for (const page of pages) {
    const html = renderPage(page);
    const outPath = join(dist, page.slug);
    // Support nested slugs like 't/index.html' (gives a clean /t/ URL).
    await mkdir(dirname(outPath), { recursive: true });
    await writeFile(outPath, html, 'utf8');
    console.log(`  ✓ ${page.slug}`);
  }

  // 3. A .nojekyll file so GitHub Pages serves everything verbatim.
  await writeFile(join(dist, '.nojekyll'), '', 'utf8');

  // 4. Runtime config for client pages (the live-trip tracker /t/). Values come
  //    from CI secrets — kept OUT of source so nothing is committed. Absent
  //    locally, so the tracker shows a friendly "being set up" message.
  await writeFile(join(dist, 'config.json'), JSON.stringify({
    supabaseUrl: process.env.SUPABASE_URL || '',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
    mapboxToken: process.env.MAPBOX_TOKEN || '',
  }), 'utf8');

  // 5. sitemap.xml + robots.txt (absolute URLs from the configured base).
  //
  // The <loc> values come from canonicalFor() — the SAME function the page layout
  // uses for its <link rel="canonical">. They used to be computed separately here
  // and drifted: the sitemap said `/` while the page claimed `/index.html`, which
  // is two URLs advertising one page and splits ranking signals between them.
  if (baseUrl) {
    const indexable = pages.filter((p) => !p.noindex && p.slug !== 'track.html');
    const urls = indexable
      .map((p) => {
        const loc = canonicalFor(p.slug);
        // Priority is a weak hint at best, but "the home page matters most, then
        // the metro pages, then everything else" is at least an honest one.
        const priority = p.slug === 'index.html' ? '1.0' : p.slug.startsWith('coverage') ? '0.8' : '0.7';
        return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${buildDate}</lastmod>\n    <priority>${priority}</priority>\n  </url>`;
      })
      .join('\n');
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
    await writeFile(join(dist, 'sitemap.xml'), sitemap, 'utf8');
    await writeFile(
      join(dist, 'robots.txt'),
      // Explicitly disallow the token-bearing tracker. It also carries a noindex
      // meta; belt and braces, because this one leaks a live location if indexed.
      `User-agent: *\nAllow: /\nDisallow: /track.html\n\nSitemap: ${baseUrl}/sitemap.xml\n`,
      'utf8',
    );
    console.log(`  ✓ sitemap.xml (${indexable.length} URLs, lastmod ${buildDate})`);
  }

  console.log(`\nBuilt ${pages.length} pages → ${dist}`);
}

build().catch((err) => {
  console.error('\nBuild failed:', err);
  process.exit(1);
});
