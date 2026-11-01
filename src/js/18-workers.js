// ================= İŞÇİLER =================
const WORKER_LV=5;const workerCost=k=>k==='fields'?800:Math.max(500,Math.round(B[k].cost*.6));
let autoGain=0,autoTick=0;
function hire(k){if(S.lv<WORKER_LV)return toast('İşçiler seviye 5\'te açılır');if(S.workers[k])return;const c=workerCost(k);if(S.coins<c)return toast('Yeterli paran yok');pay(c,'İşçi');S.workers[k]=1;sfx('build');toast('👷 İşçi işe başladı!');popLoc=k==='fields'?'tarla':locOf(k);commit()}
function workerBtn(k){if(S.workers[k])return `<span class="pill-btn" style="cursor:default">👷 İşçi çalışıyor</span>`;
  return `<button class="pill-btn" data-act="hire" data-k="${k}" ${S.lv>=WORKER_LV&&S.coins>=workerCost(k)?'':'disabled'} title="Hazır ürünü toplar, aynı üretimi yeniden başlatır">👷 ${S.lv>=WORKER_LV?'İşçi ₺'+fmt(workerCost(k)):'İşçi · Sv '+WORKER_LV}</button>`}
function automate(){let ch=false;
  if(S.workers.fields)S.fields.forEach((f,i)=>{if(f.job&&now()>=f.job.e&&harvestPlot(i,null,null,true))ch=true;if(!f.job&&plantPlot(i,S.lastCrop,true))ch=true});
  for(const u in S.workers){if(u==='fields')continue;const s=S.units[u];if(!s||!B[u].recipes)continue;if(s.job&&now()>=s.job.e&&collectUnit(u,null,null,true))ch=true;
    if(!s.job&&s.last){const r=B[u].recipes.find(x=>x.id===s.last);if(r&&r.lvl<=S.lv&&canPay(r)&&!(r.col&&!has1(r.col))){startUnit(u,s.last,true);ch=true}}}
  return ch}
