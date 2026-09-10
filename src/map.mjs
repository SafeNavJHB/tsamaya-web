// map.mjs — the coverage map: South Africa, with the metros Tsamaya has mapped
// drawn on it.
//
// WHY IT IS HAND-DRAWN SVG AND NOT A MAP LIBRARY
// A tile map (Mapbox, Leaflet, an embedded iframe) would mean a runtime
// dependency, a third-party request on every page load, an API token in public
// source, and a blank grey box for anyone the script does not reach. This is one
// inline SVG built at build time: it costs no request, works with JavaScript off,
// prints, and cannot break because someone else's CDN had a bad morning.
//
// WHAT IT DRAWS, AND WHY EACH PIECE IS HONEST
//   land       — the outline of the country from src/data/za-land.json, plus the
//                provincial borders, purely so a reader can locate themselves.
//   rectangle  — one per metro, and it is NOT decoration: it is the exact box
//                from the app's own service-area gate (src/constants/cities.ts),
//                i.e. the area inside which a GPS fix is trusted and risk ratings
//                apply. Drawing anything larger would overstate the coverage.
//   marker     — the metro's centre, so the small metros stay visible at national
//                scale where their box is only a few pixels across.
//
// Nothing here shades a province or a region that is not actually mapped. The
// site's whole argument is that a blank area means "no data" rather than "safe",
// and a map that paints Gauteng green because four metros sit inside it would say
// the opposite of that.

import { fmt, stats } from '../site.config.mjs';
import { metros as metroContent } from './data/metros.mjs';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const dataDir = join(dirname(fileURLToPath(import.meta.url)), 'data');
const readJson = (name) => JSON.parse(readFileSync(join(dataDir, name), 'utf8'));

const landData = readJson('za-land.json');
const boundsData = readJson('metro-bounds.json');

export const metroBounds = new Map(boundsData.metros.map((m) => [m.key, m]));

/* ---------------------------------------------------------------------------
 * Projection.
 *
 * Equirectangular, with longitude squeezed by cos(mid-latitude). South Africa
 * spans 22°S to 35°S, where a degree of longitude is only ~85% of a degree of
 * latitude; plotting raw lng/lat would stretch the country visibly wider than it
 * is. Web Mercator would do the opposite at these latitudes (it stretches the
 * Cape vertically). Neither matters for navigation here — nothing is measured off
 * this picture — but a country whose shape people recognise is worth 10 lines.
 * ------------------------------------------------------------------------ */
const B = landData.bounds;
const MID_LAT = ((B.latMin + B.latMax) / 2) * (Math.PI / 180);
const LNG_SQUEEZE = Math.cos(MID_LAT);

// The country is drawn 1000 units wide. Everything else — padding, type size,
// marker radii — is expressed against that, so the whole map rescales by
// changing one number.
const COUNTRY_W = 1000;
const SCALE = COUNTRY_W / ((B.lngMax - B.lngMin) * LNG_SQUEEZE);
const COUNTRY_H = (B.latMax - B.latMin) * SCALE;

// Room for the labels that sit outside the coastline. Durban's runs off the east
// coast, Cape Town's below the Cape.
const PAD = { top: 34, right: 150, bottom: 62, left: 96 };

const px = (lng) => (lng - B.lngMin) * LNG_SQUEEZE * SCALE;
const py = (lat) => (B.latMax - lat) * SCALE;
const r1 = (n) => Math.round(n * 10) / 10;

const toPath = (rings, close) =>
  rings
    .map((ring) => `M${ring.map(([lng, lat]) => `${r1(px(lng))} ${r1(py(lat))}`).join('L')}${close ? 'Z' : ''}`)
    .join('');

