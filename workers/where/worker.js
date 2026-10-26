// worker.js: answers "roughly where is this visitor?" for the home page hero
// (public/js/metro-hero.js), from Cloudflare's own lookup of the connection.
//
// It returns the coordinates Cloudflare attaches to the request (request.cf),
// rounded to one decimal place (about 10 km), and nothing else. It stores
// nothing, logs nothing, sets no cookie and calls no third party. The page
// matches the point against the metros' service-area boxes itself.
//
// Deploy and switch on: workers/where/README.md.

const ALLOWED = ['https://tsamayaapp.co.za', 'https://www.tsamayaapp.co.za'];

export default {
  async fetch(request) {
    const origin = request.headers.get('Origin') || '';
    const cors = ALLOWED.includes(origin) ? { 'Access-Control-Allow-Origin': origin, Vary: 'Origin' } : {};
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: { ...cors, 'Access-Control-Allow-Methods': 'GET' } });
    if (request.method !== 'GET') return new Response(null, { status: 405, headers: cors });

    const cf = request.cf || {};
    const round = (v) => (Number.isFinite(Number(v)) ? Math.round(Number(v) * 10) / 10 : null);
    const lat = round(cf.latitude);
    const lon = round(cf.longitude);
    const body = cf.country === 'ZA' && lat !== null && lon !== null ? { lat, lon } : {};

    return new Response(JSON.stringify(body), {
      headers: { ...cors, 'Content-Type': 'application/json', 'Cache-Control': 'private, no-store' },
    });
  },
};
