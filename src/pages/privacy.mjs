import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { renderMarkdown } from '../markdown.mjs';
import { pageHead, legalText, linkQ } from '../kit.mjs';

// The canonical text lives in the APP repo at legal/PRIVACY_POLICY.md and is
// copied here into src/content/ so this repo builds standalone (CI has no
// access to ~/Projects/SafeNav). When the app repo's copy changes, re-copy it.
const here = dirname(fileURLToPath(import.meta.url));
const md = readFileSync(join(here, '..', 'content', 'privacy.md'), 'utf8');

// Drop the markdown's own leading "# Tsamaya Privacy Policy": the page header
// already provides the <h1>, and two would be a duplicate-heading SEO problem.
const { toc, html } = legalText(renderMarkdown(md.replace(/^#\s+.*\n/, '')));

const main = `
<section class="sec legal" aria-label="Privacy policy text">
  <div class="wrap legal-in">
    ${toc}
    <article class="prose">${html}</article>
  </div>
  <p class="wrap legal-foot">${linkQ('Terms of use', 'terms.html')}${linkQ('Contact us', 'contact.html')}</p>
</section>`;

export default {
  slug: 'privacy.html',
  title: 'Privacy policy',
  description:
    'How Tsamaya handles location, analytics and reports under POPIA: no accounts, no ads, no sale of personal information, and no server-side history of where you go.',
  heroClass: 'sn page-legal',
  hud: false,
  body: [
    pageHead({ meta: 'Legal', title: 'Privacy policy', lead: 'What Tsamaya does and does not do with your information, under the Protection of Personal Information Act.' }),
    main,
  ].join('\n'),
};
