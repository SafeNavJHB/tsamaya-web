import { site } from '../../site.config.mjs';
import { section, eyebrow, icon, button } from '../components.mjs';

// The dedicated "Get the app" page. This used to be a section bolted onto
// contact.html (#beta), which crammed two jobs onto one page and read as an
// overlap; the header CTA and every "Join the beta" button now lands here.
// Contact stays purely contact.

const hero = `
<section class="page-hero">
  <div class="wrap">
    ${eyebrow('Get the app')}
    <h1>Put Tsamaya on your phone.</h1>
    <p class="lede center-narrow">Free while in beta, on both platforms — TestFlight on iPhone, a direct download on Android. A couple of minutes to set up, and you can leave whenever you like.</p>
  </div>
</section>`;

// iPhone: two ways in, depending on whether the public TestFlight link is
// configured in site.config.mjs. With a link, people install it themselves;
// without one, they email and Kyle replies with the link.
const hasPublicLink = Boolean(site.testflightPublicLink);
const iosAction = hasPublicLink
  ? `<a class="btn btn-primary btn-lg" href="${site.testflightPublicLink}" rel="noopener">${icon('phone', 18)} Install the beta</a>
     <p class="muted">Opens TestFlight on your iPhone. No sign-up, nothing to fill in.</p>`
  : `<a class="btn btn-primary btn-lg" href="mailto:${site.contactEmail}?subject=${encodeURIComponent(site.betaSubject)}&body=${encodeURIComponent(
      'Hi Tsamaya\n\nPlease send me the TestFlight link so I can try the beta.\n\nThanks',
    )}">${icon('mail', 18)} Ask for the link</a>
     <p class="muted">Send us your email address and we’ll reply with the TestFlight link and a short guide. That’s all we need — no Apple ID, no forms.</p>`;

// Android: a direct download. The APK lives on this repo's GitHub Releases
// behind an evergreen URL — see the androidApk block in site.config.mjs for
// the whole story and the one-line swap to the Play Store when it's live.
const androidCard = site.androidApk?.url
  ? `
      <div class="note-card platform-card">
        <h3>${icon('phone', 20)} On Android</h3>
        <p>Tsamaya installs directly — no store account, no invite needed. The Play Store listing is on its way; this is the same app, a step earlier.</p>
        <a class="btn btn-primary btn-lg" href="${site.androidApk.url}" rel="noopener">${icon('download', 18)} Download for Android</a>
        <p class="muted">APK · v${site.androidApk.version} · ${site.androidApk.sizeMb} MB · updated ${site.androidApk.updated}</p>
        <ol class="mini-steps">
          <li>Download <strong>tsamaya.apk</strong> on your phone.</li>
          <li>Open the downloaded file and allow the install when your phone asks.</li>
          <li>Android may warn about an unknown developer — that’s normal for an app from outside the Play Store.</li>
        </ol>
      </div>`
  : '';

const platforms = section({
  id: 'beta',
  cls: 'band',
  inner: `
  ${eyebrow('Two ways in')}
  <h2 class="center">Pick your phone</h2>
  <div class="card-2 platform-grid">
    <div class="note-card platform-card">
      <h3>${icon('phone', 20)} On iPhone</h3>
      <p>Tsamaya ships through Apple’s TestFlight while in beta — Apple’s own app for trying new software. Free, and easy to leave.</p>
      ${iosAction}
      <ol class="mini-steps">
        <li>Open the TestFlight link on your iPhone.</li>
        <li>Install TestFlight if you don’t have it, then tap Install for Tsamaya.</li>
        <li>That’s it — updates arrive automatically during the beta.</li>
      </ol>
    </div>
    ${androidCard}
  </div>
  <p class="muted center mt">Free during the beta on both platforms, with nothing to pay later for the safety basics. Just your email if you’d like to send feedback.</p>`,
});

// What to expect once it's installed — moved verbatim-in-spirit from the old
// contact-page section, with step 1 made platform-neutral.
const gettingStarted = section({
  cls: 'band-soft section',
  inner: `
  ${eyebrow('Once it’s installed')}
  <h2 class="center">Getting started takes about five minutes</h2>
  <div class="steps">
    <div class="step">
      <span class="step-num">1</span>
      ${icon('download', 26, 'step-ic')}
      <h3>Open Tsamaya and look around</h3>
      <p>The map opens on your metro with the risk picture already drawn — zones and rated roads, coloured by risk level and time of day. A short tour points out the important bits on first run.</p>
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
    <p>If an area looks mis-rated, tap the flag on the map and say so. That goes straight into our review queue. For anything else, email <a href="mailto:${site.contactEmail}">${site.contactEmail}</a> — reports about roads you actually drive are the most useful thing you can send us.</p>
  </div>`,
});

const cta = `
<section class="cta-band">
  <div class="wrap cta-inner">
    <div><h2>Want the full picture first?</h2><p>See how the routing thinks, or watch the app drive a real route before you install anything.</p></div>
    <div class="cta-actions">${button('How it works', 'how-it-works.html', 'primary')}${button('See it in action', 'demo.html', 'ghost-light')}</div>
  </div>
</section>`;

export default {
  slug: 'get-app.html',
  title: 'Get the app',
  description:
    'Install Tsamaya on iPhone (TestFlight) or Android (direct download) — free during the beta — and get set up in about five minutes.',
  body: [hero, platforms, gettingStarted, cta].join('\n'),
};
