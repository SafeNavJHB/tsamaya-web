// site.config.mjs — single source of truth for the Tsamaya marketing site.
// Everything page-agnostic lives here so copy/links/colours change in one place.
// Plain data only — no dependencies. Edit, then run `node build.mjs`.

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

  // Working contact inbox. Swap to a domain mailbox (e.g. hello@tsamaya.app) once the
  // domain is live; everything that references contact email reads from here.
  contactEmail: '4mkimkyl@gmail.com',

  // The app currently ships to testers via TestFlight (Apple ID 6779297974). No public
  // App Store link yet, so the primary call-to-action requests beta access by email.
  betaSubject: 'Tsamaya beta access request',

  // Existing legal pages already hosted on GitHub Pages.
  legal: {
    privacy: 'https://safenavjhb.github.io/tsamaya-legal/privacy',
    terms: 'https://safenavjhb.github.io/tsamaya-legal/terms',
    home: 'https://safenavjhb.github.io/tsamaya-legal/',
  },

  // Headline coverage — honest to the app's live service areas (the two GPS bounding
  // boxes in app/index.tsx) plus the data footprint in Supabase.
  coverageLive: 'Gauteng (Johannesburg, Pretoria, the East & West Rand) and Cape Town',
  coverageData: 'Johannesburg · Pretoria · Cape Town · East Rand · Secunda',

  // Rounded-down, honest figures from the live Supabase project (June 2026).
  stats: [
    { value: '5', label: 'metros mapped' },
    { value: '2,500+', label: 'risk zones' },
    { value: '1,100+', label: 'safe corridors' },
    { value: '3', label: 'risk bands by time of day' },
  ],
};

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
