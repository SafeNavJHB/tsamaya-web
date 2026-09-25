import { pageHead, linkQ, M } from '../kit.mjs';

// "Recalculating": GitHub Pages serves 404.html for any address it cannot find,
// at any depth, so the page sets <base href="/"> to load its styles from the
// root. The figure is a small street grid with a block missing: the grey route
// runs into the gap, and the emerald one bends around it (CSS only; with reduced
// motion it is simply drawn).
const blocks = [];
for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) if (!(c === 2 && r > 0)) blocks.push(`<rect x="${24 + c * 92}" y="${24 + r * 84}" width="72" height="64" rx="3"/>`);

const figure = `
    <figure class="rc" aria-hidden="true">
      <svg viewBox="0 0 488 280" focusable="false">
        <g class="rc-b">${blocks.join('')}</g>
        <rect class="rc-gap" x="204" y="104" width="80" height="160" rx="4"/>
        <text class="rc-t" x="244" y="190" text-anchor="middle">404</text>
        <path class="rc-old" pathLength="1" d="M8 182H244"/>
        <path class="rc-go" pathLength="1" d="M8 182H198V98H290V182H480"/>
        <circle class="rc-a" cx="8" cy="182" r="5"/>
        <circle class="rc-z" cx="480" cy="182" r="6"/>
      </svg>
    </figure>`;

export default {
  slug: '404.html',
  title: 'Page not found',
  description: 'This page is not on the map. The way back to the Tsamaya site starts here.',
  heroClass: 'sn page-404',
  hud: false,
  noindex: true,
  base: '/',
  body: pageHead({
    meta: `404${M}not on the map`,
    title: 'Recalculating.',
    lead: 'This page is not on the map. It may have moved, or the link has a typo. Here is a route back to somewhere that is.',
    after: `${figure}
    <p class="ph-links">${linkQ('Home', 'index.html')}${linkQ('Coverage', 'coverage.html')}${linkQ('Get the app', 'get-app.html')}</p>`,
  }),
};
