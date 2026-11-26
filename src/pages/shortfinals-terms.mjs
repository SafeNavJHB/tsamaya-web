import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { renderMarkdown } from '../markdown.mjs';
import { pageHead, legalText, linkQ } from '../kit.mjs';

// Short Finals terms of use. Text in src/content/shortfinals-terms.md; see
// shortfinals-privacy.mjs for the pattern.
const here = dirname(fileURLToPath(import.meta.url));
const md = readFileSync(join(here, '..', 'content', 'shortfinals-terms.md'), 'utf8');
const { toc, html } = legalText(renderMarkdown(md.replace(/^#\s+.*\n/, '')));

const main = `
<section class="sec legal" aria-label="Short Finals terms of use text">
  <div class="wrap legal-in">
    ${toc}
    <article class="prose">${html}</article>
  </div>
  <p class="wrap legal-foot">${linkQ('Short Finals privacy policy', 'shortfinals-privacy.html')}${linkQ('Short Finals support', 'shortfinals-support.html')}${linkQ('About Short Finals', 'shortfinals.html')}</p>
</section>`;

export default {
  slug: 'shortfinals-terms.html',
  title: 'Short Finals terms of use',
  headTitle: 'Short Finals terms of use · Tsamaya',
  description:
    'The terms covering your use of the Short Finals study app for student pilots, including the once-off unlock and why it is a study aid, never a source for flight planning.',
  heroClass: 'sn page-legal',
  hud: false,
  body: [
    pageHead({ crumb: { href: 'shortfinals.html', label: 'Short Finals' }, meta: 'Legal', title: 'Short Finals terms of use', lead: 'The agreement covering your use of Short Finals, including the unlock and what the app does not promise.' }),
    main,
  ].join('\n'),
};
