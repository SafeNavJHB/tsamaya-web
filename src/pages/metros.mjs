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

import { site, stats, fmt } from '../../site.config.mjs';
import { section, eyebrow, icon, button } from '../components.mjs';
import { metros as metroContent } from '../data/metros.mjs';
import { faqNode, breadcrumbNode } from '../seo.mjs';
import { bandBar, coverageBars } from '../charts.mjs';

// Pair the editorial content with the live numbers for that metro.
const joined = metroContent
  .map((content) => ({ content, data: stats.metros.find((m) => m.key === content.key) }))
  .filter((x) => x.data && x.data.zones > 0);

function metroPage({ content, data }) {
  const others = joined.filter((x) => x.content.key !== content.key);
  const pct = (n) => Math.round((n / data.zones) * 100);

  const hero = `
<section class="page-hero metro-hero">
  <div class="wrap">
    <nav class="crumbs" aria-label="Breadcrumb">
      <a href="index.html">Home</a> <span aria-hidden="true">›</span>
      <a href="coverage.html">Coverage</a> <span aria-hidden="true">›</span>
      <span aria-current="page">${content.name}</span>
    </nav>
    ${eyebrow(`${content.region} · live coverage`)}
    <h1>Lower-risk driving routes in ${content.name}</h1>
    <p class="lede center-narrow">${content.intro}</p>
    <div class="metro-figures">
      <div class="stat"><span class="stat-value">${fmt(data.zones)}</span><span class="stat-label">risk zones mapped</span></div>
      <div class="stat"><span class="stat-value">${fmt(data.bands.red)}</span><span class="stat-label">in the highest band</span></div>
      <div class="stat"><span class="stat-value">3</span><span class="stat-label">ratings per zone, by time of day</span></div>
    </div>
  </div>
</section>`;

  const breakdown = section({
    cls: 'band',
    inner: `
  <div class="split">
    <div>
      ${eyebrow('What the data looks like here')}
      <h2>${fmt(data.zones)} mapped areas across ${content.name}.</h2>
      <p class="big">Every area is rated three times over, once each for daytime, evening and night, because risk in South African metros does not hold still across a day. The split below is how ${content.name}'s ${fmt(data.zones)} zones fall across the bands at their highest rating.</p>
      <p class="muted small">Figures read directly from the live database, not typed by hand. The lowest band means an area was checked and carries no routing penalty, which is different from an area we have no data for.</p>
    </div>
    <div>
      ${bandBar(data.bands, content.name)}
    </div>
  </div>`,
  });

  const context = section({
    cls: 'band-soft',
    inner: `
  ${eyebrow('Driving here')}
  <h2>What matters on ${content.name}'s roads</h2>
  <ul class="context-list">
    ${content.context.map((c) => `<li>${icon('route', 20)}<span>${c}</span></li>`).join('')}
  </ul>
  <p class="muted small mt">Tsamaya rates roads and routes. It does not publish a list of neighbourhoods, and the app never labels a place for anyone other than the driver about to pass through it.</p>`,
  });

  const faq = section({
    cls: 'band',
    inner: `
  ${eyebrow('Questions')}
  <h2 class="center">Common questions about ${content.name}</h2>
  <div class="faq">
    ${content.faqs
      .map(
        (f) => `<details class="faq-item">
      <summary><span>${f.q}</span></summary>
      <p>${f.a}</p>
    </details>`,
      )
      .join('')}
  </div>`,
  });

  const elsewhere = section({
    cls: 'band-soft',
    inner: `
  ${eyebrow('Also mapped')}
  <h2 class="center">Other metros</h2>
  <div class="metro-grid">
    ${others
      .map(
        (o) => `<a class="metro-card" href="${o.content.slug}.html">
      <span class="metro-card-name">${o.content.name}</span>
      <span class="metro-card-region">${o.content.region}</span>
      <span class="metro-card-count">${fmt(o.data.zones)} zones</span>
    </a>`,
      )
      .join('')}
  </div>`,
  });

  const cta = `
<section class="cta-band">
  <div class="wrap cta-inner">
    <div>
      <h2>Drive ${content.name} with the risk on the map.</h2>
      <p>Tsamaya is free and currently in beta on iPhone. Ask for an invite and we'll send you a TestFlight link.</p>
    </div>
    <div class="cta-actions">
      ${button('Join the beta', 'contact.html#beta', 'primary')}
      ${button('See how it works', 'how-it-works.html', 'ghost-light')}
    </div>
  </div>
</section>`;

  return {
    slug: `${content.slug}.html`,
    title: `${content.name} coverage`,
    description: content.blurb,
    heroClass: 'page-metro',
    jsonLd: [
      faqNode(content.faqs),
      breadcrumbNode([
        { name: 'Home', slug: 'index.html' },
        { name: 'Coverage', slug: 'coverage.html' },
        { name: content.name, slug: `${content.slug}.html` },
      ]),
    ],
    body: [hero, breakdown, context, faq, elsewhere, cta].join('\n'),
  };
}

