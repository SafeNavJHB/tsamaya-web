import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { eyebrow } from '../components.mjs';
import { renderMarkdown } from '../markdown.mjs';

// The canonical text lives in the APP repo at legal/PRIVACY_POLICY.md and is
// copied here into src/content/ so this repo builds standalone (CI has no
// access to ~/Projects/SafeNav). When the app repo's copy changes, re-copy it.
const here = dirname(fileURLToPath(import.meta.url));
const md = readFileSync(join(here, '..', 'content', 'privacy.md'), 'utf8');

// Drop the markdown's own leading "# Tsamaya Privacy Policy" — the page hero
// already provides the <h1>, and two would be a duplicate-heading SEO problem.
const body = md.replace(/^#\s+.*\n/, '');

const hero = `
<section class="page-hero">
  <div class="wrap">
    ${eyebrow('Legal')}
    <h1>Privacy policy</h1>
    <p class="lede center-narrow">What Tsamaya does and does not do with your information, under the Protection of Personal Information Act.</p>
  </div>
</section>`;

const main = `
<section class="band">
  <div class="wrap">
    <article class="legal-prose">${renderMarkdown(body)}</article>
    <p class="legal-foot"><a href="terms.html">Terms of use</a> · <a href="contact.html">Contact us</a></p>
  </div>
</section>`;

export default {
  slug: 'privacy.html',
  title: 'Privacy policy',
  description:
    'How Tsamaya handles location, analytics and reports under POPIA: no accounts, no ads, no sale of personal information, and no server-side history of where you go.',
  body: [hero, main].join('\n'),
};
