import { readFileSync } from 'node:fs';
import { site, stats, fmt, timeTag } from '../../site.config.mjs';
import { pageHead, sec, linkQ, M } from '../kit.mjs';
import { breadcrumbNode } from '../seo.mjs';
import { LIMITS, METHOD } from '../facts.mjs';

const examples = JSON.parse(readFileSync(new URL('../data/route-examples.json', import.meta.url), 'utf8'));

// A spec sheet in the HUD style, and the pipeline as a small diagram: an ordered
// list of five stages on a line, which an emerald pulse runs along once when it
// comes into view (CSS; under five seconds, and not at all with reduced motion).

const STACK = [
  ['React Native and Expo', 'Cross-platform app, New Architecture enabled. Expo Router for navigation, EAS for builds and over-the-air updates.'],
  ['Mapbox', 'Map tiles, the Directions API for routing, and Geocoding for naming the place you tap on the map. Search itself runs on Google Places.'],
  ['Supabase and PostGIS', 'Postgres with PostGIS geometry holds every rated area and road. The app reads it live; the editor writes through typed RPC functions.'],
  ['Python data pipeline', 'Map data fetched, scored for crime density, classified into rated areas and roads, staged, then promoted to live.'],
  ['Claude review', 'An AI second opinion on the ratings, researched against local reporting. A person then sense-checks the results and looks closely at any rating that stands out.'],
  ['GitHub and EAS', 'Versioned SQL migrations keep the database reproducible; TestFlight and Google Play open testing get builds to testers.'],
];

const PIPE = [
  ['Sources', 'OpenStreetMap, published SAPS crime statistics, drivers\' reports'],
  ['Pipeline', 'Fetch, score for density, classify areas and roads, stage'],
  ['Review', 'A Claude second opinion, then a person sense-checks what stands out'],
  ['Live database', 'Rated areas and roads in Supabase (PostGIS)'],
  ['App', 'Tsamaya reads it live and plans the route'],
];

const { costPerKm: COST, gradeUnder: UNDER, bands: BANDS } = METHOD;
const span = ([from, to]) => `${from} to ${to}`;

// The method. Each line was checked against the pipeline and the app on 2026-11-05;
// the numbers come from METHOD (facts.mjs), which `npm run check:facts` compares
// with the app repo. Say what is estimated as plainly as what is measured.
const RATING = [
  ['Crime figures', `Published South African Police Service (SAPS) crime statistics, released each quarter for every police station. Places rated since September 2026 use the average of the four quarters from ${METHOD.sapsQuarters}, because one quarter alone carries too much season. Places rated before that were built on the single quarter that was newest then, and have not been re-run on the new input.`],
  ['Which crimes count', 'Each SAPS category has a weight. Carjacking, truck hijacking and murder weigh the most, then aggravated robbery, rape and attempted murder. Theft of and from vehicles, burglary and malicious damage count for little, and shoplifting, stock theft and drink-driving count for nothing. So the starting figure is wider than vehicle crime: it measures crime that threatens a person on and around the road.'],
  ['From a station to a map', 'SAPS counts by police station, not by street. Each station\'s weighted total is spread over the populated parts of its precinct, using WorldPop population data, smoothed into a crime-density surface and cut into areas. OpenStreetMap supplies the roads and place names.'],
  ['Roads', 'Main roads come from OpenStreetMap and are reviewed like areas, then marked checked, flagged or closed. National and regional routes are rated end to end from the motorist-crime rate of the police precincts they cross, with documented incidents on top.'],
  ['What AI does', 'Claude, an AI model made by Anthropic, scores each area and road for daytime, evening and night from its crime mix and local reporting, and can move the starting rating up or down. It also reads news for road closures and protests, and gives a first view on driver reports.'],
  ['What people do', 'A person sense-checks the results and looks closely at any rating that stands out. A person also reads every driver report on a road or area before its rating changes: the AI\'s view on a report is advice, never applied by itself. Police and roadblock taps are live notices that last about an hour, and they never change a rating.'],
  ['What is plain rules', 'Planning a route uses no AI. The scoring, the grades and the detour limits are fixed rules, which give the same answer for the same route and the same ratings.'],
  ['Time of day', `Three bands, set by the clock alone: daytime ${span(BANDS.daytime)}, evening ${span(BANDS.evening)} and night ${span(BANDS.night)}. SAPS does not publish crime by the hour, so the evening and night ratings are not measured. They are the review\'s estimate of how a place changes after dark, from documented patterns such as taxi ranks and city-centre edges. Many places keep one rating all day, and others rise after dark.`],
  ['Freshness', `Ratings live in one database and reach the app without an app update. Road closures and protests found in the news are checked daily. Those that pass automatic checks go live and expire on their own; the rest wait for a person. The figures on this site were read from that database on ${timeTag(stats.asOf)}.`],
];

