#!/usr/bin/env node
// indexnow.mjs: tells Bing (and the other IndexNow engines) which pages changed.
//
// WHY. Copilot answers from Bing's index. On 2026-09-28 it described Tsamaya as a
// four-metro app with no SOS and no live sharing, weeks after the site said
// otherwise, because nothing asks Bing to come back. IndexNow is that ask: one
// POST listing the changed URLs, which Bing, Yandex, Seznam and Naver share.
//
// It runs in two halves around the deploy (.github/workflows/deploy.yml):
//
//   node scripts/indexnow.mjs changed   (build job, BEFORE the deploy)
//     Compares every page in dist/ with the copy that is live right now and
//     prints the URLs that differ, one per line. A page is only worth a ping if
//     it actually changed; re-pinging unchanged pages on every changelog push
//     is what IndexNow asks sites not to do.
//
//   node scripts/indexnow.mjs submit <url> <url> ...   (AFTER the deploy)
//     POSTs those URLs. With no URLs it does nothing and says so.
//
//   node scripts/indexnow.mjs submit --all   submits every URL in dist/sitemap.xml
//     (plus /llms.txt), for a first run or after a big change.
//
// The key is public (site.config.mjs, indexNowKey); build.mjs publishes it at
// /<key>.txt, which is how the engine knows the ping came from this site.
// Node 18+ built-ins only, like the rest of the build.

import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { site, baseUrl } from '../site.config.mjs';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, 'dist');
const [mode, ...rest] = process.argv.slice(2);

// The URLs the site wants indexed: the sitemap's, plus llms.txt, which is not a
// page but is exactly the file an assistant's crawler should re-read.
async function siteUrls() {
  const sitemap = await readFile(join(dist, 'sitemap.xml'), 'utf8');
  const locs = [...sitemap.matchAll(/<loc>([^<]*)<\/loc>/g)].map((m) => m[1]);
  if (existsSync(join(dist, 'llms.txt'))) locs.push(`${baseUrl}/llms.txt`);
  return locs;
}

// The dist/ file a canonical URL was built from.
function fileFor(url) {
  const path = url.slice(baseUrl.length).replace(/^\//, '');
  return join(dist, path === '' ? 'index.html' : path);
}

async function changed() {
  const urls = await siteUrls();
  const out = [];
  for (const url of urls) {
    const local = await readFile(fileFor(url), 'utf8');
    let live = null;
    try {
      const res = await fetch(url, { redirect: 'follow', headers: { 'cache-control': 'no-cache' } });
      if (res.ok) live = await res.text();
    } catch {
      // Unreachable counts as changed: better one ping too many than a new page
      // that never gets one.
    }
    if (live !== local) out.push(url);
  }
  process.stdout.write(out.join('\n') + (out.length ? '\n' : ''));
  console.error(`indexnow: ${out.length} of ${urls.length} URLs differ from the live site`);
}

async function submit(list) {
  if (!site.indexNowKey) {
    console.error('indexnow: no indexNowKey in site.config.mjs, nothing to do');
    return;
  }
  const urls = [...new Set(list.map((u) => u.trim()).filter((u) => u.startsWith(baseUrl)))];
  if (!urls.length) {
    console.error('indexnow: no changed URLs to submit');
    return;
  }
  const host = new URL(baseUrl).host;
  const body = { host, key: site.indexNowKey, keyLocation: `${baseUrl}/${site.indexNowKey}.txt`, urlList: urls };
  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify(body),
  });
  // 200 = accepted, 202 = accepted while the key file is being checked.
  // 403 = the key file is not live (yet), 422 = a URL is not on this host,
  // 429 = too many submissions.
  console.error(`indexnow: submitted ${urls.length} URLs, HTTP ${res.status}`);
  for (const u of urls) console.error(`  ${u}`);
  if (res.status !== 200 && res.status !== 202) process.exitCode = 1;
}

if (!baseUrl) {
  console.error('indexnow: no domain configured');
} else if (mode === 'changed') {
  await changed();
} else if (mode === 'submit') {
  await submit(rest[0] === '--all' ? await siteUrls() : rest.join(' ').split(/\s+/));
} else {
  console.error('usage: node scripts/indexnow.mjs changed | submit [--all | <url> ...]');
  process.exitCode = 2;
}
