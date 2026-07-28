// site.config.mjs — single source of truth for the Tsamaya marketing site.
// Everything page-agnostic lives here so copy/links/colours change in one place.
// Plain data only — no dependencies. Edit, then run `node build.mjs`.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// Live coverage figures, refreshed by `npm run stats` and committed to the repo.
// Read from disk rather than `import ... with { type: 'json' }` so the build works
// on every Node 20+ release regardless of import-attribute support.
// The committed file is the build's source of truth — the build never hits the
// network, so it stays reproducible offline and in CI without secrets.
export const stats = JSON.parse(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'src', 'data', 'stats.json'), 'utf8'),
);

// Formats 3254 as "3,254" — thousands separators, no locale dependency.
export const fmt = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

export const site = {
  name: 'Tsamaya',
  pronunciation: 'tsa-MAH-ya',
  tagline: 'Go well.',
  lockup: 'Tsamaya — Go well.',
  // Short meta description used site-wide unless a page overrides it.
  description:
    'Tsamaya plans driving routes that think about risk, not just speed — using public crime statistics and curated local knowledge for South African metros.',

  // No custom domain registered yet → relative URLs, hosted on GitHub Pages for now.
  // When tsamayaapp.co.za is registered & DNS is pointed, set `domain` (e.g.
  // 'https://tsamayaapp.co.za') and add a public/CNAME file with the bare host. All
  // internal links are relative, so the site already works at a root domain, a
  // *.github.io/<repo>/ subpath, or any folder.
  domain: 'https://tsamayaapp.co.za',

  // Absolute base used for canonical tags + social-share (og/twitter) image URLs,
  // which crawlers require to be absolute. Points at the current live host until a
  // custom domain is wired up; when you set `domain` above, that takes precedence.
  ogBase: 'https://safenavjhb.github.io/tsamaya-web',

  // Working contact inbox — iCloud+ Custom Email Domain on tsamayaapp.co.za.
  // Everything that references a contact email (contact page, footer, sponsor) reads from here.
  contactEmail: 'info@tsamayaapp.co.za',

  // The app currently ships to testers via TestFlight (Apple ID 6779297974). No public
  // App Store link yet, so the primary call-to-action requests beta access by email.
  betaSubject: 'Tsamaya beta access request',

  // Existing legal pages already hosted on GitHub Pages.
  legal: {
    privacy: 'https://safenavjhb.github.io/tsamaya-legal/privacy',
    terms: 'https://safenavjhb.github.io/tsamaya-legal/terms',
    home: 'https://safenavjhb.github.io/tsamaya-legal/',
  },

  // Headline coverage — honest to the app's live service areas (the metro bounding
  // boxes in src/constants/cities.ts) plus the data footprint in Supabase.
  coverageLive:
    'Gauteng (Johannesburg, Pretoria, Ekurhuleni and the West Rand), Cape Town, Stellenbosch and Secunda',
  coverageData: stats.metros.map((m) => m.name).join(' · '),

  // Headline figures, derived from the live database — never hand-typed.
  // Refresh with `npm run stats`, then commit src/data/stats.json.
  stats: [
    { value: String(stats.totals.metros), label: 'metros mapped' },
    { value: fmt(stats.totals.zones), label: 'risk zones' },
    { value: fmt(stats.totals.corridorsSafe), label: 'safe corridors' },
    { value: String(stats.totals.riskBands), label: 'risk bands by time of day' },
  ],

  // Search Console / Bing verification tokens. Paste the value from the
  // "HTML tag" verification method (just the content="..." part, not the whole
  // tag). Left empty until the property is claimed — an empty string emits no tag.
  verification: {
    google: '',
    bing: '',
  },
};

// The absolute base URL every canonical, sitemap entry and social image is built
// from. `domain` wins; the GitHub Pages URL is the fallback before a domain exists.
export const baseUrl = (site.domain || site.ogBase || '').replace(/\/$/, '');

// THE canonical URL for a page slug — used by the layout's <link rel="canonical">
// AND by the sitemap generator in build.mjs.
//
// It lives here, shared, because these two used to compute the URL independently
// and drifted: the sitemap advertised `https://tsamayaapp.co.za/` while the page
// itself declared `.../index.html` as canonical. That is two URLs for one page,
// which splits ranking signals on the single most important page on the site.
// One function, one answer, no drift.
export function canonicalFor(slug) {
  if (!baseUrl) return '';
  // The host serves index.html at the bare directory URL, so that is the real
  // address of the page and the one both places must agree on.
  if (slug === 'index.html') return `${baseUrl}/`;
  return `${baseUrl}/${slug}`;
}

// Brand colours — mirrored from the app (src/constants/colors.ts) and the icon spec
// (docs/BRAND.md) so the site and product read as one thing.
export const colors = {
  navy: '#0F172A', // icon tile / deep background
  navy2: '#12122A', // splash background
  emerald: '#34D399', // brand arrow / "go"
  emeraldDeep: '#059669',
  saferGreen: '#50b46e',
  accentBlue: '#0A84FF',
  red: '#dc3c50',
  orange: '#f09632',
  yellow: '#ebc846',
  redHot: '#EF4444',
  amber: '#F59E0B',
};

// Primary navigation. `href` values are relative so the site is host/path agnostic.
export const nav = [
  { href: 'index.html', label: 'Home' },
  { href: 'how-it-works.html', label: 'How it works' },
  { href: 'demo.html', label: 'See it' },
  { href: 'coverage.html', label: 'Coverage' },
  { href: 'technical.html', label: 'Technical' },
  { href: 'about.html', label: 'About' },
  { href: 'sponsor.html', label: 'Sponsor' },
  { href: 'contact.html', label: 'Contact' },
];

// Banking details for direct EFT donations / sponsorships (provided by the founder).
// Reference convention helps reconcile incoming payments.
export const banking = {
  reference: 'Tsamaya + your name',
  accounts: [
    {
      bank: 'Investec',
      logo: 'INV',
      holder: 'Mr KG Kimble',
      type: 'Investec Bank Limited',
      number: '10013287872',
      branchName: 'Investec Bank Grayston Drive',
      branchCode: '580105',
      swift: 'IVESZAJJXXX',
    },
    {
      bank: 'Discovery Bank',
      logo: 'DISC',
      holder: 'Kyle Kimble',
      type: 'Current Account',
      number: '11988334942',
      branchName: 'Discovery Bank',
      branchCode: '679000',
      swift: 'DISCZAJJXXX',
    },
  ],
};

// What sponsorship money actually buys — concrete, honest line items.
export const sponsorUses = [
  {
    icon: 'map',
    title: 'Map another metro',
    body: 'Each new city means fetching OpenStreetMap data, scoring crime density, and a Claude-assisted review pass before anything goes live. Sponsorship funds the next metro.',
  },
  {
    icon: 'server',
    title: 'Keep the lights on',
    body: 'Map tiles, geocoding, routing and the database all sit on metered services. Steady running costs keep the app responsive and the data fresh.',
  },
  {
    icon: 'shield',
    title: 'Refresh the risk data',
    body: 'Crime patterns shift. Regular re-scoring and local-knowledge review keep the routes meaningful rather than stale.',
  },
  {
    icon: 'phone',
    title: 'Ship to more people',
    body: 'Developer accounts, store submission and device testing get Tsamaya out of beta and into the hands of everyday drivers.',
  },
];
