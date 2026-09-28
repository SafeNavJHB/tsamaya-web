#!/usr/bin/env node
// sync-hotspots.mjs: copies the app's hijacking and smash-and-grab hotspots into
// src/data/hotspots.json, which the metro page maps draw.
//
// WHY
// The app keeps a curated list of point hotspots (named off-ramps and
// intersections, compiled from public reporting) in assets/data/hotspots_v1.json.
// That list is the app's to define. A hand-typed copy on the website would drift
// from what drivers are warned about, so it is copied by a script and the copy
// is committed. The build reads the committed JSON and never needs the app repo.
//
// THE EDITORIAL RULE STILL HOLDS (README, src/data/metros.mjs)
// The app's hotspot names carry a locality ("..., Philippi", "near Good Hope
// informal settlement"). On the public site a hotspot is labelled by its ROAD
// only: roads and routes are public infrastructure, where people live is not.
// roadLabel() below keeps the road parts of a name and drops the place parts;
// LABELS overrides the few names whose road part itself names a place. The
// guard after that refuses to write a label that still carries a place name
// dropped from any other hotspot, so a new hotspot with an awkward name fails
// here, loudly, instead of publishing a suburb.
//
// POSITIONS
// Admins can move a hotspot in the app (Supabase `hotspot_overrides`, readable
// with the anon key). With SUPABASE_URL + SUPABASE_ANON_KEY set (the same pair
// `npm run stats` uses) those moves are applied; without them the bundled
// positions are used and the script says so.
//
//   npm run hotspots                 (reads ~/Projects/SafeNav by default)
//   TSAMAYA_APP_DIR=/path npm run hotspots
//   npm run hotspots -- --dry        (print, don't write)
//
// Run it whenever the app's hotspot list changes, then commit
// src/data/hotspots.json.

import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const outPath = join(root, 'src', 'data', 'hotspots.json');
const dryRun = process.argv.includes('--dry');

const sourceIn = (dir) => join(dir, 'assets', 'data', 'hotspots_v1.json');
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
    `Could not find the app's hotspot list at:\n  ${sourceFile}\n\n` +
      `Point TSAMAYA_APP_DIR at the app repo if it lives elsewhere:\n` +
      `  TSAMAYA_APP_DIR=/path/to/SafeNav npm run hotspots\n`,
  );
  process.exit(1);
}

const src = JSON.parse(await readFile(sourceFile, 'utf8'));
const TYPES = ['hijacking', 'smash_and_grab', 'both'];

/* ---------------------------------------------------------------------------
 * Road-only labels.
 *
 * A name is comma-separated: the first part is the road ("cnr Grayston Drive &
 * Rivonia Road"), later parts are either more road ("N1", "N17") or a place
 * ("Sandton", "Khayelitsha/Mitchells Plain"). Keep the first part, keep later
 * parts that read as road, drop the rest.
 * ------------------------------------------------------------------------ */
const ROADISH =
  /\b(road|rd|drive|street|avenue|lane|boulevard|bridge|circle|interchange|off-ramps?|on-ramps?|ramps?|highway|traffic lights?|stop sign|toll plaza|arterial)\b|\b[NMR]\d+\b/i;

// Names whose road part itself carries a place. Keyed by the app's id, so a
// renamed hotspot falls back to roadLabel() and meets the guard below.
const LABELS = {
  'seed-knights-road-bridge-near-good-hope-informal-settlement-germiston': 'Knights Road bridge',
  'seed-louis-botha-avenue-between-alexandra-and-hillbrow': 'Louis Botha Avenue',
  'seed-voortrekker-road-between-bellville-and-parow': 'Voortrekker Road',
  "seed-e-skia-mphahlele-drive-near-marabastad": "E'skia Mphahlele Drive",
  'seed-n2-hell-run-between-jakes-gerwel-and-baden-powell-interchanges-cape-town':
    'N2 between the Jakes Gerwel and Baden Powell interchanges',
};

