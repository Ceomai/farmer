// Çiftlik İmparatorluğu · çevrimdışı önbellek. Oyun tek dosya olduğu için ilk açılıştan sonra internetsiz çalışır.
const CACHE='ciftlik-v45c3e976dd';
const FILES=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png','apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
// Önce ağdan dene (yeni sürüm gelsin), olmazsa önbellekten aç. Firebase isteklerine dokunma.
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==location.origin)return;
  // Sorgu parametreli adresler (ör. ?utm=...) önbellekte sorgusuz karşılığıyla eşleşir
  const fromCache=()=>caches.match(e.request,{ignoreSearch:true}).then(r=>r||caches.match('index.html'));
  // Yalnızca başarılı yanıtlar önbelleğe alınır (yayın sırasında 404/500 çevrimdışı sürümü bozmasın); bağlantı çok yavaşsa 3,5 sn sonra önbellekten açılır.
  // Sorgu parametreli adresler önbelleğe yazılmaz (her farklı sorgu ayrı kopya olarak birikmesin). Yazma bitene kadar işçi açık tutulur (waitUntil).
  const net=fetch(e.request);
  e.waitUntil(net.then(r=>{if(r&&r.ok&&r.type==='basic'&&!u.search){const cp=r.clone();return caches.open(CACHE).then(c=>c.put(e.request,cp))}}).catch(()=>{}));
  e.respondWith(new Promise(res=>{let done=false;const t=setTimeout(()=>{fromCache().then(c=>{if(c&&!done){done=true;res(c)}})},3500);
    net.then(r=>{if(!done){done=true;clearTimeout(t);res(r)}}).catch(()=>fromCache().then(c=>{if(!done){done=true;clearTimeout(t);res(c||Response.error())}}))}))});
