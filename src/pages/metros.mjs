// metros.mjs — builds one landing page per metro from shared data.
//
// Exports an ARRAY of pages (build.mjs accepts either a page or an array), so the
// seven metro pages stay one template rather than seven files that drift apart.
//
// WHY THESE PAGES EXIST
// People do not search for "Tsamaya" — the brand collides with a government
// transport programme and a street in Mamelodi. They search for what they want:
// "safest route to OR Tambo", "avoid hijacking hotspots Johannesburg". A page per
// metro is the only structure that can answer those queries. The home page cannot
// rank for seven cities at once.
//
// Content rule: roads and driving context, never named residential areas.
// See the editorial note at the top of src/data/metros.mjs.

import { readFileSync } from 'node:fs';
import { stats, fmt } from '../../site.config.mjs';
import { metros as metroContent } from '../data/metros.mjs';
import { faqNode, breadcrumbNode } from '../seo.mjs';
import { exploreSection } from '../explore.mjs';
import { siteData } from '../sitedata.mjs';
import { pageHead, sec, faqSec, getSec, linkQ, M } from '../kit.mjs';

// Pair the editorial content with the live numbers for that metro.
const joined = metroContent
  .map((content) => ({ content, data: stats.metros.find((m) => m.key === content.key) }))
  .filter((x) => x.data && x.data.zones > 0);
const SD = siteData(), BANDS = SD.bands, RED = Object.fromEntries(SD.metros.map((m) => [m.key, m.red]));
const nMetros = stats.totals.metros;
const BAND_LINE = { day: 'in the daytime', evening: 'in the evening', night: 'at night' };
const bandLabel = (b) => `areas rated high risk ${BAND_LINE[b.key] || b.name.toLowerCase()}, ${b.from} to ${b.to}`;

