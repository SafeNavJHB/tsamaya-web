# Metro detection for the home page

The home page hero shows Johannesburg and Cape Town to everyone. When a visitor's
connection looks like it is in another metro, `public/js/metro-hero.js` can show that
metro's own screenshots instead. A visitor can always pick a metro by hand with
**Change**, and that choice wins from then on.

GitHub Pages cannot see where a visitor is, so the lookup is a tiny Cloudflare Worker,
`worker.js` here. It returns `{ "lat": -33.9, "lon": 18.4 }` from Cloudflare's own
lookup of the connection, rounded to about 10 km, and `{}` outside South Africa. It
stores nothing, logs nothing, sets no cookie and calls no third party.

Until it is deployed and `site.geoEndpoint` is set, the page never calls anything and
simply keeps its Johannesburg and Cape Town default.

## Switching it on

1. In the Cloudflare dashboard (the account that hosts the admin site): Workers and
   Pages, Create, Worker, name it `tsamaya-where`, and paste `worker.js` in place of
   the starter code. Deploy.
2. Note its address, for example `https://tsamaya-where.<your-subdomain>.workers.dev`.
3. In `site.config.mjs`, set `geoEndpoint` to that address, then build and deploy the
   site as usual.
4. Before you switch it on, add one sentence to the privacy policy: the home page asks
   Cloudflare for the approximate area of your connection to show your metro, and
   nothing is stored. (Not done in this change: the legal copies are under review.)

## Limits worth knowing

- Mobile networks often route a phone through Johannesburg or Cape Town wherever it
  is, so the answer is a hint, not a fact. That is why **Change** is always shown.
- The lookup has 1.5 seconds; after that, or on any error, the default stays.
- One lookup per browser tab (sessionStorage), never repeated on every page view.
