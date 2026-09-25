import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { renderMarkdown } from '../markdown.mjs';
import { pageHead, legalText, linkQ } from '../kit.mjs';

// Canonical text: the app repo's legal/TERMS_OF_USE.md, copied to src/content/.
// See the note in privacy.mjs.
const here = dirname(fileURLToPath(import.meta.url));
const md = readFileSync(join(here, '..', 'content', 'terms.md'), 'utf8');
const { toc, html } = legalText(renderMarkdown(md.replace(/^#\s+.*\n/, '')));

const main = `
<section class="sec legal" aria-label="Terms of use text">
  <div class="wrap legal-in">
    ${toc}
    <article class="prose">${html}</article>
  </div>
  <p class="wrap legal-foot">${linkQ('Privacy policy', 'privacy.html')}${linkQ('Contact us', 'contact.html')}</p>
</section>`;

export default {
  slug: 'terms.html',
  title: 'Terms of use',
  description:
    'The terms covering your use of Tsamaya, including the safety disclaimer: lower-risk routing is information, not a guarantee, and every driving decision stays yours.',
  heroClass: 'sn page-legal',
  hud: false,
  body: [
    pageHead({ meta: 'Legal', title: 'Terms of use', lead: 'The agreement covering your use of Tsamaya, including what the app does not promise.' }),
    main,
  ].join('\n'),
};
