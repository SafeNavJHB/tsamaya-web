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
      ['cpu', 'Python data pipeline', 'OpenStreetMap fetch → crime-density (KDE) scoring → zone/corridor classification → staging → promotion to live.'],
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
    <div class="flow-node"><span class="flow-k">Pipeline</span>Fetch → KDE scoring → classify zones &amp; corridors → stage</div>
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
      <h2>Tuned thresholds keep detours honest.</h2>
      <p class="big">The safety logic isn’t a black box — it’s a small set of explicit, tunable rules that decide when a detour is worth it and when it isn’t.</p>
      <div class="mt">${button('Walk through the steps', 'how-it-works.html', 'ghost')}</div>
    </div>
    <table class="spec-table">
      <tbody>
        <tr><th>Risk bands that detour</th><td>Red &amp; orange only — yellow is shown, never forced</td></tr>
        <tr><th>Route sampling</th><td>Every 3rd coordinate, ray-cast vs. all active zones</td></tr>
        <tr><th>Corridor snap tolerance</th><td>≈ 650 m (pass-through detection)</td></tr>
        <tr><th>Max lateral deviation</th><td>15% of route length, capped at 5 km</td></tr>
        <tr><th>Corridor search radius</th><td>Within 8 km of the danger area</td></tr>
        <tr><th>Bypass waypoints</th><td>Up to 2 injected per route</td></tr>
        <tr><th>Detour reject rule</th><td>&gt; 50% longer than direct → serve direct, flagged</td></tr>
        <tr><th>Time bands</th><td>Day 05–18 · Evening 18–22 · Night 22–05</td></tr>
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
