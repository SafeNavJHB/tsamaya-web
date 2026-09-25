// updates.mjs: the public changelog, mirroring the app's Settings, What's New.
//
// Content comes from src/data/whats-new.json, which `npm run changelog` generates
// from the app's own src/constants/whatsNew.ts. Same entries, same wording, same
// three categories: nothing is written twice, so the page cannot drift from what
// users see inside the app. (Only the typographic quotes are made straight.)
//
// A timeline, newest first, each release's date on the rail. The filter chips are
// radio buttons and CSS (:checked and :has), so they work without JavaScript and
// with the keyboard (arrow keys move between radios in a group).
import { readFileSync } from 'node:fs';
import { pageHead, sec, linkQ, straight, M } from '../kit.mjs';

const data = JSON.parse(readFileSync(new URL('../data/whats-new.json', import.meta.url), 'utf8'));
const { categories, releases } = data;
const latest = releases[0];
const totalItems = releases.reduce((n, r) => n + r.items.length, 0);

// Escape anything that lands in HTML: the copy comes from another repo.
const esc = (s) => straight(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const countFor = (key) => releases.reduce((n, r) => n + r.items.filter((i) => i.category === key).length, 0);
const ONE = { feature: 'Feature', fix: 'Fix', tweak: 'Tweak' };

const FILTERS = [{ key: 'all', label: 'All', n: totalItems }, ...categories.map((c) => ({ key: c.key, label: c.label, n: countFor(c.key) }))];

const timeline = `
    <h2 class="sr">Every update, newest first</h2>
    <div class="up">
      ${FILTERS.map((f, i) => `<input class="up-f" type="radio" name="up-f" id="f-${f.key}"${i === 0 ? ' checked' : ''}/>`).join('')}
      <div class="chips" data-reveal>
        <span class="hud chips-k">Show</span>
        ${FILTERS.map((f) => `<label class="chip" for="f-${f.key}">${esc(f.label)}<span class="num">${f.n}</span></label>`).join('')}
      </div>
      <ol class="up-tl">
        ${releases.map((r) => `<li class="rel"><h3 class="hud tl-d">${esc(r.date)}</h3><ul class="its">${r.items.map((it) => `<li class="it" data-c="${it.category}"><p class="hud tl-c">${ONE[it.category] || esc(it.category)}</p><h4>${esc(it.title)}</h4><p>${esc(it.body)}</p></li>`).join('')}</ul></li>`).join('\n        ')}
      </ol>
    </div>`;

const stats = `
    <div class="cov-stats up-stats">
      <div data-reveal><b class="num">${releases.length}</b><span class="hud">Updates shipped</span></div>
      <div data-reveal><b class="num">${totalItems}</b><span class="hud">Changes listed</span></div>
      <div data-reveal><b class="num">${countFor('feature')}</b><span class="hud">New features</span></div>
      <div data-reveal><b class="num up-last">${esc(latest.date.replace(/ \d{4}$/, ''))}</b><span class="hud">Most recent</span></div>
    </div>`;

export default {
  slug: 'updates.html',
  title: 'Updates',
  description: `Every update shipped to the Tsamaya app, newest first. ${releases.length} releases and ${totalItems} changes, the most recent on ${latest.date}.`,
  heroClass: 'sn page-updates',
  hud: false,
  body: [
    pageHead({
      meta: `Product updates${M}last update ${esc(latest.date)}`,
      title: "What's new in Tsamaya",
      lead: "Every change that has shipped to the app, newest first. It is the same list you see in Settings under What's New.",
      after: stats,
    }),
    sec({ id: 'log', cls: 'log', head: false, inner: timeline }),
    sec({
      id: 'honest',
      cls: 'tail',
      kick: 'How this page stays honest',
      title: 'Written once, in the app.',
      lead: 'Updates are written in the app and copied here by a script. Nothing on this page is typed out separately, so it cannot drift from what the app itself tells you, and every entry here has shipped. Tsamaya updates over the air, so you get these changes without reinstalling anything.',
      inner: `<p class="more" data-reveal>${linkQ('Get the app', 'get-app.html')}${linkQ('See it in action', 'demo.html')}</p>`,
    }),
  ].join('\n'),
};