/* ---------------------------------------------------------------------------
 * Label placement.
 *
 * Offsets in map units from the metro's own marker, plus which side the text
 * runs. They are hand-set because there is no getting around it: four metros sit
 * inside Gauteng within 40 units of each other, and Cape Town and Stellenbosch
 * are 27 apart. An automatic placer that handles that is a bigger piece of
 * software than this whole site.
 *
 * A metro with no entry here gets its name to the right of its marker, which is
 * correct for anything that is not in a cluster. If a newly added metro lands on
 * top of a neighbour, give it a line here — and check it, because nothing else
 * will catch overlapping text.
 * ------------------------------------------------------------------------ */
const LABELS = {
  // The Gauteng cluster, fanned out: two east, two west, so no leader crosses
  // another.
  pretoria: { dx: 48, dy: -14, anchor: 'start' },
  ekurhuleni: { dx: 74, dy: 8, anchor: 'start' },
  johannesburg: { dx: -104, dy: 20, anchor: 'end' },
  west_rand: { dx: -86, dy: 52, anchor: 'end' },
  // North West, west of the cluster and stacked.
  pilanesberg: { dx: -20, dy: -8, anchor: 'end' },
  rustenburg: { dx: -20, dy: 12, anchor: 'end' },
  // Mpumalanga, clear to the east.
  secunda: { dx: 22, dy: 26, anchor: 'start' },
  // The coast, where there is room below each marker.
  cape_town: { dx: -14, dy: 46, anchor: 'end' },
  stellenbosch: { dx: 16, dy: 48, anchor: 'start' },
  mossel_bay: { dx: 10, dy: 36, anchor: 'start' },
  gqeberha: { dx: 12, dy: 36, anchor: 'start' },
  durban: { dx: 20, dy: 4, anchor: 'start' },
};
const DEFAULT_LABEL = { dx: 18, dy: 5, anchor: 'start' };

// Draw a leader line once the label is far enough from its marker that the eye
// would otherwise have to guess which one it belongs to.
const LEADER_MIN = 30;

/**
 * The metros with live data, ready to hand to coverageMap(). Shared by the home
 * page and the coverage page so the two can never show different maps: a metro
 * whose zone count drops to zero disappears from both at once.
 */
export function mappedMetros() {
  return metroContent
    .map((c) => ({ content: c, data: stats.metros.find((m) => m.key === c.key) }))
    .filter((x) => x.data && x.data.zones > 0)
    .map(({ content, data }) => ({
      key: content.key,
      name: content.name,
      slug: content.slug,
      region: content.region,
      zones: data.zones,
    }));
}

/**
 * The coverage map, with the list of metros beside it.
 *
 * The list is not a caption — it is the accessible form of the same information,
 * and on a phone it is the only readable form, because SVG text scales with the
 * drawing and a national map on a 360px screen would render the labels at 7px.
 * The <svg> is therefore aria-hidden and its links are taken out of the tab order
 * on purpose: with the list sitting right beside it, exposing both would make a
 * screen reader read out twelve metros twice.
 *
 * @param {{key:string, name:string, slug:string, region:string, zones:number}[]} metros
 * @param {string} [id]  unique per page — two maps on one page would collide.
 */
