// sitedata.mjs: the data files the browser reads, written by build.mjs into
// dist/data/. Nothing here is typed by hand: it all comes from the committed
// live data (src/data/stats.json, metro-shapes.json, za-land.json) and the
// editorial list of metros (src/data/metros.mjs).
//
//   dist/data/site.json  totals, and per metro: slug, name, province, rated
//                        areas and the high-risk (red) count for each time band.
//   dist/data/geo.json   the South Africa outline and borders, and each metro's
//                        coverage outline and marker point, already projected
//                        with the same projection as the coverage map in
//                        src/map.mjs and rounded to 0.1 map units.
//
// The 3D scene fetches these after first paint, which keeps the HTML small and
// means a data refresh (`npm run stats`, `npm run shapes`) reaches the scene
// with no code change.
//
// EDITORIAL RULE: nothing finer than a whole metro goes into these files. The
// coverage outline shows where ratings exist, never how risky any part of a
// metro is.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { stats } from '../site.config.mjs';
import { metros as metroContent } from './data/metros.mjs';
import { projection } from './map.mjs';

const dataDir = join(dirname(fileURLToPath(import.meta.url)), 'data');
const readJson = (name) => JSON.parse(readFileSync(join(dataDir, name), 'utf8'));

const r1 = (n) => Math.round(n * 10) / 10;
const ring = (pts) => pts.map(([lng, lat]) => [r1(projection.x(lng)), r1(projection.y(lat))]);

// The metros that have published figures, in the editorial order of metros.mjs.
function liveMetros() {
  return metroContent
    .map((c) => ({ content: c, data: stats.metros.find((m) => m.key === c.key) }))
    .filter((x) => x.data && x.data.zones > 0);
}

export function siteData() {
  return {
    generated: stats.generatedFrom || null,
    totals: stats.totals,
    // National high-risk counts per time band, the figures the chapters count through.
    redByBand: {
      day: stats.byTime.day.red,
      evening: stats.byTime.evening.red,
      night: stats.byTime.night.red,
    },
    bands: [
      { key: 'day', name: 'Daytime', from: '05:00', to: '17:30' },
      { key: 'evening', name: 'Evening', from: '17:30', to: '19:30' },
      { key: 'night', name: 'Night', from: '19:30', to: '05:00' },
    ],
    metros: liveMetros().map(({ content, data }) => ({
      key: content.key,
      slug: content.slug,
      name: content.name,
      province: content.region,
      zones: data.zones,
      red: { day: data.byTime.day.red || 0, evening: data.byTime.evening.red || 0, night: data.byTime.night.red || 0 },
    })),
  };
}

export function geoData() {
  const land = readJson('za-land.json');
  const shapes = readJson('metro-shapes.json');
  return {
    width: projection.width,
    height: r1(projection.height),
    land: land.land.map(ring),
    borders: land.borders.map(ring),
    metros: liveMetros().map(({ content }) => {
      const s = shapes.metros[content.key];
      if (!s || !s.rings || !s.rings.length) {
        throw new Error(`sitedata: no coverage shape for "${content.key}". Run \`npm run shapes\` after onboarding a metro.`);
      }
      return {
        key: content.key,
        point: [r1(projection.x(s.point[0])), r1(projection.y(s.point[1]))],
        rings: s.rings.map(ring),
      };
    }),
  };
}
