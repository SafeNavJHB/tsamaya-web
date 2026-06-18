import { site } from '../../site.config.mjs';
import { section, eyebrow, icon, button } from '../components.mjs';

const hero = `
<section class="page-hero">
  <div class="wrap">
    ${eyebrow('Contact us')}
    <h1>Let’s talk.</h1>
    <p class="lede center-narrow">Beta access, sponsorship, a risky corner we’ve missed, or just hello — every message reaches a real person.</p>
  </div>
</section>`;

const main = section({
  cls: 'band',
  inner: `
  <div class="contact-grid">
    <div class="contact-form-wrap">
      <h2>Send a message</h2>
      <p class="sub">This opens your email app with everything filled in — no account or sign-up needed.</p>
      <form class="contact-form" data-mailto="${site.contactEmail}">
        <label>Your name
          <input type="text" name="name" autocomplete="name" required placeholder="Thandi M."/>
        </label>
        <label>Your email
          <input type="email" name="email" autocomplete="email" required placeholder="you@example.com"/>
        </label>
        <label>What’s this about?
          <select name="topic">
            <option>Joining the beta</option>
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
        <h3>${icon('shield', 18)} Spotted a risky area?</h3>
        <p>Local knowledge makes Tsamaya better. Tell us about a corner we should flag — or one we’ve flagged wrongly.</p>
        <a class="btn btn-ghost btn-sm" href="mailto:${site.contactEmail}?subject=Risk%20area%20report">Report an area</a>
      </div>
    </aside>
  </div>`,
});

const beta = `
<section id="beta" class="band-soft section">
  <div class="wrap">
    <div class="beta-card">
      <div>
        ${eyebrow('Get the app')}
        <h2>Join the Tsamaya beta</h2>
        <p class="big">Tsamaya is rolling out to testers through Apple’s TestFlight while we polish toward a public release. Request access and we’ll send you an invite link.</p>
        <ul class="check-list">
          <li>${icon('check')} Free during beta</li>
          <li>${icon('check')} iPhone (TestFlight) — Android coming later</li>
          <li>${icon('check')} Your feedback shapes what ships</li>
        </ul>
      </div>
      <div class="beta-action">
        <a class="btn btn-primary btn-lg" href="mailto:${site.contactEmail}?subject=${encodeURIComponent(site.betaSubject)}&body=${encodeURIComponent('Hi Tsamaya team,\n\nI’d love to join the beta. My Apple ID email is:\n\nThanks!')}">${icon('phone', 18)} Request beta access</a>
        <p class="muted center">We’ll add you to the TestFlight group and send the link.</p>
      </div>
    </div>
  </div>
</section>`;

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
    'Get in touch with Tsamaya — request beta access, ask about sponsorship, or report a risky area. Built in Johannesburg.',
  body: [hero, main, beta, cta].join('\n'),
};
