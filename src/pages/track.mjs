// Public live-trip tracker — tsamayaapp.co.za/track.html?id=<token>.
// Served at the site ROOT (not a /t/ subfolder) so the shared layout's relative
// CSS / logo / nav assets resolve correctly (a subfolder broke them → unstyled).
// Reads ONE trip by token via the get_live_trip Supabase RPC (no table read, so
// other trips never leak). Client keys (Supabase anon + Mapbox pk) are loaded at
// runtime from /config.json (written by build.mjs from CI secrets) — never in
// source. Self-contained: the inline script loads Mapbox GL from the CDN.
//
// This is the WEB half of the "one link, app-or-web" live trip. The SAME
// /track?id=.. link opens the in-app viewer when Tsamaya is installed (Universal
// Links, app side app/trip/[token].tsx) and this page otherwise. Both draw the
// route + live dot + ETA and show an Arrived screen. `route_geojson` / `arrived_at`
// arrive with the live-trips v2 migration; this page degrades gracefully without
// them (no line / no arrival time).
//
// PERMANENT LINKS (Guardian): the app's Guardian feature shares ONE stable token
// that carries many drives — the contact bookmarks this page. So ended / arrived /
// no-trip are WAITING states, not terminal: polling continues (slower, ~30 s) and
// the page resets per-drive state (route line, arrived overlay, destination pin)
// the moment a new active drive appears on the token. Never hard-stop the loop.
export default {
  slug: 'track.html',
  title: 'Live trip',
  description: 'Follow a Tsamaya drive in real time.',
  // Keep this page out of search indexes entirely. The URL carries a bearer
  // token (?id=<token>) that grants access to someone's live location, so an
  // indexed copy would be a leaked capability. build.mjs already excludes it from
  // the sitemap, but a sitemap exclusion is not a noindex — a crawler that finds
  // the link anywhere else will happily index it. This emits the actual directive.
  noindex: true,
  heroClass: 'sn page-track',
  hud: false,
  body: `
<section class="trk" aria-labelledby="trk-h">
  <div class="wrap">
    <p class="hud trk-k">Shared via Tsamaya</p>
    <h1 class="trk-h" id="trk-h">Live trip</h1>
    <p id="trip-status" class="trk-s" data-state="load" role="status">Loading</p>
    <div id="map-wrap" class="trk-map scheme-dark" data-lenis-prevent>
      <div id="map"></div>
      <div id="arrived" class="trk-arr">
        <svg class="trk-ok" viewBox="0 0 48 48" width="56" height="56" aria-hidden="true" focusable="false"><circle cx="24" cy="24" r="22" fill="none" stroke="currentColor" stroke-width="2"/><path d="M14 24.5l7 7 13-14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>
        <h2 id="arrived-title">Arrived</h2>
        <p id="arrived-sub"></p>
      </div>
    </div>
    <p class="trk-note">The map updates roughly every 10 to 15 seconds while a drive is active. Between drives the page waits and picks up the next one automatically, so you can bookmark it.</p>
  </div>
</section>
<script>
(function(){
  var token=new URLSearchParams(location.search).get('id');
  var info=document.getElementById('trip-status');
  var arrivedEl=document.getElementById('arrived');
  if(!token){ if(info){ info.textContent='This link is missing its trip code.'; info.setAttribute('data-state','wait'); } return; }
  var cfg=null, map=null, driver=null, destMarker=null, started=false, routeSig=null, waiting=false, slowSkip=0, lastGeo=null, sos=false;
  function pad(n){ return (n<10?'0':'')+n; }
  function clock(ms){ var d=new Date(ms); return d.getHours()+':'+pad(d.getMinutes()); }
  function loadMapbox(cb){
    // referrerPolicy no-referrer on the Mapbox loads too, so the ?id= token
    // never rides the Referer header to api.mapbox.com (defence in depth beside
    // the page-level meta referrer).
    var css=document.createElement('link'); css.rel='stylesheet'; css.referrerPolicy='no-referrer'; css.href='https://api.mapbox.com/mapbox-gl-js/v3.6.0/mapbox-gl.css'; document.head.appendChild(css);
    var s=document.createElement('script'); s.referrerPolicy='no-referrer'; s.src='https://api.mapbox.com/mapbox-gl-js/v3.6.0/mapbox-gl.js'; s.onload=cb; s.onerror=function(){ if(info) info.textContent='Could not load the map.'; }; document.head.appendChild(s);
  }
  function fetchTrip(){
    return fetch(cfg.supabaseUrl+'/rest/v1/rpc/get_live_trip',{method:'POST',headers:{'Content-Type':'application/json','apikey':cfg.anonKey,'Authorization':'Bearer '+cfg.anonKey},body:JSON.stringify({p_token:token})}).then(function(r){return r.ok?r.json():[];}).catch(function(){return [];});
  }
  function setRoute(geo,now){
    if(!geo||!geo.coordinates||!geo.coordinates.length) return;
    // Cheap identity: a new drive (or a reroute) gets a new signature → update
    // the line + reframe once; identical polls are no-ops so the viewer can pan.
    var c=geo.coordinates;
    var sig=c.length+':'+c[0].join(',')+':'+c[c.length-1].join(',');
    if(sig===routeSig) return;
    function go(){
      var data={type:'Feature',properties:{},geometry:geo};
      var src=map.getSource('route');
      if(src){ src.setData(data); }
      else{
        map.addSource('route',{type:'geojson',data:data});
        map.addLayer({id:'route-line',type:'line',source:'route',layout:{'line-cap':'round','line-join':'round'},paint:{'line-color':C().route,'line-width':5,'line-opacity':0.9}});
      }
      var b=new mapboxgl.LngLatBounds(); c.forEach(function(p){ b.extend(p); });
      try{ map.fitBounds(b,{padding:60,duration:0}); }catch(e){}
      routeSig=sig;
    }
    lastGeo=geo;
    // now: straight after a restyle ('style.load'), when 'load' will not fire again
    if(now||map.isStyleLoaded()) go(); else map.on('load',go);
  }
  // the map follows the page's theme (unless the scenes are kept dark with
  // ?scenes=dark): a light Mapbox style with a deeper emerald in the light
  function C(){
    var d=document.documentElement, lite=d.getAttribute('data-theme')==='light'&&d.getAttribute('data-scenes')!=='dark';
    return lite?{style:'mapbox://styles/mapbox/light-v11',route:'#059669',driver:'#047857',dest:'#1C2533'}:{style:'mapbox://styles/mapbox/dark-v11',route:'#34D399',driver:'#34D399',dest:'#E6EDF5'};
  }
  window.addEventListener('ts-theme',function(){
    if(!started||!map.setStyle) return;
    map.setStyle(C().style);
    map.once('style.load',function(){ routeSig=null; if(lastGeo) setRoute(lastGeo,true); });
    // markers carry their colour from creation: made again
    var p=driver.getLngLat(); driver.remove(); driver=new mapboxgl.Marker({color:sos?'#dc3c50':C().driver}).setLngLat(p).addTo(map);
    if(destMarker){ var q=destMarker.getLngLat(); destMarker.remove(); destMarker=new mapboxgl.Marker({color:C().dest}).setLngLat(q).addTo(map); }
  });
  function setDest(trip){
    if(trip.dest_lng==null||trip.dest_lat==null) return;
    if(destMarker){ destMarker.setLngLat([trip.dest_lng,trip.dest_lat]); }
    else{ destMarker=new mapboxgl.Marker({color:C().dest}).setLngLat([trip.dest_lng,trip.dest_lat]).addTo(map); }
  }
  function say(t,st){ if(info){ info.textContent=t; info.setAttribute('data-state',st); } }
  function render(trip){
    if(!trip){
      // Permanent (Guardian) links spend most of their life with no live row —
      // keep waiting rather than declaring the link dead.
      waiting=true;
      say(started
        ? 'Drive over. This page picks up their next shared drive automatically.'
        : 'No live drive right now. Leave this page open and the next shared drive appears automatically.','wait');
      return;
    }
    var lng=trip.lng, lat=trip.lat;
    var isSos = trip.kind==='sos'; sos=isSos;
    if(!started){
      mapboxgl.accessToken=cfg.mapboxToken;
      map=new mapboxgl.Map({container:'map',style:C().style,center:[lng,lat],zoom:13});
      driver=new mapboxgl.Marker({color:isSos?'#dc3c50':C().driver}).setLngLat([lng,lat]).addTo(map);
      started=true;
    } else { driver.setLngLat([lng,lat]); if(!routeSig) map.easeTo({center:[lng,lat],duration:1200}); }
    setDest(trip);
    if(trip.route_geojson) setRoute(trip.route_geojson);
    var to=trip.dest_name?(' to '+trip.dest_name):'';
    var at=trip.dest_name?(' at '+trip.dest_name):'';
    if(trip.status==='arrived'){
      waiting=true;
      say('Arrived'+at+'.','arrived');
      if(arrivedEl){
        document.getElementById('arrived-title').textContent=(trip.dest_name?trip.dest_name:'Arrived');
        document.getElementById('arrived-sub').textContent=trip.arrived_at?('Arrived at '+clock(new Date(trip.arrived_at).getTime())+'.'):'';
        arrivedEl.style.display='flex';
      }
    }
    else if(trip.status==='ended'){ waiting=true; say('Sharing ended. This page picks up their next shared drive automatically.','wait'); }
    else {
      // An active drive (re)appeared — leave waiting mode and reset the
      // previous drive's leftovers so drive #2 renders cleanly.
      waiting=false;
      if(arrivedEl) arrivedEl.style.display='none';
      if(isSos){ say('Emergency. Following their live location.','sos'); }
      else { var eta=''; if(trip.eta_epoch){ eta=' \\u00b7 ETA ~'+clock(Number(trip.eta_epoch)); } say('On the way'+to+eta+'.','live'); }
    }
  }
  // Active drive: poll every 10 s. Waiting (no trip / ended / arrived): every
  // third tick (~30 s) — cheap on the free-tier RPC while a bookmark sits open.
  function tick(){
    if(waiting){ slowSkip=(slowSkip+1)%3; if(slowSkip!==0) return; }
    fetchTrip().then(function(rows){ render(rows&&rows[0]); });
  }
  fetch('/config.json').then(function(r){return r.json();}).then(function(c){
    cfg=c;
    if(!cfg||!cfg.supabaseUrl||!cfg.mapboxToken){ if(info) info.textContent='Live tracking is being set up. Please check back soon.'; return; }
    loadMapbox(function(){ tick(); setInterval(tick,10000); });
  }).catch(function(){ if(info) info.textContent='Could not load tracking right now.'; });
})();
</script>
`,
};
