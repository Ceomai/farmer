// ================= İŞÇİLER =================
const WORKER_LV=5;const workerCost=k=>k==='fields'?800:Math.max(500,Math.round(B[k].cost*.6));
let autoGain=0,autoTick=0;
// Vardiya: işçi 8 saat çalışır, sonra çay molası verir; oyuncu bir dokunuşla yeniden başlatır (oyuna dönmek için güzel bir sebep).
// İşçi sayısı evin büyüklüğüne bağlıdır.
const SHIFT=8*3600000,WORKER_MAX=[2,5,9,99];
const workerMax=()=>WORKER_MAX[S.house-1]||2;
const workOn=k=>S.workers[k]>now();
const workersHired=()=>Object.keys(S.workers).length;
function renewWorker(k,quiet){if(!S.workers[k]||workOn(k))return false;S.workers[k]=now()+SHIFT;if(!quiet){sfx('chime');toast('☕ Çay içildi, işçi işinin başında!');commit()}return true}
function renewAll(){let n=0;for(const k in S.workers)if(renewWorker(k,true))n++;if(n){sfx('chime');commit()}return n}
function hire(k){if(k!=='fields'&&!(B[k]&&B[k].recipes&&S.units[k]))return;if(S.lv<WORKER_LV)return toast('İşçiler seviye 5\'te açılır');if(S.workers[k])return;const c=workerCost(k);if(S.coins<c)return toast('Yeterli paran yok');if(workersHired()>=workerMax())return toast(`Bu evde en fazla ${workerMax()} işçi barınabilir. Evini büyüt!`);pay(c,'İşçi');S.workers[k]=now()+SHIFT;sfx('build');toast('👷 İşçi işe başladı!');popLoc=k==='fields'?'tarla':locOf(k);commit()}
function workerBtn(k){if(S.workers[k]){if(workOn(k))return `<span class="pill-btn" style="cursor:default" title="Vardiya bitince çay molası verir">👷 Çalışıyor · ${secs(Math.ceil((S.workers[k]-now())/1000))}</span>`;
    return `<button class="pill-btn gold" data-act="renew" data-k="${k}" title="İşçi mola verdi. Bir çay ısmarla, 8 saat daha çalışsın">☕ Mola · devam ettir</button>`}
  if(S.lv>=WORKER_LV&&workersHired()>=workerMax())return `<span class="pill-btn" style="cursor:default" title="Evini büyütünce daha fazla işçi tutabilirsin">👷 ${workersHired()}/${workerMax()} işçi</span>`;
  return `<button class="pill-btn" data-act="hire" data-k="${k}" ${S.lv>=WORKER_LV&&S.coins>=workerCost(k)?'':'disabled'} title="Hazır ürünü toplar, aynı üretimi yeniden başlatır">👷 ${S.lv>=WORKER_LV?'İşçi ₺'+fmt(workerCost(k)):'İşçi · Sv '+WORKER_LV}</button>`}
// Güvenlik ağı: para tohuma yetmiyor, satacak ürün yok, hiçbir iş çalışmıyor ve işçi yoksa oyuncu kilitlenir.
// Böyle bir durumda komşu saatte en fazla bir kez tohum parası bırakır.
function rescue(){if(!S||S.coins>=5)return;const sellable=Object.keys(S.items).some(k=>has(k)>0&&k!=='yem'),running=S.fields.some(f=>f.job)||Object.values(S.units).some(s=>s.job);
  if(sellable||running||Object.keys(S.workers).some(workOn)||now()-(S.rescueAt||0)<3600000)return;S.rescueAt=now();gain(30,'Yardım');toast('🧑‍🌾 Komşu Ali tohum parası bıraktı: +₺30. Hadi ekelim!');commit()}
function automate(){let ch=false;
  if(workOn('fields'))S.fields.forEach((f,i)=>{if(f.job&&now()>=f.job.e&&harvestPlot(i,null,null,true))ch=true;if(!f.job&&plantPlot(i,S.lastCrop,true))ch=true});
  for(const u in S.workers){if(u==='fields'||!workOn(u))continue;const s=S.units[u];if(!s||!B[u].recipes)continue;if(s.job&&now()>=s.job.e&&collectUnit(u,null,null,true))ch=true;
    if(!s.job&&s.last){const r=B[u].recipes.find(x=>x.id===s.last);if(r&&r.lvl<=S.lv&&canPay(r)&&!(r.col&&!has1(r.col))){startUnit(u,s.last,true);ch=true}}}
  return ch}
