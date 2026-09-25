// kit.mjs: the Sensor page kit for the inner pages (Phase 3). The home page's
// flow sections set the vocabulary (a small square kick, a wide headline, hairline
// rules, mono telemetry labels); these helpers write it for every other page, and
// their styles live in public/styles.css under body.sn.
//
// Pages built with the kit set heroClass 'sn page-<name>' and hud: false (the page
// header carries its own telemetry line). Copy on these pages keeps the brand
// rules: straight quotes, lower-risk language, figures from stats.json only.
import { site } from '../site.config.mjs';

export const M = ' · '; // the telemetry line's separator
export const ARROW = '<svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M4 10h11M11 5l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const COPY = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/></svg>';

// An underlined text link with an arrow (the site's quiet call to action).
export const linkQ = (text, href, attrs = '') => `<a class="link-q" href="${href}"${attrs}><span>${text}</span>${ARROW}</a>`;

// A copy-to-clipboard button (site.js wires every .copy-btn).
export const copyBtn = (value, label) => `<button class="copy-btn" type="button" data-copy="${value}" aria-label="Copy ${label}">${COPY}</button>`;

// The page header: an optional way back, a telemetry line, the h1 and a lead.
// The h1 is not split for a reveal: it is the page's first paint.
export function pageHead({ crumb, meta, title, lead, after = '' }) {
  return `
<header class="ph" aria-labelledby="ph-h">
  <div class="wrap">
    ${crumb ? `<a class="crumb hud" href="${crumb.href}"><span aria-hidden="true">&larr;</span> ${crumb.label}</a>` : ''}
    ${meta ? `<p class="hud ph-meta">${meta}</p>` : ''}
    <h1 class="display" id="ph-h">${title}</h1>
    ${lead ? `<p class="lead ph-lead">${lead}</p>` : ''}${after}
  </div>
</header>`;
}

// A section: kick, headline and lead over its content. id names the section
// (and its heading, id-h, for aria-labelledby).
export function sec({ id, cls = '', kick, title, lead, inner = '', head = true }) {
  const hid = `${id}-h`;
  return `
<section class="sec${cls ? ' ' + cls : ''}" id="${id}"${title ? ` aria-labelledby="${hid}"` : ''}>
  <div class="wrap">${head ? `
    <header class="sec-h">
      ${kick ? `<p class="kick hud" data-reveal>${kick}</p>` : ''}
      ${title ? `<h2 class="h2" id="${hid}" data-split>${title}</h2>` : ''}
      ${lead ? `<p class="lead" data-reveal>${lead}</p>` : ''}
    </header>` : ''}${inner}
  </div>
</section>`;
}

// Questions and answers. Every answer is open in the HTML, so the page reads
// without JavaScript; site.js folds all but the one marked open.
export function faqSec({ id = 'faq', kick = 'Questions', title = 'Straight answers', faqs }) {
  return `
<section class="sec qs" id="${id}" aria-labelledby="${id}-h">
  <div class="wrap faq-in">
    <header class="sec-h">
      <p class="kick hud" data-reveal>${kick}</p>
      <h2 class="h2" id="${id}-h" data-split>${title}</h2>
    </header>
    <div class="faq-list">
      ${faqs.map((f, i) => `<div class="qa"${f.open ? ' data-open' : ''}><h3><button type="button" aria-expanded="true" aria-controls="${id}-a${i + 1}" id="${id}-b${i + 1}">${f.q}<span class="pm" aria-hidden="true"></span></button></h3><div class="qa-a" id="${id}-a${i + 1}" role="region" aria-labelledby="${id}-b${i + 1}"><p>${f.a}</p></div></div>`).join('\n      ')}
    </div>
  </div>
</section>`;
}

// The two store panels and the privacy line (as on the home page). mark:
// data-platform on each panel, so site.js can light the one for the visitor's
// phone without moving anything.
export function storePanels({ steps = false, h = 'h3' } = {}) {
  const android = steps ? `
        <ol class="mini">
          <li>Open the Play Store link on your Android phone.</li>
          <li>Tap Install, as you would for anything else. Play says you are joining a test: that is how beta builds arrive.</li>
          <li>Updates come on their own during the beta.</li>
        </ol>` : '';
  const iphone = steps ? `
        <ol class="mini">
          <li>Open the TestFlight link on your iPhone.</li>
          <li>Install TestFlight if you do not have it, then tap Install for Tsamaya.</li>
          <li>Updates come on their own during the beta.</li>
        </ol>` : '';
  return `
    <div class="get-grid">
      <article class="gp" data-platform="android" data-reveal>
        <p class="hud">Google Play${M}open test</p>
        <${h}>Android</${h}>
        <p>Join the open test on Google Play, then install it like any other app.</p>${android}
        <a class="btn btn-primary btn-lg btn-mag" href="${site.androidPlayLink}" rel="noopener">Get it on Google Play ${ARROW}</a>
      </article>
      <article class="gp" data-platform="ios" data-reveal>
        <p class="hud">TestFlight${M}beta</p>
        <${h}>iPhone</${h}>
        <p>Apple's TestFlight app installs beta apps. Get it first, then open our invite.</p>${iphone}
        <a class="btn btn-primary btn-lg btn-mag" href="${site.testflightPublicLink}" rel="noopener">Join on TestFlight ${ARROW}</a>
      </article>
      <aside class="priv" data-reveal aria-label="Privacy">
        <p class="hud">Privacy</p>
        <p class="priv-b">No account. No trip history kept. No ads.</p>
        <p>Your location is used on your phone to show the map and plan routes. Route requests send bare coordinates to the map provider, never your name. There is no account, and we keep no trip history on our servers unless you choose to share a live trip.</p>
        <p>${linkQ('Privacy policy', site.legal.privacy)}</p>
      </aside>
    </div>`;
}

// The closing "get the app" section most pages end on.
export function getSec({ id = 'get', title = 'Free, and in open beta now.', lead = '' } = {}) {
  return sec({ id, cls: 'get', kick: 'Get the app', title, lead, inner: storePanels() });
}

// A legal page's text (rendered from src/content/*.md): each h2 gets an id, and
// a contents list links to them. Returns { toc, html }.
export function legalText(html) {
  const used = new Set(), items = [];
  // (a table that scrolls sideways is a region the keyboard can reach)
  let tn = 0;
  const out = html.replace(/<div class="table-scroll">/g, () => `<div class="table-scroll" tabindex="0" role="region" aria-label="Table ${++tn}, scrolls sideways">`).replace(/<h2>([\s\S]*?)<\/h2>/g, (m, inner) => {
    const text = inner.replace(/<[^>]+>/g, '');
    let id = text.toLowerCase().replace(/&[a-z]+;/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'part';
    while (used.has(id)) id += '-2';
    used.add(id);
    items.push(`<li><a href="#${id}">${inner}</a></li>`);
    return `<h2 id="${id}">${inner}</h2>`;
  });
  return { toc: `<nav class="toc" aria-label="Contents"><p class="hud">Contents</p><ol>${items.join('')}</ol></nav>`, html: out };
}
