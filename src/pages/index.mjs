// index.mjs: the home page (2026-10 redesign: shorter, metro-led, light and dark).
// The metro detection it can use is described in workers/where/README.md.
//
// Five sections, about a third of the old page's length: the hero with real app
// screenshots of a metro, how it works with one real trip, the 17 metros, the
// questions, and the store panels. Everything else lives on its own page.
//
// The page reads top to bottom without JavaScript and ships the same HTML to every
// visitor and every crawler: the hero shows Johannesburg and Cape Town. Then
// public/js/metro-hero.js may swap in the visitor's own metro (a choice they made
// before, or site.geoEndpoint when it is set) and the button for their phone.
//
// FIGURES. Nothing is typed by hand. Counts come from src/data/stats.json, the
// example trip from src/data/route-card.json.
import { readFileSync } from 'node:fs';
import { site, stats, fmt, statsAsOf } from '../../site.config.mjs';
import { picture } from '../components.mjs';
import { faqSec, getSec, linkQ, ARROW } from '../kit.mjs';
import { faqNode } from '../seo.mjs';
import { F } from '../faqs.mjs';
import { metros as editorial } from '../data/metros.mjs';

const card = JSON.parse(readFileSync(new URL('../data/route-card.json', import.meta.url), 'utf8'));
const std = card.standard;
const low = card.lower;
const nMetros = stats.totals.metros;
const zones = fmt(stats.totals.zones);

// The metros, Johannesburg and Cape Town first (the pair every visitor sees
// without JavaScript, in the order the page names them), then largest first,
// with the bounding box metro-hero.js matches a location against.
const bounds = JSON.parse(readFileSync(new URL('../data/metro-bounds.json', import.meta.url), 'utf8'));
const boxOf = Object.fromEntries((bounds.metros || bounds).map((m) => [m.key, m.bbox]));
// Every metro has a daytime, evening and night screenshot
// (assets/screens-src/metro-*, cropped below the app's status bar and city pill).
const DEFAULT = ['johannesburg', 'cape_town'];
const rank = (m) => (DEFAULT.includes(m.key) ? DEFAULT.indexOf(m.key) : DEFAULT.length);
const metros = stats.metros
  .map((m) => ({ key: m.key, slug: m.slug, name: m.name, zones: m.zones, box: boxOf[m.key] }))
  .filter((m) => editorial.some((e) => e.key === m.key))
  .sort((a, b) => rank(a) - rank(b) || b.zones - a.zones);
