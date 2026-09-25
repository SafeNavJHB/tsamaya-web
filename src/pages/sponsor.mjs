import { site, banking, sponsorUses, fmt } from '../../site.config.mjs';
import { pageHead, sec, linkQ, copyBtn } from '../kit.mjs';

// This page used to be a donation pitch: a "Fund routes that get people home"
// headline, two money buttons above the fold, and a three-card pricing ladder
// with a featured tier and a "Most impact" badge. That is a conversion pattern,
// people recognise it as one, and it sat badly on a free app.
//
// It leads with the ways to help that cost nothing, because those are also the
// ways that help most at this stage: drivers using it, and drivers telling us
// where the map is wrong. Money comes after, with no tiers and no badges.
// The anchors #help, #donate and #sponsor are linked from other pages.

const domain = site.domain.replace(/^https?:\/\//, '');
const FREE = [
  ['Drive with it', 'Every trip you plan is a signal that the mapping in your metro is worth keeping fresh. The routing is free and stays that way, and the route you get does not change based on whether you have given us anything.', linkQ('Get the app', 'get-app.html')],
  ['Tell one other driver', 'One person who drives the same roads you do. That is the whole ask. There is no marketing budget behind this, so word of mouth is how anyone finds out it exists at all.', `<span class="copy-line"><span class="mono">${domain}</span>${copyBtn(domain, 'the website address')}</span>`],
  ['Tell us about a corner we got wrong', 'A road we flag that is fine these days, or a bad one we have missed completely. Local knowledge sits inside the routing model on purpose, and it can only come from people who drive there.', linkQ('Report it by email', `mailto:${site.contactEmail}?subject=${encodeURIComponent('A corner you got wrong')}`)],
  ['Tell us when it annoys you', 'A detour that made no sense, a voice prompt at the wrong moment, a screen you could not read at night. Complaints are more useful to us than compliments, and we would rather hear it than have you quietly stop opening the app.', linkQ('Send feedback', 'contact.html')],
];

const help = sec({
  id: 'help',
  kick: 'Costs you nothing',
  title: 'Four things that help',
  lead: 'These matter more right now than money does. Tsamaya is early, and what it needs most is drivers using it and telling us where it is wrong.',
  inner: `
    <ol class="cards cards-2">
      ${FREE.map(([t, p, act], i) => `<li class="card" data-reveal><span class="hud">0${i + 1}</span><h3>${t}</h3><p>${p}</p><p class="card-act">${act}</p></li>`).join('\n      ')}
    </ol>`,
});

const uses = sec({
  id: 'costs',
  kick: 'In case you are wondering',
  title: 'What money pays for',
  lead: 'Worth knowing before you decide anything. These are the four things that cost real rands.',
  inner: `
    <dl class="feat-grid" data-reveal>
      ${sponsorUses.map((u) => `<div><dt class="hud">${u.title}</dt><dd>${u.body}</dd></div>`).join('\n      ')}
    </dl>`,
});

const AMOUNTS = [
  [100, 'Goes into the running costs. Map tiles, geocoding and the database are all metered, and they tick over every month whether anyone gives anything or not.'],
  [1000, 'Enough to be felt. It is also the point at which we would ask you which metro you want mapped next, if there is one you keep waiting for.'],
  [2500, 'Sponsors a whole new city: the OpenStreetMap and crime data, the scoring, and the review pass that happens before any of it goes near a driver.'],
];

// Bank details as a spec sheet: each value in mono, with a copy button where
// someone would type it into their banking app.
const account = (a) => {
  const row = (k, v, copy) => `<div><dt class="hud">${k}</dt><dd><span class="mono">${v}</span>${copy ? copyBtn(v, k.toLowerCase()) : ''}</dd></div>`;
  return `
      <div class="bank" data-reveal>
        <p class="hud bank-h">${a.bank}${a.type ? ' · ' + a.type.toLowerCase() : ''}</p>
        <dl class="spec">
          ${row('Account holder', a.holder, false)}
          ${row('Account number', a.number, true)}
          ${a.branchName ? row('Branch', a.branchName, false) : ''}
          ${row('Branch code', a.branchCode, true)}
          ${row('SWIFT or BIC', a.swift, true)}
          ${row('Reference', banking.reference, false)}
        </dl>
      </div>`;
};

const donate = sec({
  id: 'donate',
  kick: 'If you would like to chip in',
  title: 'Any amount is fine, including none',
  lead: 'No minimum, no membership, no monthly plan to cancel later. A once-off EFT is the entire system. If you would rather keep your money, please do, and please carry on using the app.',
  inner: `
    <div class="give">
      <dl class="amounts" data-reveal>
        ${AMOUNTS.map(([r, t]) => `<div><dt>R ${fmt(r)}</dt><dd>${t}</dd></div>`).join('\n        ')}
      </dl>
      ${banking.accounts.map(account).join('')}
    </div>
    <p class="fine" data-reveal>Payments go to Tsamaya (Pty) Ltd. We are not a registered public-benefit organisation, so nothing here is tax-deductible, and we would rather say that plainly than have you find out at year end. The reference is only so we can say thank you: staying anonymous is completely fine. So is sending nothing.</p>`,
});

const business = sec({
  id: 'sponsor',
  kick: 'For a company',
  title: 'Sponsoring a metro',
  lead: 'Sponsoring a metro is the one arrangement here with any structure to it: your name on the city you fund, on this site and on its coverage page. There is no rate card and no tier you have to fit into. Tell us the city and the budget and we will work out something that suits both of us.',
  inner: `<p class="more" data-reveal>${linkQ('Email about a metro', `mailto:${site.contactEmail}?subject=${encodeURIComponent('Sponsoring a metro')}`)}</p>`,
});

const tail = sec({
  id: 'more',
  cls: 'tail',
  kick: 'No pressure either way',
  title: 'Give nothing and nothing changes.',
  lead: 'The app stays free, the routes stay the same, and you keep every feature. If you would just like to talk, email reaches Kyle, who reads all of it.',
  inner: `<p class="more" data-reveal>${linkQ('Say hello', `mailto:${site.contactEmail}?subject=${encodeURIComponent('Hello from the Tsamaya site')}`)}${linkQ('Get the app', 'get-app.html')}</p>`,
});

export default {
  slug: 'sponsor.html',
  title: 'Support Tsamaya',
  description:
    "Ways to support Tsamaya, most of them free: drive with it, tell one other driver, report a corner we've got wrong. Bank details for a once-off EFT if you'd like to chip in.",
  heroClass: 'sn page-support',
  hud: false,
  body: [
    pageHead({
      meta: 'Support Tsamaya',
      title: 'Plenty of ways to help. Most of them are free.',
      lead: 'Tsamaya is free to use, carries no ads, and sells nothing about you. If you would like to give something back, this page is the list. Money is one item on it, and it is not the first.',
      after: `\n    <p class="ph-links">${linkQ('The free ways', '#help')}${linkQ('If you would like to chip in', '#donate')}</p>`,
    }),
    help,
    uses,
    donate,
    business,
    tail,
  ].join('\n'),
};
