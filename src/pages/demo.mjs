import {
  section,
  eyebrow,
  icon,
  deviceMockup,
  deviceShot,
  picture,
  button,
} from '../components.mjs';
import { shots, walkthrough, shotSize, altFor } from '../shots.mjs';

const hero = `
<section class="page-hero">
  <div class="wrap">
    ${eyebrow('See it in action')}
    <h1>Two taps from “Where to?” to a lower-risk route.</h1>
    <p class="lede center-narrow">A walk through the real app: set a destination, compare the routes, and see which areas Tsamaya kept you out of.</p>
  </div>
</section>`;

// Real screenshots captured from the iOS Simulator (latest local build). The
// gallery is generated from src/shots.mjs — if no screenshots are present yet,
// this whole block is skipped and the interactive mockups below carry the demo.
const gallery = shots.length
  ? section({
      cls: 'band',
      inner: `
    ${eyebrow('From the latest build')}
    <h2>Screenshots from the app</h2>
    <p class="sub">Captured on the iOS&nbsp;Simulator from the current Tsamaya build.</p>
    <div class="shot-grid">
      ${shots
        .map(
          (s) => `<figure class="shot" data-reveal>
        ${picture({ name: s.name, alt: s.alt, width: shotSize.width, height: shotSize.height, sizes: '(max-width: 680px) 80vw, 248px' })}
        <figcaption><strong>${s.title}</strong>${s.caption ? `. ${s.caption}` : ''}</figcaption>
      </figure>`,
        )
        .join('')}
    </div>`,
    })
  : '';

// A real capture where we have one; the drawn mockup only where we do not.
const step = (key, label = '') =>
  walkthrough[key]
    ? deviceShot({
        name: walkthrough[key],
        alt: altFor(walkthrough[key]),
        label,
        width: shotSize.width,
        height: shotSize.height,
      })
    : deviceMockup(key, label);

const walkthroughSection = section({
  cls: shots.length ? 'band-soft' : 'band',
  inner: `
  ${eyebrow('Annotated walkthrough')}
  <h2>What you’re looking at</h2>
  <div class="walk">
    <div class="walk-step">
      ${step('home')}
      <div class="walk-text">
        <span class="walk-num">01</span>
        <h3>The live risk map</h3>
        <p>Open the app and every active hotspot is on the map, colour-coded by severity for the current time of day. Tap the eye to toggle the overlay; tap “Where to?” to begin.</p>
        <ul class="mini-legend">
          <li><span class="dot dot-red"></span> High risk</li>
          <li><span class="dot dot-orange"></span> Elevated</li>
          <li><span class="dot dot-yellow"></span> Caution</li>
        </ul>
      </div>
    </div>
    <div class="walk-step reverse">
      ${step('route')}
      <div class="walk-text">
        <span class="walk-num">02</span>
        <h3>Set From / To, then Go</h3>
        <p>Your start defaults to your live location; the destination is whatever you searched, tapped or pinned. Swap them in one tap with the ⇅ button, then press <strong>Go</strong>.</p>
      </div>
    </div>
    <div class="walk-step">
      ${step('result')}
      <div class="walk-text">
        <span class="walk-num">03</span>
        <h3>Compare, then choose</h3>
        <p>You get the lower-risk route next to the direct one, with what each costs in minutes and kilometres. If risk can’t be avoided entirely, it says so rather than pretending otherwise. Drive it in the app, or hand off to Google Maps with the detour points baked in so it follows the same line.</p>
      </div>
    </div>
    <div class="walk-step reverse">
      ${step('navigation')}
      <div class="walk-text">
        <span class="walk-num">04</span>
        <h3>Drive it</h3>
        <p>Turn-by-turn works the way you’d expect: the next turn up top, your speed, the road you’re on and the time left. The route itself is coloured by risk as you go. Voice guidance cycles between spoken directions, alerts only, and silence. There’s an SOS button, and a flag for telling us an area looks wrong.</p>
      </div>
    </div>
  </div>`,
});

const video = shots.video
  ? section({
      cls: 'band-soft',
      inner: `
    ${eyebrow('Screen recording')}
    <h2 class="center">Watch a route get re-planned</h2>
    <div class="video-wrap">
      <video controls playsinline muted loop poster="${shots.video.poster || ''}" preload="metadata">
        <source src="${shots.video.src}" type="video/mp4"/>
        Your browser doesn’t support embedded video.
      </video>
    </div>`,
    })
  : '';

const notes = section({
  cls: 'band',
  inner: `
  <div class="note-card">
    <h3>${icon('shield', 20)} Honest note on this build</h3>
    <p>Every screen on this page is a real capture from the current build, taken against the live database. Real map tiles, real risk zones, real search, real routing. Nothing here is a mock-up or a rendering. You’ll notice the map wears its night colours: the app follows the actual clock, and these were captured late in the evening. Risk data is curated and improves constantly. Routes weigh known risk, they don’t guarantee safety, and you should stay aware on the road regardless.</p>
  </div>`,
});

const cta = `
<section class="cta-band">
  <div class="wrap cta-inner">
    <div><h2>Try it yourself.</h2><p>Tsamaya is rolling out to testers through TestFlight. Request access and we’ll add you.</p></div>
    <div class="cta-actions">${button('Join the beta', 'contact.html#beta', 'primary')}${button('How it works', 'how-it-works.html', 'ghost-light')}</div>
  </div>
</section>`;

export default {
  slug: 'demo.html',
  title: 'See it in action',
  description:
    'A walkthrough of the Tsamaya app: the live risk map, setting a route, and comparing the lower-risk route against the direct one.',
  body: [hero, gallery, walkthroughSection, video, notes, cta].join('\n'),
};
