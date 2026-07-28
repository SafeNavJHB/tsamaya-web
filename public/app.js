// app.js — small progressive enhancements. Site works without JS; this adds polish.
(function () {
  'use strict';

  // 1. Mobile nav toggle
  var toggle = document.querySelector('.nav-toggle');
  var mobileNav = document.querySelector('.mobile-nav');
  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      var open = mobileNav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    mobileNav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        mobileNav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // 2. Copy-to-clipboard buttons (bank details, payment reference)
  document.querySelectorAll('.copy-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-copy') || '';
      var done = function () {
        btn.classList.add('copied');
        var prev = btn.innerHTML;
        btn.innerHTML =
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5l5 5 11-11"/></svg>';
        setTimeout(function () {
          btn.classList.remove('copied');
          btn.innerHTML = prev;
        }, 1400);
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

  // 3. Contact form → compose a mailto: with the filled-in fields.
  var form = document.querySelector('.contact-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var to = form.getAttribute('data-mailto');
      var name = (form.name && form.name.value) || '';
      var email = (form.email && form.email.value) || '';
      var topic = (form.topic && form.topic.value) || 'Hello';
      var message = (form.message && form.message.value) || '';
      var subject = 'Tsamaya — ' + topic;
      var body =
        message + '\n\n— ' + name + (email ? ' (' + email + ')' : '');
      window.location.href =
        'mailto:' + to +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(body);
    });
  }

  // 4. Shrink header on scroll for a touch of depth
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () {
      header.style.boxShadow = window.scrollY > 8 ? 'var(--shadow-sm)' : 'none';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ------------------------------------------------------------------------
   * 5. Motion — reveal on scroll, and counting stat numbers.
   *
   * Rules this obeys:
   *  - Anyone who has asked their operating system for reduced motion gets none
   *    of it. Not "less"; none. We bail out entirely before observing anything.
   *  - The real value is always in the HTML. Counting animates *toward* a number
   *    that is already correct, so a reader who arrives mid-animation, or whose
   *    browser lacks IntersectionObserver, sees the true figure regardless.
   *  - Each element animates once. Re-animating on every scroll past is a
   *    fidget, not a flourish.
   * --------------------------------------------------------------------- */
  var stillPlease =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var revealTargets = document.querySelectorAll('[data-reveal]');

  if (stillPlease || !('IntersectionObserver' in window)) {
    // Show everything in its final state and do nothing else.
    for (var r = 0; r < revealTargets.length; r++) {
      revealTargets[r].classList.add('is-visible');
    }
    return;
  }

  /* DELIBERATELY ABSENT: counting stat numbers.
   *
   * It was built and it worked, and it was removed on purpose. A count-up
   * displays a sequence of numbers that are not true on the way to one that is —
   * a screenshot taken mid-animation showed "117 risk zones mapped" for Cape Town,
   * which actually has 918. On a site whose whole argument is "these figures come
   * from the live database rather than being typed by hand", rendering false
   * figures for a second, where a crawler or a screenshot can catch them, is a bad
   * trade for a flourish. The bars still grow, which gives the same sense of
   * motion without ever asserting a number that is wrong.
   */

  var seen = new WeakSet();
  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting || seen.has(entry.target)) return;
        seen.add(entry.target);
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    },
    // Trigger slightly before the element reaches the viewport edge, so the
    // animation is already underway by the time it is properly in view.
    { rootMargin: '0px 0px -10% 0px', threshold: 0.08 },
  );

  for (var i = 0; i < revealTargets.length; i++) observer.observe(revealTargets[i]);

  /* Failsafe.
   *
   * Reveal-on-scroll has one genuinely bad failure mode: the elements start at
   * opacity 0, so if the observer never fires, that content is invisible forever.
   * A stalled callback, an odd embedded webview, a browser that throttles
   * observers in a background tab — any of them turn a decoration into a blank
   * page. Content is not worth risking for an animation, so after three seconds
   * anything still unrevealed is shown regardless. If the observer is working
   * normally this never does anything. */
  setTimeout(function () {
    for (var k = 0; k < revealTargets.length; k++) {
      if (!revealTargets[k].classList.contains('is-visible')) {
        revealTargets[k].classList.add('is-visible');
      }
    }
  }, 3000);
})();
