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
  { key: 'red', label: 'Highest', fill: '#c92a3f', desc: 'avoided by default on the strictest setting' },
  { key: 'orange', label: 'Elevated', fill: '#d97706', desc: 'always costed, avoided on the strictest setting' },
  { key: 'yellow', label: 'Caution', fill: '#b08900', desc: 'costed but never avoided, since it is too widespread to route around', hatch: true },
  { key: 'none', label: 'No penalty', fill: '#2f7d4f', desc: 'checked and carries no routing cost' },
];

// The three ratings every zone carries, in the order a day runs.
const TIMES = [
  { key: 'day', label: 'Daytime', hint: '05:00 to 17:30' },
  { key: 'evening', label: 'Evening', hint: '17:30 to 19:30' },
  { key: 'night', label: 'Night', hint: '19:30 to 05:00' },
];

/**
 * How one metro's zones split across the risk bands, once for each time of day.
 *
 * Three bars rather than one, because one was actively misleading. The single
 * bar was drawn from the `risk_band` summary column, which holds the worst of a
 * zone's three ratings — and, measured against the live data, is identical to
 * the night rating for all 4 396 zones, with not one zone worse by day than
 * after dark. So the old chart showed every metro at its worst hour and called
 * it the metro. Johannesburg read as 67% top-band when two thirds of the day it
 * is 31%.
 *
 * Showing all three is also the only honest way to make the app's central claim
 * visible: the ratings move with the clock, so the route does too.
 *
 * @param {{day:object, evening:object, night:object}} byTime  band counts per time
 * @param {string} metroName  used in the accessible summary
 */
export function bandBar(byTime, metroName) {
  if (!byTime || !byTime.day) return '';

  const rows = TIMES.map(({ key, label, hint }) => {
    const bands = byTime[key] || {};
    const total = BANDS.reduce((a, b) => a + (bands[b.key] || 0), 0);
    return { key, label, hint, bands, total };
  }).filter((r) => r.total > 0);
  if (!rows.length) return '';

  const pct = (n, total) => (n / total) * 100;

  const bars = rows
    .map((row) => {
      // One sentence per bar for screen readers, so the graphic is not the only
      // route to the information.
      const summary = BANDS.filter((b) => row.bands[b.key])
        .map((b) => `${b.label} ${fmt(row.bands[b.key])} (${Math.round(pct(row.bands[b.key], row.total))}%)`)
        .join(', ');
      const segments = BANDS.filter((b) => row.bands[b.key] > 0)
        .map(
          (b) =>
            `<span class="bandbar-seg${b.hatch ? ' is-hatched' : ''}" style="--seg:${pct(row.bands[b.key], row.total)}%;--fill:${b.fill}" title="${b.label}: ${fmt(row.bands[b.key])} zones"></span>`,
        )
        .join('');
      const top = Math.round(pct(row.bands.red || 0, row.total));
      return `<li class="bandbar-row">
      <span class="bandbar-time"><strong>${row.label}</strong><span class="bandbar-hint">${row.hint}</span></span>
      <span class="bandbar-track" role="img" aria-label="${metroName}, ${row.label.toLowerCase()}: ${summary}.">${segments}</span>
      <span class="bandbar-top">${top}%</span>
    </li>`;
    })
    .join('');

  const legend = BANDS.filter((b) => rows.some((r) => r.bands[b.key] > 0))
    .map(
      (b) => `<li class="bandbar-key">
      <span class="bandbar-chip${b.hatch ? ' is-hatched' : ''}" style="--fill:${b.fill}" aria-hidden="true"></span>
      <span class="bandbar-key-label">${b.label}</span>
      <span class="bandbar-key-desc">${b.desc}</span>
    </li>`,
    )
    .join('');

  const tableRows = rows
    .map(
      (row) =>
        `<tr><th scope="row">${row.label}</th>${BANDS.map(
          (b) => `<td>${fmt(row.bands[b.key] || 0)}</td>`,
        ).join('')}</tr>`,
    )
    .join('');

  return `<figure class="chart bandbar" data-reveal>
  <ul class="bandbar-rows">${bars}</ul>
  <p class="bandbar-caption">The right-hand figure is the share of ${metroName}’s mapped areas sitting in the highest band at that hour.</p>
  <ul class="bandbar-legend">${legend}</ul>
  <details class="chart-table">
    <summary>View as table</summary>
    <table>
      <caption>${metroName}: mapped areas by risk band, for each time of day</caption>
      <thead><tr><th scope="col">Time of day</th>${BANDS.map((b) => `<th scope="col">${b.label}</th>`).join('')}</tr></thead>
      <tbody>${tableRows}</tbody>
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
