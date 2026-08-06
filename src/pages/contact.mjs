import { site } from '../../site.config.mjs';
import { section, eyebrow, icon, button } from '../components.mjs';

const hero = `
<section class="page-hero">
  <div class="wrap">
    ${eyebrow('Contact us')}
    <h1>Let’s talk.</h1>
    <p class="lede center-narrow">Beta access, sponsorship, a risky corner we’ve missed, or just hello. Every message reaches a real person.</p>
  </div>
</section>`;

const main = section({
  id: 'sponsor',
  cls: 'band',
  inner: `
  <div class="contact-grid">
    <div class="contact-form-wrap">
      <h2>Send a message</h2>
      <p class="sub">This opens your email app with everything filled in. No account, no sign-up.</p>
      <form class="contact-form" data-mailto="${site.contactEmail}">
        <label>Your name
          <input type="text" name="name" autocomplete="name" required placeholder="Thandi M."/>
        </label>
        <label>Your email
          <input type="email" name="email" autocomplete="email" required placeholder="you@example.com"/>
        </label>
        <label>What’s this about?
          <select name="topic">
            <option>Getting the app</option>
            <option>Sponsorship / donation</option>
            <option>Report a risky area</option>
            <option>Partnership / press</option>
            <option>Something else</option>
          </select>
        </label>
        <label>Message
          <textarea name="message" rows="5" required placeholder="Tell us a bit more…"></textarea>
        </label>
        <button type="submit" class="btn btn-primary btn-block">${icon('mail', 16)} Open email to send</button>
        <p class="form-fallback">Or email us directly at <a href="mailto:${site.contactEmail}">${site.contactEmail}</a></p>
      </form>
    </div>
    <aside class="contact-side">
      <div class="contact-card">
        <h3>${icon('mail', 18)} Email</h3>
        <p><a href="mailto:${site.contactEmail}">${site.contactEmail}</a></p>
        <p class="muted">We usually reply within a day or two.</p>
      </div>
      <div class="contact-card">
        <h3>${icon('pin', 18)} Based in</h3>
        <p>Johannesburg, South Africa</p>
        <p class="muted">Built for South African metros.</p>
      </div>
      <div class="contact-card">
        <h3>${icon('phone', 18)} Here for the app?</h3>
        <p>Downloads and setup live on their own page now — iPhone and Android.</p>
        <a class="btn btn-ghost btn-sm" href="get-app.html">Get the app</a>
      </div>
      <div class="contact-card">
        <h3>${icon('shield', 18)} Spotted a risky area?</h3>
        <p>Local knowledge makes Tsamaya better. Tell us about a corner we should flag, or one we’ve got wrong.</p>
        <a class="btn btn-ghost btn-sm" href="mailto:${site.contactEmail}?subject=Risk%20area%20report">Report an area</a>
      </div>
    </aside>
  </div>`,
});

const cta = `
<section class="cta-band">
  <div class="wrap cta-inner">
    <div><h2>Like what we’re building?</h2><p>The best way to help right now is to sponsor a metro or spread the word.</p></div>
    <div class="cta-actions">${button('Sponsor us', 'sponsor.html', 'primary')}${button('How it works', 'how-it-works.html', 'ghost-light')}</div>
  </div>
</section>`;

export default {
  slug: 'contact.html',
  title: 'Contact us',
  description:
    'Get in touch about the beta, sponsorship, or a risky area we should know about. Tsamaya is built in Johannesburg.',
  body: [hero, main, cta].join('\n'),
};
