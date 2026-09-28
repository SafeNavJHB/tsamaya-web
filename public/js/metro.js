// metro.js: a metro page's band switch (src/pages/metros.mjs). The page reads
// without it: every band's figure is in the list under the big number.
//
// The tabs switch the big number, its line and its bar between the three parts
// of the day. The band in force now is marked, and chosen first. Numbers switch
// between true values (a short crossfade), never counting through made-up ones;
// only the bar moves.
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const tabs = $$('.mx .tab'), panel = $('#mx-p');
const TS = window.Tsamaya;

if (tabs.length && panel) {
  const z = +panel.dataset.z, num = $('#mx-n'), line = $('#mx-l'), bar = $('.tp-bar i', panel);
  const fmt = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  const still = () => document.documentElement.classList.contains('motion-paused') || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const nowBand = () => (TS ? TS.bands.indexOf(TS.bandAt(TS.saMinutes())) : -1);
  let cur = -1, swapT = 0;

  function mark() {
    const now = nowBand();
    tabs.forEach((t, i) => { $('.now', t).textContent = i === now ? 'Now' : ''; });
  }
  function show(i, focus, instant) {
    if (i === cur) return;
    cur = i;
    const t = tabs[i], r = +t.dataset.r;
    tabs.forEach((x, j) => { x.setAttribute('aria-selected', String(j === i)); x.tabIndex = j === i ? 0 : -1; });
    panel.setAttribute('aria-labelledby', t.id);
    if (focus) t.focus();
    bar.style.transform = `scaleX(${(r / z).toFixed(3)})`;
    // the number and its line fade out, change, and fade back in
    clearTimeout(swapT);
    const put = () => { num.textContent = fmt(r); line.textContent = t.dataset.l; panel.classList.remove('is-swap'); };
    if (instant || still()) { put(); return; }
    panel.classList.add('is-swap');
    swapT = setTimeout(put, 140);
  }
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => show(i));
    t.addEventListener('keydown', (e) => {
      const n = tabs.length, k = e.key;
      const j = k === 'ArrowRight' || k === 'ArrowDown' ? (i + 1) % n : k === 'ArrowLeft' || k === 'ArrowUp' ? (i + n - 1) % n : k === 'Home' ? 0 : k === 'End' ? n - 1 : -1;
      if (j >= 0) { e.preventDefault(); show(j, true); }
    });
  });
  mark();
  setInterval(mark, 60000);
  // start on the band in force (the page is written showing night)
  const now = nowBand();
  cur = tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true');
  if (now >= 0 && now !== cur) show(now, false, true);
}

// The hotspot markers on the map (src/pages/metros.mjs). Pointing at a marker,
// or at its row in the list under the map, lights both and names the road; a
// tap pins it. The two legend buttons show or hide each kind. Without the
// script the markers still carry their road in a <title> and the list reads on
// its own.
const hsMap = $('.mx-hs');
if (hsMap) {
  const tip = $('#mx-tip'), fig = $('.mx-map');
  const marks = new Map($$('.hs', hsMap).map((m) => [+m.dataset.h, m]));
  const rows = $$('.hs-list li');
  const hint = 'Point at a hotspot, or tap one, to see its road.';
  const still = () => document.documentElement.classList.contains('motion-paused') || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let pinned = -1;
  tip.hidden = false;
  tip.textContent = hint;

  function light(i) {
    marks.forEach((m, j) => m.classList.toggle('is-on', j === i));
    rows.forEach((r) => r.classList.toggle('is-on', +r.dataset.h === i));
    const m = marks.get(i);
    if (m) {
      hsMap.appendChild(m); // draw the lit one on top of its neighbours
      tip.textContent = $('title', m).textContent;
    } else tip.textContent = hint;
  }
  const pin = (i) => { pinned = pinned === i ? -1 : i; light(pinned); };

  marks.forEach((m, i) => {
    m.addEventListener('pointerenter', () => light(i));
    m.addEventListener('pointerleave', () => light(pinned));
    m.addEventListener('click', () => pin(i));
  });
  rows.forEach((r) => {
    const i = +r.dataset.h;
    r.addEventListener('pointerenter', () => light(i));
    r.addEventListener('pointerleave', () => light(pinned));
    r.addEventListener('focus', () => light(i));
    r.addEventListener('blur', () => light(pinned));
    // a row far below the map pins its marker and brings the map back into view
    const go = () => {
      pinned = i;
      light(i);
      const box = fig.getBoundingClientRect();
      if (box.bottom < 80 || box.top > innerHeight) {
        if (window.lenis) window.lenis.scrollTo(fig, { offset: -80, immediate: still() });
        else fig.scrollIntoView({ block: 'start', behavior: still() ? 'auto' : 'smooth' });
      }
    };
    r.addEventListener('click', go);
    r.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
  });

  $$('.mx-key .mk').forEach((b) => {
    b.addEventListener('click', () => {
      const on = b.getAttribute('aria-pressed') !== 'true';
      b.setAttribute('aria-pressed', String(on));
      hsMap.classList.toggle(`no-${b.dataset.t}`, !on);
      const m = marks.get(pinned);
      if (!on && m && m.classList.contains(b.dataset.t)) { pinned = -1; light(-1); }
    });
  });
}
