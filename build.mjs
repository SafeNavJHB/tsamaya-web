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
import { site } from './site.config.mjs';

const root = dirname(fileURLToPath(import.meta.url));
const dist = join(root, 'dist');
const pagesDir = join(root, 'src', 'pages');
const publicDir = join(root, 'public');

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
  const files = (await readdir(pagesDir)).filter((f) => extname(f) === '.mjs');
  const pages = [];
  for (const f of files) {
    const mod = await import(join(pagesDir, f));
    const page = mod.default;
    if (!page || !page.slug) throw new Error(`Page ${f} has no default { slug }`);
    pages.push(page);
  }

  for (const page of pages) {
    const html = renderPage(page);
    await writeFile(join(dist, page.slug), html, 'utf8');
    console.log(`  ✓ ${page.slug}`);
  }

  // 3. A .nojekyll file so GitHub Pages serves everything verbatim.
  await writeFile(join(dist, '.nojekyll'), '', 'utf8');

  // 4. sitemap.xml + robots.txt (absolute URLs from the configured base).
  const base = (site.domain || site.ogBase || '').replace(/\/$/, '');
  if (base) {
    const urls = pages
      .map((p) => {
        const loc = p.slug === 'index.html' ? `${base}/` : `${base}/${p.slug}`;
        const priority = p.slug === 'index.html' ? '1.0' : '0.7';
        return `  <url><loc>${loc}</loc><priority>${priority}</priority></url>`;
      })
      .join('\n');
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
    await writeFile(join(dist, 'sitemap.xml'), sitemap, 'utf8');
    await writeFile(
      join(dist, 'robots.txt'),
      `User-agent: *\nAllow: /\nSitemap: ${base}/sitemap.xml\n`,
      'utf8',
    );
  }

  console.log(`\nBuilt ${pages.length} pages → ${dist}`);
}

build().catch((err) => {
  console.error('\nBuild failed:', err);
  process.exit(1);
});
