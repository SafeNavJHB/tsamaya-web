// components.mjs — reusable HTML/SVG fragments. Pure string builders, no deps.
import { colors } from '../site.config.mjs';

/* ----------------------------------------------------------------------------
 * Brand mark — the genuine Tsamaya app icon (green swerve arrow threading
 * between the red & amber risk hotspots on a deep-navy tile). `size` in px.
 * ------------------------------------------------------------------------- */
export function logoMark(size = 40) {
  return `<img class="logo-mark" src="img/icon.png" width="${size}" height="${size}" alt="Tsamaya icon" loading="eager"/>`;
}

// Full lockup: mark + wordmark, used in the nav and footer.
export function logoLockup(size = 34) {
  return `<a class="brand" href="index.html" aria-label="Tsamaya home">
    ${logoMark(size)}
    <span class="brand-word">Tsamaya</span>
  </a>`;
}

/* ----------------------------------------------------------------------------
 * Inline icon set (stroke icons). Returns a 24×24 SVG path group.
 * ------------------------------------------------------------------------- */
const ICONS = {
  map: '<path d="M9 3 3 6v15l6-3 6 3 6-3V3l-6 3-6-3z"/><path d="M9 3v15M15 6v15"/>',
  server:
    '<rect x="3" y="4" width="18" height="7" rx="1.5"/><rect x="3" y="13" width="18" height="7" rx="1.5"/><path d="M7 7.5h.01M7 16.5h.01"/>',
  shield: '<path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z"/>',
  phone:
    '<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/>',
  route:
    '<circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="6" r="2.5"/><path d="M8.5 17C14 16 16 13 16.5 8.4"/>',
  layers: '<path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 12l9 5 9-5M3 16l9 5 9-5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  database:
    '<ellipse cx="12" cy="5.5" rx="8" ry="3"/><path d="M4 5.5v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6M4 11.5v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/>',
  cpu: '<rect x="6" y="6" width="12" height="12" rx="2"/><rect x="9.5" y="9.5" width="5" height="5" rx="1"/><path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3"/>',
  eye: '<path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="2.5"/>',
  swap: '<path d="M7 4v13M7 4 4 7M7 4l3 3M17 20V7M17 20l-3-3M17 20l3-3"/>',
  bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z"/>',
  pin: '<path d="M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>',
  check: '<path d="M4 12.5l5 5 11-11"/>',
  heart:
    '<path d="M12 21C5 16 3 12 3 8.5A4.5 4.5 0 0 1 12 6a4.5 4.5 0 0 1 9 2.5C21 12 19 16 12 21z"/>',
  copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  github:
    '<path d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.3-3.4-1.3-.5-1.1-1.1-1.4-1.1-1.4-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8.1-.6.3-1.1.6-1.4-2.2-.2-4.6-1.1-4.6-4.9 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.6 0 0 .8-.3 2.7 1a9.4 9.4 0 0 1 5 0c1.9-1.3 2.7-1 2.7-1 .5 1.3.2 2.3.1 2.6.6.7 1 1.6 1 2.7 0 3.8-2.4 4.7-4.6 4.9.3.3.7.9.7 1.9v2.8c0 .3.2.6.7.5A10 10 0 0 0 12 2z"/>',
  star: '<path d="M12 3l2.6 5.5 6 .8-4.4 4.2 1.1 6L12 16.8 6.7 19.5l1.1-6L3.4 9.3l6-.8L12 3z"/>',
};

