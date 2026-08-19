#!/usr/bin/env node
// sync-changelog.mjs — copies the app's "What's New" entries onto the website.
//
// WHY
// The app already keeps a changelog: every OTA must add an entry to
// src/constants/whatsNew.ts in the app repo, and `npm run check:whatsnew` fails
// the release if it doesn't. That list is the single source of truth, and this
// script mirrors it onto the website so the public updates page can never
// disagree with what users see in Settings › What's New.
//
// Nothing here is retyped. If an entry is on the website it is because it shipped.
//
//   npm run changelog              (reads ~/Projects/SafeNav by default)
//   TSAMAYA_APP_DIR=/path npm run changelog
//   npm run changelog -- --dry
//
// Run it after each OTA, then commit src/data/whats-new.json. The build reads the
// committed JSON, so the website still builds with the app repo absent.

import { writeFile, readFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const outPath = join(root, 'src', 'data', 'whats-new.json');
const dryRun = process.argv.includes('--dry');

// The app repo's usual homes, tried in order; TSAMAYA_APP_DIR beats them all.
const sourceIn = (dir) => join(dir, 'src', 'constants', 'whatsNew.ts');
const defaultAppDirs = [
  join(homedir(), 'Projects', 'SafeNav'),
  join(homedir(), 'Desktop', 'SafeNav'), // the repo's home before 2026-08-19
];
const appDir =
  process.env.TSAMAYA_APP_DIR ||
  defaultAppDirs.find((dir) => existsSync(sourceIn(dir))) ||
  defaultAppDirs[0];
const sourceFile = sourceIn(appDir);

if (!existsSync(sourceFile)) {
  console.error(
    `Could not find the app changelog at:\n  ${sourceFile}\n\n` +
      `Point TSAMAYA_APP_DIR at the app repo if it lives elsewhere:\n` +
      `  TSAMAYA_APP_DIR=/path/to/SafeNav npm run changelog\n`,
  );
  process.exit(1);
}

const source = await readFile(sourceFile, 'utf8');

/* ---------------------------------------------------------------------------
 * Extracting the data.
 *
 * whatsNew.ts is TypeScript, but WHATS_NEW_RELEASES is a plain array literal —
 * objects, strings and string concatenation, nothing else. So rather than pull in
 * a TypeScript parser for one array, we slice out the literal by matching
 * brackets and evaluate it as an expression.
 *
 * Deliberately NOT a regex over the whole file: the bodies contain apostrophes,
 * em dashes and 'a' + 'b' concatenation across lines, all of which defeat naive
 * pattern matching. Bracket counting handles them because it only tracks
 * structure, and it skips anything inside a string or comment.
 * ------------------------------------------------------------------------ */
function extractArrayLiteral(src, declaration) {
  // Anchor on the actual `export const NAME` declaration, not the first mention.
  // The file's doc comment names both constants several times, so a plain
  // indexOf(name) lands inside the comment and finds no array at all.
  // Match through the assignment, so the type annotation is already behind us.
  // Without this the search finds the "[" in `: WhatsNewRelease[] =` — the
  // brackets of the type, not of the value.
  const declRe = new RegExp(`export\\s+const\\s+${declaration}\\b[^=]*=`);
  const match = declRe.exec(src);
  if (!match) throw new Error(`Could not find "export const ${declaration} = ..." in whatsNew.ts`);
  const start = src.indexOf('[', match.index + match[0].length);
  if (start === -1) throw new Error(`No array literal follows "${declaration}"`);

  let depth = 0;
  let inString = null;
  let inLineComment = false;
  let inBlockComment = false;

  for (let i = start; i < src.length; i++) {
    const ch = src[i];
    const next = src[i + 1];

    if (inLineComment) {
      if (ch === '\n') inLineComment = false;
      continue;
    }
    if (inBlockComment) {
      if (ch === '*' && next === '/') { inBlockComment = false; i++; }
      continue;
    }
    if (inString) {
      if (ch === '\\') { i++; continue; }        // escaped character
      if (ch === inString) inString = null;
      continue;
    }
    if (ch === '/' && next === '/') { inLineComment = true; i++; continue; }
    if (ch === '/' && next === '*') { inBlockComment = true; i++; continue; }
    if (ch === "'" || ch === '"' || ch === '`') { inString = ch; continue; }

    if (ch === '[') depth++;
    else if (ch === ']') {
      depth--;
      if (depth === 0) return src.slice(start, i + 1);
    }
  }
  throw new Error(`Unbalanced brackets while reading "${declaration}"`);
}

let releases;
let categories;
try {
  const releasesLiteral = extractArrayLiteral(source, 'WHATS_NEW_RELEASES');
  const categoriesLiteral = extractArrayLiteral(source, 'WHATS_NEW_CATEGORIES');
  // The literals are pure data — no identifiers, no calls, nothing to execute.
  releases = new Function(`return ${releasesLiteral};`)();
  categories = new Function(`return ${categoriesLiteral};`)();
} catch (err) {
  console.error(`Failed to read the changelog: ${err.message}`);
  process.exit(1);
}

/* ---- Validate before writing ------------------------------------------- */
const problems = [];
if (!Array.isArray(releases) || releases.length === 0) problems.push('no releases found');

const seenVersions = new Set();
for (const rel of releases) {
  if (!rel.version) problems.push(`a release has no version (date "${rel.date}")`);
  if (!rel.date) problems.push(`release ${rel.version} has no date`);
  if (seenVersions.has(rel.version)) problems.push(`duplicate version ${rel.version}`);
  seenVersions.add(rel.version);
  if (!Array.isArray(rel.items) || rel.items.length === 0) {
    problems.push(`release ${rel.version} has no items`);
    continue;
  }
  for (const item of rel.items) {
    if (!item.title) problems.push(`an item in ${rel.version} has no title`);
    if (!item.body) problems.push(`"${item.title}" in ${rel.version} has no body`);
  }
}
if (problems.length) {
  console.error('The app changelog has problems, so nothing was written:');
  for (const p of problems) console.error(`  ! ${p}`);
  process.exit(1);
}

/* ---- Shape it for the website ------------------------------------------ */
// `silent` is an app concept — it decides whether a release interrupts the user
// with a card. On a page someone chose to visit there is no interruption to
// suppress, so every release is shown and the flag is dropped.
const out = {
  categories: categories.map((c) => ({ key: c.key, label: c.label })),
  releases: releases.map((rel) => ({
    version: rel.version,
    date: rel.date,
    items: rel.items.map((it) => ({
      icon: it.icon,
      title: it.title,
      body: it.body,
      category: it.category || 'feature',
    })),
  })),
};

const counts = out.releases.reduce((acc, rel) => {
  for (const it of rel.items) acc[it.category] = (acc[it.category] || 0) + 1;
  return acc;
}, {});
const totalItems = Object.values(counts).reduce((a, b) => a + b, 0);

console.log(
  `\n  ${out.releases.length} releases, ${totalItems} items` +
    `\n  ${out.categories.map((c) => `${c.label}: ${counts[c.key] || 0}`).join('  ·  ')}` +
    `\n  newest: ${out.releases[0].date} (${out.releases[0].version})` +
    `\n  oldest: ${out.releases[out.releases.length - 1].date}\n`,
);

if (dryRun) {
  console.log('  --dry: not written.\n');
} else {
  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, JSON.stringify(out, null, 2) + '\n', 'utf8');
  console.log(`  → wrote ${outPath}\n  Commit it, then push to publish.\n`);
}