// A metro's coverage outline (its rated areas dissolved into one shape, from
// src/data/metro-shapes.json), projected on its own: longitude scaled by the
// cosine of the latitude, the longer side 600 units. Outline only: it shows
// where ratings exist, never which parts are high risk.
const SHAPES = JSON.parse(readFileSync(new URL('../data/metro-shapes.json', import.meta.url), 'utf8')).metros;
function outline(key) {
  const rings = (SHAPES[key] && SHAPES[key].rings) || [];
  const pts = rings.flat();
  if (!pts.length) return null;
  const lat0 = pts.reduce((a, p) => a + p[1], 0) / pts.length, k = Math.cos((lat0 * Math.PI) / 180);
  const xs = pts.map((p) => p[0] * k), ys = pts.map((p) => -p[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const sc = 600 / Math.max(x1 - x0, y1 - y0), pad = 14;
  const W = Math.round((x1 - x0) * sc + pad * 2), H = Math.round((y1 - y0) * sc + pad * 2);
  const d = rings.map((r) => 'M' + r.map((p) => `${((p[0] * k - x0) * sc + pad).toFixed(1)} ${((-p[1] - y0) * sc + pad).toFixed(1)}`).join('L') + 'Z').join('');
  return { W, H, d };
}

function metroPage({ content, data }) {
  const others = joined.filter((x) => x.content.key !== content.key);
  const red = RED[content.key], z = data.zones, name = content.name;
  const night = BANDS[BANDS.length - 1];
  const o = outline(content.key);

  // The figure and the numbers. Without JavaScript the list shows every band
  // and the big number shows night; metro.js switches the big number to the
  // band in force (true values only: a crossfade, never a count-up).
  const figure = o ? `
      <figure class="mx-map" data-reveal>
        <svg viewBox="0 0 ${o.W} ${o.H}" role="img" aria-label="Outline of the rated ground in ${name}" focusable="false">
          <defs><pattern id="mx-dots" width="12" height="12" patternUnits="userSpaceOnUse"><circle cx="6" cy="6" r="1.2"/></pattern></defs>
          <path class="mx-fill" fill-rule="evenodd" d="${o.d}"/>
          <path class="mx-line" d="${o.d}"/>
        </svg>
        <figcaption class="hud">Rated ground in ${name}. We never name suburbs as risky.</figcaption>
      </figure>` : '';
  const panel = `
      <div class="mx-panel">
        <p class="kick hud" id="mx-k">Areas rated high risk, by time of day</p>
        <div class="tabs" role="tablist" aria-labelledby="mx-k">
          ${BANDS.map((b, i) => `<button class="tab hud" type="button" role="tab" id="mx-t${i}" data-b="${i}" data-r="${red[b.key]}" data-l="${bandLabel(b)}" aria-controls="mx-p" aria-selected="${i === BANDS.length - 1}" tabindex="${i === BANDS.length - 1 ? 0 : -1}">${b.name}<span class="now" aria-hidden="true"></span></button>`).join('')}
        </div>
        <div class="tp" id="mx-p" role="tabpanel" aria-labelledby="mx-t${BANDS.length - 1}" data-z="${z}">
          <p class="tp-n num" id="mx-n">${fmt(red[night.key])}</p>
          <p class="tp-l" id="mx-l">${bandLabel(night)}</p>
          <div class="tp-bar" aria-hidden="true"><i style="transform:scaleX(${(red[night.key] / z).toFixed(3)})"></i></div>
          <p class="tp-sc hud" aria-hidden="true"><span>0</span><span>${fmt(z)} rated areas</span></p>
        </div>
        <ul class="tp-all">
          ${BANDS.map((b) => `<li><span class="hud">${b.name}, ${b.from} to ${b.to}</span><b class="num">${fmt(red[b.key])}</b></li>`).join('\n          ')}
        </ul>
        <p class="fine">Of the ${fmt(z)} rated areas in ${name}, these are the ones in the top of the four bands for each part of the day. Every figure comes straight from the live database. The lowest band means an area was checked and carries no routing penalty, which is different from an area we have no data for.</p>
      </div>`;

  const numbers = `
<section class="sec mx" aria-label="${name} in numbers">
  <div class="wrap mx-in">${figure}${panel}
  </div>
</section>`;

  const driving = sec({
    id: 'driving',
    kick: 'Driving here',
    title: 'What to know on these roads',
    inner: `
    <ol class="cards">
      ${content.context.map((c, i) => `<li class="card" data-reveal><span class="hud">0${i + 1}</span><p class="card-p">${c}</p></li>`).join('\n      ')}
    </ol>
    <p class="fine" data-reveal>Tsamaya rates roads and routes. It does not publish a list of neighbourhoods, and the app never labels a place for anyone other than the driver about to pass through it.</p>`,
  });

  const elsewhere = sec({
    id: 'elsewhere',
    kick: 'Elsewhere',
    title: `The other ${others.length} metros`,
    inner: `
    <ul class="mlist" data-reveal>
      ${others.map(({ content: c, data: d }) => `<li><a href="${c.slug}.html"><span>${c.name}</span><span class="num">${fmt(d.zones)}<span class="sr"> rated areas</span></span></a></li>`).join('\n      ')}
    </ul>`,
  });

  return {
    slug: `${content.slug}.html`,
    title: `${name} coverage`,
    description: content.blurb,
    heroClass: 'sn page-metro',
    hud: false,
    scripts: ['js/metro.js'],
    jsonLd: [
      faqNode(content.faqs),
      breadcrumbNode([
        { name: 'Home', slug: 'index.html' },
        { name: 'Coverage', slug: 'coverage.html' },
        { name, slug: `${content.slug}.html` },
      ]),
    ],
    body: [
      pageHead({
        crumb: { href: 'coverage.html', label: `All ${nMetros} metros` },
        meta: `${content.region}${M}${fmt(z)} rated areas`,
        title: `<span class="ph-pre">Lower-risk driving routes in</span> ${name}`,
        lead: content.intro,
      }),
      numbers,
      driving,
      faqSec({ id: 'faq', title: `${name}, asked`, faqs: content.faqs }),
      getSec({ title: `Drive ${name} with it tonight.` }),
      elsewhere,
      `<p class="wrap back">${linkQ(`Back to all ${nMetros} metros`, 'coverage.html')}</p>`,
    ].join('\n'),
  };
}

/* ---------------------------------------------------------------------------
 * The coverage index: the explore map, then every metro, the counts, the
 * questions and a way to help map the next one.
 * ------------------------------------------------------------------------ */
// The coverage page opens on the explore map (BUILD_PLAN section 5.1): the
// whole map interaction, with the page's h1 as its heading and its own scene.
const coverageMapSection = exploreSection({
  kick: 'Where Tsamaya works',
  canvas: true,
  h: 'h1',
  lede: `Every one of the ${fmt(stats.totals.zones)} mapped areas is rated for daytime, evening and night, and every figure here comes straight from the live database.`,
});

const coverageGrid = sec({
  id: 'metros',
  kick: 'Coverage by metro',
  title: 'Pick a metro',
  lead: 'Each metro has its own page: its figures for every part of the day, what to know on its roads, and the questions people ask about it.',
  inner: `
    <ul class="mcards">
      ${joined.map(({ content, data }) => `<li data-reveal><a href="${content.slug}.html"><span class="hud">${content.region}${M}${fmt(data.zones)} rated areas</span><span class="mc-n">${content.name}</span><span class="mc-b">${content.blurb}</span><span class="mc-go" aria-hidden="true">View coverage</span></a></li>`).join('\n      ')}
    </ul>`,
});

const maxZ = Math.max(...joined.map((x) => x.data.zones)), half = Math.ceil(joined.length / 2);
const covTable = (rows, part) => `
    <table class="cov-t">
      <caption class="sr">Rated areas per metro, part ${part} of 2</caption>
      <thead><tr><th scope="col">Metro</th><th scope="col" class="n">Areas</th><th scope="col" class="b"><span class="sr">Relative size</span></th></tr></thead>
      <tbody>
        ${rows.map(({ content, data }) => `<tr><th scope="row"><a href="${content.slug}.html">${content.name}</a></th><td class="n">${fmt(data.zones)}</td><td class="b" aria-hidden="true"><i style="--w:${(data.zones / maxZ).toFixed(3)}"></i></td></tr>`).join('\n        ')}
      </tbody>
    </table>`;
const bySize = [...joined].sort((a, b) => b.data.zones - a.data.zones);
const stell = stats.metros.find((m) => m.key === 'stellenbosch');
const coverageChart = sec({
  id: 'counts',
  kick: 'The shape of the map',
  title: 'Rated areas per metro',
  lead: `Counts follow the size and density of each metro, not how thoroughly it has been covered.${stell ? ` Stellenbosch has ${fmt(stell.zones)} rated areas because it is a small town, not because it is half-finished.` : ''}`,
  inner: `
    <div class="cov-tables" data-reveal>${covTable(bySize.slice(0, half), 1)}${covTable(bySize.slice(half), 2)}
    </div>`,
});

const coverageFaqs = [
  {
    q: 'What happens if I drive outside a mapped metro?',
    a: 'The app still works as a normal map and turn-by-turn navigator anywhere. It simply has no risk data to apply, and it tells you that rather than implying an unmapped road has been checked and found safe.',
  },
  {
    q: 'Does a blank map mean an area is safe?',
    a: 'No. A blank area means no data. An area rated in the lowest band means it was checked and carries no routing penalty. The app shows those differently on purpose.',
  },
  {
    q: 'How often is the data updated?',
    a: 'Rated areas and roads are re-scored periodically as new crime statistics are published, and corrections from local knowledge are applied continuously. The app pulls changes automatically, so you do not need to reinstall it.',
  },
  {
    q: 'Which metro is next?',
    a: 'New metros are added as time and money allow, since each one means fetching map data, scoring it against crime statistics, and running a review pass before anything goes live. Anything people chip in speeds that up.',
  },
];

const coverageTail = sec({
  id: 'next',
  cls: 'tail',
  kick: 'The next metro',
  title: 'Help us map the next one.',
  lead: 'Each new city means map data, crime scoring and a review pass before it goes live. Sponsoring one is the surest way to move it up the list.',
  inner: `<p class="more" data-reveal>${linkQ('Sponsor a metro', 'sponsor.html#sponsor')}${linkQ('Get the app', 'get-app.html')}</p>`,
});

const coveragePage = {
  slug: 'coverage.html',
  title: 'Coverage',
  description: `Tsamaya rates ${fmt(stats.totals.zones)} areas across ${stats.totals.metros} South African metros: Johannesburg, Cape Town, Durban, Gqeberha, Pretoria, Ekurhuleni, the West Rand, Stellenbosch, Rustenburg, Pilanesberg, Mossel Bay and Secunda.`,
  heroClass: 'sn page-coverage',
  jsonLd: [
    faqNode(coverageFaqs),
    breadcrumbNode([
      { name: 'Home', slug: 'index.html' },
      { name: 'Coverage', slug: 'coverage.html' },
    ]),
  ],
  hud: false, // the map carries the page's opening
  scripts: ['js/coverage.js'],
  body: [coverageMapSection, coverageGrid, coverageChart, faqSec({ id: 'faq', title: 'About coverage', faqs: coverageFaqs }), coverageTail].join('\n'),
};

export default [coveragePage, ...joined.map(metroPage)];
