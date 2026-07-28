import { site, stats, fmt } from '../../site.config.mjs';
import {
  section,
  eyebrow,
  statRow,
  button,
  icon,
  deviceMockup,
} from '../components.mjs';
import { metros as metroContent } from '../data/metros.mjs';
import { coverageBars, routeCompare } from '../charts.mjs';
import { faqNode } from '../seo.mjs';

// A decorative route that draws itself across the hero background — the brand's
// swerve motif, threading between two risk markers. Deliberately abstract and
// aria-hidden: it is ornament, not a depiction of the app's actual map, and
// dressing up decoration as product UI is how marketing sites start lying.
const heroRoute = `
<svg class="hero-route" viewBox="0 0 520 560" preserveAspectRatio="xMaxYMid meet" aria-hidden="true" focusable="false">
  <path class="hero-route-path"
        d="M96 548 C 96 470 40 430 76 356 C 112 284 214 306 236 236 C 258 166 186 118 232 58 C 262 20 330 14 404 22"
        fill="none" stroke="#34D399" stroke-width="2.5" stroke-linecap="round" opacity="0.28" style="--len:1200"/>
  <circle class="hero-route-dot" cx="404" cy="22" r="5.5" fill="#34D399" opacity="0.5"/>
</svg>`;

const hero = `
<section class="hero">
  ${heroRoute}
  <div class="wrap hero-inner">
    <div class="hero-copy">
      ${eyebrow('Lower-risk routes for South African drivers')}
      <h1>Go where the<br/><span class="grad">trouble isn’t.</span></h1>
      <p class="lede">Tsamaya plans driving routes that think about <strong>risk</strong>, not just speed — steering you around known crime hotspots using public statistics and curated local knowledge. <span class="muted">(say: ${site.pronunciation} — Sesotho/Setswana for “go”)</span></p>
      <div class="hero-cta">
        ${button('Join the beta', 'contact.html#beta', 'primary')}
        ${button('See how it works', 'how-it-works.html', 'ghost-light')}
      </div>
      <p class="hero-disclaimer">${icon('shield', 15)} Routes consider risk — not a guarantee of safety. Always stay aware.</p>
    </div>
    <div class="hero-device">
      ${deviceMockup('home')}
    </div>
  </div>
  <div class="wrap">${statRow(site.stats)}</div>
</section>`;

const problem = section({
  cls: 'band',
  inner: `
  <div class="split">
    <div>
      ${eyebrow('Why it exists')}
      <h2>Most maps optimise for time. South African roads need more than that.</h2>
      <p class="big">Hijackings, smash-and-grabs and robberies cluster in known areas — and they shift by time of day. A fast route can run straight through the worst of it. Tsamaya weighs that risk before it sends you.</p>
    </div>
    <ul class="check-list">
      <li>${icon('check')} Avoids high- and elevated-risk zones, not just traffic</li>
      <li>${icon('check')} Risk changes by day, evening and night — so do the routes</li>
      <li>${icon('check')} Built on public crime stats + on-the-ground local knowledge</li>
      <li>${icon('check')} Hands off cleanly to Google Maps or guides you in-app</li>
    </ul>
  </div>`,
});

const steps = section({
  id: 'how',
  cls: 'band-soft',
  inner: `
  ${eyebrow('How it works')}
  <h2 class="center">Three quick steps</h2>
  <div class="steps">
    <div class="step">
      <span class="step-num">1</span>
      ${icon('pin', 26, 'step-ic')}
      <h3>Set your destination</h3>
      <p>Search, tap the map, or long-press to drop a pin. Your start defaults to your live location.</p>
    </div>
    <div class="step">
      <span class="step-num">2</span>
      ${icon('route', 26, 'step-ic')}
      <h3>We check the route</h3>
      <p>Tsamaya samples the fastest route and tests it against every active risk zone for the current time of day.</p>
    </div>
    <div class="step">
      <span class="step-num">3</span>
      ${icon('shield', 26, 'step-ic')}
      <h3>Re-routed around risk</h3>
      <p>If the direct line runs through danger, we steer it along safe corridors and show you exactly what was avoided.</p>
    </div>
  </div>
  <div class="center mt">${button('The full breakdown', 'how-it-works.html', 'ghost')}</div>`,
});

const features = section({
  cls: 'band',
  inner: `
  ${eyebrow('What’s inside')}
  <h2>A real navigation app — with a risk-aware brain.</h2>
  <div class="feature-grid">
    ${[
      ['clock', 'Time-aware risk', 'Zones carry separate risk bands for day, evening and night. The route you get at noon is not the route you get at 11pm.'],
      ['layers', 'Safe corridors', 'Curated “known-okay” roads the router prefers when threading past a hotspot — so detours stay sensible.'],
      ['route', 'Smart re-routing', 'Only red and orange zones trigger a detour, and a sanity check rejects any bypass that’s wildly longer than direct.'],
      ['map', 'Multi-metro', `Live across Gauteng, the Western Cape and Mpumalanga — ${stats.totals.metros} metros mapped and more on the way.`],
      ['route', 'Turn-by-turn, your way', 'Drive the lower-risk route with built-in turn-by-turn navigation — or hand off to Google Maps with the bypass waypoints baked in.'],
      ['eye', 'See the risk', 'Toggle the live zone overlay any time — every hotspot and corridor, colour-coded on the map.'],
    ]
      .map(
        ([ic, t, b]) =>
          `<article class="feature"><div class="feature-ic">${icon(ic, 24)}</div><h3>${t}</h3><p>${b}</p></article>`,
      )
      .join('')}
  </div>`,
});

