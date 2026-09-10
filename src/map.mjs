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
//   coverage   — one shape per metro, and it is NOT decoration: it is that
//                metro's own risk zones dissolved into a single outline
//                (src/data/metro-shapes.json, read off the live database). What
//                you see is the ground that actually carries ratings, down to
//                the coastline it follows and the gaps where nothing is rated.
//                A zone is left out only when it lies mostly outside every
//                metro's service area, which is how a 5 000 km2 rural sub-place
//                tagged to Mossel Bay is kept from dragging its coverage past
//                George; see the note at the top of
//                scripts/make-coverage-shapes.py. Measured against the live
//                data, every metro draws at least 99.2% of the ground it keeps.
//                An earlier version drew each metro as its bounding box, which
//                was accurate about the app's GPS gate and looked like a
//                spreadsheet laid over a country.
//   marker     — a point on that shape, so the small metros stay findable at
//                national scale where their coverage is a few pixels across, and
//                so every label has something to point at.
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
const shapeData = readJson('metro-shapes.json');

/* ---------------------------------------------------------------------------
 * Projection.
 *
 * Equirectangular, with longitude squeezed by cos(mid-latitude). South Africa
 * spans 22°S to 35°S, where a degree of longitude is only ~88% of a degree of
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

// Room for the labels that sit outside the coastline: Cape Town's runs off the
// west coast, and the Cape itself hangs below the last of them.
//
// Measured, not guessed. The first pass reserved a generous margin all round and
// left a fifth of the frame empty — on the coverage map, where the country IS
// the content. These values sit about 20 units clear of the furthest ink in the
// browser, which is enough for a wider fallback font if Sora fails to load. If a
// new metro's label runs past the frame, widen the side it runs past; the
// clipping is not subtle when it happens.
const PAD = { top: 16, right: 34, bottom: 24, left: 34 };

const px = (lng) => (lng - B.lngMin) * LNG_SQUEEZE * SCALE;
const py = (lat) => (B.latMax - lat) * SCALE;
const r1 = (n) => Math.round(n * 10) / 10;

/* Point-to-segment distance, and a point-in-rings test, both in projected units.
 * Needed to size a marker's hit area against the SHAPES around it rather than
 * only against the other markers. */
function segmentDistance(x, y, ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  const len = dx * dx + dy * dy;
  const t = len === 0 ? 0 : Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / len));
  return Math.hypot(x - (ax + t * dx), y - (ay + t * dy));
}

/** 0 when the point is inside the shape, otherwise the distance to its nearest edge. */
function distanceToShape(x, y, rings) {
  let inside = false;
  let best = Infinity;
  for (const ring of rings) {
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [ax, ay] = ring[i];
      const [bx, by] = ring[j];
      if (ay > y !== by > y && x < ((bx - ax) * (y - ay)) / (by - ay) + ax) inside = !inside;
      const d = segmentDistance(x, y, ax, ay, bx, by);
      if (d < best) best = d;
    }
  }
  return inside ? 0 : best;
}

function ringArea(ring) {
  let twice = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    twice += (ring[j][0] - ring[i][0]) * (ring[j][1] + ring[i][1]);
  }
  return Math.abs(twice) / 2;
}

function pointInRing(x, y, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [ax, ay] = ring[i];
    const [bx, by] = ring[j];
    if (ay > y !== by > y && x < ((bx - ax) * (y - ay)) / (by - ay) + ax) inside = !inside;
  }
  return inside;
}

/** A shape's true area: exteriors less the holes punched out of them.
 *
 * The rings arrive unlabelled — the generator emits exteriors and holes into one
 * flat list for an even-odd fill — so a ring inside an odd number of the others
 * is a hole. Bounding-box area was used here first and is a bad proxy for a
 * crescent: it ranked Ekurhuleni and the West Rand as larger than Johannesburg,
 * which inverted the paint order this is for. */
function shapeArea(rings) {
  let total = 0;
  for (const ring of rings) {
    const [x, y] = ring[0];
    let depth = 0;
    for (const other of rings) {
      if (other !== ring && pointInRing(x, y, other)) depth++;
    }
    total += depth % 2 === 1 ? -ringArea(ring) : ringArea(ring);
  }
  return total;
}

const toPath = (rings, close) =>
  rings
    .map((ring) => `M${ring.map(([lng, lat]) => `${r1(px(lng))} ${r1(py(lat))}`).join('L')}${close ? 'Z' : ''}`)
    .join('');

