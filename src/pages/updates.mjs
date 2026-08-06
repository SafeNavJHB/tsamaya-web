// updates.mjs — the public changelog, mirroring the app's Settings › What's New.
//
// Content comes from src/data/whats-new.json, which `npm run changelog` generates
// from the app's own src/constants/whatsNew.ts. Same entries, same wording, same
// three category tabs — nothing is written twice, so the page cannot drift from
// what users see inside the app.
//
// The tabs are CSS-only, built on radio inputs. No JavaScript is involved, which
// means they work with scripting disabled, they are keyboard-navigable by default
// (arrow keys move between radios in a group), and there is no flash of the wrong
// tab while a script loads.

import { section, eyebrow, icon, button, iconForIonicon } from '../components.mjs';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const data = JSON.parse(
  readFileSync(join(dirname(dirname(fileURLToPath(import.meta.url))), 'data', 'whats-new.json'), 'utf8'),
);

const { categories, releases } = data;
const latest = releases[0];
const totalItems = releases.reduce((n, r) => n + r.items.length, 0);

// Escape anything that lands in HTML — the copy comes from another repo and
// contains apostrophes, ampersands and quotes.
const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const countFor = (key) =>
  releases.reduce((n, r) => n + r.items.filter((i) => i.category === key).length, 0);

// One panel per category: every release that has an item in that category.
function panel(cat) {
  const withItems = releases
    .map((rel) => ({ ...rel, items: rel.items.filter((i) => i.category === cat.key) }))
    .filter((rel) => rel.items.length > 0);

  if (!withItems.length) {
    return `<div class="up-panel" id="panel-${cat.key}" role="tabpanel"><p class="muted">Nothing here yet.</p></div>`;
  }

  return `<div class="up-panel" id="panel-${cat.key}" role="tabpanel" aria-label="${esc(cat.label)}">
    ${withItems
      .map(
        (rel) => `<section class="up-release">
      <h3 class="up-date">${esc(rel.date)}</h3>
      <ul class="up-list">
        ${rel.items
          .map(
            (it) => `<li class="up-item">
          <span class="up-icon">${icon(iconForIonicon(it.icon, it.category), 18)}</span>
          <span class="up-text">
            <strong>${esc(it.title)}</strong>
            <span>${esc(it.body)}</span>
          </span>
        </li>`,
          )
          .join('')}
      </ul>
    </section>`,
      )
      .join('')}
  </div>`;
}

const hero = `
<section class="page-hero">
  <div class="wrap">
    ${eyebrow('Product updates')}
    <h1>What’s new in Tsamaya</h1>
    <p class="lede center-narrow">Every change that has shipped to the app, newest first. It’s the same list you see in Settings under What’s New. Last update <strong>${esc(latest.date)}</strong>.</p>
    <div class="metro-figures">
      <div class="stat"><span class="stat-value">${releases.length}</span><span class="stat-label">updates shipped</span></div>
      <div class="stat"><span class="stat-value">${totalItems}</span><span class="stat-label">changes listed</span></div>
      <div class="stat"><span class="stat-value">${esc(latest.date.replace(/ \d{4}$/, ''))}</span><span class="stat-label">most recent</span></div>
    </div>
  </div>
</section>`;

const tabs = section({
  cls: 'band',
  inner: `
  <div class="up-tabs">
    ${/* The radios sit here, as DIRECT siblings of both the tab bar and the
          panels. That is load-bearing: the CSS reveals a panel with a sibling
          combinator (#tab-x:checked ~ #panel-x), which only matches between
          siblings. Nesting them inside the tab bar silently hides every panel. */ ''}
    ${categories
      .map(
        (c, i) =>
          `<input class="up-radio" type="radio" name="up-tab" id="tab-${c.key}"${i === 0 ? ' checked' : ''}/>`,
      )
      .join('')}
    <div class="up-tabbar" role="tablist" aria-label="Filter updates by type">
      ${categories
        .map(
          (c) =>
            `<label class="up-tab" for="tab-${c.key}">${esc(c.label)}<span class="up-count">${countFor(c.key)}</span></label>`,
        )
        .join('')}
    </div>
    ${categories.map(panel).join('')}
  </div>`,
});

const note = section({
  cls: 'band-soft',
  inner: `
  <div class="note-card">
    <h3>${icon('shield', 20)} How this page stays honest</h3>
    <p>Updates are written once, in the app, and copied here by a script. Nothing on this page is typed out separately, so it cannot drift from what the app itself tells you. Every entry here has actually shipped. Tsamaya updates over the air, so you get these changes without reinstalling anything.</p>
  </div>`,
});

const cta = `
<section class="cta-band">
  <div class="wrap cta-inner">
    <div>
      <h2>Want the next one first?</h2>
      <p>Tsamaya is in open beta on iPhone. Join and you’ll get every update as it ships.</p>
    </div>
    <div class="cta-actions">
      ${button('Join the beta', 'get-app.html', 'primary')}
      ${button('See it in action', 'demo.html', 'ghost-light')}
    </div>
  </div>
</section>`;

export default {
  slug: 'updates.html',
  title: 'Updates',
  description: `Every update shipped to the Tsamaya app, newest first. ${releases.length} releases and ${totalItems} changes, the most recent on ${latest.date}.`,
  heroClass: 'page-updates',
  body: [hero, tabs, note, cta].join('\n'),
};
