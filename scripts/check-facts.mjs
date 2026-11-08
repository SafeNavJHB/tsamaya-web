#!/usr/bin/env node
// check-facts.mjs: what the site says about things it does not own.
//
//   npm run check:facts
//
// check-seo.mjs proves the site agrees with itself. This proves it agrees with the
// app and the stores, which is where it actually drifted: on 2026-11-05 a public
// audit found the Google Play listing still naming 14 of the 22 places, five weeks
// after the site moved on, and nothing had flagged it.
//
// Run it after a new place, a new store release, or a change to grades or time
// bands. It needs the network and, for the app checks, the app repo
// (TSAMAYA_APP_DIR, default ~/Projects/SafeNav), so it is NOT a deploy gate: a
// store listing lagging behind must never block a site deploy. A source it cannot
// reach is reported as "could not check", never as a pass.
//
// Exits non-zero on any mismatch.

import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { stats, site } from '../site.config.mjs';
import { AVAILABILITY, METHOD } from '../src/facts.mjs';

const results = [];
const pass = (msg) => results.push(['ok', msg]);
const fail = (msg) => results.push(['FAIL', msg]);
const skip = (msg) => results.push(['skip', msg]);

const STALE_AFTER_DAYS = 45;
const BUNDLE_ID = 'com.tsamaya.app';
const UA = { 'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/130 Safari/537.36' };

