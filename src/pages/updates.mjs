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
//
// The page carries the newest NEWEST releases only, to keep it light. The rest
// are on updates-archive.html; the "Show earlier updates" link below the list
// goes there, and with JavaScript (public/js/updates.js) it fetches that page
// once and adds its releases here, NEWEST at a time.
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

const NEWEST = 10;
const recent = releases.slice(0, NEWEST), earlier = releases.slice(NEWEST);
const countIn = (list, key) => list.reduce((n, r) => n + r.items.filter((i) => key === 'all' || i.category === key).length, 0);
const filtersFor = (list) => [{ key: 'all', label: 'All' }, ...categories].map((c) => ({ key: c.key, label: c.label, n: countIn(list, c.key) }));

const rel = (r) => `<li class="rel"><h3 class="hud tl-d">${esc(r.date)}</h3><ul class="its">${r.items.map((it) => `<li class="it" data-c="${it.category}"><p class="hud tl-c">${ONE[it.category] || esc(it.category)}</p><h4>${esc(it.title)}</h4><p>${esc(it.body)}</p></li>`).join('')}</ul></li>`;

// the chips count everything the page can show: on Updates that includes the
// earlier releases "Show earlier updates" brings in
const timeline = (list, counted, after = '') => `
    <h2 class="sr">Every update, newest first</h2>
    <div class="up">
      ${filtersFor(counted).map((f, i) => `<input class="up-f" type="radio" name="up-f" id="f-${f.key}"${i === 0 ? ' checked' : ''}/>`).join('')}
      <div class="chips" data-reveal>
        <span class="hud chips-k">Show</span>
        ${filtersFor(counted).map((f) => `<label class="chip" for="f-${f.key}">${esc(f.label)}<span class="num">${f.n}</span></label>`).join('')}
      </div>
      <ol class="up-tl">
        ${list.map(rel).join('\n        ')}
      </ol>
      ${after}
    </div>`;

const more = earlier.length
  ? `<p class="up-more-row"><a class="up-more" href="updates-archive.html" data-more="${NEWEST}">Show earlier updates<span class="num">${earlier.length} more</span></a></p>
      <p class="sr" role="status" aria-live="polite" data-more-status></p>`
  : '';

const stats = `
    <div class="cov-stats up-stats">
      <div data-reveal><b class="num">${releases.length}</b><span class="hud">Updates shipped</span></div>
      <div data-reveal><b class="num">${totalItems}</b><span class="hud">Changes listed</span></div>
      <div data-reveal><b class="num">${countFor('feature')}</b><span class="hud">New features</span></div>
      <div data-reveal><b class="num up-last">${esc(latest.date.replace(/ \d{4}$/, ''))}</b><span class="hud">Most recent</span></div>
    </div>`;

const updatesPage = {
  slug: 'updates.html',
  title: 'Updates',
  description: `Every update shipped to the Tsamaya app, newest first. ${releases.length} releases and ${totalItems} changes, the most recent on ${latest.date}.`,
  heroClass: 'sn page-updates',
  hud: false,
  scripts: earlier.length ? ['js/updates.js'] : [],
  body: [
    pageHead({
      meta: `Product updates${M}last update ${esc(latest.date)}`,
      title: "What's new in Tsamaya",
      lead: "Every change that has shipped to the app, newest first: the latest releases here, every earlier one a tap away. It is the same list you see in Settings under What's New.",
      after: stats,
    }),
    sec({ id: 'log', cls: 'log', head: false, inner: timeline(recent, releases, more) }),
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

// Every release before the newest NEWEST: where "Show earlier updates" goes
// without JavaScript, and what it fetches with it.
const oldest = earlier.length ? earlier[earlier.length - 1].date : '';
const archivePage = {
  slug: 'updates-archive.html',
  title: 'Earlier updates',
  description: earlier.length ? `Every earlier update to the Tsamaya app, from ${esc(oldest)} to ${esc(earlier[0].date)}: ${earlier.length} releases. The newest are on the Updates page.` : 'Earlier updates to the Tsamaya app.',
  heroClass: 'sn page-updates',
  hud: false,
  body: [
    pageHead({
      crumb: { href: 'updates.html', label: 'Updates' },
      meta: `Product updates${M}${esc(oldest)} to ${esc(earlier.length ? earlier[0].date : '')}`,
      title: 'Earlier updates',
      lead: `The ${earlier.length} releases before the newest ${NEWEST}, newest first. The latest are on the Updates page.`,
    }),
    sec({ id: 'log', cls: 'log', head: false, inner: timeline(earlier, earlier, `<p class="more">${linkQ('The latest updates', 'updates.html')}</p>`) }),
  ].join('\n'),
};

export default earlier.length ? [updatesPage, archivePage] : [updatesPage];
