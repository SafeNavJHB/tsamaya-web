// Brand copy rules over built pages' visible text.
// Usage: node copylint.mjs <dist> [page.html ...]
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const dist = process.argv[2] || decodeURIComponent(new URL('../../../../dist', import.meta.url).pathname);
const pages = process.argv.slice(3).length ? process.argv.slice(3) : readdirSync(dist).filter((f) => f.endsWith('.html'));
const LEGAL = new Set(['privacy.html', 'terms.html']);
const RULES = [
  ['em dash', /—/],
  ['en dash', /–/],
  ['curly quote', /[‘’“”]/],
  ['"safe route"', /\bsafe(r)? route/i],
  ['"safest"', /\bsafest\b/i],
  ['"stay safe"', /\bstay safe\b/i],
  ['"guarantee" as a claim', /(?<!\b(not a|not a safety|cannot|can't|can not|no app can|never|does it|does not|doesn't|won't|will not)\s)\bguarantee(d|s)?\b(?![^.?!]*\?)/i],
  ['"Asambe"', /\basambe\b/i],
  ['"risk zones" wording', /\brisk zones?\b/i],
  ['comma thousands', /\b\d{1,3},\d{3}\b/],
];

const visible = (html) => html
  .replace(/<script[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<svg[\s\S]*?<\/svg>/gi, (m) => (m.match(/<(title|text)[^>]*>[\s\S]*?<\/\1>/gi) || []).join(' '))
  // alt text is read aloud and indexed: it keeps the same rules (launch review, 2026/09/26)
  .replace(/<img\b[^>]*?\balt="([^"]*)"[^>]*>/gi, ' $1 ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/g, ' ').replace(/&middot;/g, '·').replace(/&amp;/g, '&').replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"')
  .replace(/&rsquo;/g, '’').replace(/&lsquo;/g, '‘').replace(/&ldquo;/g, '“').replace(/&rdquo;/g, '”').replace(/&mdash;/g, '—').replace(/&ndash;/g, '–')
  .replace(/\s+/g, ' ');

let total = 0;
for (const p of pages) {
  const text = visible(readFileSync(join(dist, p), 'utf8'));
  const hits = [];
  for (const [name, re] of RULES) {
    if (LEGAL.has(p) && /dash|quote/.test(name)) continue;
    const g = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g');
    let m;
    while ((m = g.exec(text))) hits.push(`${name}: "...${text.slice(Math.max(0, m.index - 40), m.index + 40).trim()}..."`);
  }
  if (hits.length) { total += hits.length; console.log(`\n${p} (${hits.length})`); hits.slice(0, 12).forEach((h) => console.log('  ' + h)); if (hits.length > 12) console.log(`  ... ${hits.length - 12} more`); }
}
console.log(`\n${total} hit(s) across ${pages.length} page(s)`);
