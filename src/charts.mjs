// charts.mjs — data visualisations built from the live figures in stats.json.
//
// Built as plain HTML + CSS rather than SVG or a charting library: horizontal bars
// are one div per bar, they reflow on a phone without a viewBox fight, they scale
// with the user's font size, and a screen reader reads them as the list they are.
// No runtime dependency, nothing to keep up to date.
//
// ---------------------------------------------------------------------------
// A NOTE ON THE RISK-BAND COLOURS — please read before "fixing" them.
//
// Red / orange / yellow / green are the app's risk semantics. A driver who sees a
// red overlay on the map has to see the same red here; breaking that correspondence
// to satisfy a palette checker would make the site worse, not better.
//
// Those hues cannot pass a categorical colour-blindness check, and no amount of
// tuning will fix that: red, orange and yellow are adjacent warm hues, so orange
// and yellow sit at ΔE ~8 for normal vision and ~2 under protanopia. Verified with
// the palette validator rather than assumed.
//
// This is a STATUS scale, not a categorical one, so identity is carried in channels
// that are not colour at all:
//   1. fixed severity order — position alone tells you which band you are looking at
//   2. a text label, a count and a percentage on every single band
//   3. a 2px surface gap between segments so boundaries are visible without hue
//   4. a diagonal hatch on the caution band — the pair most at risk of merging
//   5. a full table view underneath, for anyone the graphic does not serve
// The fills below are darkened from the app's map colours purely so they clear 3:1
// contrast against a white page; the app renders them over a map, not over paper.
// ------------------------------------------------------------------------ */

import { fmt } from '../site.config.mjs';

// Web-surface variants of the app's risk bands. Order is severity order and is
// load-bearing — it is the primary non-colour encoding. Do not sort these.
const BANDS = [
  { key: 'red', label: 'Highest', fill: '#c92a3f', desc: 'avoided by default on the safest setting' },
  { key: 'orange', label: 'Elevated', fill: '#d97706', desc: 'always costed, avoided on the safest setting' },
  { key: 'yellow', label: 'Caution', fill: '#b08900', desc: 'costed but never avoided — too widespread to route around', hatch: true },
  { key: 'none', label: 'No penalty', fill: '#2f7d4f', desc: 'checked and carries no routing cost' },
];

/**
 * A stacked proportion bar showing how one metro's zones split across risk bands.
 * @param {{red:number, orange:number, yellow:number, none:number}} bands
 * @param {string} metroName  used in the accessible summary
 */
export function bandBar(bands, metroName) {
  const total = BANDS.reduce((a, b) => a + (bands[b.key] || 0), 0);
  if (!total) return '';
  const pct = (n) => (n / total) * 100;
  // One-sentence summary for screen readers, so the graphic is not the only route
  // to the information.
  const summary = BANDS.filter((b) => bands[b.key])
    .map((b) => `${b.label} ${fmt(bands[b.key])} (${Math.round(pct(bands[b.key]))}%)`)
    .join(', ');

  const segments = BANDS.filter((b) => bands[b.key] > 0)
    .map(
      (b) =>
        `<span class="bandbar-seg${b.hatch ? ' is-hatched' : ''}" style="--seg:${pct(bands[b.key])}%;--fill:${b.fill}" title="${b.label}: ${fmt(bands[b.key])} zones"></span>`,
    )
    .join('');

  const legend = BANDS.filter((b) => bands[b.key] > 0)
    .map(
      (b) => `<li class="bandbar-key">
      <span class="bandbar-chip${b.hatch ? ' is-hatched' : ''}" style="--fill:${b.fill}" aria-hidden="true"></span>
      <span class="bandbar-key-label">${b.label}</span>
      <span class="bandbar-key-num">${fmt(bands[b.key])}</span>
      <span class="bandbar-key-pct">${Math.round(pct(bands[b.key]))}%</span>
    </li>`,
    )
    .join('');

  const rows = BANDS.filter((b) => bands[b.key] > 0)
    .map(
      (b) =>
        `<tr><th scope="row">${b.label}</th><td>${fmt(bands[b.key])}</td><td>${Math.round(pct(bands[b.key]))}%</td><td>${b.desc}</td></tr>`,
    )
    .join('');

  return `<figure class="chart bandbar" data-reveal>
  <div class="bandbar-track" role="img" aria-label="${metroName} risk zones by band: ${summary}.">${segments}</div>
  <ul class="bandbar-legend">${legend}</ul>
  <details class="chart-table">
    <summary>View as table</summary>
    <table>
      <caption>${metroName} — ${fmt(total)} mapped zones by risk band</caption>
      <thead><tr><th scope="col">Band</th><th scope="col">Zones</th><th scope="col">Share</th><th scope="col">How routing treats it</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </details>
</figure>`;
}

/**
 * Horizontal bars comparing mapped-zone counts across metros.
 * One series, so one colour and no legend — the heading names what is measured.
 * @param {{label:string, value:number, slug:string}[]} items
 */
export function coverageBars(items) {
  const sorted = [...items].sort((a, b) => b.value - a.value);
  const max = Math.max(...sorted.map((i) => i.value));

  const bars = sorted
    .map(
      (i, idx) => `<li class="cbar-row">
    <a class="cbar-label" href="${i.slug}.html">${i.label}</a>
    <span class="cbar-track">
      <span class="cbar-fill" style="--w:${(i.value / max) * 100}%;--delay:${idx * 60}ms"></span>
    </span>
    <span class="cbar-value">${fmt(i.value)}</span>
  </li>`,
    )
    .join('');

  const rows = sorted
    .map((i) => `<tr><th scope="row">${i.label}</th><td>${fmt(i.value)}</td></tr>`)
    .join('');

  return `<figure class="chart cbar" data-reveal>
  <ul class="cbar-list">${bars}</ul>
  <details class="chart-table">
    <summary>View as table</summary>
    <table>
      <caption>Mapped risk zones per metro</caption>
      <thead><tr><th scope="col">Metro</th><th scope="col">Zones</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </details>
</figure>`;
}

/**
 * A compact "what the router does" comparison — the direct route against the
 * lower-risk one. Numbers are illustrative of a typical result, so it is labelled
 * as an example rather than dressed up as a measured statistic.
 */
export function routeCompare({ directMin, safeMin, avoided }) {
  const max = Math.max(directMin, safeMin);
  return `<figure class="chart routecmp" data-reveal>
  <ul class="routecmp-list">
    <li class="routecmp-row">
      <span class="routecmp-label">Direct route</span>
      <span class="cbar-track"><span class="cbar-fill is-danger" style="--w:${(directMin / max) * 100}%"></span></span>
      <span class="routecmp-val">${directMin} min</span>
    </li>
    <li class="routecmp-row">
      <span class="routecmp-label">Lower-risk route</span>
      <span class="cbar-track"><span class="cbar-fill is-safe" style="--w:${(safeMin / max) * 100}%;--delay:120ms"></span></span>
      <span class="routecmp-val">${safeMin} min</span>
    </li>
  </ul>
  <figcaption>A typical result: <strong>+${safeMin - directMin} minutes</strong> to route around ${avoided} flagged areas. Illustrative of a common outcome, not an average across all trips.</figcaption>
</figure>`;
}
