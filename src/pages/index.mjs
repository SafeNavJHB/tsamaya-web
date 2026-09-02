import { site, stats, fmt } from '../../site.config.mjs';
import {
  section,
  eyebrow,
  statRow,
  button,
  icon,
  deviceMockup,
  deviceShot,
} from '../components.mjs';
import { metros as metroContent } from '../data/metros.mjs';
import { shotSize, walkthrough, altFor } from '../shots.mjs';
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
      <p class="lede">Most maps work out the quickest way there. Tsamaya also works out what you would be driving through, and steers you around the areas where vehicle crime actually happens. <span class="muted">(say: ${site.pronunciation}. It is Sesotho and Setswana for “go”.)</span></p>
      <div class="hero-cta">
        ${button('Join the beta', 'get-app.html', 'primary')}
        ${button('See how it works', 'how-it-works.html', 'ghost-light')}
      </div>
      <p class="hero-disclaimer">${icon('shield', 15)} Lower risk is not no risk. Stay alert either way.</p>
    </div>
    <div class="hero-device">
      ${deviceShot({
        name: 'jhb-map',
        alt: altFor('jhb-map'),
        width: shotSize.width,
        height: shotSize.height,
        eager: true, // above the fold: this is the page's largest paint
      })}
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
      <h2>The fastest way there is not always the one you want.</h2>
      <p class="big">Hijackings, smash-and-grabs and robberies cluster in particular places, and those places change between lunchtime and midnight. A route planned only for speed will take you through them without mentioning it. Tsamaya weighs that up before it sends you anywhere.</p>
    </div>
    <ul class="check-list">
      <li>${icon('check')} Routes around the top two risk bands, not only around traffic</li>
      <li>${icon('check')} Ratings change between day, evening and night, so the route does too</li>
      <li>${icon('check')} Built from published crime statistics, then corrected by people who drive here</li>
      <li>${icon('check')} Drive it in the app, or hand the route to Google Maps</li>
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
      <p>Search for it, tap the map, or hold down to drop a pin. Your starting point is wherever you are.</p>
    </div>
    <div class="step">
      <span class="step-num">2</span>
      ${icon('route', 26, 'step-ic')}
      <h3>We check the route</h3>
      <p>We take the quickest route and test it against every rated area, using the ratings that apply at this hour.</p>
    </div>
    <div class="step">
      <span class="step-num">3</span>
      ${icon('shield', 26, 'step-ic')}
      <h3>Re-routed around risk</h3>
      <p>If it runs through somewhere bad, we move it onto roads we have checked, and tell you what we moved it around.</p>
    </div>
  </div>
  <div class="center mt">${button('The full breakdown', 'how-it-works.html', 'ghost')}</div>`,
});

const features = section({
  cls: 'band',
  inner: `
  ${eyebrow('What’s inside')}
  <h2>A proper navigation app that happens to think about risk.</h2>
  <div class="feature-grid">
    ${[
      ['clock', 'Ratings follow the clock', 'Every area is rated three times over: daytime, evening and night. The route you get at noon is not the one you get at 11pm.'],
      ['layers', 'Roads we have checked', 'When a detour is needed, it runs along roads we have already looked at, which keeps it sensible rather than sending you down a back street.'],
      ['route', 'Detours with a limit', 'Only the top two bands are worth going around, and any detour that adds too much gets thrown out before you ever see it.'],
      ['map', 'Multi-metro', `Live across Gauteng, the Western Cape and Mpumalanga, with ${stats.totals.metros} metros mapped and more on the way.`],
      ['route', 'Drive it however you like', 'Full turn-by-turn is built in. If you would rather use Google Maps, we hand it the route with the detour points already in place.'],
      ['eye', 'Look before you go', 'Turn the overlay on whenever you want and see every rated area and road on the map, colour-coded.'],
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
      ${deviceShot({ name: walkthrough.route, alt: altFor(walkthrough.route), label: 'Set From / To, then Go', width: shotSize.width, height: shotSize.height })}
      ${deviceShot({ name: walkthrough.result, alt: altFor(walkthrough.result), label: 'Compare the real trade-off', width: shotSize.width, height: shotSize.height })}
    </div>
    <div>
      ${eyebrow('See it in action')}
      <h2>From “Where to?” to a lower-risk route in two taps.</h2>
      <p class="big">Pick a destination, hit <strong>Go</strong>, and Tsamaya compares the direct line against a route built around risk, then tells you which areas it kept you out of.</p>
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
  <p class="sub">Every figure here is read from the live database rather than typed into the page. Zone counts follow how big and dense a metro is. Stellenbosch has ${stats.metros.find((m) => m.key === 'stellenbosch').zones} because it is a small town, not because it is half-finished.</p>
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
      <h2>It usually costs you a few minutes.</h2>
      <p class="big">A detour only gets offered if it actually cuts your exposure, and one that adds too much distance is thrown out even when it is safer. Without that limit you would be handed routes nobody would ever drive.</p>
      <p class="muted small">When there is no good alternative, Tsamaya says so and gives you the normal route with the risky stretches marked. It will not invent a detour just to look busy.</p>
    </div>
    <div>
      ${routeCompare({ directMin: 16, safeMin: 19, avoided: 2 })}
    </div>
  </div>`,
});

const faqs = [
  {
    q: 'What is Tsamaya?',
    a: 'A free navigation app for South African drivers. It plans routes around the places where vehicle crime is known to happen, instead of only working out the quickest way there. It is in open beta on iPhone and Android at the moment.',
  },
  {
    q: 'Where does the risk data come from?',
    a: 'Published South African crime statistics, scored against map data to work out where vehicle crime concentrates. Everything then gets reviewed and corrected against local knowledge before it goes anywhere near the app.',
  },
  {
    q: 'Which cities does it cover?',
    a: `Tsamaya currently maps ${stats.totals.metros} metros: ${stats.metros.map((m) => m.name).join(', ')}. Outside those areas it still works as an ordinary map and turn-by-turn navigator, it just has no risk data to apply.`,
  },
  {
    q: 'Does a safer route take much longer?',
    a: 'Usually a few minutes. A detour has to actually reduce your exposure to be offered at all, and anything dramatically longer than the direct route is rejected outright.',
  },
  {
    q: 'Is Tsamaya free?',
    a: 'Yes. It is paid for by sponsorship and donations. There are no ads, and we do not sell anything about you.',
  },
  {
    q: 'Does it guarantee I will be safe?',
    a: 'No, and we will never tell you otherwise. Tsamaya cuts your exposure to areas with a history of vehicle crime. Crime is not predictable, and no route is safe. Treat it as better information for the choice you were going to make anyway, and stay alert.',
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
      <p>Tsamaya is independent and self-funded. Sponsorship and donations pay for the map data, the hosting bills, and getting the app onto more phones.</p>
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
