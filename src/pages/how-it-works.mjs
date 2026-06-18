import {
  section,
  eyebrow,
  icon,
  deviceMockup,
  button,
} from '../components.mjs';

const hero = `
<section class="page-hero">
  <div class="wrap">
    ${eyebrow('How it works')}
    <h1>Risk, weighed before you drive.</h1>
    <p class="lede center-narrow">Tsamaya layers a risk model on top of ordinary turn-by-turn routing. Here’s the whole pipeline — from the moment you pick a destination to the route on your screen.</p>
  </div>
</section>`;

const pipeline = section({
  cls: 'band',
  inner: `
  ${eyebrow('The pipeline')}
  <h2 class="center">From destination to lower-risk route, step by step</h2>
  <ol class="timeline">
    <li>
      <div class="t-marker">${icon('route', 20)}</div>
      <div>
        <h3>1 · Fetch the fastest route</h3>
        <p>We start with a standard Mapbox Directions route — the same fast line any map app would give you. That’s the baseline we test.</p>
      </div>
    </li>
    <li>
      <div class="t-marker">${icon('eye', 20)}</div>
      <div>
        <h3>2 · Sample &amp; test against risk zones</h3>
        <p>The route is sampled along its length and tested against all active danger zones for the current time band. Only <strong>red</strong> and <strong>elevated-orange</strong> zones count — caution-yellow is shown but never forces a detour.</p>
      </div>
    </li>
    <li>
      <div class="t-marker">${icon('layers', 20)}</div>
      <div>
        <h3>3 · Already on a safe corridor?</h3>
        <p>If the route is already running along a curated <em>safe corridor</em> through a zone, that’s a pass-through — no detour needed. Corridors are the local knowledge that stops the app over-reacting.</p>
      </div>
    </li>
    <li>
      <div class="t-marker">${icon('pin', 20)}</div>
      <div>
        <h3>4 · Find bypass waypoints</h3>
        <p>For genuine danger, Tsamaya picks the nearest safe-corridor point to each hotspot and injects a small number of waypoints — nudging the route around the area rather than through it.</p>
      </div>
    </li>
    <li>
      <div class="t-marker">${icon('check', 20)}</div>
      <div>
        <h3>5 · Re-route &amp; sanity-check</h3>
        <p>We re-fetch with those waypoints. If the safer line ends up substantially longer than direct, we don’t pretend it’s reasonable — we hand back the direct route, clearly flagged as risky, and let you decide.</p>
      </div>
    </li>
    <li>
      <div class="t-marker">${icon('bolt', 20)}</div>
      <div>
        <h3>6 · Drive it your way</h3>
        <p>Follow along with in-app turn-by-turn navigation, or hand off to Google Maps — Tsamaya seeds it with the bypass waypoints so it follows the lower-risk line instead of recomputing its own.</p>
      </div>
    </li>
  </ol>`,
});

const timeBands = section({
  cls: 'band-soft',
  inner: `
  <div class="split">
    <div>
      ${eyebrow('Time-aware')}
      <h2>The same road isn’t equally risky all day.</h2>
      <p class="big">Every zone carries three separate risk bands. Tsamaya reads the clock — or your manual override — and routes against the band that actually applies right now.</p>
      <div class="band-pills">
        <span class="pill pill-day">${icon('clock', 16)} Daytime · 05:00–18:00</span>
        <span class="pill pill-eve">${icon('clock', 16)} Evening · 18:00–22:00</span>
        <span class="pill pill-night">${icon('clock', 16)} Night · 22:00–05:00</span>
      </div>
    </div>
    <div class="device-pair">
      ${deviceMockup('home', 'Live risk overlay')}
    </div>
  </div>`,
});

const cta = `
<section class="cta-band">
  <div class="wrap cta-inner">
    <div><h2>Want the engineering detail?</h2><p>Architecture, data pipeline and the exact thresholds are on the technical page.</p></div>
    <div class="cta-actions">${button('Technical details', 'technical.html', 'primary')}${button('See the app', 'demo.html', 'ghost-light')}</div>
  </div>
</section>`;

export default {
  slug: 'how-it-works.html',
  title: 'How it works',
  description:
    'How Tsamaya plans lower-risk routes: fetch the fastest line, test it against time-aware risk zones, and re-route along curated safe corridors.',
  body: [hero, pipeline, timeBands, cta].join('\n'),
};
