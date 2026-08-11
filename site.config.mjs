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
  lockup: 'Tsamaya. Go well.',
  // Short meta description used site-wide unless a page overrides it.
  description:
    'Tsamaya plans driving routes around known crime hotspots in South African metros, using published crime statistics and local knowledge.',

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

  // The app ships to testers via TestFlight (Apple ID 6779297974). No public App
  // Store listing yet.
  betaSubject: 'Tsamaya beta access request',

  // PUBLIC TESTFLIGHT LINK — paste it here and the beta section switches from
  // "ask us for access" to "install it right now", with no reply needed from you.
  //
  // Find it in App Store Connect → your app → TestFlight → Public Link. It looks
  // like https://testflight.apple.com/join/XXXXXXXX and it is meant to be public,
  // so there is nothing sensitive about putting it on the site.
  //
  // Left empty, the page falls back to the email request flow — which still works,
  // it just costs you a manual reply each time.
  testflightPublicLink: '',

  // DIRECT ANDROID DOWNLOAD — the Android beta installs straight from an APK
  // hosted on THIS repo's GitHub Releases (the repo is public; releases are
  // used ONLY for Android APKs and the asset is always named tsamaya.apk, so
  // the evergreen /releases/latest/download/ URL below never changes — publish
  // a new release and every button on the site serves the new build; see
  // docs/ANDROID.md in the app repo for the two-command release flow).
  //
  // WHEN THE PLAY STORE LISTING GOES LIVE: replace `url` with the Play link
  // (https://play.google.com/store/apps/details?id=com.tsamaya.app), delete
  // version/sizeMb/sha256, and trim the install caveats in
  // src/pages/contact.mjs — exactly the same swap the TestFlight link above
  // will get when the App Store listing lands.
  androidApk: {
    url: 'https://github.com/SafeNavJHB/tsamaya-web/releases/latest/download/tsamaya.apk',
    version: '1.4.1 (build 2)',
    updated: '11 August 2026',
    sizeMb: 195,
    sha256: '67f4609641d31335093ee2d85dafeb94b840d6d2d297ee63d5ac08e1dfd88ad1',
  },

  // Legal pages now live on THIS site (src/pages/privacy.mjs + terms.mjs, text
  // rendered from src/content/*.md). They used to be a separate GitHub Pages
  // site — which meant tsamayaapp.co.za/privacy 404'd, and that is the URL the
  // app and the Play listing want. The old site stays up as a fallback for
  // builds already in the field that link to it; it is NOT the canonical copy,
  // so update src/content/ here when the app repo's legal/*.md changes.
  legal: {
    privacy: 'privacy.html',
    terms: 'terms.html',
    legacyHome: 'https://safenavjhb.github.io/tsamaya-legal/',
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

  // Search Console / Bing verification tokens — the content="..." value from the
  // "HTML tag" verification method, not the whole tag. An empty string emits no tag.
  //
  // The Google property is https://tsamayaapp.co.za/ (URL-prefix), owned by
  // 4mkimkyl@gmail.com, verified 28 July 2026 by this meta tag.
  //
  // DO NOT REMOVE THE GOOGLE VALUE. Google re-checks it periodically; if the tag
  // disappears the property silently un-verifies and all Search Console data stops.
  // `npm run check` fails if it goes missing, precisely so that cannot happen quietly.
  verification: {
    google: 'rTbWXci5jDpgA5KzHoly-_DLJzKFaInplMgdGfvlTnM',
    bing: '',
  },

  // Web analytics. OFF by default — set `provider` and the matching field to switch it on.
  //
  // Search Console (already connected) answers the questions that matter most for
  // this site: what people searched, what ranked, what they clicked. This block is
  // for on-site behaviour on top of that — how many people land, and whether they
  // reach the beta request.
  //
  // ⚠️ CHOOSE WITH POPIA IN MIND. Google Analytics sets cookies and profiles
  // visitors, which in South Africa means you need a consent banner before it may
  // run — and a banner on a site this small costs more than the data is worth.
  // The cookieless options below need no banner because they store nothing on the
  // visitor's device and collect no personal information.
  //
  //   provider: 'plausible'   → set `domain` below.        Paid (~$9/mo), cookieless.
  //   provider: 'umami'       → set `src` and `websiteId`. Free if self-hosted, cookieless.
  //   provider: 'cloudflare'  → set `token`.               Free, cookieless.  ← best free fit
  //   provider: 'goatcounter' → set `src`.                 Free for non-commercial, cookieless.
  //   provider: 'ga4'         → set `measurementId`.       Free, BUT cookies → needs consent.
  //
  // LIVE: Cloudflare Web Analytics, set up 28 July 2026 on the
  // Kylekimble@outlook.com account, hostname tsamayaapp.co.za.
  //
  // Cookieless and stores nothing on the visitor's device, so it needs no consent
  // banner. It measures page views, referrers, countries and which pages people
  // land on — not individuals. Dashboard:
  // https://dash.cloudflare.com/ → Analytics → Web Analytics
  //
  // The token is a public beacon identifier, not a secret: it ships in the page
  // source on every load, exactly as Cloudflare intends. Nothing here needs hiding.
  analytics: {
    provider: 'cloudflare',
    token: '433490bfd12f4ce2879cb9ed77833446',
    domain: '',          // plausible
    src: '',             // umami / goatcounter script URL
    websiteId: '',       // umami
    measurementId: '',   // ga4, e.g. 'G-XXXXXXXXXX'
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
  { href: 'updates.html', label: 'Updates' },
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
