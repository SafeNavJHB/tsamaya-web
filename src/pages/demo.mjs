import {
  section,
  eyebrow,
  icon,
  deviceMockup,
  button,
} from '../components.mjs';
import { shots } from '../shots.mjs';

const hero = `
<section class="page-hero">
  <div class="wrap">
    ${eyebrow('See it in action')}
    <h1>Two taps from “Where to?” to a lower-risk route.</h1>
    <p class="lede center-narrow">A walkthrough of the real app — set a destination, compare routes, and see exactly which areas Tsamaya kept you out of.</p>
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
          (s) => `<figure class="shot">
        <img src="${s.src}" alt="${s.alt}" loading="lazy" width="300"/>
        <figcaption><strong>${s.title}</strong>${s.caption ? ` — ${s.caption}` : ''}</figcaption>
      </figure>`,
        )
        .join('')}
    </div>`,
    })
  : '';

const walkthrough = section({
  cls: shots.length ? 'band-soft' : 'band',
  inner: `
  ${eyebrow('Annotated walkthrough')}
  <h2>What you’re looking at</h2>
  <div class="walk">
    <div class="walk-step">
      ${deviceMockup('home')}
      <div class="walk-text">
        <span class="walk-num">01</span>
        <h3>Home — the live risk map</h3>
        <p>Open the app and every active hotspot is on the map, colour-coded by severity for the current time of day. Tap the eye to toggle the overlay; tap “Where to?” to begin.</p>
        <ul class="mini-legend">
          <li><span class="dot dot-red"></span> High risk</li>
          <li><span class="dot dot-orange"></span> Elevated</li>
          <li><span class="dot dot-yellow"></span> Caution</li>
        </ul>
      </div>
    </div>
    <div class="walk-step reverse">
      ${deviceMockup('route')}
      <div class="walk-text">
        <span class="walk-num">02</span>
        <h3>Set From / To, then Go</h3>
        <p>Your start defaults to your live location; the destination is whatever you searched, tapped or pinned. Swap them in one tap with the ⇅ button, then press <strong>Go</strong>.</p>
      </div>
    </div>
    <div class="walk-step">
      ${deviceMockup('result')}
      <div class="walk-text">
        <span class="walk-num">03</span>
        <h3>Compare &amp; see what was avoided</h3>
        <p>Tsamaya shows the lower-risk route beside the direct one — distance, time and the exact risk areas it steered you around. Start the in-app turn-by-turn drive, or hand off to Google Maps with the bypass waypoints baked in so it follows the lower-risk line — not its own.</p>
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
    <p>Tsamaya is in active beta. The screens above are from the current build; the interactive mockups mirror the same UI and brand. Risk data is curated and improving constantly — routes weigh known risk, they don’t guarantee safety, and you should always stay aware on the road.</p>
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
  body: [hero, gallery, walkthrough, video, notes, cta].join('\n'),
};
