// flight.mjs: Tsamaya's apps for pilots, once. The flight hub (flight.html), each
// app's landing page, the flight header and footer (layout.mjs) and llms.txt all
// read from here, so a new app or a moved page is one edit.
//
// The legal pages keep the URLs App Store Connect and Google Play already have
// (logbook2-privacy.html and so on). Do not rename them: the stores link to them,
// and GitHub Pages cannot redirect.
//
// Versions and effective dates are read from the policy text itself
// (src/content/*.md, "**Version 1.1. Effective date: 8 November 2026.**"), so the
// hub's list of policies cannot drift from the policies.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { baseUrl } from '../site.config.mjs';

const content = join(dirname(fileURLToPath(import.meta.url)), 'content');

// "Version 1.3. Effective date: 21 November 2026." from a policy's first lines.
function versionOf(file) {
  const md = readFileSync(join(content, file), 'utf8');
  const m = md.match(/\*\*Version ([\d.]+)\. Effective date: ([^*]+?)\.\*\*/);
  if (!m) throw new Error(`${file}: no "**Version X. Effective date: D.**" line near the top`);
  return { version: m[1], effective: m[2] };
}

export const FLIGHT_APPS = [
  {
    key: 'logbook2',
    name: 'Logbook²',
    slug: 'logbook2.html',
    icon: 'img/apps/logbook2',
    kind: 'Pilot logbook',
    line: 'A pilot logbook for South African pilots, with pages formatted to SA-CATS 61. Your flights stay on your phone.',
    status: 'In testing on iPhone and Android',
    privacy: 'logbook2-privacy.html',
    terms: 'logbook2-terms.html',
    support: 'logbook2-support.html',
    privacyVersion: versionOf('logbook2-privacy.md'),
    termsVersion: versionOf('logbook2-terms.md'),
  },
  {
    key: 'shortfinals',
    name: 'Short Finals',
    slug: 'shortfinals.html',
    icon: 'img/apps/shortfinals',
    kind: 'Ground school',
    line: 'Study for the SACAA PPL and CPL theory exams, aeroplane and helicopter, and for the aircraft you fly.',
    status: 'In testing on iPhone and Android',
    privacy: 'shortfinals-privacy.html',
    terms: 'shortfinals-terms.html',
    support: 'shortfinals-support.html',
    privacyVersion: versionOf('shortfinals-privacy.md'),
    termsVersion: versionOf('shortfinals-terms.md'),
  },
];

// Apps on the way. No page and no policies yet: a card on the hub, nothing more.
// Name no partner or school here until there is a signed agreement to do so.
export const FLIGHT_SOON = [
  {
    key: 'bookings',
    name: 'Flight bookings',
    kind: 'For flying schools',
    line: 'Bookings and training flights on your phone, for students, instructors and the school office.',
    status: 'In development',
  },
];

// Every page that wears the flight header and footer.
export const FLIGHT_SLUGS = [
  'flight.html',
  ...FLIGHT_APPS.flatMap((a) => [a.slug, a.privacy, a.terms, a.support]),
];

// The header's links on flight pages.
export const flightNav = [
  { href: 'flight.html', label: 'All flight apps' },
  ...FLIGHT_APPS.map((a) => ({ href: a.slug, label: a.name })),
];

// A 1x/2x app icon. alt is empty when the app's name sits right beside it.
export const appIcon = (app, size = 72, alt = '') =>
  `<img class="fl-icon" src="${app.icon}-192.png" srcset="${app.icon}-192.png 1x, ${app.icon}-384.png 2x" width="${size}" height="${size}" alt="${alt}" loading="lazy" decoding="async"/>`;

// The structured-data node for an app's landing page. Neither app is in a store
// yet, so there is no downloadUrl or offer price; add them on release.
export function appNode(app, { description, category, features }) {
  return {
    '@type': 'MobileApplication',
    '@id': `${baseUrl}/${app.slug}#app`,
    name: app.name,
    url: `${baseUrl}/${app.slug}`,
    description,
    applicationCategory: category,
    operatingSystem: 'iOS, Android',
    image: `${baseUrl}/${app.icon}-384.png`,
    featureList: features,
    inLanguage: 'en-ZA',
    countriesSupported: 'ZA',
    publisher: { '@id': `${baseUrl}/#organisation` },
  };
}
