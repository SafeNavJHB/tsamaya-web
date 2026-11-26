import { site, baseUrl } from '../../site.config.mjs';
import { pageHead, sec, linkQ } from '../kit.mjs';
import { FLIGHT_APPS, FLIGHT_SOON, appIcon } from '../flight.mjs';

// The flight hub: every Tsamaya app for pilots, with its own page, support and
// policies one tap away. The apps and their policy versions come from
// src/flight.mjs; the company details match the policies and the seller details
// on shortfinals-support.html.
const mail = `<a href="mailto:${site.contactEmail}">${site.contactEmail}</a>`;

const SOON_ICON = '<svg class="fl-icon fl-icon-soon" width="72" height="72" viewBox="0 0 72 72" aria-hidden="true" focusable="false"><rect x="1" y="1" width="70" height="70" rx="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="5 5"/><rect x="20" y="22" width="32" height="30" rx="4" fill="none" stroke="currentColor" stroke-width="2"/><path d="M20 30h32M28 18v8M44 18v8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M29 41l5 4 9-9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const card = (a) => `
      <article class="fl-card">
        <div class="fl-card-h">${appIcon(a)}<div><p class="hud">${a.kind}</p><h3><a href="${a.slug}">${a.name}</a></h3></div></div>
        <p>${a.line}</p>
        <p class="fl-status hud">${a.status}</p>
        <p class="fl-links">${linkQ(`About ${a.name}`, a.slug)}</p>
        <p class="fl-small"><a href="${a.support}">Support</a><a href="${a.privacy}">Privacy policy</a><a href="${a.terms}">Terms of use</a></p>
      </article>`;

const soonCard = (a) => `
      <article class="fl-card fl-soon">
        <div class="fl-card-h">${SOON_ICON}<div><p class="hud">${a.kind}</p><h3>${a.name}</h3></div></div>
        <p>${a.line}</p>
        <p class="fl-status hud">${a.status}</p>
        <p class="fl-small">Its own page, support and policies will be here before it opens to flying schools.</p>
      </article>`;

// The apps go in the page header, so they are the first thing a visitor sees.
const apps = `
    <div class="fl-grid fl-grid-head">${FLIGHT_APPS.map(card).join('')}${FLIGHT_SOON.map(soonCard).join('')}
    </div>`;

const shared = sec({
  id: 'promise',
  kick: 'Across every app',
  title: 'Your records stay yours',
  inner: `
    <dl class="feat-grid feat-3" data-reveal>
      <div><dt class="hud">No account</dt><dd>Nothing to sign up for and no password to forget. You open the app and start.</dd></div>
      <div><dt class="hud">On your phone</dt><dd>Your logbook and your study progress are kept on your phone, and you choose where backups go. Each privacy policy lists exactly what, if anything, leaves it.</dd></div>
      <div><dt class="hud">No ads</dt><dd>No advertising, and we never sell your information. Payments go through the App Store or Google Play, so we never see your card.</dd></div>
    </dl>`,
});

const v = (p) => `version ${p.version}, ${p.effective}`;
const policies = sec({
  id: 'policies',
  kick: 'Policies',
  title: 'Every policy in one place',
  lead: 'Each app has its own privacy policy and terms of use, written for that app. When one changes, its version and date change at the top.',
  inner: `
    <dl class="spec spec-wide fl-policies" data-reveal>
      ${FLIGHT_APPS.map((a) => `<div><dt class="hud">${a.name}</dt><dd><span><a href="${a.privacy}">Privacy policy</a> <span class="fl-ver">${v(a.privacyVersion)}</span></span><span><a href="${a.terms}">Terms of use</a> <span class="fl-ver">${v(a.termsVersion)}</span></span><span><a href="${a.support}">Support</a></span></dd></div>`).join('\n      ')}
      <div><dt class="hud">The company</dt><dd><span><a href="paia.html">PAIA manual</a> <span class="fl-ver">how to ask for records we hold</span></span></dd></div>
      <div><dt class="hud">This website</dt><dd><span><a href="privacy.html#21-our-website">Website privacy</a> <span class="fl-ver">the visitor count on these pages, in section 21 of our main privacy policy</span></span></dd></div>
    </dl>`,
});

const WHO = [
  ['Company', 'Tsamaya (Pty) Ltd, a private company registered in South Africa'],
  ['Registration number', '2023/990736/07'],
  ['Director and Information Officer', 'Kyle Kimble'],
  ['Address, also for legal documents', '10 Audocia Place, Hurlingham Manor, Sandton, 2196, South Africa'],
  ['Telephone', '073 285 5752'],
  ['Email', mail],
];

const who = sec({
  id: 'who',
  kick: 'Who we are',
  title: 'A small South African company',
  lead: 'Tsamaya (Pty) Ltd builds and runs these apps from Johannesburg. We also make <a href="index.html">Tsamaya</a>, a navigation app for drivers.',
  inner: `
    <dl class="spec spec-wide" data-reveal>
      ${WHO.map(([k, val]) => `<div><dt class="hud">${k}</dt><dd>${val}</dd></div>`).join('\n      ')}
    </dl>`,
});

const help = sec({
  id: 'help',
  cls: 'tail',
  kick: 'Get help',
  title: 'Write to us',
  lead: `Email ${mail} and tell us which app you are writing about. We usually reply within two working days. Each app's support page answers the common questions first.`,
  inner: `<p class="more" data-reveal>${FLIGHT_APPS.map((a) => linkQ(`${a.name} support`, a.support)).join('')}</p>`,
});

export default {
  slug: 'flight.html',
  title: 'Tsamaya flight apps',
  headTitle: 'Tsamaya flight apps: Logbook² and Short Finals for South African pilots',
  description:
    'Apps for pilots and student pilots in South Africa from Tsamaya: Logbook², a SA-CATS 61 pilot logbook, and Short Finals, PPL and CPL ground school. Support, privacy policies and terms for each.',
  heroClass: 'sn page-flight',
  hud: false,
  jsonLd: [
    {
      '@type': 'ItemList',
      name: 'Tsamaya flight apps',
      itemListElement: FLIGHT_APPS.map((a, i) => ({ '@type': 'ListItem', position: i + 1, item: { '@id': `${baseUrl}/${a.slug}#app` } })),
    },
  ],
  body: [
    pageHead({
      meta: 'Tsamaya · Flight',
      title: 'Apps for pilots',
      lead: 'A logbook for pilots and a ground school for students, built in South Africa for South African flying. Both are in testing now and coming to the App Store and Google Play. Flight bookings for flying schools are on the way.',
      after: apps,
    }),
    shared,
    policies,
    who,
    help,
  ].join('\n'),
};
