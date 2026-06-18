import { site } from '../../site.config.mjs';
import { section, eyebrow, icon, button } from '../components.mjs';

const hero = `
<section class="page-hero">
  <div class="wrap">
    ${eyebrow('Technical details')}
    <h1>Under the hood.</h1>
    <p class="lede center-narrow">Tsamaya is a React&nbsp;Native app backed by a geospatial database and a Python data pipeline with a Claude-assisted review step. Here’s how the pieces fit.</p>
  </div>
</section>`;

const stack = section({
  cls: 'band',
  inner: `
  ${eyebrow('The stack')}
  <h2>Built on proven, boring-in-a-good-way tools.</h2>
  <div class="tech-grid">
    ${[
      ['phone', 'React Native + Expo', 'Cross-platform app, New Architecture enabled. Expo Router for navigation, EAS for builds and over-the-air updates.'],
      ['map', 'Mapbox', 'Map tiles, Directions API for routing, and Geocoding for search and reverse-geocoding the map.'],
      ['database', 'Supabase + PostGIS', 'Postgres with PostGIS geometry holds every zone and corridor. The app reads live; the editor writes via typed RPC functions.'],
      ['cpu', 'Python data pipeline', 'Map-data fetch → proprietary crime-density scoring → zone/corridor classification → staging → promotion to live.'],
      ['shield', 'Claude review', 'A second-opinion review pass flags questionable classifications for a human before anything reaches drivers.'],
      ['server', 'GitHub + EAS', 'Versioned SQL migrations keep the database reproducible; TestFlight distributes builds to testers.'],
    ]
      .map(
        ([ic, t, b]) =>
          `<article class="tech"><div class="tech-ic">${icon(ic, 22)}</div><div><h3>${t}</h3><p>${b}</p></div></article>`,
      )
      .join('')}
  </div>`,
});

const architecture = section({
  cls: 'band-soft',
  inner: `
  ${eyebrow('Three repos, one system')}
  <h2>How data becomes a route</h2>
  <p class="sub">Crime and map data flow through a pipeline, get reviewed, then go live for the app to read.</p>
  <div class="flow">
    <div class="flow-node"><span class="flow-k">Sources</span>OpenStreetMap · SAPS crime stats · local knowledge</div>
    <div class="flow-arrow">${icon('route', 18)}</div>
    <div class="flow-node"><span class="flow-k">Pipeline</span>Fetch → density scoring → classify zones &amp; corridors → stage</div>
    <div class="flow-arrow">${icon('route', 18)}</div>
    <div class="flow-node"><span class="flow-k">Review</span>Claude second-opinion + human approve/reject</div>
    <div class="flow-arrow">${icon('route', 18)}</div>
    <div class="flow-node"><span class="flow-k">Live DB</span>Supabase zones &amp; corridors (PostGIS)</div>
    <div class="flow-arrow">${icon('route', 18)}</div>
    <div class="flow-node flow-node-app"><span class="flow-k">App</span>Tsamaya reads live, plans the route on-device</div>
  </div>`,
});

const thresholds = section({
  cls: 'band',
  inner: `
  <div class="split">
    <div>
      ${eyebrow('The routing model')}
      <h2>A principled, carefully-tuned model.</h2>
      <p class="big">The routing logic isn’t a black box — it’s a small set of deliberate rules, tuned over real South African routes, that decide when a detour is worth it and when it isn’t.</p>
      <div class="mt">${button('Walk through the steps', 'how-it-works.html', 'ghost')}</div>
    </div>
    <table class="spec-table">
      <tbody>
        <tr><th scope="row">What triggers a detour</th><td>Only higher-risk areas; caution-level zones are shown, never forced</td></tr>
        <tr><th scope="row">Route check</th><td>The route is sampled and tested against every active zone for the current time</td></tr>
        <tr><th scope="row">Corridor awareness</th><td>Recognises when a route already runs a known-safe corridor, and leaves it be</td></tr>
        <tr><th scope="row">Detour limits</th><td>Bypasses are capped so they never wander unreasonably far from the direct line</td></tr>
        <tr><th scope="row">Corridor selection</th><td>Only nearby safe corridors are used to steer around a risk area</td></tr>
        <tr><th scope="row">Sanity check</th><td>Any detour that ends up excessively longer than direct is rejected — you get the direct route, clearly flagged</td></tr>
        <tr><th scope="row">Time-aware</th><td>Separate risk weighting for daytime, evening and night</td></tr>
      </tbody>
    </table>
  </div>`,
});

const dataModel = section({
  cls: 'band-soft',
  inner: `
  ${eyebrow('Data model')}
  <h2>Zones and corridors</h2>
  <div class="card-2">
    <article class="info-card">
      <h3>${icon('shield', 18)} Risk zones</h3>
      <p>Polygons with a name, city, three time-band risk levels, crime types, and a source. Soft-deleted (never hard-deleted) so history is recoverable.</p>
      <code class="chip">red · orange · yellow</code>
    </article>
    <article class="info-card">
      <h3>${icon('layers', 18)} Corridors</h3>
      <p>LineStrings with a buffer width that mark roads as <em>safe</em> (preferred when threading past risk) or <em>danger</em> (actively avoided). Identity is always <code>(city, name)</code> — road names repeat across metros.</p>
      <code class="chip">safe · danger</code>
    </article>
  </div>
  <p class="footnote">Geometry is stored as PostGIS and written through <code>ST_SetSRID(ST_GeomFromGeoJSON(…), 4326)</code> RPCs, since PostgREST can’t auto-cast GeoJSON to geometry.</p>`,
});

const coverage = section({
  cls: 'band',
  inner: `
  ${eyebrow('Coverage')}
  <h2>Where Tsamaya works today</h2>
  <p class="big">Live across ${site.coverageLive}. Mapped metros: <strong>${site.coverageData}</strong> — and adding a new city is a documented, repeatable runbook, not a rewrite.</p>
  <div class="stats stats-tech">
    ${site.stats.map((s) => `<div class="stat"><span class="stat-value">${s.value}</span><span class="stat-label">${s.label}</span></div>`).join('')}
  </div>`,
});

const cta = `
<section class="cta-band">
  <div class="wrap cta-inner">
    <div><h2>Curious, or want to help build it?</h2><p>We’re always glad to talk shop — or to find sponsors who want to fund the next metro.</p></div>
    <div class="cta-actions">${button('Get in touch', 'contact.html', 'primary')}${button('Sponsor a city', 'sponsor.html', 'ghost-light')}</div>
  </div>
</section>`;

export default {
  slug: 'technical.html',
  title: 'Technical details',
  description:
    'The Tsamaya tech stack and routing model: React Native + Expo, Mapbox, Supabase/PostGIS, a Python data pipeline with Claude-assisted review, and the exact routing thresholds.',
  body: [hero, stack, architecture, thresholds, dataModel, coverage, cta].join('\n'),
};
