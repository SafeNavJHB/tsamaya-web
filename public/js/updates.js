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
      const added = next.map((r) => list.appendChild(document.importNode(r, true)));
      // the chips count what is on the page
      document.querySelectorAll('.chip[for^="f-"]').forEach((c) => {
        const k = c.getAttribute('for').slice(2), n = c.querySelector('.num');
        if (n) n.textContent = list.querySelectorAll(k === 'all' ? '.it' : `.it[data-c="${k}"]`).length;
      });
      // and the line above them says what the list now holds
      const sc = document.querySelector('[data-scope]'), ds = list.querySelectorAll(':scope > .rel > .tl-d');
      if (sc && ds.length) {
        const a = ds[0].textContent.trim(), z = ds[ds.length - 1].textContent.trim(), n = list.children.length;
        const [da, ma, ya] = a.split(' '), [dz, mz, yz] = z.split(' ');
        const span = a === z ? a : ya === yz ? (ma === mz ? `${dz} to ${da} ${ma} ${ya}` : `${dz} ${mz} to ${da} ${ma} ${ya}`) : `${z} to ${a}`;
        sc.textContent = `${n === +sc.dataset.total ? `All ${n} updates` : `The ${n} most recent updates`} · ${span}`;
      }
      if (status) status.textContent = `${next.length} earlier release${next.length === 1 ? '' : 's'} added.`;
      if (!rels.length) link.closest('.up-more-row').remove();
      else if (count) count.textContent = `${rels.length} more`;
      // keyboard and screen-reader users continue from the first one added that
      // the filter shows; with none shown, from the list itself
      const first = added.find((r) => r.offsetParent !== null);
      const h = first ? first.querySelector('.tl-d') : list;
      h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true });
      if (window.ScrollTrigger) window.ScrollTrigger.refresh();
    }).catch(() => { window.location.href = link.href; }) // could not fetch: go to the page itself
      .finally(() => { busy = false; link.removeAttribute('aria-busy'); });
  });
}
