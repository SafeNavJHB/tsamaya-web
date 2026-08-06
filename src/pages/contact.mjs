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
        <h3>${icon('shield', 18)} Spotted a risky area?</h3>
        <p>Local knowledge makes Tsamaya better. Tell us about a corner we should flag, or one we’ve got wrong.</p>
        <a class="btn btn-ghost btn-sm" href="mailto:${site.contactEmail}?subject=Risk%20area%20report">Report an area</a>
      </div>
    </aside>
  </div>`,
});

// Two ways in, depending on whether the public TestFlight link is configured.
// With a link, people install it themselves. Without one, they email and Kyle
// replies with the link — no Apple ID needed either way, just an email address.
const hasPublicLink = Boolean(site.testflightPublicLink);

const betaAction = hasPublicLink
  ? `<a class="btn btn-primary btn-lg" href="${site.testflightPublicLink}" rel="noopener">${icon('phone', 18)} Install the beta</a>
        <p class="muted center">Opens TestFlight on your iPhone. No sign-up, nothing to fill in.</p>`
  : `<a class="btn btn-primary btn-lg" href="mailto:${site.contactEmail}?subject=${encodeURIComponent(site.betaSubject)}&body=${encodeURIComponent(
      'Hi Tsamaya\n\nPlease send me the TestFlight link so I can try the beta.\n\nThanks',
    )}">${icon('mail', 18)} Ask for the link</a>
        <p class="muted center">Send us your email address and we’ll reply with the TestFlight link and a short guide to getting started. That’s all we need. No Apple ID, no forms.</p>`;

// Android is a DIRECT download — no store account, no invite. The APK lives on
// this repo's GitHub Releases behind an evergreen URL (site.config.mjs has the
// whole story), so this block never needs touching when a new build ships.
// When the Play Store listing is live the config swaps to the Play URL and the
// caveat copy below should be trimmed to match.
const androidAction = site.androidApk?.url
  ? `<a class="btn btn-primary btn-lg" href="${site.androidApk.url}" rel="noopener">${icon('download', 18)} Download for Android</a>
        <p class="muted center">Direct install (APK) · v${site.androidApk.version} · ${site.androidApk.sizeMb} MB · updated ${site.androidApk.updated}.<br>Open the downloaded file and allow the install when your phone asks. Android may warn about an unknown developer — that’s normal for a download outside the Play Store, where Tsamaya is headed next.</p>`
  : '';

const beta = `
<section id="beta" class="band-soft section">
  <div class="wrap">
    <div class="beta-card">
      <div>
        ${eyebrow('Get the app')}
        <h2>Try Tsamaya on your phone</h2>
        <p class="big">Tsamaya is in open beta — TestFlight on iPhone, a direct download on Android. It’s free, it takes a couple of minutes to set up, and you can leave whenever you like.</p>
        <ul class="check-list">
          <li>${icon('check')} Free, with nothing to pay later during the beta</li>
          <li>${icon('check')} iPhone via TestFlight, Android as a direct download below</li>
          <li>${icon('check')} Just your email address. We don’t need your Apple ID</li>
          <li>${icon('check')} Tell us what’s wrong and we’ll usually fix it that week</li>
        </ul>
      </div>
      <div class="beta-action">
        ${betaAction}
        ${androidAction}
      </div>
    </div>
  </div>
</section>`;

// What to expect once you're in. People install a beta and then wonder what they
// are supposed to do with it, so this answers that before they have to ask.
const gettingStarted = section({
  cls: 'band',
  inner: `
  ${eyebrow('Once you’re in')}
  <h2 class="center">Getting started takes about five minutes</h2>
  <div class="steps">
    <div class="step">
      <span class="step-num">1</span>
      ${icon('download', 26, 'step-ic')}
      <h3>Install TestFlight, then Tsamaya</h3>
      <p>TestFlight is Apple’s own app for trying beta software. Open the link we send on your iPhone, install TestFlight if you don’t have it, then tap Install for Tsamaya.</p>
    </div>
    <div class="step">
      <span class="step-num">2</span>
      ${icon('pin', 26, 'step-ic')}
      <h3>Allow location while driving</h3>
      <p>Tsamaya needs your location to show where you are and to plan a route from where you’re standing. Choose “While Using the App”. It never tracks you in the background.</p>
    </div>
    <div class="step">
      <span class="step-num">3</span>
      ${icon('route', 26, 'step-ic')}
      <h3>Drive a route you already know</h3>
      <p>The best first test is a trip you make often. You’ll see straight away whether the route it suggests makes sense to you, and that’s exactly the feedback worth having.</p>
    </div>
  </div>
  <div class="note-card mt">
    <h3>${icon('chat', 20)} Telling us something’s wrong</h3>
    <p>If an area looks mis-rated, tap the flag on the map and say so. That goes straight into our review queue. For anything else, shake your phone in TestFlight to send a screenshot and a note, or just email <a href="mailto:${site.contactEmail}">${site.contactEmail}</a>. Reports about roads you actually drive are the most useful thing you can send us.</p>
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
  body: [hero, beta, gettingStarted, main, cta].join('\n'),
};
