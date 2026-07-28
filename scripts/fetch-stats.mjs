#!/usr/bin/env node
// fetch-stats.mjs — refreshes src/data/stats.json from the live Supabase project.
//
// WHY THIS EXISTS
// The site used to hardcode its headline figures ("5 metros", "2,500+ zones").
// They went stale within weeks and nobody noticed. This script pulls the real
// numbers so the only way a figure is wrong is if nobody ran the refresh.
//
// HOW IT FITS THE BUILD
// This is deliberately NOT part of `node build.mjs`. The build must work offline,
// in CI, and without secrets — so it reads the *committed* src/data/stats.json.
// The flow is: run this script → eyeball the diff → commit the JSON → push.
//
//   node scripts/fetch-stats.mjs        (reads SUPABASE_URL + SUPABASE_ANON_KEY)
//   node scripts/fetch-stats.mjs --dry  (print, don't write)
//
// Credentials come from the environment. The app repo's .env has them, so:
//   set -a && source ~/Desktop/SafeNav/.env && set +a
//   SUPABASE_URL=$EXPO_PUBLIC_SUPABASE_URL SUPABASE_ANON_KEY=$EXPO_PUBLIC_SUPABASE_ANON_KEY \
//     node scripts/fetch-stats.mjs

import { writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const outPath = join(root, 'src', 'data', 'stats.json');
const dryRun = process.argv.includes('--dry');

const URL_BASE = (process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
const KEY = process.env.SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!URL_BASE || !KEY) {
  console.error(
    'Missing credentials. Set SUPABASE_URL and SUPABASE_ANON_KEY, e.g.:\n\n' +
      '  set -a && source ~/Desktop/SafeNav/.env && set +a\n' +
      '  SUPABASE_URL=$EXPO_PUBLIC_SUPABASE_URL SUPABASE_ANON_KEY=$EXPO_PUBLIC_SUPABASE_ANON_KEY node scripts/fetch-stats.mjs\n',
  );
  process.exit(1);
}

const headers = {
  apikey: KEY,
  Authorization: `Bearer ${KEY}`,
};

// PostgREST returns the total row count in the Content-Range header
// ("0-0/3254") when asked for an exact count. Cheaper than pulling rows.
async function count(table, query) {
  const res = await fetch(`${URL_BASE}/rest/v1/${table}?${query}`, {
    headers: { ...headers, Prefer: 'count=exact', Range: '0-0' },
  });
  if (!res.ok) throw new Error(`${table}?${query} → HTTP ${res.status} ${await res.text()}`);
  const range = res.headers.get('content-range') || '';
  const total = Number(range.split('/')[1]);
  if (!Number.isFinite(total)) throw new Error(`${table}: could not parse count from "${range}"`);
  return total;
}

// The metros the app actually serves, in the same order and spelling as
// src/constants/cities.ts in the app repo. `key` is the DB `city` value.
const METROS = [
  { key: 'johannesburg', name: 'Johannesburg', slug: 'johannesburg' },
  { key: 'cape_town', name: 'Cape Town', slug: 'cape-town' },
  { key: 'pretoria', name: 'Pretoria', slug: 'pretoria' },
  { key: 'ekurhuleni', name: 'Ekurhuleni', slug: 'ekurhuleni' },
  { key: 'west_rand', name: 'West Rand', slug: 'west-rand' },
  { key: 'secunda', name: 'Secunda', slug: 'secunda' },
  { key: 'stellenbosch', name: 'Stellenbosch', slug: 'stellenbosch' },
];

const BANDS = ['red', 'orange', 'yellow', 'none'];

async function main() {
  const live = 'deleted_at=is.null';

  // ---- Totals -------------------------------------------------------------
  const [zonesTotal, corridorsTotal, corridorsSafe, corridorsDanger] = await Promise.all([
    count('zones', `select=id&${live}`),
    count('corridors', `select=id&${live}`),
    count('corridors', `select=id&${live}&corridor_type=eq.safe`),
    count('corridors', `select=id&${live}&corridor_type=eq.danger`),
  ]);

  // ---- Risk-band split (drives the distribution chart) --------------------
  const bandCounts = {};
  for (const band of BANDS) {
    bandCounts[band] = await count('zones', `select=id&${live}&risk_band=eq.${band}`);
  }

  // ---- Per-metro ----------------------------------------------------------
  const metros = [];
  for (const m of METROS) {
    const zones = await count('zones', `select=id&${live}&city=eq.${m.key}`);
    const corridors = await count('corridors', `select=id&${live}&city=eq.${m.key}`);
    const bands = {};
    for (const band of BANDS) {
      bands[band] = await count('zones', `select=id&${live}&city=eq.${m.key}&risk_band=eq.${band}`);
    }
    // DELIBERATELY NOT COLLECTED: the names of red-band zones.
    //
    // They are census sub-place names, and the red band is overwhelmingly
    // townships and informal settlements (Alexandra Ext 1-18, Khayamandi SP,
    // Embalenhle, Bekkersdal SP...). Showing a driver a risk overlay in the app,
    // in the context of a route they are about to drive, is the product. Publishing
    // a permanent, indexable, quotable web page that lists those same places as
    // dangerous is a completely different act — it reads as a redline map, invites
    // defamation and unfair-discrimination complaints, and would be thin
    // keyword-stuffed content that search engines demote anyway.
    //
    // Metro pages therefore carry counts, band distribution, data provenance and
    // driving context — never a list of named areas. If this is ever revisited,
    // it needs a legal opinion first, not a code change.
    metros.push({ ...m, zones, corridors, bands });
  }

  // ---- Sanity checks ------------------------------------------------------
  // These catch a silently-broken query far better than eyeballing JSON does.
  const warnings = [];
  const bandSum = BANDS.reduce((a, b) => a + bandCounts[b], 0);
  if (bandSum !== zonesTotal) {
    warnings.push(
      `Risk bands sum to ${bandSum} but there are ${zonesTotal} zones — ` +
        `${zonesTotal - bandSum} zone(s) carry a band outside [${BANDS.join(', ')}].`,
    );
  }
  if (corridorsSafe + corridorsDanger !== corridorsTotal) {
    warnings.push(
      `Safe (${corridorsSafe}) + danger (${corridorsDanger}) ≠ total (${corridorsTotal}) corridors.`,
    );
  }
  const metroZoneSum = metros.reduce((a, m) => a + m.zones, 0);
  if (metroZoneSum !== zonesTotal) {
    warnings.push(
      `Per-metro zones sum to ${metroZoneSum} but the total is ${zonesTotal} — ` +
        `${zonesTotal - metroZoneSum} zone(s) have a city value outside the known metro list.`,
    );
  }
  // Known data issue: Ekurhuleni corridors are tagged city='johannesburg', so
  // Ekurhuleni reports 0. Per-metro corridor counts are therefore NOT published
  // on the site; only the national corridor total is. Flag it so the day it gets
  // fixed, someone notices they can start publishing the breakdown.
  const zeroCorridorMetros = metros.filter((m) => m.zones > 0 && m.corridors === 0).map((m) => m.name);
  if (zeroCorridorMetros.length) {
    warnings.push(
      `${zeroCorridorMetros.join(', ')} report 0 corridors despite having zones — ` +
        `corridor rows are tagged to another city. Per-metro corridor counts stay unpublished.`,
    );
  }

  const stats = {
    // Stamped by the caller, not the script: the build sandbox forbids Date.*,
    // and a stamp that changes on every run makes for noisy diffs anyway.
    generatedFrom: URL_BASE.replace(/^https?:\/\//, '').split('.')[0],
    totals: {
      metros: metros.filter((m) => m.zones > 0).length,
      zones: zonesTotal,
      corridors: corridorsTotal,
      corridorsSafe,
      corridorsDanger,
      riskBands: 3,
    },
    bands: bandCounts,
    metros,
    // Per-metro corridor counts are unreliable (see the warning above); the site
    // must not render them. Kept in the JSON for debugging only.
    perMetroCorridorsReliable: zeroCorridorMetros.length === 0,
  };

  const json = JSON.stringify(stats, null, 2) + '\n';

  console.log(
    `\n  metros    ${stats.totals.metros}` +
      `\n  zones     ${zonesTotal}  (red ${bandCounts.red} · orange ${bandCounts.orange} · yellow ${bandCounts.yellow} · none ${bandCounts.none})` +
      `\n  corridors ${corridorsTotal}  (safe ${corridorsSafe} · danger ${corridorsDanger})\n`,
  );
  for (const m of metros) console.log(`  ${m.name.padEnd(14)} ${String(m.zones).padStart(4)} zones`);

  if (warnings.length) {
    console.log('\n  Warnings:');
    for (const w of warnings) console.log(`    ! ${w}`);
  }

  if (dryRun) {
    console.log('\n  --dry: not written.\n');
    return;
  }
  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, json, 'utf8');
  console.log(`\n  → wrote ${outPath}\n  Commit it so the build picks it up.\n`);
}

main().catch((err) => {
  console.error('\nfetch-stats failed:', err.message);
  process.exit(1);
});
