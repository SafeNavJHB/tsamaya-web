// updates.js: "Show earlier updates" on the Updates page (src/pages/updates.mjs).
// Without it the button is a link to updates-archive.html, which lists every
// earlier release. With it, the first press fetches that page once and each
// press adds the next few releases (data-more of them) to this timeline, so the
// filter chips keep working on everything shown.
const link = document.querySelector('.up-more');
const list = document.querySelector('.up-tl');
const status = document.querySelector('[data-more-status]');
if (link && list) {
  const step = +link.dataset.more || 10;
  const count = link.querySelector('.num');
  let pending = null, busy = false;
  const load = () => fetch(link.href).then((r) => { if (!r.ok) throw new Error(r.status); return r.text(); })
    .then((html) => [...new DOMParser().parseFromString(html, 'text/html').querySelectorAll('.up-tl > .rel')]);
  link.addEventListener('click', (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button) return; // a new tab gets the archive page
    e.preventDefault();
    if (busy) return;
    busy = true;
    link.setAttribute('aria-busy', 'true');
    (pending || (pending = load())).then((rels) => {
      const next = rels.splice(0, step);
      next.forEach((r) => list.appendChild(document.importNode(r, true)));
      if (status) status.textContent = `${next.length} earlier release${next.length === 1 ? '' : 's'} added.`;
      // keyboard and screen-reader users continue from the first one added
      const h = next[0] && list.children[list.children.length - next.length].querySelector('.tl-d');
      if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
      if (rels.length) { if (count) count.textContent = `${rels.length} more`; }
      else link.closest('.up-more-row').remove();
      if (window.ScrollTrigger) window.ScrollTrigger.refresh();
    }).catch(() => { window.location.href = link.href; }) // could not fetch: go to the page itself
      .finally(() => { busy = false; link.removeAttribute('aria-busy'); });
  });
}
