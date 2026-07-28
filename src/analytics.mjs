// analytics.mjs — emits the analytics snippet for whichever provider is configured.
//
// The whole point of this file is that switching provider, or turning analytics
// off entirely, is a change to site.config.mjs and nothing else. No page or
// template knows which provider is in use, and with `provider: ''` (the default)
// not a single byte of tracking code reaches the built site.
//
// Every provider here except GA4 is cookieless and stores nothing on the visitor's
// device, so none of them needs a consent banner under POPIA or GDPR. GA4 does.
// That is why it is last, and why it carries a warning in the config.

import { site } from '../site.config.mjs';

// Attribute-escape, so a stray quote in a config value cannot break out of the tag.
function attr(value) {
  return String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

export function analyticsSnippet() {
  const a = site.analytics || {};
  const provider = (a.provider || '').toLowerCase();
  if (!provider) return '';

  switch (provider) {
    case 'plausible':
      if (!a.domain) return '';
      return `<script defer data-domain="${attr(a.domain)}" src="https://plausible.io/js/script.js"></script>`;

    case 'umami':
      if (!a.src || !a.websiteId) return '';
      return `<script defer src="${attr(a.src)}" data-website-id="${attr(a.websiteId)}"></script>`;

    case 'cloudflare':
      if (!a.token) return '';
      // Matches Cloudflare's own snippet exactly, including type="module" —
      // that is how they ship it, and beacon.min.js is served as an ES module.
      return `<!-- Cloudflare Web Analytics -->
  <script type="module" src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "${attr(a.token)}"}'></script>`;

    case 'goatcounter':
      if (!a.src) return '';
      return `<script data-goatcounter="${attr(a.src)}" async src="//gc.zgo.at/count.js"></script>`;

    case 'ga4': {
      if (!a.measurementId) return '';
      const id = attr(a.measurementId);
      // IP anonymisation and ad-personalisation signals are disabled here, which
      // reduces but does NOT remove the consent obligation — GA4 still writes
      // cookies. If you ship this, ship a consent banner with it.
      return `<script async src="https://www.googletagmanager.com/gtag/js?id=${id}"></script>
  <script>
    window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
    gtag('js',new Date());
    gtag('config','${id}',{anonymize_ip:true,allow_google_signals:false,allow_ad_personalization_signals:false});
  </script>`;
    }

    default:
      // An unknown provider is a typo, not a reason to silently ship nothing.
      throw new Error(
        `site.config.mjs: unknown analytics provider "${a.provider}". ` +
          `Expected one of: plausible, umami, cloudflare, goatcounter, ga4 — or '' to disable.`,
      );
  }
}