export function icon(name, size = 22, cls = '') {
  const body = ICONS[name] || '';
  return `<svg class="ic ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
}

/* ----------------------------------------------------------------------------
 * Section helpers
 * ------------------------------------------------------------------------- */
export function section({ id = '', cls = '', inner = '' }) {
  return `<section${id ? ` id="${id}"` : ''} class="section ${cls}"><div class="wrap">${inner}</div></section>`;
}

export function eyebrow(text) {
  return `<p class="eyebrow">${text}</p>`;
}

export function statRow(stats) {
  return `<div class="stats">${stats
    .map(
      (s) =>
        `<div class="stat"><span class="stat-value">${s.value}</span><span class="stat-label">${s.label}</span></div>`,
    )
    .join('')}</div>`;
}

export function button(label, href, kind = 'primary', attrs = '') {
  return `<a class="btn btn-${kind}" href="${href}" ${attrs}>${label}</a>`;
}

/* ----------------------------------------------------------------------------
 * Device mockups — faithful renders of the real app screens, built from the
 * actual UI copy (app/index.tsx, app/route-result.tsx) and brand colours.
 * Rendered as SVG inside a phone frame so they stay crisp at any size and need
 * no binary screenshots to look right. `screen` selects which screen.
 * ------------------------------------------------------------------------- */
function phoneFrame(innerSvg, label = '') {
  return `<figure class="device">
    <div class="device-frame">
      <div class="device-notch"></div>
      ${innerSvg}
    </div>
    ${label ? `<figcaption>${label}</figcaption>` : ''}
  </figure>`;
}

// A stylised street-map backdrop (paths + a route line) reused by the screens.
function mapBackdrop(route = 'safe') {
  const routeColor = route === 'safe' ? colors.saferGreen : colors.red;
  return `
  <rect x="0" y="0" width="320" height="660" fill="#e8eaed"/>
  <!-- blocks -->
  <g fill="#f4f5f7">
    <rect x="14" y="70" width="120" height="90" rx="4"/>
    <rect x="150" y="70" width="160" height="60" rx="4"/>
    <rect x="14" y="180" width="80" height="120" rx="4"/>
    <rect x="110" y="180" width="200" height="70" rx="4"/>
    <rect x="14" y="320" width="150" height="110" rx="4"/>
    <rect x="180" y="270" width="130" height="160" rx="4"/>
    <rect x="14" y="450" width="120" height="150" rx="4"/>
    <rect x="150" y="450" width="160" height="150" rx="4"/>
  </g>
  <!-- roads -->
  <g stroke="#ffffff" stroke-width="7">
    <line x1="0" y1="165" x2="320" y2="165"/>
    <line x1="0" y1="305" x2="320" y2="305"/>
    <line x1="0" y1="435" x2="320" y2="435"/>
    <line x1="100" y1="0" x2="100" y2="660"/>
    <line x1="170" y1="0" x2="170" y2="660"/>
    <line x1="255" y1="0" x2="255" y2="660"/>
  </g>
  <!-- risk zone overlays (red / orange) -->
  <circle cx="200" cy="250" r="52" fill="${colors.red}" opacity="0.18"/>
  <circle cx="200" cy="250" r="30" fill="${colors.red}" opacity="0.28"/>
  <circle cx="92" cy="380" r="44" fill="${colors.orange}" opacity="0.18"/>
  <circle cx="92" cy="380" r="24" fill="${colors.orange}" opacity="0.26"/>
  <!-- route line -->
  <path d="M70 560 C 70 470 120 450 120 400 C 120 340 60 320 70 250 C 78 190 150 175 150 110"
        fill="none" stroke="${routeColor}" stroke-width="6" stroke-linecap="round"/>
  <circle cx="70" cy="560" r="8" fill="#1d4ed8" stroke="#fff" stroke-width="3"/>
  <path d="M150 110 l-7 12 h14 z" fill="${routeColor}"/>
  <circle cx="150" cy="104" r="9" fill="${routeColor}" stroke="#fff" stroke-width="3"/>`;
}

function screenHome() {
  return `
  <svg viewBox="0 0 320 660" xmlns="http://www.w3.org/2000/svg" class="device-svg" role="img" aria-label="Tsamaya home screen">
    ${mapBackdrop('safe')}
    <!-- top bar: eye toggle -->
    <g>
      <rect x="252" y="52" width="54" height="40" rx="20" fill="#0F172A" opacity="0.82"/>
      <g transform="translate(279,72)" stroke="#fff" stroke-width="1.6" fill="none">
        <path d="M-9 0s3.2-5 9-5 9 5 9 5-3.2 5-9 5-9-5-9-5z"/><circle cx="0" cy="0" r="2.3"/>
      </g>
    </g>
    <!-- glass "Where to?" search bar -->
    <g>
      <rect x="14" y="540" width="292" height="56" rx="16" fill="#0F172A" opacity="0.88"/>
      <circle cx="40" cy="568" r="8" fill="none" stroke="#cbd5e1" stroke-width="2"/>
      <line x1="46" y1="574" x2="52" y2="580" stroke="#cbd5e1" stroke-width="2"/>
      <text x="66" y="573" fill="#e2e8f0" font-size="16" font-family="system-ui">Where to?</text>
    </g>
    <!-- risk legend -->
    <g font-family="system-ui" font-size="11" fill="#0F172A">
      <rect x="14" y="606" width="292" height="34" rx="12" fill="#ffffff" opacity="0.92"/>
      <circle cx="34" cy="623" r="5" fill="${colors.red}"/><text x="44" y="627">High</text>
      <circle cx="104" cy="623" r="5" fill="${colors.orange}"/><text x="114" y="627">Elevated</text>
      <circle cx="194" cy="623" r="5" fill="${colors.yellow}"/><text x="204" y="627">Caution</text>
      <line x1="262" y1="623" x2="278" y2="623" stroke="${colors.saferGreen}" stroke-width="4" stroke-linecap="round"/><text x="284" y="627">Safe</text>
    </g>
  </svg>`;
}

function screenRouteCard() {
  return `
  <svg viewBox="0 0 320 660" xmlns="http://www.w3.org/2000/svg" class="device-svg" role="img" aria-label="Tsamaya route mode with From and To and the Go button">
    ${mapBackdrop('safe')}
    <!-- From / To card -->
    <g font-family="system-ui">
      <rect x="14" y="486" width="292" height="158" rx="18" fill="#0F172A" opacity="0.92"/>
      <!-- From row -->
      <circle cx="40" cy="520" r="6" fill="#1d4ed8"/>
      <text x="58" y="516" fill="#94a3b8" font-size="11">FROM</text>
      <text x="58" y="531" fill="#f1f5f9" font-size="15">My location</text>
      <!-- swap -->
      <g transform="translate(280,540)" stroke="${colors.emerald}" stroke-width="1.8" fill="none">
        <path d="M-4 -7v14M-4 -7l-3 3M-4 -7l3 3M4 7V-7M4 7l-3-3M4 7l3-3"/>
      </g>
      <line x1="58" y1="548" x2="262" y2="548" stroke="#334155" stroke-width="1"/>
      <!-- To row -->
      <path d="M40 560 v12" stroke="${colors.red}" stroke-width="0"/>
      <path d="M40 556 c4 0 6 3 6 6 0 4-6 9-6 9s-6-5-6-9c0-3 2-6 6-6z" fill="${colors.red}"/>
      <text x="58" y="560" fill="#94a3b8" font-size="11">TO</text>
      <text x="58" y="575" fill="#f1f5f9" font-size="15">Maboneng Precinct</text>
      <!-- Go button -->
      <rect x="30" y="596" width="260" height="34" rx="17" fill="${colors.emerald}"/>
      <text x="160" y="618" fill="#04231a" font-size="16" font-weight="700" text-anchor="middle" font-family="system-ui">Go</text>
    </g>
  </svg>`;
}

function screenResult() {
  return `
  <svg viewBox="0 0 320 660" xmlns="http://www.w3.org/2000/svg" class="device-svg" role="img" aria-label="Tsamaya route result comparing a lower-risk route with the direct route">
    <rect width="320" height="660" fill="#0F172A"/>
    <!-- map preview area -->
    <g>
      <rect x="0" y="0" width="320" height="300" fill="#e8eaed"/>
      <g stroke="#fff" stroke-width="6"><line x1="0" y1="120" x2="320" y2="120"/><line x1="0" y1="220" x2="320" y2="220"/><line x1="120" y1="0" x2="120" y2="300"/><line x1="230" y1="0" x2="230" y2="300"/></g>
      <circle cx="180" cy="150" r="46" fill="${colors.red}" opacity="0.18"/><circle cx="180" cy="150" r="26" fill="${colors.red}" opacity="0.28"/>
      <path d="M40 270 C 40 210 95 205 95 160 C 95 110 40 90 60 50" fill="none" stroke="${colors.saferGreen}" stroke-width="6" stroke-linecap="round"/>
      <path d="M40 270 C 120 250 170 200 175 150 C 180 95 150 70 150 40" fill="none" stroke="${colors.red}" stroke-width="4" stroke-dasharray="2 7" stroke-linecap="round" opacity="0.85"/>
      <circle cx="40" cy="270" r="8" fill="#1d4ed8" stroke="#fff" stroke-width="3"/>
    </g>
    <!-- result sheet -->
    <g font-family="system-ui">
      <rect x="0" y="288" width="320" height="372" rx="20" fill="#0F172A"/>
      <!-- lower-risk route row -->
      <rect x="16" y="312" width="288" height="74" rx="14" fill="#10331f" stroke="${colors.saferGreen}" stroke-width="1.5"/>
      <circle cx="42" cy="349" r="11" fill="${colors.saferGreen}"/>
      <path d="M37 349l4 4 7-8" stroke="#04231a" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <text x="64" y="343" fill="#eafaf0" font-size="15" font-weight="700">Lower-risk route</text>
      <text x="64" y="364" fill="#9fe7bb" font-size="12">Avoids 2 risk areas · 19 min · 14.2 km</text>
      <text x="64" y="378" fill="#7fb79a" font-size="11">+3 min vs direct</text>
      <!-- direct route row -->
      <rect x="16" y="396" width="288" height="64" rx="14" fill="#1b2336" stroke="#334155" stroke-width="1"/>
      <circle cx="42" cy="428" r="11" fill="none" stroke="${colors.red}" stroke-width="2"/>
      <path d="M42 423v6M42 432v.5" stroke="${colors.red}" stroke-width="2" stroke-linecap="round"/>
      <text x="64" y="422" fill="#e2e8f0" font-size="15" font-weight="700">Direct route</text>
      <text x="64" y="442" fill="#f0a0a8" font-size="12">Passes through 2 risk areas · 16 min</text>
      <!-- avoided list -->
      <text x="20" y="488" fill="#94a3b8" font-size="11" letter-spacing="1">AVOIDED ON THIS ROUTE</text>
      <g>
        <circle cx="26" cy="508" r="5" fill="${colors.red}"/><text x="40" y="512" fill="#e2e8f0" font-size="13" font-family="system-ui">Hillbrow — hijacking, robbery</text>
        <circle cx="26" cy="532" r="5" fill="${colors.orange}"/><text x="40" y="536" fill="#e2e8f0" font-size="13" font-family="system-ui">Berea — smash-and-grab</text>
      </g>
      <!-- actions -->
      <rect x="16" y="560" width="138" height="46" rx="14" fill="${colors.emerald}"/>
      <text x="85" y="588" fill="#04231a" font-size="14" font-weight="700" text-anchor="middle">Start Navigation</text>
      <rect x="166" y="560" width="138" height="46" rx="14" fill="none" stroke="#475569" stroke-width="1.5"/>
      <text x="235" y="588" fill="#e2e8f0" font-size="14" text-anchor="middle">Google Maps</text>
      <text x="160" y="634" fill="#64748b" font-size="10.5" text-anchor="middle">Routes consider risk, not guarantees. Stay aware.</text>
    </g>
  </svg>`;
}

export function deviceMockup(screen, label = '') {
  const map = {
    home: screenHome,
    route: screenRouteCard,
    result: screenResult,
  };
  const fn = map[screen] || screenHome;
  return phoneFrame(fn(), label);
}
