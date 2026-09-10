#!/usr/bin/env node
// sync-metro-bounds.mjs — copies the app's metro bounding boxes into
// src/data/metro-bounds.json, which is what the coverage map is drawn from.
//
// WHY THIS EXISTS
// The bbox for each metro is the app's own service-area gate: the rectangle
// inside which a GPS fix is trusted and risk data applies. That makes it the
// honest thing to draw on a coverage map — it is literally where the app works.
//
// It is also the app's to define, not this site's. src/constants/cities.ts in
// the SafeNav repo is the source of truth, and it is already mirrored into the
// admin and the pipeline by hand. A fourth hand-typed copy would eventually
// disagree with the other three, and the one that disagrees silently is the one
// on the public website. So it is copied by a script, and the copy is committed.
//
//   node scripts/sync-metro-bounds.mjs           (reads ~/Projects/SafeNav)
//   node scripts/sync-metro-bounds.mjs --app /path/to/SafeNav
//   node scripts/sync-metro-bounds.mjs --dry     (print, don't write)
//
// Run it whenever a metro is onboarded, in the same sitting as `npm run stats`.
// The site build fails outright if a metro carrying zones has no bounds here, so
// forgetting is loud rather than silent.

import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { homedir } from 'node:os';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const outPath = join(root, 'src', 'data', 'metro-bounds.json');

const argv = process.argv.slice(2);
const dryRun = argv.includes('--dry');
const appArg = argv.indexOf('--app');
const appRoot = appArg >= 0 ? argv[appArg + 1] : join(homedir(), 'Projects', 'SafeNav');
const citiesPath = join(appRoot, 'src', 'constants', 'cities.ts');

if (!existsSync(citiesPath)) {
  console.error(
    `Cannot find ${citiesPath}.\n` +
      'Pass --app <path to the SafeNav app checkout>.\n',
  );
  process.exit(1);
}

const source = await readFile(citiesPath, 'utf8');

// One match per CITIES entry. The fields always appear in this order in the app
// file, and each entry is a flat object literal, so a regex is enough — but a
// changed shape must not silently yield fewer metros, hence the count check
// against the `key:` occurrences below.
const ENTRY =
  /key:\s*['"]([a-z_]+)['"][\s\S]*?display:\s*['"]([^'"]+)['"][\s\S]*?bbox:\s*\{\s*lngMin:\s*(-?[\d.]+),\s*lngMax:\s*(-?[\d.]+),\s*latMin:\s*(-?[\d.]+),\s*latMax:\s*(-?[\d.]+),?\s*\}[\s\S]*?center:\s*\[\s*(-?[\d.]+),\s*(-?[\d.]+)\s*\]/g;

const block = source.slice(source.indexOf('export const CITIES'));
const metros = [];
for (const m of block.matchAll(ENTRY)) {
  metros.push({
    key: m[1],
    name: m[2],
    bbox: {
      lngMin: Number(m[3]),
      lngMax: Number(m[4]),
      latMin: Number(m[5]),
      latMax: Number(m[6]),
    },
    center: [Number(m[7]), Number(m[8])],
  });
}

// A regex that quietly matches four of twelve entries would ship a map missing
// eight metros and nobody would know. Count the `key:` lines independently.
const declared = (block.match(/^\s*key:\s*['"]/gm) || []).length;
if (metros.length !== declared) {
  console.error(
    `Parsed ${metros.length} metros but cities.ts declares ${declared}. ` +
      'The shape of CITIES has changed — fix the parser in this script rather than committing a short list.\n',
  );
  process.exit(1);
}
if (!metros.length) {
  console.error('Parsed no metros at all from cities.ts.\n');
  process.exit(1);
}

// Sanity: every box must be the right way round and inside South Africa.
for (const m of metros) {
  const { lngMin, lngMax, latMin, latMax } = m.bbox;
  if (lngMin >= lngMax || latMin >= latMax) {
    console.error(`${m.key}: bbox is inside out — ${JSON.stringify(m.bbox)}\n`);
    process.exit(1);
  }
  const [lng, lat] = m.center;
  if (lng < 16 || lng > 33 || lat < -35 || lat > -22) {
    console.error(`${m.key}: centre ${lng}, ${lat} is not in South Africa\n`);
    process.exit(1);
  }
}

// Warn about drift against the published figures. Not fatal here — the build is
// what refuses to ship a metro with zones and no bounds — but this is where a
// human is looking, so say it here too.
const stats = JSON.parse(await readFile(join(root, 'src', 'data', 'stats.json'), 'utf8'));
const keys = new Set(metros.map((m) => m.key));
const missing = stats.metros.filter((m) => m.zones > 0 && !keys.has(m.key)).map((m) => m.key);
const extra = metros.filter((m) => !stats.metros.some((s) => s.key === m.key)).map((m) => m.key);

const payload = {
  _generated: 'scripts/sync-metro-bounds.mjs — do not hand-edit',
  _source: 'SafeNav app, src/constants/cities.ts (the service-area gate)',
  metros,
};
const json = JSON.stringify(payload, null, 2) + '\n';

console.log(`\n  ${metros.length} metros read from ${citiesPath}\n`);
for (const m of metros) {
  const w = (m.bbox.lngMax - m.bbox.lngMin).toFixed(2);
  const h = (m.bbox.latMax - m.bbox.latMin).toFixed(2);
  console.log(`  ${m.name.padEnd(14)} ${w} x ${h} deg   centre ${m.center.join(', ')}`);
}
if (missing.length) console.log(`\n  ! stats.json has zones for ${missing.join(', ')} but cities.ts does not list them`);
if (extra.length) console.log(`\n  ~ cities.ts lists ${extra.join(', ')}, which stats.json has never heard of`);

if (dryRun) {
  console.log('\n  --dry: not written.\n');
} else {
  await writeFile(outPath, json, 'utf8');
  console.log(`\n  → wrote ${outPath}\n  Commit it so the build picks it up.\n`);
}
