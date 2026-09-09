import { site, banking, sponsorUses } from '../../site.config.mjs';
import { section, eyebrow, icon, button } from '../components.mjs';

// This page used to be a donation pitch: a "Fund routes that get people home"
// headline, two money buttons above the fold, and a three-card pricing ladder
// with a featured tier and a "Most impact" badge. That is a conversion pattern,
// people recognise it as one, and it sat badly on a free safety app.
//
// It now leads with the ways to help that cost nothing, because those are also
// the ways that help most at this stage: drivers using it, and drivers telling
// us where the map is wrong. Money comes after, with no tiers and no badges.

const hero = `
<section class="page-hero page-hero-accent">
  <div class="wrap">
    ${eyebrow('Support Tsamaya')}
    <h1>Plenty of ways to help.<br/>Most of them are free.</h1>
    <p class="lede center-narrow">Tsamaya is free to use, carries no ads, and sells nothing about you. If you’d like to give something back, this page is the list. Money is one item on it, and it isn’t the first.</p>
    <div class="cta-actions center mt">
      ${button('The free ways', '#help', 'primary')}
      ${button('If you’d like to chip in', '#donate', 'ghost')}
    </div>
  </div>
</section>`;

const help = section({
  id: 'help',
  cls: 'band',
  inner: `
  ${eyebrow('Costs you nothing')}
  <h2>Four things that genuinely help</h2>
  <p class="sub">These matter more right now than money does. Tsamaya is early, and what it needs most is drivers using it and telling us where it’s wrong.</p>
  <div class="use-grid">
    <article class="use">
      <div class="use-ic">${icon('car', 22)}</div>
      <h3>Drive with it</h3>
      <p>Every trip you plan is a signal that the mapping in your metro is worth keeping fresh. The safety side of the app is free and stays that way, and the route you get doesn’t change based on whether you’ve given us anything.</p>
      <p class="use-link"><a href="get-app.html">${icon('phone', 15)} Get the app</a></p>
    </article>
    <article class="use">
      <div class="use-ic">${icon('share', 22)}</div>
      <h3>Tell one other driver</h3>
      <p>One person who drives the same roads you do. That’s the whole ask. There’s no marketing budget behind this, so word of mouth is how anyone finds out it exists at all.</p>
      <p class="use-link"><span class="use-url">tsamayaapp.co.za</span> <button class="copy-btn" data-copy="${site.domain}" aria-label="Copy the website address">${icon('copy', 14)}</button></p>
    </article>
    <article class="use">
      <div class="use-ic">${icon('flag', 22)}</div>
      <h3>Tell us about a corner we got wrong</h3>
      <p>A road we’ve flagged that’s perfectly fine these days, or a bad one we’ve missed completely. Local knowledge sits inside the routing model on purpose, and it can only come from people who drive there.</p>
      <p class="use-link"><a href="mailto:${site.contactEmail}?subject=Risk%20area%20report">${icon('mail', 15)} Report an area</a></p>
    </article>
    <article class="use">
      <div class="use-ic">${icon('chat', 22)}</div>
      <h3>Tell us when it annoys you</h3>
      <p>A detour that made no sense, a voice prompt at the wrong moment, a screen you couldn’t read at night. Complaints are more useful to us than compliments, and we’d rather hear it than have you quietly stop opening the app.</p>
      <p class="use-link"><a href="contact.html">${icon('chat', 15)} Send feedback</a></p>
    </article>
  </div>`,
});

const uses = section({
  cls: 'band-soft',
  inner: `
  ${eyebrow('In case you’re wondering')}
  <h2>What money actually pays for</h2>
  <p class="sub">Worth knowing before you decide anything. These are the four things that cost real rands.</p>
  <div class="use-grid">
    ${sponsorUses
      .map(
        (u) =>
          `<article class="use"><div class="use-ic">${icon(u.icon, 22)}</div><h3>${u.title}</h3><p>${u.body}</p></article>`,
      )
      .join('')}
  </div>`,
});

