import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { renderMarkdown } from '../markdown.mjs';
import { pageHead, legalText, linkQ } from '../kit.mjs';

// Logbook² terms of use. Text in src/content/logbook2-terms.md; see
// logbook2-privacy.mjs for the pattern.
const here = dirname(fileURLToPath(import.meta.url));
const md = readFileSync(join(here, '..', 'content', 'logbook2-terms.md'), 'utf8');
const { toc, html } = legalText(renderMarkdown(md.replace(/^#\s+.*\n/, '')));

const main = `
<section class="sec legal" aria-label="Logbook² terms of use text">
  <div class="wrap legal-in">
    ${toc}
    <article class="prose">${html}</article>
  </div>
  <p class="wrap legal-foot">${linkQ('Logbook² privacy policy', 'logbook2-privacy.html')}${linkQ('Logbook² support', 'logbook2-support.html')}</p>
</section>`;

export default {
  slug: 'logbook2-terms.html',
  title: 'Logbook² terms of use',
  description:
    'The terms covering your use of the Logbook² pilot logbook app, including the Logbook² Pro subscription and why the pilot stays responsible for the legal validity of their logbook.',
  heroClass: 'sn page-legal',
  hud: false,
  body: [
    pageHead({ meta: 'Legal', title: 'Logbook² terms of use', lead: 'The agreement covering your use of Logbook², including what the app does not promise.' }),
    main,
  ].join('\n'),
};