const GRADING = [
  ['The score', `A route is scored in weighted kilometres. Each kilometre on red ground counts ${fmt(COST.red)}, orange ${COST.orange} and yellow ${COST.yellow}, and ground rated "none" adds nothing. One orange or yellow area stops adding after ${METHOD.saturationKm} km; red never stops. A checked road through a rated area earns credit for that stretch, and a flagged road counts only when you drive along it, not when you cross it.`],
  ['The letter', `A is under ${UNDER.A}, B under ${UNDER.B}, C under ${fmt(UNDER.C)}, D under ${fmt(UNDER.D)} and E is ${fmt(UNDER.D)} or more. Driving ${METHOD.redFloorMetres} m or more on red ground that a checked road does not cover means D or E, which is why D is a common letter on city trips. When routes are shown together, one with half the risk or less of another on the same letter moves up one letter, except that a route with red ground stays D or E.`],
  ['Time and risk', 'Time is not part of the grade, which measures exposure only. Time and distance decide which routes are offered. Fastest is the quickest road with live traffic, whatever its grade, though a road within a minute of it can take the label if it carries clearly less risk. A detour found by going round risky ground must stay within a limit that grows with the risk it removes, and trips over 150 km also have a cap on added time.'],
  ['What a grade is not', 'It compares routes. It is not the chance of an incident on any one drive, and the same trip can earn a different letter at a different hour.'],
];

const cell = (o) => (o
  ? `<b>${o.grade}</b>, ${o.km} km${o.minutes ? `, ${o.minutes} min` : ''}`
  : 'Same route');

const exampleTable = `
    <div class="prose examples-table" data-reveal><div class="table-scroll">
      <table>
        <thead><tr><th scope="col">Trip</th><th scope="col">Fastest, by day</th><th scope="col">Lower-risk, by day</th><th scope="col">Fastest, at night</th><th scope="col">Lower-risk, at night</th></tr></thead>
        <tbody>
          ${examples.trips.map((t) => `<tr><th scope="row">${t.place}: ${t.trip}</th><td>${cell(t.day.fastest)}</td><td>${cell(t.day.lower)}</td><td>${cell(t.night.fastest)}</td><td>${cell(t.night.lower)}</td></tr>`).join('\n          ')}
        </tbody>
      </table>
    </div></div>
    <p class="fine" data-reveal>Planned by the app's own planner against the live ratings at ${examples.capturedSast} on ${timeTag(examples.capturedIso)}, with the traffic at that moment. Night plans use the night ratings; they show no minutes, because morning traffic says nothing about a night drive. Balanced and Lower-risk came out as the same route on all five. These trips were picked from our test list to show a spread, so they are not an average, and ratings change, so the same trips may read differently today.</p>`;

const RULES = [
  ['What triggers a detour', 'Balanced goes around red ground, and Lower-risk around red and orange. Yellow ground counts toward the grade and is never avoided outright.'],
  ['Route check', 'Each route is split into short stretches and scored against the rated areas and roads, using the rating for the time you will reach each part.'],
  ['Checked roads', 'Recognises when a route already runs along a road we have checked and does not charge it for the area around that road, unless the road carries its own rating after dark.'],
  ['Choosing a way round', 'The ordinary route alternatives are tried first. Only if none is clean does it add up to two waypoints from nearby checked roads and ask for the rated ground to be avoided.'],
  ['Detour limits', 'The longer a detour, the more risk it has to remove. One that adds too much is left out of the three options, even when it carries less risk.'],
  ['When nothing is clean', 'You get the least risky route that fits the limits, with its grade shown and its risky stretches marked.'],
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
      <div><b class="num">${stats.totals.metros}</b><span class="hud">Places mapped</span></div>
      <div><b class="num">${fmt(stats.totals.zones)}</b><span class="hud">Rated areas</span></div>
      <div><b class="num">${fmt(stats.totals.corridorsSafe)}</b><span class="hud">Checked road stretches</span></div>
      <div><b class="num">${stats.totals.riskBands}</b><span class="hud">Time bands</span></div>
    </div>`;

export default {
  slug: 'technical.html',
  title: 'Technical details',
  headTitle: 'How Tsamaya rates risk: data, method and limits',
  description:
    'How Tsamaya rates areas, roads and routes: SAPS crime statistics, the AI and human review, A to E grades, real example trips, what the ratings cannot tell you, and the technology behind them.',
  heroClass: 'sn page-tech',
  hud: false,
  jsonLd: [breadcrumbNode([{ name: 'Home', slug: 'index.html' }, { name: 'Technical details', slug: 'technical.html' }])],
  body: [
    pageHead({
      meta: 'Technical details',
      title: 'Under the hood.',
      lead: 'How a rating gets made, how a route gets its grade, where both fall short, and the technology behind them. Lower risk does not mean safe, and these pages say why.',
    }),
    sec({ id: 'ratings', kick: 'The method', title: 'How an area or road gets its rating', inner: spec(RATING) }),
    sec({ id: 'grades', kick: 'A to E', title: 'How a route gets its grade', inner: spec(GRADING) }),
    sec({
      id: 'limits',
      kick: 'The limits',
      title: 'What the ratings cannot tell you',
      inner: `${spec(LIMITS)}\n    <p class="fine" data-reveal>Think a rating is wrong? Report it from inside the app, or write to <a href="mailto:${site.contactEmail}">${site.contactEmail}</a>. How reports and your data are handled is in the <a href="privacy.html">Privacy Policy</a>.</p>`,
    }),
    sec({ id: 'examples', kick: 'Real trips', title: 'Five trips, by day and at night', lead: 'The first shows the price of a lower letter: twice the distance and 14 more minutes, and only you can say if that is worth it. On the last, the planner found no other road within its limits, and the letter shows what that road carries.', inner: exampleTable }),
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
      lead: `Live across ${site.coverageLive}. Adding a city follows a documented runbook, which is how the map went from one city to ${stats.totals.metros} places.`,
      inner: `${numbers}\n    <p class="more" data-reveal>${linkQ('Coverage by place', 'coverage.html')}</p>`,
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