/* ---------------------------------------------------------------------------
 * The coverage index — the hub the seven metro pages hang off.
 * ------------------------------------------------------------------------ */
const coverageHero = `
<section class="page-hero">
  <div class="wrap">
    ${eyebrow('Where Tsamaya works')}
    <h1>${stats.totals.metros} metros mapped, ${fmt(stats.totals.zones)} risk zones.</h1>
    <p class="lede center-narrow">Tsamaya is live across ${site.coverageLive}. Every mapped area is rated for daytime, evening and night, and every figure on this page comes straight from the live database rather than being typed in.</p>
  </div>
</section>`;

const coverageGrid = section({
  cls: 'band',
  inner: `
  ${eyebrow('Coverage by metro')}
  <h2>Pick a metro</h2>
  <div class="metro-grid metro-grid-lg">
    ${joined
      .map(
        ({ content, data }) => `<a class="metro-card" href="${content.slug}.html">
      <span class="metro-card-name">${content.name}</span>
      <span class="metro-card-region">${content.region}</span>
      <span class="metro-card-count">${fmt(data.zones)} zones</span>
      <span class="metro-card-blurb">${content.blurb}</span>
      <span class="metro-card-go">${icon('route', 18)} View coverage</span>
    </a>`,
      )
      .join('')}
  </div>`,
});

const coverageChart = section({
  cls: 'band-soft',
  inner: `
  ${eyebrow('The shape of the map')}
  <h2>Mapped areas per metro</h2>
  <p class="sub">Zone counts follow the size and density of each metro, not how thoroughly it has been covered. Stellenbosch has 32 zones because it is a small town, not because it is half-finished.</p>
  ${coverageBars(joined.map(({ content, data }) => ({ label: content.name, value: data.zones, slug: content.slug })))}`,
});

const coverageFaqs = [
  {
    q: 'What happens if I drive outside a mapped metro?',
    a: 'The app still works as a normal map and turn-by-turn navigator anywhere. It simply has no risk data to apply, and it tells you that rather than implying an unmapped road has been checked and found safe.',
  },
  {
    q: 'Does blank map mean an area is safe?',
    a: 'No, and this distinction matters. A blank area means no data. An area rated in the lowest band means it was checked and carries no routing penalty. The app shows those differently on purpose.',
  },
  {
    q: 'How often is the data updated?',
    a: 'Zones and corridors are re-scored periodically as new crime statistics are published, and corrections from local knowledge are applied continuously. The app pulls changes automatically, so you do not need to reinstall it.',
  },
  {
    q: 'Which metro is next?',
    a: 'New metros are added as funding allows, since each one means fetching map data, scoring it against crime statistics and a review pass before anything goes live. Sponsorship directly determines the pace.',
  },
];

const coverageFaq = section({
  cls: 'band',
  inner: `
  ${eyebrow('Questions')}
  <h2 class="center">About coverage</h2>
  <div class="faq">
    ${coverageFaqs
      .map(
        (f) => `<details class="faq-item">
      <summary><span>${f.q}</span></summary>
      <p>${f.a}</p>
    </details>`,
      )
      .join('')}
  </div>`,
});

const coverageCta = `
<section class="cta-band">
  <div class="wrap cta-inner">
    <div>
      <h2>Help us map the next metro.</h2>
      <p>Each new city means map data, crime scoring and a review pass before it goes live. Sponsorship is what decides which one is next.</p>
    </div>
    <div class="cta-actions">
      ${button('Sponsor a metro', 'sponsor.html', 'primary')}
      ${button('Join the beta', 'contact.html#beta', 'ghost-light')}
    </div>
  </div>
</section>`;

const coveragePage = {
  slug: 'coverage.html',
  title: 'Coverage',
  description: `Tsamaya maps ${fmt(stats.totals.zones)} risk zones across ${stats.totals.metros} South African metros: Johannesburg, Cape Town, Pretoria, Ekurhuleni, the West Rand, Secunda and Stellenbosch.`,
  heroClass: 'page-coverage',
  jsonLd: [
    faqNode(coverageFaqs),
    breadcrumbNode([
      { name: 'Home', slug: 'index.html' },
      { name: 'Coverage', slug: 'coverage.html' },
    ]),
  ],
  body: [coverageHero, coverageGrid, coverageChart, coverageFaq, coverageCta].join('\n'),
};

export default [coveragePage, ...joined.map(metroPage)];