const byKey = Object.fromEntries(metros.map((m) => [m.key, m]));
const attr = (t) => String(t).replace(/&/g, '&amp;').replace(/'/g, '&#39;');
const text = (t) => String(t).replace(/&/g, '&amp;');

const SHOT_W = 600;
const SHOT_H = 1133;
// Each metro's map at the three times of day it is rated for, as the app draws
// it then (day, dusk and night styling). Only the band the toggle picks shows;
// the two default daytime shots load eagerly, being the first thing on screen.
const BANDS = [
  { key: 'day', label: 'Daytime', range: '05:00 to 17:30' },
  { key: 'evening', label: 'Evening', range: '17:30 to 19:30' },
  { key: 'night', label: 'Night', range: '19:30 to 05:00' },
];
function phone(key) {
  const m = byKey[key];
  const pic = (band) => picture({
    loading: DEFAULT.includes(key) && band.key === 'day' ? 'eager' : 'lazy',
    name: `metro-${m.slug}-${band.key}`,
    alt: `The Tsamaya map of ${text(m.name)} with its rated areas coloured by their ${band.label.toLowerCase()} ratings`,
    width: SHOT_W,
    height: SHOT_H,
    sizes: '(max-width: 680px) 44vw, 240px',
    widths: [300, 600],
    className: 'hm-shot',
  });
  return `<figure class="hm-phone" data-metro="${m.key}"${DEFAULT.includes(key) ? '' : ' hidden'}>
        <div class="hm-frame">${BANDS.map((b) => `<span class="hm-v hm-v-${b.key}">${pic(b)}</span>`).join('')}</div>
        <figcaption><b>${text(m.name)}</b> ${fmt(m.zones)} rated areas</figcaption>
      </figure>`;
}

const hero = `
<section class="hm-hero" aria-labelledby="hero-h">
  <div class="wrap hm-hero-in">
    <div class="hm-copy">
      <p class="hm-badge"><a href="why-tsamaya.html">Risk-aware navigation<span aria-hidden="true"> · </span><span class="sr">, </span>Proudly South African</a></p>
      <p class="hm-say">Tsamaya (say: ${site.pronunciation}) is Sesotho and Setswana for "go".</p>
      <h1 class="hm-h1" id="hero-h">Go where the trouble isn't.</h1>
      <p class="hm-sub">A free navigation app that checks your route against ${zones} rated areas in ${nMetros} South African metros, at the hour you drive, and plans it around the high-risk ones.</p>
      <div class="hm-cta">
        <a class="btn btn-primary btn-lg" href="${site.androidPlayLink}" rel="noopener" data-store="primary" data-android="${site.androidPlayLink}" data-ios="${site.testflightPublicLink}">Get it on Google Play ${ARROW}</a>
        <a class="hm-alt" href="${site.testflightPublicLink}" rel="noopener" data-store="other" data-android="${site.androidPlayLink}" data-ios="${site.testflightPublicLink}">On iPhone? Join on TestFlight</a>
      </div>
      <p class="hm-note">Free, in open beta. Lower risk is not no risk: stay alert.</p>
    </div>
    <div class="hm-phones" id="metro-hero" data-metros='${attr(JSON.stringify(metros.map(({ key, slug, name, zones: z, box }) => ({ key, slug, name, zones: z, box, shot: true }))))}' data-default="${DEFAULT.join(' ')}" data-band="day"${site.geoEndpoint ? ` data-geo="${site.geoEndpoint}"` : ''}>
      <div class="hm-row">
      ${metros.map((m) => phone(m.key)).join('\n      ')}
      </div>
      <div class="hm-bands" role="group" aria-label="Show the ratings for a time of day">
        ${BANDS.map((b, i) => `<button type="button" data-band="${b.key}" aria-pressed="${i === 0}">${b.label}</button>`).join('')}
      </div>
      <p class="hm-band-line" id="band-line" aria-live="polite">${BANDS[0].label} ratings, ${BANDS[0].range}.</p>
      <p class="hm-loc">
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 21s-7-6.1-7-11a7 7 0 0 1 14 0c0 4.9-7 11-7 11z" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="10" r="2.5" fill="none" stroke="currentColor" stroke-width="2"/></svg>
        <span id="metro-line" aria-live="polite">Showing Johannesburg and Cape Town.</span>
        <a href="#where" id="metro-change">Change</a>
      </p>
      <p class="hm-pick" id="metro-pick-row" hidden>
        <label for="metro-pick">Show the metro you drive in</label>
        <select id="metro-pick">
          <option value="">Johannesburg and Cape Town</option>
          ${metros.map((m) => `<option value="${m.key}">${text(m.name)}</option>`).join('')}
        </select>
      </p>
    </div>
  </div>
</section>`;

const STEPS = [
  ['Say where you\'re going', 'Search, tap the map, or pick Home or Work.'],
  ['Compare the routes', 'Fastest, Balanced and Lower-risk, each graded from A (least risk) to E, with what it goes around.'],
  ['Drive it', 'Turn-by-turn voice on your phone, Apple CarPlay or Android Auto.'],
];

const how = `
<section class="sec hm-how" id="how" aria-labelledby="how-h">
  <div class="wrap">
    <h2 class="h2" id="how-h">How it works</h2>
    <ol class="hm-steps">
      ${STEPS.map(([t, p], i) => `<li><span class="hm-n" aria-hidden="true">${i + 1}</span><h3>${t}</h3><p>${p}</p></li>`).join('\n      ')}
    </ol>
    <div class="hm-trip">
      <p class="hm-trip-h">One real trip, from a route card in the app (Ekurhuleni, ${card.captured})</p>
      <div class="hm-trip-rows">
        <div class="hm-route"><span class="hm-grade g-${std.grade.toLowerCase()}" role="img" aria-label="Grade ${std.grade}">${std.grade}</span><div><p class="hm-route-t">${std.label}: ${std.minutes} min, ${std.km.toFixed(1)} km</p><p>${std.highRiskKm} km through ${std.highRisk} high-risk ${std.highRisk === 1 ? 'area' : 'areas'}</p></div></div>
        <div class="hm-route"><span class="hm-grade g-${low.grade.toLowerCase()}" role="img" aria-label="Grade ${low.grade}">${low.grade}</span><div><p class="hm-route-t">${low.label[0].toUpperCase() + low.label.slice(1)}: ${low.minutes} min, ${low.km.toFixed(1)} km</p><p>No high-risk areas, ${low.mediumRiskKm} km through ${low.mediumRisk} medium-risk ${low.mediumRisk === 1 ? 'area' : 'areas'}</p></div></div>
      </div>
      <p class="hm-trip-foot">That morning the lower-risk route was ${low.minutesQuicker} minutes quicker. Usually it takes a few minutes longer, and a detour that adds too much is thrown out.</p>
    </div>
    <p class="hm-more">${linkQ('How the routing works', 'how-it-works.html')}${linkQ('Everything it does', 'features.html')}</p>
  </div>
</section>`;

const where = `
<section class="sec hm-where" id="where" aria-labelledby="where-h">
  <div class="wrap">
    <h2 class="h2" id="where-h">Does it cover where you drive?</h2>
    <p class="lead">${nMetros} metros and ${zones} rated areas, each rated separately for daytime, evening and night. Everywhere else Tsamaya works as a normal map and navigator. Figures from the live database on ${statsAsOf}.</p>
    <ul class="hm-metros">
      ${metros.map((m) => `<li><a href="${m.slug}.html"><span>${text(m.name)}</span><span class="hm-count">${fmt(m.zones)}</span></a></li>`).join('\n      ')}
    </ul>
    <p class="hm-more">${linkQ('See the coverage map', 'coverage.html')}</p>
  </div>
</section>`;

// The questions people ask first, answered in the HTML (FAQPage below). The
// avoid question is worded the way people put it to an assistant.
const faqs = [F.what, F.avoid, F.data, F.cities, F.longer, F.sos, F.share, F.free, { ...F.guarantee, open: true }];

export default {
  slug: 'index.html',
  title: 'Home',
  description: site.description,
  heroClass: 'sn page-home2',
  hud: false,
  scripts: ['js/metro-hero.js'],
  jsonLd: [faqNode(faqs)],
  body: [
    hero,
    how,
    where,
    faqSec({ id: 'faq', kick: '', title: 'Questions', faqs }),
    getSec({ kick: '', title: 'Put it on your phone', lead: 'Free, in open beta on Android and iPhone. No account and no ads.' }),
  ].join('\n'),
};