function roadLabel(name) {
  const [head, ...rest] = String(name).split(/,\s*/);
  return [head, ...rest.filter((p) => ROADISH.test(p))].join(', ').trim();
}

// Every place part dropped from any name, split on "/" ("Khayelitsha/Mitchells
// Plain"), plus the words that always mean a place people live.
const dropped = new Set(['informal settlement']);
for (const h of src.hotspots || []) {
  const [, ...rest] = String(h.name).split(/,\s*/);
  for (const p of rest) if (!ROADISH.test(p)) p.split('/').forEach((w) => dropped.add(w.trim().toLowerCase()));
}
// "Pretoria" is dropped from "Fountains Circle, Pretoria" but "Pretoria Road" is
// a road, so a place word directly followed by a road word is allowed.
const leaks = (label) =>
  [...dropped].filter((w) => w && new RegExp(`\\b${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b(?!\\s+(main\\s+)?(road|street|drive|avenue|arterial|interchange))`, 'i').test(label));

const problems = [];
const hotspots = [];
for (const h of src.hotspots || []) {
  if (typeof h?.lng !== 'number' || typeof h?.lat !== 'number' || !TYPES.includes(h?.type)) {
    problems.push(`${h?.id}: missing coordinates or an unknown type`);
    continue;
  }
  const label = LABELS[h.id] || roadLabel(h.name);
  const bad = leaks(label);
  if (bad.length) problems.push(`${h.id}: label "${label}" still names ${bad.join(', ')}. Add a road-only label to LABELS.`);
  hotspots.push({ id: String(h.id), type: h.type, city: String(h.city), label, lng: h.lng, lat: h.lat });
}
for (const id of Object.keys(LABELS)) {
  if (!hotspots.some((h) => h.id === id)) console.log(`  ~ LABELS has "${id}", which the app no longer lists`);
}
if (problems.length) {
  console.error(`\n  Refusing to write:\n  ${problems.join('\n  ')}\n`);
  process.exit(1);
}

/* ---------------------------------------------------------------------------
 * Admin position moves, when credentials are present.
 * ------------------------------------------------------------------------ */
const URL_BASE = (process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
const KEY = process.env.SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
let moved = null;
if (URL_BASE && KEY) {
  const res = await fetch(`${URL_BASE}/rest/v1/hotspot_overrides?select=hotspot_id,lng,lat`, {
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
  });
  if (!res.ok) {
    console.error(`  hotspot_overrides: HTTP ${res.status} ${await res.text()}\n`);
    process.exit(1);
  }
  moved = 0;
  for (const o of await res.json()) {
    const h = hotspots.find((x) => x.id === o.hotspot_id);
    if (h && typeof o.lng === 'number' && typeof o.lat === 'number') { h.lng = o.lng; h.lat = o.lat; moved++; }
  }
}

const payload = {
  _generated: 'scripts/sync-hotspots.mjs, do not hand-edit',
  _source: `SafeNav app, assets/data/hotspots_v1.json (${src._generated || 'undated'})`,
  _positions: moved === null ? 'bundled seed (no Supabase credentials, admin moves not applied)' : `bundled seed + ${moved} admin moves`,
  attribution: 'Compiled from public reporting (SAPS, NHPA/Arrive Alive, regional news). Approximate and not a complete list.',
  hotspots,
};

const byCity = {};
for (const h of hotspots) byCity[h.city] = (byCity[h.city] || 0) + 1;
console.log(`\n  ${hotspots.length} hotspots read from ${sourceFile}`);
for (const [c, n] of Object.entries(byCity)) console.log(`  ${c.padEnd(14)} ${n}`);
console.log(`  positions: ${payload._positions}`);

if (dryRun) {
  for (const h of hotspots) console.log(`  ${h.city.padEnd(13)} ${h.type.padEnd(15)} ${h.label}`);
  console.log('\n  --dry: not written.\n');
} else {
  await writeFile(outPath, JSON.stringify(payload, null, 2) + '\n', 'utf8');
  console.log(`\n  → wrote ${outPath}\n  Commit it so the build picks it up.\n`);
}
