// layout.mjs — the HTML shell wrapped around every page's body.
import { site, nav } from '../site.config.mjs';
import { logoLockup, logoMark, icon } from './components.mjs';

const year = 2026; // build-time constant; Date.* is unavailable in the build sandbox.

function navLinks(active) {
  return nav
    .map(
      (n) =>
        `<a href="${n.href}"${n.href === active ? ' aria-current="page"' : ''}>${n.label}</a>`,
    )
    .join('');
}

// page: { slug, title, description, body, heroClass }
export function renderPage(page) {
  const titleFull =
    page.slug === 'index.html'
      ? `${site.name} — ${site.tagline} Lower-risk routes for South African drivers`
      : `${page.title} · ${site.name}`;
  const desc = page.description || site.description;
  const canonical = site.domain ? `${site.domain}/${page.slug}` : '';

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>${titleFull}</title>
  <meta name="description" content="${desc}"/>
  <meta name="theme-color" content="#0F172A"/>
  ${canonical ? `<link rel="canonical" href="${canonical}"/>` : ''}
  <meta property="og:title" content="${titleFull}"/>
  <meta property="og:description" content="${desc}"/>
  <meta property="og:type" content="website"/>
  <meta property="og:image" content="img/og.svg"/>
  <meta name="twitter:card" content="summary_large_image"/>
  <link rel="icon" type="image/svg+xml" href="img/favicon.svg"/>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
  <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet"/>
  <link rel="stylesheet" href="styles.css"/>
</head>
<body class="${page.heroClass || ''}">
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header" id="top">
    <div class="wrap header-inner">
      ${logoLockup(34)}
      <nav class="primary-nav" aria-label="Primary">
        ${navLinks(page.slug)}
      </nav>
      <a class="btn btn-primary btn-sm header-cta" href="contact.html#beta">Get the app</a>
      <button class="nav-toggle" aria-label="Open menu" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
    </div>
    <nav class="mobile-nav" aria-label="Mobile">
      ${navLinks(page.slug)}
      <a class="btn btn-primary" href="contact.html#beta">Get the app</a>
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
        <p class="footer-note">Driving routes that think about risk, not just speed — for South African metros. <em>Tsamaya</em> (say: ${site.pronunciation}) is Sesotho/Setswana for “go”.</p>
      </div>
      <div class="footer-col">
        <h4>Explore</h4>
        <a href="how-it-works.html">How it works</a>
        <a href="demo.html">See it in action</a>
        <a href="technical.html">Technical details</a>
        <a href="about.html">About us</a>
      </div>
      <div class="footer-col">
        <h4>Support</h4>
        <a href="sponsor.html">Sponsor us</a>
        <a href="sponsor.html#donate">Donate</a>
        <a href="contact.html">Contact</a>
        <a href="contact.html#beta">Join the beta</a>
      </div>
      <div class="footer-col">
        <h4>Legal</h4>
        <a href="${site.legal.privacy}" rel="noopener">Privacy policy</a>
        <a href="${site.legal.terms}" rel="noopener">Terms of use</a>
        <a href="mailto:${site.contactEmail}">${icon('mail', 15)} Email us</a>
      </div>
    </div>
    <div class="wrap footer-bottom">
      <p>© ${year} Tsamaya. Built in Johannesburg. Routes consider risk — they are not a guarantee of safety.</p>
    </div>
  </footer>

  <script src="app.js" defer></script>
</body>
</html>`;
}
