// layout.mjs — the HTML shell wrapped around every page's body.
import { site, nav, baseUrl, canonicalFor } from '../site.config.mjs';
import { logoLockup, logoMark, icon } from './components.mjs';
import { siteGraph } from './seo.mjs';
import { analyticsSnippet } from './analytics.mjs';
import { metros } from './data/metros.mjs';

const year = 2026; // build-time constant; Date.* is unavailable in the build sandbox.

function navLinks(active) {
  return nav
    .map(
      (n) =>
        `<a href="${n.href}"${n.href === active ? ' aria-current="page"' : ''}>${n.label}</a>`,
    )
    .join('');
}

// Every page links to every metro page from the footer. On a site this small that
// is the strongest internal-linking signal available: it means a crawler that
// reaches any page can reach all of them in one hop, and it gives readers a way to
// jump straight to their own city from wherever they landed.
function metroLinks() {
  return metros.map((m) => `<a href="${m.slug}.html">${m.name}</a>`).join('');
}

// Escape text destined for HTML attributes / element text (titles, descriptions).
function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// page: { slug, title, description, body, heroClass }
export function renderPage(page) {
  const titleFull = esc(
    page.slug === 'index.html'
      ? `${site.name}: ${site.tagline} Lower-risk routes for South African drivers`
      : `${page.title} · ${site.name}`,
  );
  const desc = esc(page.description || site.description);
  // Absolute URLs — crawlers require them for canonical tags and social images.
  // canonicalFor() is shared with the sitemap generator so the two cannot drift.
  const canonical = canonicalFor(page.slug);
  const ogImage = baseUrl ? `${baseUrl}/img/og.png` : 'img/og.png';
  // The live-trip tracker is a token-bearing page and must never be indexed.
  const noindex = page.noindex === true;

  return `<!doctype html>
<html lang="en-ZA">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <!-- Marks the document as script-capable before first paint. Every reveal
       animation is scoped to .js, so with JavaScript disabled or still loading
       nothing is hidden waiting for an observer that will never run. -->
  <script>document.documentElement.className+=' js';</script>
  <!-- Never leak the URL (the live-trip tracker carries a bearer ?id= token) in
       the Referer header to Mapbox or any cross-origin request. -->
  <meta name="referrer" content="no-referrer"/>
  <title>${titleFull}</title>
  <meta name="description" content="${desc}"/>
  <meta name="theme-color" content="#0F172A"/>
  ${noindex ? '<meta name="robots" content="noindex,nofollow"/>' : '<meta name="robots" content="index,follow,max-image-preview:large"/>'}
  ${canonical ? `<link rel="canonical" href="${canonical}"/>` : ''}
  ${site.verification.google ? `<meta name="google-site-verification" content="${esc(site.verification.google)}"/>` : ''}
  ${site.verification.bing ? `<meta name="msvalidate.01" content="${esc(site.verification.bing)}"/>` : ''}
  <meta property="og:site_name" content="Tsamaya"/>
  <meta property="og:locale" content="en_ZA"/>
  <meta property="og:title" content="${titleFull}"/>
  <meta property="og:description" content="${desc}"/>
  <meta property="og:type" content="website"/>
  ${canonical ? `<meta property="og:url" content="${canonical}"/>` : ''}
  <meta property="og:image" content="${ogImage}"/>
  <meta property="og:image:type" content="image/png"/>
  <meta property="og:image:width" content="1200"/>
  <meta property="og:image:height" content="630"/>
  <meta property="og:image:alt" content="Tsamaya: lower-risk driving routes for South African metros"/>
  <meta name="twitter:card" content="summary_large_image"/>
  <meta name="twitter:image" content="${ogImage}"/>
  <meta name="twitter:image:alt" content="Tsamaya: lower-risk driving routes for South African metros"/>
  <link rel="icon" type="image/png" sizes="48x48" href="img/favicon.png"/>
  <link rel="icon" type="image/svg+xml" href="img/favicon.svg"/>
  <link rel="apple-touch-icon" href="img/apple-touch-icon.png"/>
  <!-- Fonts are self-hosted (public/fonts/). Previously these came from the
       Google Fonts CDN, which meant a render-blocking request to a third party
       on every page load, plus a DNS + TLS handshake before any text could paint.
       Same files, one origin, preloaded. -->
  <link rel="preload" href="fonts/sora-latin.woff2" as="font" type="font/woff2" crossorigin/>
  <link rel="preload" href="fonts/inter-latin.woff2" as="font" type="font/woff2" crossorigin/>
  <link rel="stylesheet" href="styles.css"/>
  ${siteGraph(page, titleFull, desc)}
</head>
<body class="${page.heroClass || ''}">
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header" id="top">
    <div class="wrap header-inner">
      ${logoLockup(34)}
      <nav class="primary-nav" aria-label="Primary">
        ${navLinks(page.slug)}
      </nav>
      <a class="btn btn-primary btn-sm header-cta" href="get-app.html">Get the app</a>
      <button class="nav-toggle" aria-label="Open menu" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
    </div>
    <nav class="mobile-nav" aria-label="Mobile">
      ${navLinks(page.slug)}
      <a class="btn btn-primary" href="get-app.html">Get the app</a>
    </nav>
  </header>

  <main id="main">
    ${page.body}
  </main>

  <footer class="site-footer">
    <div class="wrap footer-grid">
      <div class="footer-brand">
        ${logoMark(40)}
        <p class="footer-tagline"><strong>${site.lockup}</strong></p>
        <p class="footer-note">Driving routes planned around risk, for South African metros. <em>Tsamaya</em> (say: ${site.pronunciation}) is Sesotho/Setswana for “go”.</p>
      </div>
      <div class="footer-col">
        <h4>Explore</h4>
        <a href="how-it-works.html">How it works</a>
        <a href="demo.html">See it in action</a>
        <a href="coverage.html">Coverage</a>
        <a href="updates.html">Updates</a>
        <a href="technical.html">Technical details</a>
        <a href="about.html">About us</a>
      </div>
      <div class="footer-col">
        <h4>Where it works</h4>
        ${metroLinks()}
      </div>
      <div class="footer-col">
        <h4>Support</h4>
        <a href="sponsor.html">Sponsor us</a>
        <a href="sponsor.html#donate">Donate</a>
        <a href="contact.html">Contact</a>
        <a href="get-app.html">Join the beta</a>
      </div>
      <div class="footer-col">
        <h4>Legal</h4>
        <a href="${site.legal.privacy}">Privacy policy</a>
        <a href="${site.legal.terms}">Terms of use</a>
        <a href="mailto:${site.contactEmail}">${icon('mail', 15)} Email us</a>
      </div>
    </div>
    <div class="wrap footer-bottom">
      <p>© ${year} Tsamaya. Built in Johannesburg. Routes consider risk. They are not a guarantee of safety.</p>
      <p class="footer-admin"><a href="https://admin.tsamayaapp.co.za" rel="noopener nofollow" style="opacity:.35;font-size:12px;text-decoration:none" aria-label="Admin sign-in">Admin</a></p>
    </div>
  </footer>

  <script src="app.js" defer></script>
  ${analyticsSnippet()}
</body>
</html>`;
}
