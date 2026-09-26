// layout.mjs — the HTML shell wrapped around every page's body.
import { site, nav, baseUrl, canonicalFor, stats, fmt } from '../site.config.mjs';
import { logoLockup, logoMark, icon } from './components.mjs';
import { siteGraph } from './seo.mjs';
import { analyticsSnippet } from './analytics.mjs';
import { metros } from './data/metros.mjs';

const year = 2026; // build-time constant; Date.* is unavailable in the build sandbox.

function navLinks(active) {
  return nav
    .filter((n) => n.primary)
    .map(
      (n) =>
        `<a href="${n.href}"${n.href === active ? ' aria-current="page"' : ''}>${n.label}</a>`,
    )
    .join('');
}

// The mobile menu: the primary items large, the secondary ones in a small row
// underneath, so nothing in the old nine-item bar becomes unreachable on a phone.
function mobileLinks(active) {
  const cur = (n) => (n.href === active ? ' aria-current="page"' : '');
  const primary = nav.filter((n) => n.primary).map((n) => `<a class="mnav-link" href="${n.href}"${cur(n)}>${n.label}</a>`).join('');
  const more = nav.filter((n) => !n.primary).map((n) => `<a href="${n.href}"${cur(n)}>${n.label}</a>`).join('');
  return `${primary}<div class="mnav-more">${more}</div>`;
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


// The arrow on primary actions. It nudges right on hover (styles.css).
const arrow = '<svg width="16" height="16" viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M4 10h11M11 5l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

// The telemetry strip under the header on content pages. The time and band are
// filled in by site.js from the South African clock; without JavaScript the
// strip still carries the coverage, which is written in at build time.
function hudStrip() {
  return `  <div class="wrap hud-strip" aria-label="Live status">
    <span class="hud hud-live" data-sa-clock>South African time</span>
    <span class="hud">${stats.totals.metros} metros \u00b7 ${fmt(stats.totals.zones)} rated areas \u00b7 3 time bands</span>
  </div>
`;
}

// page: { slug, title, description, body, heroClass, hud, scripts, noindex, root }
//   hud: false hides the telemetry strip (pages with their own scene HUD).
//   scripts: extra ES modules for this page only (the 3D scene, the map).
//   root: write every relative URL from this root instead (the 404 page, which
//   GitHub Pages serves at any depth). Not a <base href>: that would also send
//   the page's own #links, the skip link among them, to the home page.
export function renderPage(page) {
  const html = pageHtml(page);
  return page.root ? fromRoot(html, page.root) : html;
}

// Relative URLs in href, src and srcset, rewritten from the given root. Page
// fragments (#main), absolute URLs and mailto:/tel:/data: links are left alone.
const LOCAL = /^(?![#/]|[a-z][a-z0-9+.-]*:)/i;
function fromRoot(html, root) {
  const fix = (u) => (LOCAL.test(u) ? root + u : u);
  return html
    .replace(/\b(href|src)="([^"]*)"/g, (m, a, u) => `${a}="${fix(u)}"`)
    .replace(/\bsrcset="([^"]*)"/g, (m, v) => `srcset="${v.split(',').map((c) => c.trim().replace(/^\S+/, fix)).join(', ')}"`);
}

function pageHtml(page) {
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
  <!-- Light or dark before first paint: the visitor's own choice if they made
       one (the header's sun and moon button, site.js), else the device's.
       Without JavaScript the stylesheet follows the device by itself. -->
  <!-- (A browser without light-dark() stays dark: the stylesheet has no light
       values for it. The first wheel, touch or key is noted for site.js, which
       then leaves the scroll position alone.)
       The 3D city and the maps follow the theme too. ?scenes=dark (remembered
       for the tab) keeps them as night panels in a light page instead, the
       other way to do light mode; ?scenes=light goes back. -->
  <script>(function(){var d=document.documentElement,t,s;try{t=localStorage.getItem('ts-theme')}catch(e){}if(t!=='light'&&t!=='dark')t=window.matchMedia&&matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';if(!(window.CSS&&CSS.supports&&CSS.supports('color','light-dark(#000,#fff)')))t='dark';d.setAttribute('data-theme',t);['wheel','touchstart','keydown','mousedown'].forEach(function(e){addEventListener(e,function(){window.__tsMoved=1},{once:true,passive:true})});try{s=new URLSearchParams(location.search).get('scenes');if(s)sessionStorage.setItem('ts-scenes',s);s=sessionStorage.getItem('ts-scenes')}catch(e){}if(s==='dark')d.setAttribute('data-scenes','dark')})();</script>
  <meta name="color-scheme" content="dark light"/>
  <!-- Never leak the URL (the live-trip tracker carries a bearer ?id= token) in
       the Referer header to Mapbox or any cross-origin request. -->
  <meta name="referrer" content="no-referrer"/>
  <title>${titleFull}</title>
  <meta name="description" content="${desc}"/>
  <meta name="theme-color" content="#0A0F1C" media="(prefers-color-scheme: dark)"/>
  <meta name="theme-color" content="#F4F6F9" media="(prefers-color-scheme: light)"/>
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
  <!-- Fonts are self-hosted (public/fonts/): same origin, preloaded, no
       render-blocking request to a third party. Archivo carries the text,
       Martian Mono the small telemetry readouts. -->
  <link rel="preload" href="fonts/archivo-latin.woff2" as="font" type="font/woff2" crossorigin/>
  <link rel="preload" href="fonts/martian-mono-latin.woff2" as="font" type="font/woff2" crossorigin/>
  <link rel="stylesheet" href="styles.css"/>
  ${siteGraph(page, titleFull, desc)}
</head>
<body class="${page.heroClass || ''}">
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header" id="top">
    <div class="wrap header-inner">
      ${logoLockup(30)}
      <nav class="primary-nav" aria-label="Primary">
        ${navLinks(page.slug)}
      </nav>
      <a class="btn btn-primary btn-sm header-cta btn-mag" href="get-app.html">Get the app ${arrow}</a>
      <button class="theme-toggle" type="button" data-theme-toggle aria-label="Switch to light mode">
        <svg class="tt-sun" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
        <svg class="tt-moon" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M20 14.2A8 8 0 0 1 9.8 4a8 8 0 1 0 10.2 10.2z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>
      </button>
      <button class="nav-toggle" aria-label="Open menu" aria-expanded="false" aria-controls="mobile-nav">
        <span></span><span></span><span></span>
      </button>
    </div>
    <nav class="mobile-nav" id="mobile-nav" aria-label="Mobile">
      ${mobileLinks(page.slug)}
      <a class="btn btn-primary btn-lg" href="get-app.html">Get the app ${arrow}</a>
      <p class="hud"><span data-sa-clock>Live South African time</span></p>
    </nav>
  </header>
${page.hud === false ? '' : hudStrip()}
  <main id="main">
    ${page.body}
  </main>

  <footer class="site-footer">
    <div class="wrap footer-signoff">
      <p class="signoff">Go well<span class="stop">.</span></p>
      <p class="signoff-note"><em>Tsamaya</em> (say: ${site.pronunciation}) is Sesotho and Setswana for "go", from <em>tsamaya sentle</em>: go well. It is how people say goodbye here.</p>
    </div>
    <div class="wrap footer-grid">
      <div class="footer-col">
        <h2>Explore</h2>
        <a href="how-it-works.html">How it works</a>
        <a href="demo.html">See it in action</a>
        <a href="coverage.html">Coverage</a>
        <a href="updates.html">Updates</a>
        <a href="technical.html">Technical details</a>
        <a href="about.html">About us</a>
      </div>
      <div class="footer-col">
        <h2>Where it works</h2>
        <div class="footer-metros">${metroLinks()}</div>
      </div>
      <div class="footer-col">
        <h2>Support</h2>
        <a href="get-app.html">Get the app</a>
        <a href="sponsor.html">Ways to help</a>
        <a href="sponsor.html#donate">Chip in</a>
        <a href="contact.html">Contact</a>
      </div>
      <div class="footer-col">
        <h2>Legal</h2>
        <a href="${site.legal.privacy}">Privacy policy</a>
        <a href="${site.legal.terms}">Terms of use</a>
        <a href="mailto:${site.contactEmail}">${icon('mail', 15)} ${site.contactEmail}</a>
      </div>
    </div>
    <div class="wrap footer-bottom">
      <p>© ${year} TSAMAYA (PTY) LTD. Built in Johannesburg. Routes consider risk. They are not a guarantee of safety.</p>
      <p class="footer-admin"><a href="https://admin.tsamayaapp.co.za" rel="noopener nofollow" aria-label="Admin sign-in">Admin</a></p>
    </div>
  </footer>

  <!-- Vendored libraries (public/vendor/README.md), then the site script. All
       deferred, so they run in this order after the page has parsed. The page is
       complete without any of them. -->
  <script src="vendor/gsap.min.js" defer></script>
  <script src="vendor/ScrollTrigger.min.js" defer></script>
  <script src="vendor/SplitText.min.js" defer></script>
  <script src="vendor/lenis.min.js" defer></script>
  <script src="js/site.js" defer></script>
  ${(page.scripts || []).map((src) => `<script type="module" src="${src}"></script>`).join('\n  ')}
  ${analyticsSnippet()}
</body>
</html>`;
}