export function coverageMap(metros, id = 'coverage-map') {
  const placed = metros.map((m) => {
    const bounds = metroBounds.get(m.key);
    if (!bounds) {
      // A metro with published zone counts and no bounds would silently vanish
      // from the map while still being listed beside it. Fail the build instead.
      throw new Error(
        `coverageMap: no bounds for "${m.key}". Run \`npm run bounds\` after onboarding a metro.`,
      );
    }
    const [lng, lat] = bounds.center;
    return { ...m, bounds, x: px(lng), y: py(lat), label: LABELS[m.key] || DEFAULT_LABEL };
  });

  const land = `<path class="zamap-land" d="${toPath(landData.land, true)}" fill-rule="evenodd"/>`;
  const borders = `<path class="zamap-border" d="${toPath(landData.borders, false)}"/>`;

  const markers = placed
    .map((m) => {
      const { lngMin, lngMax, latMin, latMax } = m.bounds.bbox;
      const x = px(lngMin);
      const y = py(latMax);
      const w = px(lngMax) - x;
      const h = py(latMin) - y;
      const lx = m.x + m.label.dx;
      const ly = m.y + m.label.dy;
      const far = Math.hypot(m.label.dx, m.label.dy) > LEADER_MIN;
      // The leader stops short of both ends so it never touches the marker or
      // sits under the first letter.
      const leader = far
        ? `<line class="zamap-leader" x1="${r1(m.x)}" y1="${r1(m.y)}" x2="${r1(lx - (m.label.anchor === 'end' ? -6 : 6))}" y2="${r1(ly - 5)}"/>`
        : '';
      return `<a class="zamap-metro" data-metro="${m.key}" href="${m.slug}.html" tabindex="-1">
      <title>${m.name}: ${fmt(m.zones)} mapped areas</title>
      <rect class="zamap-area" x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${r1(h)}" rx="2"/>
      ${leader}
      <circle class="zamap-halo" cx="${r1(m.x)}" cy="${r1(m.y)}" r="18"/>
      <circle class="zamap-dot" cx="${r1(m.x)}" cy="${r1(m.y)}" r="9"/>
      <text class="zamap-label" x="${r1(lx)}" y="${r1(ly)}" text-anchor="${m.label.anchor}">${m.name}</text>
      <circle class="zamap-hit" cx="${r1(m.x)}" cy="${r1(m.y)}" r="30"/>
    </a>`;
    })
    .join('\n    ');

  const viewBox = [
    -PAD.left,
    -PAD.top,
    COUNTRY_W + PAD.left + PAD.right,
    COUNTRY_H + PAD.top + PAD.bottom,
  ]
    .map(r1)
    .join(' ');

  // Provinces in the order the metros happen to sit in, so the busiest province
  // leads. Grouping matters more than it looks: it is how a reader answers "is
  // there anything near me?" without knowing which municipality they live in.
  const byRegion = new Map();
  for (const m of placed) {
    if (!byRegion.has(m.region)) byRegion.set(m.region, []);
    byRegion.get(m.region).push(m);
  }
  const regions = [...byRegion.entries()].sort(
    (a, b) => b[1].reduce((s, m) => s + m.zones, 0) - a[1].reduce((s, m) => s + m.zones, 0),
  );

  const list = regions
    .map(
      ([region, items]) => `<div class="zamap-group">
      <h3 class="zamap-region">${region}</h3>
      <ul class="zamap-metros">
        ${items
          .sort((a, b) => b.zones - a.zones)
          .map(
            (m) => `<li><a class="zamap-row" data-metro="${m.key}" href="${m.slug}.html">
          <span class="zamap-row-name">${m.name}</span>
          <span class="zamap-row-count">${fmt(m.zones)}</span>
        </a></li>`,
          )
          .join('\n        ')}
      </ul>
    </div>`,
    )
    .join('\n    ');

  return `<figure class="zamap" id="${id}" data-reveal>
  <div class="zamap-canvas">
    <svg viewBox="${viewBox}" class="zamap-svg" aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid meet">
      ${land}
      ${borders}
      ${markers}
    </svg>
  </div>
  <div class="zamap-side">
    <p class="zamap-key">
      <span class="zamap-key-item"><span class="zamap-swatch" aria-hidden="true"></span>Mapped and live</span>
      <span class="zamap-key-item"><span class="zamap-swatch is-blank" aria-hidden="true"></span>No risk data yet</span>
    </p>
    ${list}
  </div>
  <figcaption class="zamap-caption">
    Each block is the area the app treats as covered — the same box it uses to decide whether your
    position has risk ratings behind it. Outside those blocks Tsamaya still navigates and still gives
    you turn-by-turn directions; it simply has nothing to warn you about, and says so rather than
    implying the road has been checked.
  </figcaption>
</figure>`;
}
