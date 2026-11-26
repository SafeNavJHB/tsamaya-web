import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { renderMarkdown } from '../markdown.mjs';
import { pageHead, legalText, linkQ } from '../kit.mjs';

// Short Finals (the student pilot study app) has its own legal pages, like
// Logbook² (see logbook2-privacy.mjs). The text lives in
// src/content/shortfinals-privacy.md and is rendered here. The app repo's
// docs/store/privacy-policy.md is the draft it came from, with the code
// reference behind each statement.
const here = dirname(fileURLToPath(import.meta.url));
const md = readFileSync(join(here, '..', 'content', 'shortfinals-privacy.md'), 'utf8');

// Drop the markdown's own leading "# Short Finals Privacy Policy": the page
// header already provides the <h1>, and two would be a duplicate-heading SEO problem.
const { toc, html } = legalText(renderMarkdown(md.replace(/^#\s+.*\n/, '')));

const main = `
<section class="sec legal" aria-label="Short Finals privacy policy text">
  <div class="wrap legal-in">
    ${toc}
    <article class="prose">${html}</article>
  </div>
  <p class="wrap legal-foot">${linkQ('Short Finals terms of use', 'shortfinals-terms.html')}${linkQ('Short Finals support', 'shortfinals-support.html')}${linkQ('About Short Finals', 'shortfinals.html')}</p>
</section>`;

export default {
  slug: 'shortfinals-privacy.html',
  title: 'Short Finals privacy policy',
  headTitle: 'Short Finals privacy policy: your study data stays on your phone',
  description:
    'How the Short Finals ground school study app handles your information under POPIA: no accounts, no analytics, no ads, and your progress stays on your phone.',
  heroClass: 'sn page-legal',
  hud: false,
  body: [
    pageHead({ crumb: { href: 'shortfinals.html', label: 'Short Finals' }, meta: 'Legal', title: 'Short Finals privacy policy', lead: 'What Short Finals does and does not do with your information. Short version: your study data stays on your phone.' }),
    main,
  ].join('\n'),
};
