import { site } from '../../site.config.mjs';
import { section, eyebrow, icon, button, logoMark } from '../components.mjs';

const hero = `
<section class="page-hero">
  <div class="wrap">
    ${eyebrow('About us')}
    <h1>A small idea with a serious job:<br/><span class="grad">get people home well.</span></h1>
    <p class="lede center-narrow">Tsamaya started as one driver’s question — <em>why does my map send me through the worst part of town just to save two minutes?</em> — and grew into a navigation app that puts risk on the map.</p>
  </div>
</section>`;

const name = section({
  cls: 'band',
  inner: `
  <div class="split">
    <div class="name-mark">${logoMark(120)}</div>
    <div>
      ${eyebrow('The name')}
      <h2>Tsamaya <span class="muted">/ tsa-MAH-ya /</span></h2>
      <p class="big">It’s Sesotho and Setswana for <strong>“go”</strong> — from the everyday blessing <em>tsamaya sentle</em>, “go well”. That’s the whole promise in two words: not a guarantee, just a wish for a good journey, the way South Africans say goodbye in every language.</p>
      <p>There’s a second meaning we love: in kasi football, a <em>tsamaya</em> is the move that sends the defender the wrong way — going exactly where the trouble isn’t. Which is the entire point.</p>
      <p class="lockup-line"><strong>${site.lockup}</strong></p>
    </div>
  </div>`,
});

const mission = section({
  cls: 'band-soft',
  inner: `
  ${eyebrow('What we believe')}
  <h2 class="center">Our principles</h2>
  <div class="value-grid">
    <article class="value">
      <div class="value-ic">${icon('shield', 22)}</div>
      <h3>Honest about risk</h3>
      <p>We never say “safe”. Routes are <strong>lower-risk</strong>, built from statistics and local knowledge. We tell you what we avoided and trust you to make the call.</p>
    </article>
    <article class="value">
      <div class="value-ic">${icon('map', 22)}</div>
      <h3>Local knowledge counts</h3>
      <p>Data alone misses the corner everyone in the neighbourhood already avoids. Curated corridors fold real human knowledge into the model.</p>
    </article>
    <article class="value">
      <div class="value-ic">${icon('heart', 22)}</div>
      <h3>Built for South Africa</h3>
      <p>Made in Johannesburg, for the way people actually drive here — not a global template with our cities bolted on.</p>
    </article>
    <article class="value">
      <div class="value-ic">${icon('eye', 22)}</div>
      <h3>Nothing hidden</h3>
      <p>Open thresholds, visible zones, a clear disclaimer. You can always see why a route bends the way it does.</p>
    </article>
  </div>`,
});

const founder = section({
  cls: 'band',
  inner: `
  <div class="split">
    <div>
      ${eyebrow('Who’s behind it')}
      <h2>An independent, self-funded project.</h2>
      <p class="big">Tsamaya is built and maintained by <strong>Kyle Kimble</strong> — a Johannesburg-based Chartered Accountant who taught himself to ship a mobile app because the problem wouldn’t leave him alone.</p>
      <p>It’s not backed by a big company or a marketing budget. Every metro mapped, every line of routing logic and every rand of running cost has come from one person’s nights and weekends — which is exactly why sponsorship and donations make such a difference.</p>
      <div class="mt cta-actions">
        ${button('Support the project', 'sponsor.html', 'primary')}
        ${button('Say hello', 'contact.html', 'ghost')}
      </div>
    </div>
    <div class="quote-card">
      <p class="quote">“Most maps optimise for the fastest line. On South African roads, the fastest line isn’t always the one you want to be on. Tsamaya is my attempt to give drivers that choice.”</p>
      <p class="quote-by">— Kyle Kimble, founder</p>
    </div>
  </div>`,
});

const cta = `
<section class="cta-band">
  <div class="wrap cta-inner">
    <div><h2>Want to follow along — or pitch in?</h2><p>Whether you’re a driver, a sponsor or just curious, we’d love to hear from you.</p></div>
    <div class="cta-actions">${button('Contact us', 'contact.html', 'primary')}${button('See the app', 'demo.html', 'ghost-light')}</div>
  </div>
</section>`;

export default {
  slug: 'about.html',
  title: 'About us',
  description:
    'The story behind Tsamaya — an independent, Johannesburg-built navigation app that routes South African drivers around known risk. The name means “go well”.',
  body: [hero, name, mission, founder, cta].join('\n'),
};