async function get(url) {
  const res = await fetch(url, { headers: UA, signal: AbortSignal.timeout(30000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}
const textOf = (html) => html
  .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/\s+/g, ' ');

// ---- 1. The day someone last looked at the stores ----------------------------
{
  const days = Math.floor((Date.now() - Date.parse(AVAILABILITY.verified)) / 86400000);
  if (days > STALE_AFTER_DAYS) fail(`AVAILABILITY.verified is ${days} days old (facts.mjs): look at the stores, then move it`);
  else pass(`availability checked ${days} day(s) ago`);
}

// ---- 2. The app repo: places, grades, pricing, time bands ---------------------
const app = process.env.TSAMAYA_APP_DIR || join(homedir(), 'Projects', 'SafeNav');
const read = (rel) => readFileSync(join(app, rel), 'utf8');
if (!existsSync(join(app, 'src', 'constants', 'routingTunables.ts'))) {
  skip(`no app repo at ${app}: places, grades and bands not compared`);
} else {
  // The site counts every place the database names. The app's CITIES is a list of
  // GPS boxes, and Johannesburg's box also holds these two, so they are not in it.
  const INSIDE_ANOTHER_BOX = new Set(['ekurhuleni', 'west_rand']);
  const appKeys = [...read('src/constants/cities.ts').matchAll(/^\s+key: '([^']+)'/gm)].map((m) => m[1]);
  const siteKeys = stats.metros.map((m) => m.key);
  const notOnSite = appKeys.filter((k) => !siteKeys.includes(k));
  const notInApp = siteKeys.filter((k) => !appKeys.includes(k) && !INSIDE_ANOTHER_BOX.has(k));
  if (notOnSite.length) fail(`in the app but not on the site: ${notOnSite.join(', ')}. See "Onboarding a new metro" in the README`);
  if (notInApp.length) fail(`on the site but not in the app's CITIES: ${notInApp.join(', ')}`);
  if (!notOnSite.length && !notInApp.length) pass(`the app's ${appKeys.length} GPS boxes and the site's ${siteKeys.length} places agree`);

  const tunables = read('src/constants/routingTunables.ts');
  const grade = tunables.match(/SAFETY_GRADE_MAX_COST = Object\.freeze\(\{ A: (\d+), B: (\d+), C: (\d+), D: (\d+) \}\)/);
  const u = METHOD.gradeUnder;
  if (!grade) fail('could not find SAFETY_GRADE_MAX_COST in routingTunables.ts');
  else if ([u.A, u.B, u.C, u.D].join() === grade.slice(1).join()) pass('grade cut-offs match the app');
  else fail(`grade cut-offs differ: app ${grade.slice(1).join('/')}, METHOD ${[u.A, u.B, u.C, u.D].join('/')}`);

  const price = tunables.match(/zone: Object\.freeze\(\{ red: (\d+), orange: (\d+), yellow: (\d+) \}\)/);
  const c = METHOD.costPerKm;
  if (!price) fail('could not find the zone pricing in routingTunables.ts');
  else if ([c.red, c.orange, c.yellow].join() === price.slice(1).join()) pass('per-km pricing matches the app');
  else fail(`per-km pricing differs: app ${price.slice(1).join('/')}, METHOD ${[c.red, c.orange, c.yellow].join('/')}`);

  const eps = tunables.match(/epsKm: ([\d.]+)/);
  if (!eps) fail('could not find epsKm in routingTunables.ts');
  else if (Math.round(Number(eps[1]) * 1000) === METHOD.redFloorMetres) pass('the red floor matches the app');
  else fail(`the red floor differs: app ${Number(eps[1]) * 1000} m, METHOD ${METHOD.redFloorMetres} m`);

  const clock = read('src/lib/timeBandClock.ts');
  const b = METHOD.bands;
  const wanted = [`daytime  ${b.daytime[0]} – ${b.daytime[1]}`, `evening  ${b.evening[0]} – ${b.evening[1]}`, `night    ${b.night[0]} – ${b.night[1]}`];
  const missing = wanted.filter((w) => !clock.includes(w));
  if (missing.length) fail(`time bands differ from timeBandClock.ts: ${missing.join('; ')}`);
  else pass('time bands match the app');
}

// ---- 3. The App Store listing (live since 2026-11-06) --------------------------
try {
  const app = JSON.parse(await get(`https://itunes.apple.com/lookup?bundleId=${BUNDLE_ID}&country=za`)).results?.[0];
  if (!app) fail('Tsamaya is not on the South African App Store, but every page links to it (site.appStoreLink)');
  else {
    if (!site.appStoreLink.includes(`/id${app.trackId}`)) fail(`site.appStoreLink does not point at app id ${app.trackId}`);
    else pass(`site.appStoreLink points at the live listing (id ${app.trackId})`);
    if (app.version === AVAILABILITY.iphoneVersion) pass(`the App Store shows ${app.version}, as AVAILABILITY says`);
    else fail(`the App Store shows ${app.version} but AVAILABILITY says ${AVAILABILITY.iphoneVersion}`);
    const text = app.description || '';
    if (/dangerous/i.test(text)) fail('the App Store description says "dangerous": brand copy is lower-risk language (docs/BRAND.md in the app repo)');
    else pass('the App Store description keeps to lower-risk language');
    // The count is only there if someone wrote one, so absence is not a failure.
    const count = (text.match(/\b(\d+) places\b/) || [])[1];
    if (count && Number(count) !== stats.totals.metros) fail(`the App Store description says ${count} places but the live total is ${stats.totals.metros}`);
  }
} catch (e) { skip(`could not check the App Store: ${e.message}`); }

// ---- 4. The Google Play listing ----------------------------------------------
try {
  const text = textOf(await get(`${site.androidPlayLink}&hl=en_ZA&gl=ZA`));
  // "Kruger & Lowveld" and "eMalahleni & Middelburg" count when each part is named.
  const absent = stats.metros
    .filter((m) => !m.name.split(' & ').every((part) => text.includes(part)))
    .map((m) => m.name);
  if (absent.length) fail(`the Play listing does not name ${absent.length} of ${stats.totals.metros} places: ${absent.join(', ')}`);
  else pass(`the Play listing names all ${stats.totals.metros} places`);
  const version = (text.match(/Tsamaya (\d+\.\d+\.\d+)/) || [])[1];
  if (!version) skip('could not read a version from the Play listing');
  else if (version === AVAILABILITY.androidVersion) pass(`Play shows ${version}, as AVAILABILITY says`);
  else fail(`Play shows ${version} but AVAILABILITY says ${AVAILABILITY.androidVersion}`);
} catch (e) { skip(`could not check the Play listing: ${e.message}`); }


for (const [state, msg] of results) console.log(`  ${state.padEnd(4)}  ${msg}`);
const failed = results.filter(([s]) => s === 'FAIL').length;
console.log(failed ? `\n  ${failed} check(s) failed.\n` : '\n  No mismatches.\n');
process.exit(failed ? 1 : 0);
