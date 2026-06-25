// Public live-trip tracker — tsamayaapp.co.za/track.html?id=<token>.
// Served at the site ROOT (not a /t/ subfolder) so the shared layout's relative
// CSS / logo / nav assets resolve correctly (a subfolder broke them → unstyled).
// Reads ONE trip by token via the get_live_trip Supabase RPC (no table read, so
// other trips never leak). Client keys (Supabase anon + Mapbox pk) are loaded at
// runtime from /config.json (written by build.mjs from CI secrets) — never in
// source. Self-contained: the inline script loads Mapbox GL from the CDN.
export default {
  slug: 'track.html',
  title: 'Live trip',
  description: 'Follow a Tsamaya drive in real time.',
  body: `
<section class="wrap" style="padding:28px 0;">
  <h1 style="margin:0 0 4px;">Live trip</h1>
  <p id="trip-status" style="font-size:16px;font-weight:600;">Loading…</p>
  <div id="map" style="height:68vh;min-height:320px;border-radius:16px;overflow:hidden;background:#eef;margin-top:12px;"></div>
  <p style="margin-top:12px;opacity:.6;font-size:13px;">Shared via Tsamaya — the map updates roughly every 10–15 seconds while the drive is active. The link expires after the trip.</p>
</section>
<script>
(function(){
  var token=new URLSearchParams(location.search).get('id');
  var info=document.getElementById('trip-status');
  if(!token){ if(info) info.textContent='This link is missing its trip code.'; return; }
  var cfg=null, map=null, driver=null, started=false;
  function loadMapbox(cb){
    var css=document.createElement('link'); css.rel='stylesheet'; css.href='https://api.mapbox.com/mapbox-gl-js/v3.6.0/mapbox-gl.css'; document.head.appendChild(css);
    var s=document.createElement('script'); s.src='https://api.mapbox.com/mapbox-gl-js/v3.6.0/mapbox-gl.js'; s.onload=cb; s.onerror=function(){ if(info) info.textContent='Could not load the map.'; }; document.head.appendChild(s);
  }
  function fetchTrip(){
    return fetch(cfg.supabaseUrl+'/rest/v1/rpc/get_live_trip',{method:'POST',headers:{'Content-Type':'application/json','apikey':cfg.anonKey,'Authorization':'Bearer '+cfg.anonKey},body:JSON.stringify({p_token:token})}).then(function(r){return r.ok?r.json():[];}).catch(function(){return [];});
  }
  function render(trip){
    if(!trip){ if(info) info.textContent='Waiting for the driver to start sharing…'; return; }
    var lng=trip.lng, lat=trip.lat;
    if(!started){
      mapboxgl.accessToken=cfg.mapboxToken;
      map=new mapboxgl.Map({container:'map',style:'mapbox://styles/mapbox/streets-v12',center:[lng,lat],zoom:13});
      driver=new mapboxgl.Marker({color:'#0A84FF'}).setLngLat([lng,lat]).addTo(map);
      if(trip.dest_lng!=null&&trip.dest_lat!=null){ new mapboxgl.Marker({color:'#E5484D'}).setLngLat([trip.dest_lng,trip.dest_lat]).addTo(map); }
      started=true;
    } else { driver.setLngLat([lng,lat]); map.easeTo({center:[lng,lat],duration:1200}); }
    var to=trip.dest_name?(' to '+trip.dest_name):'';
    var at=trip.dest_name?(' at '+trip.dest_name):'';
    if(trip.status==='arrived'){ info.textContent='\\u2705 Drive ended \\u2014 arrived safely'+at+'.'; }
    else if(trip.status==='ended'){ info.textContent='Drive ended.'; }
    else { var eta=''; if(trip.eta_epoch){ var d=new Date(Number(trip.eta_epoch)); eta=' \\u00b7 ETA ~'+d.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}); } info.textContent='\\uD83D\\uDE97 On the way'+to+eta+'.'; }
  }
  function tick(){ fetchTrip().then(function(rows){ render(rows&&rows[0]); }); }
  fetch('/config.json').then(function(r){return r.json();}).then(function(c){
    cfg=c;
    if(!cfg||!cfg.supabaseUrl||!cfg.mapboxToken){ if(info) info.textContent='Live tracking is being set up — please check back soon.'; return; }
    loadMapbox(function(){ tick(); setInterval(tick,10000); });
  }).catch(function(){ if(info) info.textContent='Could not load tracking right now.'; });
})();
</script>
`,
};
