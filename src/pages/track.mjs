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
  body: `
<section class="wrap" style="padding:28px 0;">
  <h1 style="margin:0 0 4px;">Live trip</h1>
  <p id="trip-status" style="font-size:16px;font-weight:600;">Loading…</p>
  <div id="map-wrap" style="position:relative;height:68vh;min-height:320px;border-radius:16px;overflow:hidden;background:#eef;margin-top:12px;">
    <div id="map" style="position:absolute;inset:0;"></div>
    <div id="arrived" style="position:absolute;inset:0;display:none;flex-direction:column;align-items:center;justify-content:center;text-align:center;background:rgba(255,255,255,0.96);padding:24px;">
      <div style="font-size:56px;line-height:1;">✅</div>
      <h2 id="arrived-title" style="margin:14px 0 6px;">Arrived safely</h2>
      <p id="arrived-sub" style="margin:0;opacity:.65;"></p>
    </div>
  </div>
  <p style="margin-top:12px;opacity:.6;font-size:13px;">Shared via Tsamaya — the map updates roughly every 10–15 seconds while a drive is active. Between drives the page waits and picks up the next one automatically, so it's safe to bookmark.</p>
</section>
<script>
(function(){
  var token=new URLSearchParams(location.search).get('id');
  var info=document.getElementById('trip-status');
  var arrivedEl=document.getElementById('arrived');
  if(!token){ if(info) info.textContent='This link is missing its trip code.'; return; }
  var cfg=null, map=null, driver=null, destMarker=null, started=false, routeSig=null, waiting=false, slowSkip=0;
  function pad(n){ return (n<10?'0':'')+n; }
  function clock(ms){ var d=new Date(ms); return d.getHours()+':'+pad(d.getMinutes()); }
  function loadMapbox(cb){
    var css=document.createElement('link'); css.rel='stylesheet'; css.href='https://api.mapbox.com/mapbox-gl-js/v3.6.0/mapbox-gl.css'; document.head.appendChild(css);
    var s=document.createElement('script'); s.src='https://api.mapbox.com/mapbox-gl-js/v3.6.0/mapbox-gl.js'; s.onload=cb; s.onerror=function(){ if(info) info.textContent='Could not load the map.'; }; document.head.appendChild(s);
  }
  function fetchTrip(){
    return fetch(cfg.supabaseUrl+'/rest/v1/rpc/get_live_trip',{method:'POST',headers:{'Content-Type':'application/json','apikey':cfg.anonKey,'Authorization':'Bearer '+cfg.anonKey},body:JSON.stringify({p_token:token})}).then(function(r){return r.ok?r.json():[];}).catch(function(){return [];});
  }
  function setRoute(geo){
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
        map.addLayer({id:'route-line',type:'line',source:'route',layout:{'line-cap':'round','line-join':'round'},paint:{'line-color':'#0A84FF','line-width':5,'line-opacity':0.9}});
      }
      var b=new mapboxgl.LngLatBounds(); c.forEach(function(p){ b.extend(p); });
      try{ map.fitBounds(b,{padding:60,duration:0}); }catch(e){}
      routeSig=sig;
    }
    if(map.isStyleLoaded()) go(); else map.on('load',go);
  }
  function setDest(trip){
    if(trip.dest_lng==null||trip.dest_lat==null) return;
    if(destMarker){ destMarker.setLngLat([trip.dest_lng,trip.dest_lat]); }
    else{ destMarker=new mapboxgl.Marker({color:'#E5484D'}).setLngLat([trip.dest_lng,trip.dest_lat]).addTo(map); }
  }
  function render(trip){
    if(!trip){
      // Permanent (Guardian) links spend most of their life with no live row —
      // keep waiting rather than declaring the link dead.
      waiting=true;
      if(info) info.textContent=started
        ? 'Drive over \\u2014 this page picks up their next shared drive automatically.'
        : 'No live drive right now \\u2014 leave this page open and the next shared drive appears automatically.';
      return;
    }
    var lng=trip.lng, lat=trip.lat;
    var isSos = trip.kind==='sos';
    if(!started){
      mapboxgl.accessToken=cfg.mapboxToken;
      map=new mapboxgl.Map({container:'map',style:'mapbox://styles/mapbox/streets-v12',center:[lng,lat],zoom:13});
      driver=new mapboxgl.Marker({color:isSos?'#dc3c50':'#0A84FF'}).setLngLat([lng,lat]).addTo(map);
      started=true;
    } else { driver.setLngLat([lng,lat]); if(!routeSig) map.easeTo({center:[lng,lat],duration:1200}); }
    setDest(trip);
    if(trip.route_geojson) setRoute(trip.route_geojson);
    var to=trip.dest_name?(' to '+trip.dest_name):'';
    var at=trip.dest_name?(' at '+trip.dest_name):'';
    if(trip.status==='arrived'){
      waiting=true;
      if(info) info.textContent='\\u2705 Arrived safely'+at+'.';
      if(arrivedEl){
        document.getElementById('arrived-title').textContent=(trip.dest_name?trip.dest_name+' \\u2014 ':'')+'Arrived safely';
        document.getElementById('arrived-sub').textContent=trip.arrived_at?('Arrived at '+clock(new Date(trip.arrived_at).getTime())+'.'):'';
        arrivedEl.style.display='flex';
      }
    }
    else if(trip.status==='ended'){ waiting=true; if(info) info.textContent='Sharing ended \\u2014 this page picks up their next shared drive automatically.'; }
    else {
      // An active drive (re)appeared — leave waiting mode and reset the
      // previous drive's leftovers so drive #2 renders cleanly.
      waiting=false;
      if(arrivedEl) arrivedEl.style.display='none';
      if(isSos){ if(info){ info.textContent='\\u26A0\\uFE0F Emergency \\u2014 following their live location.'; info.style.color='#dc3c50'; info.style.fontWeight='700'; } }
      else { var eta=''; if(trip.eta_epoch){ eta=' \\u00b7 ETA ~'+clock(Number(trip.eta_epoch)); } if(info) info.textContent='\\uD83D\\uDE97 On the way'+to+eta+'.'; }
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
    if(!cfg||!cfg.supabaseUrl||!cfg.mapboxToken){ if(info) info.textContent='Live tracking is being set up — please check back soon.'; return; }
    loadMapbox(function(){ tick(); setInterval(tick,10000); });
  }).catch(function(){ if(info) info.textContent='Could not load tracking right now.'; });
})();
</script>
`,
};
