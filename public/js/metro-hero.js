// metro-hero.js: the home page hero's metro and store button.
//
// The HTML always shows Johannesburg and Cape Town (src/pages/index.mjs), so every
// visitor and every crawler gets the same page. This only changes what is shown:
//
// 1. The metro. A metro the visitor picked before (localStorage) wins. Otherwise,
//    when site.geoEndpoint is set (data-geo), it asks once per tab where the
//    connection is ({ lat, lon }, a Cloudflare Worker: workers/where/) and matches
//    that against each metro's service-area box. The metro's own screenshots
//    take over the hero (a metro without them keeps the
//    default pair and gets a line of its own).
//    No match, no answer within 1.5 s, or any error: the default stays.
// 2. The store button. An iPhone gets TestFlight first and Google Play second.
//
// Nothing here is needed to read or use the page.
(function () {
  var root = document.getElementById('metro-hero');
  if (!root) return;
  var KEY = 'ts-metro';
  var GEO = 'ts-geo';
  var metros = [];
  try { metros = JSON.parse(root.getAttribute('data-metros') || '[]'); } catch (e) { return; }
  var byKey = {};
  metros.forEach(function (m) { byKey[m.key] = m; });
  var defaults = (root.getAttribute('data-default') || '').split(' ');
  var line = document.getElementById('metro-line');
  var change = document.getElementById('metro-change');
  var row = document.getElementById('metro-pick-row');
  var pick = document.getElementById('metro-pick');
  var figs = Array.prototype.slice.call(root.querySelectorAll('[data-metro]'));

  function store(k, v) { try { if (v) localStorage.setItem(k, v); else localStorage.removeItem(k); } catch (e) {} }
  function read(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function sread(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
  function swrite(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }
  function fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }

  function show(keys) {
    figs.forEach(function (f) { f.hidden = keys.indexOf(f.getAttribute('data-metro')) < 0; });
  }

  // how: 'picked' (the visitor's choice), 'near' (from the connection) or ''.
  function apply(key, how) {
    var m = byKey[key];
    if (!line) return;
    if (pick) pick.value = m ? key : '';
    if (!m) {
      show(defaults);
      line.textContent = 'Showing Johannesburg and Cape Town.';
      return;
    }
    if (m.shot) {
      show([key]);
      line.textContent = 'Showing ' + m.name + (how === 'near' ? ', based on your connection.' : '.');
      return;
    }
    show(defaults);
    line.textContent = '';
    line.appendChild(document.createTextNode((how === 'near' ? 'You seem to be near ' : '') + m.name + ': ' + fmt(m.zones) + ' rated areas. '));
    var a = document.createElement('a');
    a.href = m.slug + '.html';
    a.textContent = 'See ' + m.name + ' coverage';
    line.appendChild(a);
  }

  function inside(m, lat, lon) {
    var b = m.box;
    return b && lon >= b.lngMin && lon <= b.lngMax && lat >= b.latMin && lat <= b.latMax;
  }

  // Smallest box first, so a metro inside a bigger neighbour's box still wins.
  function nearest(lat, lon) {
    var hits = metros.filter(function (m) { return inside(m, lat, lon); });
    hits.sort(function (a, b) {
      return (a.box.lngMax - a.box.lngMin) * (a.box.latMax - a.box.latMin) - (b.box.lngMax - b.box.lngMin) * (b.box.latMax - b.box.latMin);
    });
    return hits.length ? hits[0].key : '';
  }

  function detect(url) {
    var cached = sread(GEO);
    if (cached !== null) { if (cached) apply(cached, 'near'); return; }
    if (!window.fetch || !window.AbortController) return;
    var ctl = new AbortController();
    var timer = setTimeout(function () { ctl.abort(); }, 1500);
    fetch(url, { signal: ctl.signal, credentials: 'omit', cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        clearTimeout(timer);
        var lat = d && Number(d.lat), lon = d && Number(d.lon);
        var key = d && isFinite(lat) && isFinite(lon) ? nearest(lat, lon) : '';
        swrite(GEO, key);
        if (key && !read(KEY)) apply(key, 'near');
      })
      .catch(function () { clearTimeout(timer); swrite(GEO, ''); });
  }

  if (change && row && pick) {
    // Without JavaScript "Change" is a link to the metro list. With it, it is a
    // button that opens the picker (site.js would smooth-scroll any # link).
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.id = change.id;
    btn.className = 'hm-change';
    btn.textContent = change.textContent;
    change.parentNode.replaceChild(btn, change);
    change = btn;
    change.addEventListener('click', function () {
      row.hidden = !row.hidden;
      change.setAttribute('aria-expanded', String(!row.hidden));
      if (!row.hidden) pick.focus();
    });
    change.setAttribute('aria-controls', 'metro-pick-row');
    change.setAttribute('aria-expanded', 'false');
    pick.addEventListener('change', function () {
      store(KEY, pick.value);
      apply(pick.value, 'picked');
    });
  }

  var chosen = read(KEY);
  if (chosen && byKey[chosen]) apply(chosen, 'picked');
  else if (root.getAttribute('data-geo')) detect(root.getAttribute('data-geo'));

  // The time of day the screenshots show. The HTML shows daytime; this starts on
  // the band South Africa is in right now (the app's own clock: daytime
  // 05:00-17:30, evening 17:30-19:30, night 19:30-05:00) and the buttons switch.
  var BANDS = { day: ['Daytime', '05:00 to 17:30'], evening: ['Evening', '17:30 to 19:30'], night: ['Night', '19:30 to 05:00'] };
  var bandLine = document.getElementById('band-line');
  var bandBtns = Array.prototype.slice.call(root.querySelectorAll('.hm-bands [data-band]'));
  function bandNow() {
    var hm;
    try {
      hm = new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Johannesburg', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date()).split(':');
    } catch (e) { return 'day'; }
    var mins = Number(hm[0]) % 24 * 60 + Number(hm[1]);
    return mins >= 300 && mins < 1050 ? 'day' : mins >= 1050 && mins < 1170 ? 'evening' : 'night';
  }
  var current = bandNow();
  function setBand(b) {
    if (!BANDS[b]) b = 'day';
    root.setAttribute('data-band', b);
    bandBtns.forEach(function (x) { x.setAttribute('aria-pressed', String(x.getAttribute('data-band') === b)); });
    if (bandLine) bandLine.textContent = BANDS[b][0] + ' ratings, ' + BANDS[b][1] + (b === current ? ', the ones in use in South Africa right now.' : '.');
  }
  bandBtns.forEach(function (x) { x.addEventListener('click', function () { setBand(x.getAttribute('data-band')); }); });
  setBand(current);

  // The store button for the visitor's phone (the same test as site.js).
  var ua = navigator.userAgent || '';
  var ios = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  if (ios) {
    var main = document.querySelector('[data-store="primary"]');
    var other = document.querySelector('[data-store="other"]');
    if (main && other) {
      var arrow = main.querySelector('svg');
      main.href = main.getAttribute('data-ios');
      main.textContent = 'Join on TestFlight ';
      if (arrow) main.appendChild(arrow);
      other.href = other.getAttribute('data-android');
      other.textContent = 'On Android? Get it on Google Play';
    }
  }
})();
