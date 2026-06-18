import { site, banking, sponsorUses } from '../../site.config.mjs';
import { section, eyebrow, icon, button } from '../components.mjs';

const hero = `
<section class="page-hero page-hero-accent">
  <div class="wrap">
    ${eyebrow('Sponsor us · Donate')}
    <h1>Fund routes that get people home.</h1>
    <p class="lede center-narrow">Tsamaya is independent and self-funded. Every contribution goes directly into mapping more metros, keeping the data fresh, and getting the app into more drivers’ hands.</p>
    <div class="cta-actions center mt">
      ${button('Donate by EFT', '#donate', 'primary')}
      ${button('Sponsor as a business', '#sponsor', 'ghost')}
    </div>
  </div>
</section>`;

const uses = section({
  cls: 'band',
  inner: `
  ${eyebrow('Where it goes')}
  <h2>What your support pays for</h2>
  <div class="use-grid">
    ${sponsorUses
      .map(
        (u) =>
          `<article class="use"><div class="use-ic">${icon(u.icon, 22)}</div><h3>${u.title}</h3><p>${u.body}</p></article>`,
      )
      .join('')}
  </div>`,
});

const tiers = section({
  id: 'sponsor',
  cls: 'band-soft',
  inner: `
  ${eyebrow('For businesses & organisations')}
  <h2 class="center">Sponsorship tiers</h2>
  <p class="sub">Indicative — we’ll happily tailor something. Sponsors get a thank-you and, from Supporter up, a place on this site.</p>
  <div class="tier-grid">
    <article class="tier">
      <h3>Friend</h3>
      <p class="tier-price">R500<span>+ once-off</span></p>
      <ul>
        <li>${icon('check', 16)} Our genuine thanks</li>
        <li>${icon('check', 16)} Early access to new features</li>
      </ul>
      ${button('Chip in', '#donate', 'ghost')}
    </article>
    <article class="tier tier-featured">
      <span class="tier-tag">Most impact</span>
      <h3>Supporter</h3>
      <p class="tier-price">R2,500<span>+ once-off or monthly</span></p>
      <ul>
        <li>${icon('check', 16)} Name / logo on this site</li>
        <li>${icon('check', 16)} A say in which metro we map next</li>
        <li>${icon('check', 16)} Project updates as we ship</li>
      </ul>
      ${button('Become a supporter', '#donate', 'primary')}
    </article>
    <article class="tier">
      <h3>Metro partner</h3>
      <p class="tier-price">R10,000<span>+ / metro</span></p>
      <ul>
        <li>${icon('check', 16)} Sponsor a whole city’s mapping</li>
        <li>${icon('check', 16)} Prominent “city brought to you by” credit</li>
        <li>${icon('check', 16)} Direct line to the founder</li>
      </ul>
      ${button('Talk to us', 'contact.html#sponsor', 'ghost')}
    </article>
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
    ${row('Branch', a.branchName, false)}
    ${row('Branch code', a.branchCode)}
    ${row('SWIFT / BIC', a.swift)}
  </article>`;
}

const donate = section({
  id: 'donate',
  cls: 'band',
  inner: `
  ${eyebrow('Donate by EFT')}
  <h2>Direct bank transfer</h2>
  <p class="sub">South African EFT or international SWIFT. Please use the reference below so we can say thank you.</p>
  <div class="ref-banner">
    ${icon('bolt', 18)} <span>Payment reference:</span> <strong>${banking.reference}</strong>
    <button class="copy-btn" data-copy="${banking.reference}" aria-label="Copy reference">${icon('copy', 14)}</button>
  </div>
  <div class="bank-grid">
    ${banking.accounts.map(accountCard).join('')}
  </div>
  <p class="footnote">${icon('shield', 15)} Tsamaya is an independent project, not a registered public-benefit organisation, so donations aren’t tax-deductible — they’re simply support, and they mean a great deal. Once you’ve sent something, <a href="contact.html">drop us a line</a> so we can thank you properly.</p>`,
});

const cta = `
<section class="cta-band">
  <div class="wrap cta-inner">
    <div><h2>Prefer to talk first?</h2><p>Email us about sponsorship, partnerships, or anything else — no pressure.</p></div>
    <div class="cta-actions">
      <a class="btn btn-primary" href="mailto:${site.contactEmail}?subject=Sponsoring%20Tsamaya">${icon('mail', 16)} Email about sponsorship</a>
      ${button('Contact page', 'contact.html', 'ghost-light')}
    </div>
  </div>
</section>`;

export default {
  slug: 'sponsor.html',
  title: 'Sponsor us & Donate',
  description:
    'Support Tsamaya — sponsor a metro or donate by EFT. Independent, self-funded South African navigation that routes drivers around risk.',
  body: [hero, uses, tiers, donate, cta].join('\n'),
};
