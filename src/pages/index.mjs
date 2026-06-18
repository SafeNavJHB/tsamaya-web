import { site } from '../../site.config.mjs';
import {
  section,
  eyebrow,
  statRow,
  button,
  icon,
  deviceMockup,
} from '../components.mjs';

const hero = `
<section class="hero">
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
      ['map', 'Multi-metro', 'Live across Gauteng and Cape Town, with five metros mapped and more on the way.'],
      ['bolt', 'Google Maps handoff', 'Prefer Google Maps? Tsamaya injects the bypass waypoints so Google follows the lower-risk line, not its own.'],
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
  body: [hero, problem, steps, features, demoTeaser, sponsorBand].join('\n'),
};
