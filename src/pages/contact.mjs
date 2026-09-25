import { site } from '../../site.config.mjs';
import { pageHead, sec, linkQ } from '../kit.mjs';

// The form composes an email (site.js, form.contact-form[data-mailto]): nothing
// is sent anywhere from this page.
const form = `
      <form class="contact-form" data-mailto="${site.contactEmail}" data-reveal>
        <h2 class="hud">Send a message</h2>
        <p class="form-note">This opens your email app with everything filled in. No account, no sign-up.</p>
        <label>Your name
          <input type="text" name="name" autocomplete="name" required placeholder="Thandi M."/>
        </label>
        <label>Your email
          <input type="email" name="email" autocomplete="email" required placeholder="you@example.com"/>
        </label>
        <label>What is it about?
          <select name="topic">
            <option>Getting the app</option>
            <option>Support or a donation</option>
            <option>A corner we got wrong</option>
            <option>Partnership or press</option>
            <option>Something else</option>
          </select>
        </label>
        <label>Message
          <textarea name="message" rows="6" required placeholder="Tell us a bit more"></textarea>
        </label>
        <button type="submit" class="btn btn-primary btn-lg">Open email to send</button>
        <p class="form-note">Or email us directly at <a href="mailto:${site.contactEmail}">${site.contactEmail}</a>.</p>
      </form>`;

const ROWS = [
  ['Email', `<a href="mailto:${site.contactEmail}">${site.contactEmail}</a>`, 'We usually reply within a day or two. Every message reaches a real person.'],
  ['Based in', 'Johannesburg, South Africa', 'Built for South African metros.'],
  ['Here for the app?', 'Installing Tsamaya has its own page, for iPhone and Android.', linkQ('Get the app', 'get-app.html')],
  ['A corner we got wrong?', 'Local knowledge makes the map better: a road we flag that is fine these days, or one we have missed.', linkQ('Report it by email', `mailto:${site.contactEmail}?subject=${encodeURIComponent('A corner you got wrong')}`)],
];

const side = `
      <dl class="rows" data-reveal>
        ${ROWS.map(([k, v, note]) => `<div><dt class="hud">${k}</dt><dd><p class="rows-v">${v}</p><p class="rows-n">${note}</p></dd></div>`).join('\n        ')}
      </dl>`;

export default {
  slug: 'contact.html',
  title: 'Contact us',
  description:
    'Get in touch about the beta, sponsorship, or a corner of the map we should know about. Tsamaya is built in Johannesburg.',
  heroClass: 'sn page-contact',
  hud: false,
  body: [
    pageHead({
      meta: 'Contact',
      title: "Let's talk.",
      lead: 'Beta access, sponsorship, a corner we have got wrong, or just hello. Every message reaches a real person.',
    }),
    sec({ id: 'write', cls: 'contact', head: false, inner: `<div class="contact-in">${form}${side}\n    </div>` }),
    sec({
      id: 'more',
      cls: 'tail',
      kick: 'While you are here',
      title: 'Like what we are building?',
      lead: 'Drive with it, and tell us where the map is wrong. There are a few other ways to help too.',
      inner: `<p class="more" data-reveal>${linkQ('Ways to help', 'sponsor.html')}${linkQ('How it works', 'how-it-works.html')}</p>`,
    }),
  ].join('\n'),
};
