import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { renderMarkdown } from '../markdown.mjs';
import { pageHead, legalText, linkQ } from '../kit.mjs';

// Logbook² (the pilot logbook app) has its own legal pages, separate from
// Tsamaya's navigation-app policy in privacy.mjs. Same pattern: the text lives
// in src/content/logbook2-privacy.md and is rendered here.
const here = dirname(fileURLToPath(import.meta.url));
const md = readFileSync(join(here, '..', 'content', 'logbook2-privacy.md'), 'utf8');

// Drop the markdown's own leading "# Logbook² Privacy Policy": the page header
// already provides the <h1>, and two would be a duplicate-heading SEO problem.
const { toc, html } = legalText(renderMarkdown(md.replace(/^#\s+.*\n/, '')));

const main = `
<section class="sec legal" aria-label="Logbook² privacy policy text">
  <div class="wrap legal-in">
    ${toc}
    <article class="prose">${html}</article>
  </div>
  <p class="wrap legal-foot">${linkQ('Logbook² terms of use', 'logbook2-terms.html')}${linkQ('Logbook² support', 'logbook2-support.html')}</p>
</section>`;

export default {
  slug: 'logbook2-privacy.html',
  title: 'Logbook² privacy policy',
  description:
    'How the Logbook² pilot logbook app handles your information under POPIA: everything stays on your device, with no accounts, no servers, no analytics and no advertising.',
  heroClass: 'sn page-legal',
  hud: false,
  body: [
    pageHead({ meta: 'Legal', title: 'Logbook² privacy policy', lead: 'What Logbook² does and does not do with your information. Short version: your logbook stays on your phone.' }),
    main,
  ].join('\n'),
};
