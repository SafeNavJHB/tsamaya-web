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
