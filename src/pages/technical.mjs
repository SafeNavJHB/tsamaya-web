import { site, stats, fmt } from '../../site.config.mjs';
import { pageHead, sec, linkQ, M } from '../kit.mjs';

// A spec sheet in the HUD style, and the pipeline as a small diagram: an ordered
// list of five stages on a line, which an emerald pulse runs along once when it
// comes into view (CSS; under five seconds, and not at all with reduced motion).

const STACK = [
  ['React Native and Expo', 'Cross-platform app, New Architecture enabled. Expo Router for navigation, EAS for builds and over-the-air updates.'],
  ['Mapbox', 'Map tiles, the Directions API for routing, and Geocoding for search and for naming the place you tap on the map.'],
  ['Supabase and PostGIS', 'Postgres with PostGIS geometry holds every rated area and road. The app reads it live; the editor writes through typed RPC functions.'],
  ['Python data pipeline', 'Map data fetched, scored for crime density, classified into rated areas and roads, staged, then promoted to live.'],
  ['Claude review', 'A second-opinion review pass flags questionable ratings for a human before anything reaches drivers.'],
  ['GitHub and EAS', 'Versioned SQL migrations keep the database reproducible; TestFlight and Google Play open testing get builds to testers.'],
];

const PIPE = [
  ['Sources', 'OpenStreetMap, published SAPS crime statistics, local knowledge'],
  ['Pipeline', 'Fetch, score for density, classify areas and roads, stage'],
  ['Review', 'A Claude second opinion, then a person approves or rejects'],
  ['Live database', 'Rated areas and roads in Supabase (PostGIS)'],
  ['App', 'Tsamaya reads it live and plans the route'],
];

const RULES = [
  ['What triggers a detour', 'Only higher-risk areas. Caution-level areas are drawn on the map but never trigger a detour.'],
  ['Route check', 'The route is sampled and tested against every active area for the current time.'],
  ['Checked roads', 'Recognises when a route already runs along a road we have checked, and leaves it be.'],
  ['Detour limits', 'Bypasses are capped so they never wander unreasonably far from the direct line.'],
  ['Choosing a way round', 'Only nearby checked roads are used to steer around a high-risk area.'],
  ['Sanity check', 'Any detour that ends up excessively longer than the direct route is rejected. You get the direct route, clearly flagged.'],
  ['Time-aware', 'Separate ratings for daytime, evening and night.'],
];

const spec = (rows) => `
    <dl class="spec spec-wide" data-reveal>
      ${rows.map(([k, v]) => `<div><dt class="hud">${k}</dt><dd>${v}</dd></div>`).join('\n      ')}
    </dl>`;

const pipeline = `
    <ol class="pipe" data-reveal>
      ${PIPE.map(([k, v], i) => `<li style="--i:${i}"><span class="pipe-dot" aria-hidden="true"></span><p class="hud">0${i + 1}${M}${k}</p><p>${v}</p></li>`).join('\n      ')}
    </ol>`;

const numbers = `
    <div class="cov-stats" data-reveal>
      <div><b class="num">${stats.totals.metros}</b><span class="hud">Metros mapped</span></div>
      <div><b class="num">${fmt(stats.totals.zones)}</b><span class="hud">Rated areas</span></div>
      <div><b class="num">${fmt(stats.totals.corridorsSafe)}</b><span class="hud">Checked road stretches</span></div>
      <div><b class="num">${stats.totals.riskBands}</b><span class="hud">Time bands</span></div>
    </div>`;

export default {
  slug: 'technical.html',
  title: 'Technical details',
  description:
    'The Tsamaya tech stack and routing model: React Native and Expo, Mapbox, Supabase and PostGIS, a Python data pipeline with a Claude-assisted review, and the rules that decide a detour.',
  heroClass: 'sn page-tech',
  hud: false,
  body: [
    pageHead({
      meta: 'Technical details',
      title: 'Under the hood.',
      lead: 'Tsamaya is a React Native app backed by a geospatial database and a Python data pipeline with a Claude-assisted review step. Here is how the pieces fit.',
    }),
    sec({ id: 'stack', kick: 'The stack', title: 'Proven tools, boring in a good way', inner: spec(STACK) }),
    sec({ id: 'pipeline', kick: 'Three repos, one system', title: 'How data becomes a route', lead: 'Crime and map data flow through a pipeline, get reviewed, then go live for the app to read.', inner: pipeline }),
    sec({ id: 'routing', kick: 'The routing model', title: 'How a detour gets decided', lead: 'A small set of deliberate rules, tuned over real South African routes, that decide when a detour is worth it and when it is not.', inner: `${spec(RULES)}\n    <p class="more" data-reveal>${linkQ('Walk through the steps', 'how-it-works.html')}</p>` }),
    sec({
      id: 'model',
      kick: 'Data model',
      title: 'Rated areas and roads',
      inner: `
    <div class="cards cards-2">
      <article class="card" data-reveal><p class="hud">Rated areas</p><h3>Polygons</h3><p>Each has a name, a city, a rating for each of the three time bands, crime types and a source. Soft-deleted, never hard-deleted, so history can be recovered.</p><p class="card-act"><code class="mono">red${M}orange${M}yellow${M}none</code></p></article>
      <article class="card" data-reveal><p class="hud">Rated roads</p><h3>Line strings</h3><p>Each has a buffer width and marks a road as checked (preferred when threading past risk), flagged (avoided where there is a sensible way round) or closed (gated or impassable, so routed around without being counted as risk). The stored values are <code class="mono">safe</code>, <code class="mono">danger</code> and <code class="mono">blocked</code>: a checked road is one we have reviewed, not a promise about it. Identity is always <code class="mono">(city, name)</code>, because road names repeat across metros.</p><p class="card-act"><code class="mono">checked${M}flagged${M}closed</code></p></article>
    </div>
    <p class="fine" data-reveal>Geometry is stored as PostGIS geometry and written through <code class="mono">ST_SetSRID(ST_GeomFromGeoJSON(...), 4326)</code> RPCs, since PostgREST cannot cast GeoJSON to geometry by itself.</p>`,
    }),
    sec({
      id: 'coverage',
      kick: 'Coverage',
      title: 'Where Tsamaya works today',
      lead: `Live across ${site.coverageLive}. Adding a city follows a documented runbook, which is how the map went from one metro to ${stats.totals.metros}.`,
      inner: `${numbers}\n    <p class="more" data-reveal>${linkQ('Coverage by metro', 'coverage.html')}</p>`,
    }),
    sec({
      id: 'more',
      cls: 'tail',
      kick: 'Talk shop',
      title: 'Curious, or want to help build it?',
      lead: 'We are always glad to talk shop, or to find sponsors who want to fund the next metro.',
      inner: `<p class="more" data-reveal>${linkQ('Get in touch', 'contact.html')}${linkQ('Sponsor a metro', 'sponsor.html#sponsor')}</p>`,
    }),
  ].join('\n'),
};
