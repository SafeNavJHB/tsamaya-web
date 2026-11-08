import { site } from '../../site.config.mjs';
import { pageHead, sec, M } from '../kit.mjs';

// Founding 30 (Kyle, 2026-11-08): the launch was on his 30th birthday, so the
// first 30 drivers to claim here get a free month of Premium. Each tap hands
// out ONE single-use App Store offer-code link through the founding-claim Edge
// Function (SafeNav repo: supabase/functions/founding-claim and
// scripts/founding-30-migration.sql). The page never holds a link in its
// source: the count and the link come from the function at runtime.
//
// A link counts as gone once claimed (Apple does not say which code was
// redeemed). This browser keeps the link it claimed (localStorage) and shows it
// again instead of claiming another. Kept out of search (noindex): the offer
// ends, and a stale search result would promise months that are gone.

const how = sec({
  id: 'how',
  kick: 'The small print, in plain words',
  title: 'How the free month works',
  inner: `
    <ul class="f30-rules" data-reveal>
      <li>One free month of Tsamaya Premium on the monthly plan: toll and fuel costs for each trip, fuel price alerts, the SARS-ready logbook and your full trip history.</li>
      <li>For iPhone, on a South African App Store account that has not had Premium before, or whose Premium has ended.</li>
      <li>After the free month it renews at the normal App Store price unless you cancel. To cancel, open Settings on your iPhone, tap your name, then Subscriptions.</li>
      <li>Each link works once, and the links stop working after 31 December 2026.</li>
      <li>Routing around risk, SOS and trip sharing are free for everyone, with or without Premium.</li>
      <li>We keep nothing about you when you claim: only the time, and whether it was from an iPhone.</li>
    </ul>
    <p class="fine" data-reveal>Something not working? Email <a href="mailto:${site.contactEmail}">${site.contactEmail}</a> and we will sort it out.</p>`,
});

export default {
  slug: 'founding-30.html',
  title: 'Founding 30',
  headTitle: 'Founding 30: a free month of Tsamaya Premium',
  description: 'Tsamaya launched on our founder’s 30th birthday. The first 30 drivers to claim here get a free month of Premium on iPhone.',
  noindex: true,
  heroClass: 'sn page-f30',
  hud: false,
  body: [
    pageHead({
      meta: `Founding 30${M}iPhone${M}one free month`,
      title: 'Thirty free months for our first thirty drivers.',
      lead: 'Tsamaya launched on 7 November 2026, which was also my 30th birthday. To mark it, the first 30 people to claim here get a month of Premium free. Thank you for driving with us from the start. Kyle, founder',
      after: `
    <div class="f30" id="f30" data-state="load">
      <p class="f30-count"><span class="f30-n" id="f30-left">&hellip;</span> <span id="f30-of">of 30 left</span></p>
      <div class="f30-claim">
        <button class="btn btn-primary btn-lg" id="f30-btn" type="button" disabled>Claim my free month</button>
        <p class="f30-msg" id="f30-msg" role="status" aria-live="polite"></p>
        <p class="f30-note" id="f30-ios" hidden>These are App Store links, so they only work on an iPhone. Open this page on your iPhone to claim, or claim here and send the link to your phone.</p>
      </div>
      <div class="f30-got" id="f30-got" hidden>
        <p class="hud">Your free month is ready</p>
        <ol class="f30-steps">
          <li>Install Tsamaya from the <a href="${site.appStoreLink}">App Store</a> if you have not yet.</li>
          <li>Tap the button below on your iPhone, then tap Redeem.</li>
          <li>Open Tsamaya. Premium switches on by itself.</li>
        </ol>
        <p class="f30-actions">
          <a class="btn btn-primary btn-lg" id="f30-link" href="#">Redeem on the App Store</a>
          <button class="btn btn-lg f30-copy" id="f30-copy" type="button">Copy link</button>
        </p>
        <p class="f30-note">This link works once and is yours. Please don't share it: if you want a friend to have one, send them this page.</p>
      </div>
    </div>`,
    }),
    how,
  ].join('\n') + `
<script>
(function(){
  var KEY='ts-f30-link';
  var box=document.getElementById('f30'), left=document.getElementById('f30-left'), of=document.getElementById('f30-of');
  var btn=document.getElementById('f30-btn'), msg=document.getElementById('f30-msg'), ios=document.getElementById('f30-ios');
  var got=document.getElementById('f30-got'), link=document.getElementById('f30-link'), copy=document.getElementById('f30-copy');
  var isIphone=/iPhone|iPod/.test(navigator.userAgent);
  var url=null;
  function say(t){ msg.textContent=t||''; }
  function count(d){
    if(!d||typeof d.left!=='number') return;
    left.textContent=d.left; of.textContent='of '+(d.total||30)+' left';
    if(d.left<=0&&got.hidden){ box.setAttribute('data-state','gone'); btn.disabled=true; ios.hidden=true; btn.textContent='All claimed'; say('All '+(d.total||30)+' free months have been claimed. Thank you to everyone who took one.'); }
  }
  function show(l){
    link.href=l; got.hidden=false; btn.hidden=true; ios.hidden=true; box.setAttribute('data-state','got'); say('');
  }
  function call(body){
    return fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}).then(function(r){ return r.json(); });
  }
  var saved=null; try{ saved=localStorage.getItem(KEY); }catch(e){}
  if(saved&&saved.indexOf('https://apps.apple.com/redeem?')===0) show(saved);
  else if(!isIphone) ios.hidden=false;
  copy.addEventListener('click',function(){
    var t=link.href;
    function done(){ copy.textContent='Copied'; setTimeout(function(){ copy.textContent='Copy link'; },2000); }
    if(navigator.clipboard&&navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(done,function(){ window.prompt('Copy your link',t); });
    else window.prompt('Copy your link',t);
  });
  btn.addEventListener('click',function(){
    if(!url) return;
    btn.disabled=true; say('Getting your link\\u2026');
    call({action:'claim',device:isIphone?'iphone':'other'}).then(function(d){
      if(d&&d.ok&&d.link&&d.link.indexOf('https://apps.apple.com/redeem?')===0){
        try{ localStorage.setItem(KEY,d.link); }catch(e){}
        show(d.link); count(d); return;
      }
      count(d);
      if(d&&d.reason==='gone') return;
      btn.disabled=false;
      say(d&&d.reason==='busy' ? 'A lot of people are claiming right now. Please try again in a few minutes.' : 'That did not work just now. Please try again in a moment.');
    }).catch(function(){ btn.disabled=false; say('That did not work just now. Please check your connection and try again.'); });
  });
  fetch('/config.json').then(function(r){ return r.json(); }).then(function(c){
    if(!c||!c.supabaseUrl){ say('The claim page is being set up. Please check back soon.'); return; }
    url=c.supabaseUrl+'/functions/v1/founding-claim';
    return call({action:'status'}).then(function(d){
      if(!d||!d.ok){ say('Could not load the count right now. Please refresh in a moment.'); return; }
      box.setAttribute('data-state', got.hidden ? 'open' : 'got');
      if(got.hidden){ btn.disabled=false; }
      count(d);
    });
  }).catch(function(){ say('Could not load the count right now. Please refresh in a moment.'); });
})();
</script>
`,
};
