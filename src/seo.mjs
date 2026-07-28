// seo.mjs — structured data (JSON-LD) for the site.
//
// WHAT THIS IS
// Search engines read normal page text, but they read *structured data* with far
// more confidence, because it is unambiguous. Marking up "Tsamaya is a free iOS
// navigation app made by a South African company" in JSON-LD is the difference
// between Google inferring that and Google knowing it. It is also what makes
// FAQ answers eligible to appear directly in results.
//
// The site previously had none at all — zero JSON-LD blocks across every page.
//
// HOW IT WORKS
// Everything goes into one `@graph` per page: the site-wide nodes (the company,
// the website, the app) plus whatever that specific page adds (an FAQ list, a
// breadcrumb trail). Nodes reference each other by @id, which is how you tell a
// crawler "the publisher of this website is that organisation" rather than
// repeating the organisation's details on every node.
//
// Validate changes at https://validator.schema.org/ or in Search Console's
// Rich Results Test before shipping.

import { site, stats, baseUrl, canonicalFor } from '../site.config.mjs';

// Stable @id anchors. The trailing fragment is conventional and lets other nodes
// point at these without duplicating them.
export const ID = {
  org: `${baseUrl}/#organisation`,
  website: `${baseUrl}/#website`,
  app: `${baseUrl}/#app`,
};

// The company behind the app.
function organisation() {
  return {
    '@type': 'Organization',
    '@id': ID.org,
    name: 'Tsamaya',
    legalName: 'Tsamaya (Pty) Ltd',
    url: `${baseUrl}/`,
    logo: {
      '@type': 'ImageObject',
      url: `${baseUrl}/img/icon.png`,
      width: 512,
      height: 512,
    },
    email: site.contactEmail,
    slogan: site.tagline,
    description: site.description,
    foundingLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Johannesburg',
        addressCountry: 'ZA',
      },
    },
    areaServed: stats.metros.map((m) => ({
      '@type': 'City',
      name: m.name,
      address: { '@type': 'PostalAddress', addressCountry: 'ZA' },
    })),
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: site.contactEmail,
      areaServed: 'ZA',
      availableLanguage: ['en'],
    },
  };
}

function website() {
  return {
    '@type': 'WebSite',
    '@id': ID.website,
    url: `${baseUrl}/`,
    name: site.name,
    description: site.description,
    publisher: { '@id': ID.org },
    inLanguage: 'en-ZA',
  };
}

// The product itself. This is the node that can earn an app rich result.
function application() {
  return {
    '@type': 'MobileApplication',
    '@id': ID.app,
    name: site.name,
    alternateName: 'Tsamaya — Go well.',
    url: `${baseUrl}/`,
    // Free text, but these are the values Google's own docs use.
    applicationCategory: 'TravelApplication',
    applicationSubCategory: 'Navigation',
    operatingSystem: 'iOS 16.0 or later',
    description: site.description,
    publisher: { '@id': ID.org },
    author: { '@id': ID.org },
    inLanguage: 'en-ZA',
    screenshot: `${baseUrl}/img/og.png`,
    featureList: [
      'Risk-aware route planning for South African metros',
      'Time-of-day risk bands for day, evening and night',
      'Turn-by-turn navigation with live safety indication',
      'CarPlay support',
      'Live trip sharing with a trusted contact',
    ],
    // Honest: the app is genuinely free, and there is no public rating to claim.
    // Never invent an aggregateRating — fabricated review markup is a manual-action
    // penalty, and there is no version of that trade that is worth it.
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'ZAR',
      availability: 'https://schema.org/InStock',
    },
  };
}

/**
 * An FAQPage node. Google can surface these answers directly in results.
 * @param {{q: string, a: string}[]} faqs
 */
export function faqNode(faqs) {
  if (!faqs || !faqs.length) return null;
  return {
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

/**
 * A breadcrumb trail, e.g. Home › Coverage › Johannesburg.
 * @param {{name: string, slug: string}[]} trail  ordered, root first
 */
export function breadcrumbNode(trail) {
  if (!trail || trail.length < 2) return null;
  return {
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((t, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: t.name,
      item: canonicalFor(t.slug),
    })),
  };
}

/**
 * A WebPage node tying the page to the site and the organisation. Gives every
 * page an explicit identity rather than leaving crawlers to infer one.
 */
function webPage(page, title, description) {
  return {
    '@type': 'WebPage',
    '@id': `${canonicalFor(page.slug)}#webpage`,
    url: canonicalFor(page.slug),
    name: title,
    description,
    isPartOf: { '@id': ID.website },
    about: { '@id': ID.app },
    publisher: { '@id': ID.org },
    inLanguage: 'en-ZA',
  };
}

/**
 * Build the complete JSON-LD block for a page.
 * Pages opt into extra nodes by exporting `jsonLd: [...]` (see src/pages/*.mjs).
 */
export function siteGraph(page, title, description) {
  if (!baseUrl) return '';

  const graph = [organisation(), website(), webPage(page, title, description)];

  // The app node belongs on pages that are actually about the product, not on
  // the sponsor or contact pages — repeating it everywhere dilutes rather than
  // reinforces, and gives crawlers conflicting signals about what each page is.
  const APP_PAGES = new Set(['index.html', 'how-it-works.html', 'demo.html', 'technical.html', 'coverage.html']);
  if (APP_PAGES.has(page.slug)) graph.push(application());

  for (const node of page.jsonLd || []) if (node) graph.push(node);

  const json = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });
  // JSON-LD sits in a <script> block, so the one character that can break out of
  // it is the "<" of a closing tag. Escaping it keeps the document well-formed
  // no matter what ends up in a description or FAQ answer.
  return `<script type="application/ld+json">${json.replace(/</g, '\\u003c')}</script>`;
}
