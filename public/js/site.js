// site.js: runs on every page. The site is complete without it; this adds the
// live clock, the menu, smooth scrolling and motion.
//
// Replaces the old app.js (2026/09 redesign). Everything app.js did is kept here:
// the menu, copy buttons, the contact form's mailto, the coverage map and list
// lighting each other, and reveal-on-scroll with its failsafe.
//
// RULES THIS FILE KEEPS
//  - Reduced motion means none: no smooth scroll, no reveals, no magnetic pull.
//  - Content is never left hidden: every "hidden before reveal" state is scoped
//    under html.js, and a failsafe shows anything still hidden after 3 s.
//  - No count-ups. A number on this site is always a true figure; animating
//    through made-up in-between values was removed on purpose once already (a
//    screenshot caught "117 risk zones" for a metro that had 918).
//  - Libraries are optional. GSAP, ScrollTrigger, SplitText and Lenis are loaded
//    before this file with `defer`; if any failed, the matching feature is
//    skipped and nothing else breaks.
(function () {
  'use strict';

  var doc = document.documentElement;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // A fresh visit to a page opens at its top, whatever the last page's scroll
  // was. Back and forward (and a #link) keep the browser's own position.
  try {
    var navEntry = performance.getEntriesByType('navigation')[0];
    if (navEntry && navEntry.type === 'navigate' && !location.hash && window.scrollY) window.scrollTo(0, 0);
  } catch (e) {}

  /* ------------------------------------------------------------------------
   * 1. South African time and the ratings band in force.
   *
   * South Africa has no daylight saving, so SAST is always UTC+2 and needs no
   * time-zone database. The bands are the app's: daytime 05:00 to 17:30,
   * evening 17:30 to 19:30, night 19:30 to 05:00.
   * --------------------------------------------------------------------- */
  var BANDS = [
    { key: 'day', name: 'Daytime', from: 300, to: 1050 },
    { key: 'evening', name: 'Evening', from: 1050, to: 1170 },
    { key: 'night', name: 'Night', from: 1170, to: 300 },
  ];
  function saMinutes() {
    var d = new Date();
    return (d.getUTCHours() * 60 + d.getUTCMinutes() + 120) % 1440;
  }
  function bandAt(m) {
    if (m >= 300 && m < 1050) return BANDS[0];
    if (m >= 1050 && m < 1170) return BANDS[1];
    return BANDS[2];
  }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function paintClock() {
    var m = saMinutes();
    var band = bandAt(m);
    var time = pad(Math.floor(m / 60)) + ':' + pad(m % 60);
    $$('[data-sa-clock]').forEach(function (el) { el.textContent = time + ' SAST · ' + band.name + ' ratings'; });
    $$('[data-sa-time]').forEach(function (el) { el.textContent = time; });
    $$('[data-sa-band]').forEach(function (el) { el.textContent = band.name; });
    doc.setAttribute('data-band', band.key);
  }
  paintClock();
  setInterval(paintClock, 30000);
  // Shared with page scripts (the scene, the map) so every surface agrees.
  window.Tsamaya = { saMinutes: saMinutes, bandAt: bandAt, bands: BANDS, reducedMotion: reduce };

  /* ------------------------------------------------------------------------
   * 1b. Light and dark. The head script (layout.mjs) has already applied the
   *     visitor's stored choice or the device's. The header button switches;
   *     a choice that matches the device is not stored, so the site follows the
   *     device again from then on. While a dark area (.scheme-dark: the scene,
   *     the maps) is under the header, the header goes dark with it.
   * --------------------------------------------------------------------- */
  var themeBtn = $('[data-theme-toggle]');
  var mqLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)');
  var device = function () { return mqLight && mqLight.matches ? 'light' : 'dark'; };
  var stored = function () { try { var t = localStorage.getItem('ts-theme'); return t === 'light' || t === 'dark' ? t : null; } catch (e) { return null; } };
  function applyTheme(t, animate) {
    if (animate && !reduce) { doc.classList.add('theme-anim'); setTimeout(function () { doc.classList.remove('theme-anim'); }, 350); }
    doc.setAttribute('data-theme', t);
    if (themeBtn) themeBtn.setAttribute('aria-label', t === 'light' ? 'Switch to dark mode' : 'Switch to light mode');
    $$('meta[name="theme-color"]').forEach(function (m) { m.setAttribute('content', t === 'light' ? '#F4F6F9' : '#0A0F1C'); });
  }
  applyTheme(doc.getAttribute('data-theme') === 'light' ? 'light' : 'dark');
  if (themeBtn) themeBtn.addEventListener('click', function () {
    var next = doc.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    try { if (next === device()) localStorage.removeItem('ts-theme'); else localStorage.setItem('ts-theme', next); } catch (e) {}
    applyTheme(next, true);
  });
  if (mqLight) {
    var onDevice = function () { if (!stored()) applyTheme(device(), true); };
    if (mqLight.addEventListener) mqLight.addEventListener('change', onDevice); else if (mqLight.addListener) mqLight.addListener(onDevice);
  }

  /* ------------------------------------------------------------------------
   * 2. Header: solid once the page has moved.
   * --------------------------------------------------------------------- */
  var header = $('.site-header');
  function onScroll() { if (header) header.classList.toggle('is-solid', window.scrollY > 24); }
  // the header strip: is any dark area under it?
  var darks = $$('.scheme-dark').filter(function (el) { return !header || !header.contains(el); });
  if (header && darks.length && 'IntersectionObserver' in window) {
    var under = new Set();
    var headIo;
    var watch = function () {
      if (headIo) headIo.disconnect();
      under.clear();
      var h = header.offsetHeight || 68;
      headIo = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) under.add(e.target); else under.delete(e.target); });
        header.classList.toggle('on-dark', under.size > 0);
      }, { rootMargin: '0px 0px ' + (h - window.innerHeight) + 'px 0px' });
      darks.forEach(function (el) { headIo.observe(el); });
    };
    watch();
    window.addEventListener('resize', watch);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ------------------------------------------------------------------------
   * 3. Mobile menu: a full-screen sheet. Escape closes it, and focus goes back
   *    to the button that opened it.
   * --------------------------------------------------------------------- */
  var toggle = $('.nav-toggle');
  var sheet = $('.mobile-nav');
  function setMenu(open) {
    if (!toggle || !sheet) return;
    sheet.classList.toggle('open', open);
    doc.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (header) header.classList.toggle('is-solid', open || window.scrollY > 24);
    if (open) { var first = $('a', sheet); if (first) first.focus({ preventScroll: true }); }
  }
  if (toggle && sheet) {
    toggle.addEventListener('click', function () { setMenu(!sheet.classList.contains('open')); });
    $$('a', sheet).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && sheet.classList.contains('open')) { e.preventDefault(); setMenu(false); toggle.focus(); }
    });
  }

  /* ------------------------------------------------------------------------
   * 4. Copy-to-clipboard buttons (bank details, payment reference).
   * --------------------------------------------------------------------- */
  $$('.copy-btn').forEach(function (btn) {
    // the resting icon and label, taken once: a second press inside the 1.4 s
    // must not save the tick as the thing to go back to
    var prev = btn.innerHTML, label = btn.getAttribute('aria-label'), undo = 0;
    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-copy') || '';
      var done = function () {
        btn.classList.add('copied');
        btn.setAttribute('aria-label', 'Copied');
        btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5l5 5 11-11"/></svg>';
        clearTimeout(undo);
        undo = setTimeout(function () { btn.classList.remove('copied'); btn.innerHTML = prev; if (label) btn.setAttribute('aria-label', label); }, 1400);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, done);
      } else {
        var t = document.createElement('textarea');
        t.value = text;
        document.body.appendChild(t);
        t.select();
        try { document.execCommand('copy'); } catch (e) {}
        document.body.removeChild(t);
        done();
      }
    });
  });

  /* ------------------------------------------------------------------------
   * 5. Contact form: compose a mailto with the filled-in fields.
   * --------------------------------------------------------------------- */
  var form = $('.contact-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var to = form.getAttribute('data-mailto');
      var name = (form.name && form.name.value) || '';
      var email = (form.email && form.email.value) || '';
      var topic = (form.topic && form.topic.value) || 'Hello';
      var message = (form.message && form.message.value) || '';
      var subject = 'Tsamaya: ' + topic;
      var body = message + '\n\nFrom: ' + name + (email ? ' (' + email + ')' : '');
      window.location.href = 'mailto:' + to + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    });
  }

  /* ------------------------------------------------------------------------
   * 6. Coverage map and its list light each other up (hover and keyboard focus).
   *    Keyboard users reach the list, never the drawing, so focusing a row has
   *    to light the map too.
   * --------------------------------------------------------------------- */
  $$('.zamap').forEach(function (map) {
    var linked = $$('[data-metro]', map);
    var mark = function (key, on) {
      linked.forEach(function (el) { if (el.getAttribute('data-metro') === key) el.classList.toggle('is-active', on); });
    };
    linked.forEach(function (el) {
      var key = el.getAttribute('data-metro');
      var on = function () { mark(key, true); };
      var off = function () { mark(key, false); };
      el.addEventListener('mouseenter', on);
      el.addEventListener('mouseleave', off);
      el.addEventListener('focus', on);
      el.addEventListener('blur', off);
    });
  });

  /* ------------------------------------------------------------------------
   * 7. "Pause motion". Any element with [data-motion-toggle] switches every
   *    self-running animation off and on (WCAG 2.2.2). Page scripts listen for
   *    the 'tsamaya:motion' event and read html.motion-paused.
   * --------------------------------------------------------------------- */
  function setPaused(paused) {
    doc.classList.toggle('motion-paused', paused);
    $$('[data-motion-toggle]').forEach(function (b) {
      b.setAttribute('aria-pressed', paused ? 'true' : 'false');
      var label = $('.motion-label', b);
      if (label) label.textContent = paused ? 'Play motion' : 'Pause motion';
    });
    document.dispatchEvent(new CustomEvent('tsamaya:motion', { detail: { paused: paused } }));
  }
  $$('[data-motion-toggle]').forEach(function (b) {
    b.addEventListener('click', function () { setPaused(!doc.classList.contains('motion-paused')); });
  });
  window.Tsamaya.setMotionPaused = setPaused;

  /* ------------------------------------------------------------------------
   * 8. Reveal on scroll ([data-reveal]), with the failsafe.
   * --------------------------------------------------------------------- */
  var revealTargets = $$('[data-reveal]');
  function showAll() { revealTargets.forEach(function (el) { el.classList.add('is-visible'); }); }
  if (reduce || !('IntersectionObserver' in window)) {
    showAll();
  } else {
    var seen = new WeakSet();
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting || seen.has(entry.target)) return;
        seen.add(entry.target);
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
    revealTargets.forEach(function (el) { io.observe(el); });
    // Failsafe: content is not worth risking for an animation. Anything the
    // observer has not revealed after 3 s is shown regardless.
    setTimeout(showAll, 3000);
  }

  /* ------------------------------------------------------------------------
   * 9. Smooth scrolling and GSAP, when available and wanted.
   *
   * Lenis smooths mouse-wheel scrolling only; touch screens keep native
   * scrolling (syncTouch false). It is exposed as window.lenis so page scripts
   * and tests can drive it, and kept in step with ScrollTrigger.
   * --------------------------------------------------------------------- */
  var gsap = window.gsap;
  var ScrollTrigger = window.ScrollTrigger;
  var SplitText = window.SplitText;
  if (gsap && ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    if (SplitText) gsap.registerPlugin(SplitText);
    ScrollTrigger.config({ ignoreMobileResize: true });
  }

  if (!reduce && window.Lenis) {
    var lenis = new window.Lenis({ lerp: 0.1, smoothWheel: true, syncTouch: false });
    window.lenis = lenis;
    doc.classList.add('has-lenis');
    if (gsap && ScrollTrigger) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
    } else {
      var raf = function (t) { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
    // In-page anchors go through Lenis so the smoothing is not fought.
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var target = document.getElementById(id.slice(1));
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -80 });
      history.pushState(null, '', id);
      // and move focus there, as the browser would have (the skip link most of all)
      if (!target.matches('a[href], button, input, select, textarea, [tabindex]')) { target.setAttribute('tabindex', '-1'); target.setAttribute('data-anchor', ''); }
      target.focus({ preventScroll: true });
    });
    // Anything that must stop the page scrolling (the menu) sets html.menu-open.
    new MutationObserver(function () {
      if (doc.classList.contains('menu-open')) lenis.stop(); else lenis.start();
    }).observe(doc, { attributes: true, attributeFilter: ['class'] });
  }

  /* ------------------------------------------------------------------------
   * 10. Headline reveals ([data-split]): lines rise from behind a mask, expo
   *     out, about a second, 0.1 s apart. SplitText keeps the real text for
   *     screen readers (aria: 'auto'). Headlines only, never body copy.
   * --------------------------------------------------------------------- */
  if (!reduce && gsap && ScrollTrigger && SplitText) {
    $$('[data-split]').forEach(function (el) {
      var inHero = el.hasAttribute('data-split-now');
      SplitText.create(el, {
        type: 'lines', mask: 'lines', aria: 'auto', autoSplit: true,
        onSplit: function (self) {
          return gsap.from(self.lines, {
            yPercent: 100, duration: 1.05, ease: 'expo.out', stagger: 0.1,
            delay: inHero ? 0.15 : 0,
            scrollTrigger: inHero ? undefined : { trigger: el, start: 'top 82%', once: true },
          });
        },
      });
    });
  }

  /* ------------------------------------------------------------------------
   * 11. Magnetic primary buttons (.btn-mag): a gentle pull toward the pointer,
   *     fine pointers only.
   * --------------------------------------------------------------------- */
  if (!reduce && finePointer && gsap) {
    $$('.btn-mag').forEach(function (el) {
      var xTo = gsap.quickTo(el, 'x', { duration: 0.45, ease: 'power3' });
      var yTo = gsap.quickTo(el, 'y', { duration: 0.45, ease: 'power3' });
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.25);
        yTo((e.clientY - r.top - r.height / 2) * 0.25);
      });
      el.addEventListener('pointerleave', function () { xTo(0); yTo(0); });
    });
  }

  /* ------------------------------------------------------------------------
   * 12. Questions (.qa) on the inner pages: every answer is open in the HTML,
   *     so the page reads without JavaScript; fold all but the one marked
   *     data-open. The home page runs its own (home.js), which also keeps the
   *     reader's place round its pinned scene.
   * --------------------------------------------------------------------- */
  if (!document.body.classList.contains('page-home')) {
    var refresh = function () { if (window.ScrollTrigger) window.ScrollTrigger.refresh(); };
    $$('.qa').forEach(function (qa) {
      var btn = $('button', qa), panel = $('.qa-a', qa);
      if (!btn || !panel) return;
      var open = qa.hasAttribute('data-open');
      btn.setAttribute('aria-expanded', String(open));
      panel.hidden = !open;
      btn.addEventListener('click', function () {
        var now = btn.getAttribute('aria-expanded') !== 'true';
        btn.setAttribute('aria-expanded', String(now));
        if (reduce || !gsap) { panel.hidden = !now; refresh(); return; }
        gsap.killTweensOf(panel);
        if (now) {
          panel.hidden = false;
          gsap.fromTo(panel, { height: 0 }, { height: 'auto', duration: 0.18, ease: 'power2.out', clearProps: 'height', onComplete: refresh });
        } else {
          gsap.to(panel, { height: 0, duration: 0.18, ease: 'power2.in', onComplete: function () { panel.hidden = true; gsap.set(panel, { clearProps: 'height' }); refresh(); } });
        }
      });
    });
  }

  /* ------------------------------------------------------------------------
   * 13. The store panels ([data-platform]): light the one for the visitor's
   *     phone. Only a border and a label: nothing moves.
   * --------------------------------------------------------------------- */
  var ua = navigator.userAgent || '';
  var mine = /Android/i.test(ua) ? 'android' : /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) ? 'ios' : '';
  if (mine) $$('[data-platform="' + mine + '"]').forEach(function (el) { el.classList.add('is-mine'); });
})();
