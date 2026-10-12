import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { renderMarkdown } from '../markdown.mjs';
import { pageHead, legalText, linkQ } from '../kit.mjs';

// The PAIA manual (PAIA s51: published on our website). The canonical text lives
// in the APP repo at legal/PAIA_MANUAL.md and is copied here into src/content/,
// like the Privacy Policy and Terms (the app repo's `npm run check:legal`
// compares all the copies).
const here = dirname(fileURLToPath(import.meta.url));
const md = readFileSync(join(here, '..', 'content', 'paia.md'), 'utf8');

// Drop the markdown's own leading "# …": the page header provides the <h1>.
const { toc, html } = legalText(renderMarkdown(md.replace(/^#\s+.*\n/, '')));

const main = `
<section class="sec legal" aria-label="PAIA manual text">
  <div class="wrap legal-in">
    ${toc}
    <article class="prose">${html}</article>
  </div>
  <p class="wrap legal-foot">${linkQ('Privacy policy', 'privacy.html')}${linkQ('Terms of use', 'terms.html')}${linkQ('Contact us', 'contact.html')}</p>
</section>`;

export default {
  slug: 'paia.html',
  title: 'PAIA manual',
  description:
    'Tsamaya (Pty) Ltd\'s manual under the Promotion of Access to Information Act: our records, how to request them, the fees, and how we process personal information under POPIA.',
  heroClass: 'sn page-legal',
  hud: false,
  body: [
    pageHead({ meta: 'Legal', title: 'PAIA manual', lead: 'How to request a record we hold, what it costs, and how we process personal information.' }),
    main,
  ].join('\n'),
};
