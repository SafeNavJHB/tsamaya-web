// topic.mjs: the shell shared by the topic pages (features, closures and
// protests, speed cameras, hotspots, CarPlay and Android Auto, live trip sharing,
// night driving, the two comparison pages and the FAQ hub).
//
// WHY THESE PAGES EXIST. Until 2026-10-01 almost everything the app does beyond
// "lower-risk routes" lived only in the changelog, so a search engine or an AI
// assistant asked about stops, speed cameras, protests or CarPlay had no page of
// its own to quote. Each topic page answers one such question, links to its
// neighbours and carries its own FAQ markup. Copy follows the site's rules:
// lower-risk language (never "safe" as a promise), roads and regions but never a
// suburb as risky, no em dashes, straight quotes, figures from stats.json, and
// other apps named only by the KIND of app they are (Kyle, 2026-09-28).
import { readFileSync } from 'node:fs';
import { faqNode, breadcrumbNode } from './seo.mjs';
import { pageHead, sec, faqSec, getSec, linkQ, M } from './kit.mjs';

// The newest changelog entry is the date the site last described the app. It
// comes from the same file the Updates page reads, so it moves with it.
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const { releases } = JSON.parse(readFileSync(new URL('./data/whats-new.json', import.meta.url), 'utf8'));
const [d, m, y] = releases[0].date.split(' ');
export const LATEST = {
  text: releases[0].date,
  iso: `${y}-${String(MONTHS.indexOf(m) + 1).padStart(2, '0')}-${d.padStart(2, '0')}`,
};

// A related-pages row: [label, href] pairs, written as the site's quiet links.
const related = (links) => sec({
  id: 'related',
  kick: 'Keep reading',
  title: 'More on this',
  inner: `<div class="more" data-reveal>${links.map(([t, h]) => linkQ(t, h)).join('')}</div>`,
});

/**
 * @param {object} o
 * @param {string} o.slug, o.title, o.description  the page's identity (title is unique per page)
 * @param {string} o.meta      the telemetry line under the header, joined with M
 * @param {string} o.h1, o.lead
 * @param {string[]} o.sections  already-built section HTML (kit.sec)
 * @param {{q:string,a:string}[]} [o.faqs]
 * @param {[string,string][]} [o.links]  related pages
 */
export function topicPage({ slug, title, description, meta, h1, lead, sections, faqs = [], links = [], ctaTitle = 'Try it on your next drive.', after = '' }) {
  return {
    slug,
    title,
    description,
    heroClass: 'sn page-visit',
    hud: false,
    modified: LATEST.iso,
    jsonLd: [
      faqs.length ? faqNode(faqs) : null,
      breadcrumbNode([
        { name: 'Home', slug: 'index.html' },
        { name: title, slug },
      ]),
    ],
    body: [
      pageHead({ crumb: slug === 'features.html' ? null : { href: 'features.html', label: 'All features' }, meta: `${meta}${M}as of ${LATEST.text}`, title: h1, lead, after }),
      ...sections,
      links.length ? related(links) : '',
      faqs.length ? faqSec({ id: 'faq', title: 'Asked often', faqs }) : '',
      getSec({ title: ctaTitle, lead: `Free, in open beta, on Android and iPhone. Lower risk is not no risk. ` }),
    ].join('\n'),
  };
}

// A two-column "what it is / what it is not" or any simple table, in the
// markup the visitor page uses (the table scrolls sideways on a phone).
export function table({ label, head, rows }) {
  return `
    <div class="prose" data-reveal>
      <div class="table-scroll" tabindex="0" role="region" aria-label="${label}, scrolls sideways">
        <table>
          <thead><tr>${head.map((h) => `<th scope="col">${h}</th>`).join('')}</tr></thead>
          <tbody>
            ${rows.map(([first, ...rest]) => `<tr><th scope="row">${first}</th>${rest.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('\n            ')}
          </tbody>
        </table>
      </div>
    </div>`;
}

// A feature grid in the home page's markup.
export function grid(items) {
  return `
    <dl class="feat-grid" data-reveal>
      ${items.map(([t, dd]) => `<div><dt class="hud">${t}</dt><dd>${dd}</dd></div>`).join('\n      ')}
    </dl>`;
}

// Prose paragraphs and bullet lists.
export const prose = (...blocks) => `
    <div class="prose" data-reveal>
      ${blocks.join('\n      ')}
    </div>`;
export const ul = (items) => `<ul>${items.map((i) => `<li>${i}</li>`).join('')}</ul>`;
