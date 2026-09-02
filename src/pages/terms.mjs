import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { eyebrow } from '../components.mjs';
import { renderMarkdown } from '../markdown.mjs';

// Canonical text: the app repo's legal/TERMS_OF_USE.md, copied to src/content/.
// See the note in privacy.mjs.
const here = dirname(fileURLToPath(import.meta.url));
const md = readFileSync(join(here, '..', 'content', 'terms.md'), 'utf8');
const body = md.replace(/^#\s+.*\n/, '');

const hero = `
<section class="page-hero">
  <div class="wrap">
    ${eyebrow('Legal')}
    <h1>Terms of use</h1>
    <p class="lede center-narrow">The agreement covering your use of Tsamaya, including what the app does not promise.</p>
  </div>
</section>`;

const main = `
<section class="band">
  <div class="wrap">
    <article class="legal-prose">${renderMarkdown(body)}</article>
    <p class="legal-foot"><a href="privacy.html">Privacy policy</a> · <a href="contact.html">Contact us</a></p>
  </div>
</section>`;

export default {
  slug: 'terms.html',
  title: 'Terms of use',
  description:
    'The terms covering your use of Tsamaya, including the safety disclaimer: lower-risk routing is information, not a guarantee, and every driving decision stays yours.',
  body: [hero, main].join('\n'),
};