const demoTeaser = section({
  cls: 'band-soft',
  inner: `
  <div class="split">
    <div class="device-pair">
      ${deviceMockup('route', 'Set From / To, then Go')}
      ${deviceMockup('result', 'See exactly what was avoided')}
    </div>
    <div>
      ${eyebrow('See it in action')}
      <h2>From “Where to?” to a lower-risk route in two taps.</h2>
      <p class="big">Pick a destination, hit <strong>Go</strong>, and Tsamaya compares the direct line against a route built around risk — then tells you which areas it kept you out of.</p>
      <div class="mt">${button('Open the demo', 'demo.html', 'primary')}</div>
    </div>
  </div>`,
});

// Coverage — the map's actual footprint, straight from the live database, and the
// entry point to the per-metro pages.
const coverage = section({
  cls: 'band',
  inner: `
  ${eyebrow('Where it works')}
  <h2>${fmt(stats.totals.zones)} mapped risk zones across ${stats.totals.metros} metros.</h2>
  <p class="sub">Every figure here is read from the live database rather than typed into the page. Zone counts follow how big and dense a metro is — Stellenbosch has ${stats.metros.find((m) => m.key === 'stellenbosch').zones} because it is a small town, not because it is half-finished.</p>
  ${coverageBars(
    metroContent
      .map((c) => ({ content: c, data: stats.metros.find((m) => m.key === c.key) }))
      .filter((x) => x.data && x.data.zones > 0)
      .map(({ content, data }) => ({ label: content.name, value: data.zones, slug: content.slug })),
  )}
  <div class="center mt">${button('Coverage by metro', 'coverage.html', 'ghost')}</div>`,
});

// What the trade-off actually costs, in the only unit drivers care about.
const tradeoff = section({
  cls: 'band-soft',
  inner: `
  <div class="split">
    <div>
      ${eyebrow('The trade-off')}
      <h2>Safer usually costs minutes, not hours.</h2>
      <p class="big">A detour has to genuinely reduce risk exposure to be offered at all, and one that is wildly longer than the direct route gets rejected even when it is safer. That guardrail is the difference between a route you will actually take and one you will ignore.</p>
      <p class="muted small">If no acceptable lower-risk route exists, Tsamaya says so and gives you the standard one with the risks marked — rather than inventing a detour to look useful.</p>
    </div>
    <div>
      ${routeCompare({ directMin: 16, safeMin: 19, avoided: 2 })}
    </div>
  </div>`,
});

const faqs = [
  {
    q: 'What is Tsamaya?',
    a: 'Tsamaya is a free navigation app for South African drivers that plans routes around known crime hotspots rather than purely for speed. It is currently in beta on iPhone.',
  },
  {
    q: 'Where does the risk data come from?',
    a: 'Published South African crime statistics, scored against map data to identify where vehicle-related crime concentrates, then reviewed and corrected with local knowledge before anything goes live.',
  },
  {
    q: 'Which cities does it cover?',
    a: `Tsamaya currently maps ${stats.totals.metros} metros: ${stats.metros.map((m) => m.name).join(', ')}. Outside those areas it still works as an ordinary map and turn-by-turn navigator, it just has no risk data to apply.`,
  },
  {
    q: 'Does a safer route take much longer?',
    a: 'Usually a few minutes. A detour is only offered if it meaningfully reduces risk exposure, and routes that are dramatically longer than the direct one are rejected outright.',
  },
  {
    q: 'Is Tsamaya free?',
    a: 'Yes. It is free to use and independently funded through sponsorship and donations rather than advertising or selling data.',
  },
  {
    q: 'Does it guarantee I will be safe?',
    a: 'No, and it never claims to. Tsamaya reduces known, mapped exposure based on historical crime data. Crime is not predictable and no route is guaranteed safe. It is a tool for making a better-informed choice, not a substitute for staying alert.',
  },
];

const faq = section({
  cls: 'band',
  inner: `
  ${eyebrow('Questions')}
  <h2 class="center">Common questions</h2>
  <div class="faq">
    ${faqs
      .map(
        (f) => `<details class="faq-item">
      <summary><span>${f.q}</span></summary>
      <p>${f.a}</p>
    </details>`,
      )
      .join('')}
  </div>`,
});

const sponsorBand = `
<section class="cta-band">
  <div class="wrap cta-inner">
    <div>
      <h2>Help us map the next metro.</h2>
      <p>Tsamaya is independent and self-funded. Sponsorship and donations pay for data, hosting and getting the app to more drivers.</p>
    </div>
    <div class="cta-actions">
      ${button('Sponsor us', 'sponsor.html', 'primary')}
      ${button('Donate', 'sponsor.html#donate', 'ghost-light')}
    </div>
  </div>
</section>`;

export default {
  slug: 'index.html',
  title: 'Home',
  description: site.description,
  heroClass: 'page-home',
  jsonLd: [faqNode(faqs)],
  body: [hero, problem, steps, coverage, features, tradeoff, demoTeaser, faq, sponsorBand].join('\n'),
};