function accountCard(a) {
  const row = (label, value, copy = true) => `
    <div class="bank-row">
      <span class="bank-label">${label}</span>
      <span class="bank-value">${value}${
        copy
          ? ` <button class="copy-btn" data-copy="${value}" aria-label="Copy ${label}">${icon('copy', 14)}</button>`
          : ''
      }</span>
    </div>`;
  return `
  <article class="bank-card">
    <header class="bank-head">
      <span class="bank-logo">${a.logo}</span>
      <div><h3>${a.bank}</h3><p>${a.type}</p></div>
    </header>
    ${row('Account holder', a.holder, false)}
    ${row('Account number', a.number)}
    ${a.branchName ? row('Branch', a.branchName, false) : ''}
    ${row('Branch code', a.branchCode)}
    ${row('SWIFT / BIC', a.swift)}
  </article>`;
}

const donate = section({
  id: 'donate',
  cls: 'band',
  inner: `
  ${eyebrow('If you’d like to chip in')}
  <h2>Any amount is fine, including none</h2>
  <p class="sub">No minimum, no membership, no monthly plan to cancel later. A once-off EFT is the entire system. If you’d rather keep your money, please do, and please carry on using the app.</p>
  <div class="give-list">
    <div class="give-row">
      <span class="give-amount">R 100</span>
      <p>Goes into the running costs. Map tiles, geocoding and the database are all metered, and they tick over every month whether anyone gives anything or not.</p>
    </div>
    <div class="give-row">
      <span class="give-amount">R 1 000</span>
      <p>Enough to be felt. It’s also the point at which we’d ask you which metro you want mapped next, if there’s one you keep waiting for.</p>
    </div>
    <div class="give-row">
      <span class="give-amount">R 2 500</span>
      <p>Sponsors a whole new city: the OpenStreetMap and crime data, the scoring, and the review pass that happens before any of it goes near a driver.</p>
    </div>
  </div>
  <div class="ref-banner">
    ${icon('bolt', 18)} <span>If you’d like a thank-you, use the reference:</span> <strong>${banking.reference}</strong>
    <button class="copy-btn" data-copy="${banking.reference}" aria-label="Copy reference">${icon('copy', 14)}</button>
  </div>
  <div class="bank-grid${banking.accounts.length === 1 ? ' bank-grid-one' : ''}">
    ${banking.accounts.map(accountCard).join('')}
  </div>
  <p class="footnote">${icon('shield', 15)} Payments go to Tsamaya (Pty) Ltd. We’re not a registered public-benefit organisation, so nothing here is tax-deductible, and we’d rather say that plainly than have you find out at year end. Staying anonymous is completely fine. So is sending nothing.</p>`,
});

const business = section({
  id: 'sponsor',
  cls: 'band-soft',
  inner: `
  <div class="note-card">
    <h3>${icon('map', 20)} If you’re asking on behalf of a company</h3>
    <p>Sponsoring a metro is the one arrangement here with any structure to it: your name on the city you fund, on this site and on its coverage page. There’s no rate card and no tier you have to fit into. Tell us the city and the budget and we’ll work out something that suits both of us.</p>
    <p class="mt"><a class="btn btn-ghost btn-sm" href="mailto:${site.contactEmail}?subject=Sponsoring%20a%20metro">${icon('mail', 15)} Email about a metro</a></p>
  </div>`,
});

const cta = `
<section class="cta-band">
  <div class="wrap cta-inner">
    <div><h2>No pressure either way.</h2><p>Give nothing and the app stays free, the routes stay the same, and you keep every feature. If you’d just like to talk, email reaches Kyle, who reads all of it.</p></div>
    <div class="cta-actions">
      <a class="btn btn-primary" href="mailto:${site.contactEmail}?subject=Hello%20from%20the%20Tsamaya%20site">${icon('mail', 16)} Say hello</a>
      ${button('Get the app', 'get-app.html', 'ghost-light')}
    </div>
  </div>
</section>`;

export default {
  slug: 'sponsor.html',
  title: 'Support Tsamaya',
  description:
    'Ways to support Tsamaya, most of them free: drive with it, tell one other driver, report a corner we’ve got wrong. Bank details for a once-off EFT if you’d like to chip in.',
  body: [hero, help, uses, donate, business, cta].join('\n'),
};