/* ---------------------------------------------------------------------------
 * Label placement.
 *
 * Offsets in map units from the metro's own marker, plus which side the text
 * runs. They are hand-set because there is no getting around it: the four
 * Gauteng metros all fall inside a 50-unit square, and Cape Town and
 * Stellenbosch are 27 units apart. An automatic placer that resolves that is a
 * bigger piece of software than this whole site.
 *
 * A metro with no entry here gets its name to the right of its marker, which is
 * correct for anything that is not in a cluster. If a newly added metro lands on
 * top of a neighbour, give it a line here — and check it, because nothing else
 * will catch overlapping text.
 * ------------------------------------------------------------------------ */
const LABELS = {
  // The Gauteng cluster and its neighbours, fanned out: three west, three east,
  // stacked far enough apart that no label touches another and no leader crosses
  // one. Retuned when the markers moved off the bounding-box centres and onto
  // the coverage shapes themselves — Johannesburg's dropped 30 units south, because
  // Soweto is in the shape and the centre of the rated ground is not the centre
  // of the box.
  pilanesberg: { dx: -20, dy: -8, anchor: 'end' },
  rustenburg: { dx: -22, dy: 10, anchor: 'end' },
  johannesburg: { dx: -96, dy: 6, anchor: 'end' },
  west_rand: { dx: -78, dy: 62, anchor: 'end' },
  pretoria: { dx: 46, dy: -16, anchor: 'start' },
  ekurhuleni: { dx: 62, dy: -2, anchor: 'start' },
  secunda: { dx: 24, dy: 24, anchor: 'start' },
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
 * and on a narrow screen it is the only readable form: SVG text scales with the
 * drawing, so below about 620px the labels are hidden and the list is all there
 * is. The <svg> is therefore aria-hidden and its links are taken out of the tab
 * order on purpose: with the list sitting right beside it, exposing both would
 * make a screen reader read out twelve metros twice, and reaching the map by
 * keyboard would gain a reader nothing the list has not already said.
 *
 * @param {{key:string, name:string, slug:string, region:string, zones:number}[]} metros
 * @param {string} [id]  must be unique per page: it names the figure and the
 *                       shared land path, and two maps sharing one would emit
 *                       duplicate ids. Both would still render, since the second
 *                       <use> resolves to the first identical path, but the HTML
 *                       would be invalid and nothing in the build checks for it.
 */
export function coverageMap(metros, id = 'coverage-map') {
  const placed = metros.map((m) => {
    const shape = shapeData.metros[m.key];
    if (!shape) {
      // A metro with published zone counts and no shape would silently vanish
      // from the map while still being listed beside it. Fail the build instead.
      throw new Error(
        `coverageMap: no coverage shape for "${m.key}". Run \`npm run shapes\` after onboarding a metro.`,
      );
    }
    if (!shape.rings || !shape.rings.length) {
      // Would render an empty path and sort to the far end of the paint order on
      // an Infinity extent, both silently. Only reachable through a hand-edited
      // or half-written JSON, which is exactly when you want to be told.
      throw new Error(`coverageMap: "${m.key}" has no rings in metro-shapes.json.`);
    }
    const [lng, lat] = shape.point;

    // Projected once, and reused for the path, the area and the hit sizing.
    const rings = shape.rings.map((ring) => ring.map(([rlng, rlat]) => [px(rlng), py(rlat)]));

    return {
      ...m,
      rings,
      d: toPath(shape.rings, true),
      x: px(lng),
      y: py(lat),
      area: shapeArea(rings),
      label: LABELS[m.key] || DEFAULT_LABEL,
    };
  });

  // Paint the largest coverage first so the smallest ends up on top. The Gauteng
  // metros share borders and overlap slightly where the same suburb is rated by
  // two of them, so without an order the click target for a small metro is
  // whatever happened to be written last. Smallest-on-top is also the rule the
  // app itself uses to decide which of two overlapping zones owns a piece of
  // ground, so the map behaves the way the product does.
  const painted = [...placed].sort((a, b) => b.area - a.area);

  // Marker hit areas.
  //
  // Each marker carries an invisible disc so that a metro whose coverage is a
  // few specks — Pilanesberg, Secunda — is still comfortably clickable. The disc
  // is transparent, not `fill: none`, so it DOES take clicks, and it is the last
  // element in its group, so it sits above everything drawn before it.
  //
  // It therefore has to be bounded against two different things, and bounding it
  // against only the first was a real bug once the metros became shapes rather
  // than boxes:
  //
  //   1. other markers — half the distance to the nearest one is the most a disc
  //      can claim without covering a neighbour's marker. This alone was the old
  //      rule, from when a metro was a rectangle and its marker sat at the centre
  //      of it.
  //   2. other metros' COVERAGE — a disc must not reach across a neighbour's
  //      visible ground, because the reader sees Johannesburg's green there and
  //      would get the West Rand's page. Johannesburg's marker sits on a 40x90
  //      crescent whose anchor is close to the West Rand's and Pretoria's, so
  //      their discs were covering about 22% of Johannesburg's visible shape and
  //      taking its clicks, its tooltip and its hover highlight with them.
  //
  // Where the bound falls below the marker itself the marker is the whole target
  // and nothing is added. The marker may legitimately sit over a neighbour's
  // coverage — the metros overlap — and clicking a labelled marker should always
  // reach the metro it labels.
  const MARKER_R = 5.5;
  for (const m of placed) {
    const others = placed.filter((o) => o !== m);
    const nearestMarker = Math.min(...others.map((o) => Math.hypot(o.x - m.x, o.y - m.y)));
    const nearestShape = Math.min(...others.map((o) => distanceToShape(m.x, m.y, o.rings)));
    m.hit = Math.max(MARKER_R, Math.min(26, nearestMarker / 2 - 0.5, nearestShape - 1));
  }

  // The land is drawn twice: once as a soft wide stroke that reads as the haze
  // printed maps put along a coastline, and once as the land itself. Defining
  // the path once and referencing it keeps the second copy free — that outline
  // is 1 600 points and is the single heaviest thing on the page.
  const landId = `${id}-land`;
  const defs = `<defs><path id="${landId}" d="${toPath(landData.land, true)}" fill-rule="evenodd"/></defs>`;
  const land = `<use class="zamap-halo-land" href="#${landId}"/><use class="zamap-land" href="#${landId}"/>`;
  const borders = `<path class="zamap-border" d="${toPath(landData.borders, false)}"/>`;

  const markers = painted
    .map((m) => {
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
      <path class="zamap-area" d="${m.d}" fill-rule="evenodd"/>
      ${leader}
      <circle class="zamap-ring" cx="${r1(m.x)}" cy="${r1(m.y)}" r="15"/>
      <circle class="zamap-dot" cx="${r1(m.x)}" cy="${r1(m.y)}" r="${MARKER_R}"/>
      <text class="zamap-label" x="${r1(lx)}" y="${r1(ly)}" text-anchor="${m.label.anchor}">${m.name}</text>
      <circle class="zamap-hit" cx="${r1(m.x)}" cy="${r1(m.y)}" r="${r1(m.hit)}"/>
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
        ${[...items]
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

  // The label margin, restated as percentages of the drawing's own width, so a
  // narrow screen — where the labels are hidden and that margin is dead space —
  // can crop back to the coastline in CSS. Computed rather than typed so the two
  // cannot drift apart when PAD changes.
  const pc = (units) => `${((units / COUNTRY_W) * 100).toFixed(3)}%`;
  const crop = [
    `--zamap-w:${pc(COUNTRY_W + PAD.left + PAD.right)}`,
    `--zamap-t:-${pc(PAD.top)}`,
    `--zamap-r:-${pc(PAD.right)}`,
    `--zamap-b:-${pc(PAD.bottom)}`,
    `--zamap-l:-${pc(PAD.left)}`,
  ].join(';');

  return `<figure class="zamap" id="${id}">
  <div class="zamap-canvas" style="${crop}">
    <svg viewBox="${viewBox}" class="zamap-svg" aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid meet">
      ${defs}
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
    <div class="zamap-groups">
      ${list}
    </div>
  </div>
  <figcaption class="zamap-caption">
    Each shape is the real outline of that metro’s rated ground inside the area the app serves: its
    risk zones, dissolved into one piece and drawn where they actually fall. The ragged edges and the
    gaps between them are the coverage rather than an artist’s impression, smoothed to about half a
    kilometre so that a country fits on a page. Outside the shapes
    Tsamaya still navigates and still gives you turn-by-turn directions; it simply has nothing to warn
    you about, and says so rather than implying the road has been checked.
  </figcaption>
</figure>`;
}
