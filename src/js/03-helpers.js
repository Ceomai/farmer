// ================= YARDIMCILAR =================
const $=s=>document.querySelector(s);
const fmt=n=>Math.floor(n).toLocaleString('tr-TR');
// Üst çubuk için kısa sayı: 10.000 ve üstü B (bin), Mn (milyon), Mr (milyar); 100'den küçük katlarda bir ondalık (12,3 B · 1,2 Mn · 123 Mn; sayı ile birim arasında dar boşluk). Paneller tam sayıyı (fmt) kullanır.
const fmtShort=n=>{n=Math.floor(n);const a=Math.abs(n),u=a>=1e9?[1e9,'Mr']:a>=1e6?[1e6,'Mn']:a>=1e4?[1e3,'B']:null;if(!u)return fmt(n);const v=n/u[0],d=Math.abs(v)<100?10:1;return (Math.trunc(v*d)/d).toLocaleString('tr-TR',{maximumFractionDigits:1})+'\u202f'+u[1]};
let TIME_OFF=0;const now=()=>Date.now()+TIME_OFF;
const has=k=>S.items[k]||0;
const stored=()=>Object.entries(S.items).reduce((a,[k,v])=>k==='at'?a:a+v,0); // taylar ambarda değil ahırda durur
const owned=r=>!!S.regions[r];
function cap(){return [80,160,260,400][S.house-1]+(S.units.silo?150*S.units.silo.l:0)}
const xpNeed=l=>Math.round(60*Math.pow(l,1.55));
const TRACKED=new Set(['built','orders','contracts','contest','race','mg','photo','sold','harvest_field','iap']);
const stat=(k,n=1)=>{S.stats[k]=(S.stats[k]||0)+n;if(TRACKED.has(k)&&typeof track==='function')track(k,{n});if(S.daily)for(const t of S.daily.tasks){if(t.k===k||(t.k==='plant'&&k.startsWith('plant_')&&CROPS.some(c=>'plant_'+c.id===k)))t.p+=n}};
const secs=s=>s>=3600?Math.floor(s/3600)+' sa'+(Math.floor(s%3600/60)?' '+Math.floor(s%3600/60)+' dk':''):s>=60?Math.floor(s/60)+' dk'+(s%60?' '+String(s%60).padStart(2,'0')+' sn':''):s+' sn';
// Seviye başına +%30 ürün ve %10 kısa süre (Sv5: 2,2 kat ürün, %60 süre). Yeni nesil bonusu (S.gen) tüm üretime eklenir.
function scaled(r,l){const g=1+0.1*((S&&S.gen)||0),out={};for(const k in r.out)out[k]=Math.max(1,Math.round(r.out[k]*(1+0.3*(l-1))*g));return {out,t:Math.round(r.t*Math.max(.6,1-0.1*(l-1))*(typeof projOn==='function'&&projOn('saat')?.95:1))}}
function canPay(r){if((r.cost||0)>S.coins)return false;for(const k in (r.in||{}))if(has(k)<r.in[k])return false;return true}
const prog=j=>Math.min(1,(now()-j.s)/(j.e-j.s));
const stageOf=j=>{const p=prog(j);return p<.34?1:p<.67?2:3};
const unitRecipe=u=>B[u].recipes.find(x=>x.id===S.units[u].job.r);
const secShort=s=>s<=0?'hazır':s<60?s+'sn':s<3600?Math.ceil(s/60)+'dk':s<86400?Math.floor(s/3600)+'sa'+(s%3600>=60?' '+Math.floor(s%3600/60)+'dk':''):Math.floor(s/86400)+'g';
// Mevsim ürünleri yalnızca kendi mevsiminde ekilir
const cropSeasonOk=c=>!c.season||c.season.includes(season());
const cropOf=id=>CROPS.find(c=>c.id===id);
// Hareketi azalt: Ayarlar'daki anahtar (S.ui.rm); hiç seçilmediyse sistemin tercihi (prefers-reduced-motion). applyUI body.rm sınıfını ve _rm'yi günceller.
const _rmMQ=window.matchMedia?matchMedia('(prefers-reduced-motion: reduce)'):null;let _rm=!!(_rmMQ&&_rmMQ.matches);const RM=()=>_rm;
if(_rmMQ&&_rmMQ.addEventListener)_rmMQ.addEventListener('change',()=>{if(typeof applyUI==='function')applyUI()});
// Kapanış animasyonu: asıl öğe hemen gizlenir/kaldırılır (durum anında değişir, yeni açılan öğe eskisini beklemez); yerine etkileşimsiz bir kopyası
// kısa kapanış animasyonunu oynatıp kendini siler. Aynı türden önceki kopya hemen silinir: hızlı aç/kapa'da DOM'da öğe birikmez.
const _ghost={},GHOST_ATTR=['id','data-act','data-go','data-quick','data-quickall','data-region','data-open','data-desk','data-x'];
function ghostClear(to){const g=_ghost[to];if(g){g.remove();_ghost[to]=null}}
function ghostOut(el,from,to,ms){ghostClear(to);if(!el||!document.body)return;const g=el.cloneNode(true);g.removeAttribute('hidden');g.classList.remove('dragging','in');if(from)g.classList.remove(from);g.classList.add(to);
  for(const n of [g,...g.querySelectorAll('[id],[data-act],[data-go],[data-quick],[data-quickall],[data-region],[data-open],[data-desk],[data-x]')])for(const a of GHOST_ATTR)n.removeAttribute(a);
  g.setAttribute('aria-hidden','true');g.removeAttribute('role');g.removeAttribute('aria-live');g.inert=true;document.body.appendChild(g);_ghost[to]=g;
  const kill=()=>{if(_ghost[to]===g)_ghost[to]=null;g.remove()};g.addEventListener('animationend',e=>{if(e.target===g)kill()});setTimeout(kill,ms+120)}
// Bildirim: yenisi eskisini anında devralır; süresi dolunca kısa ölçek+opaklıkla kapanır.
// o.err: yetersiz para / eksik malzeme / dolu ambar uyarısı — kısa çift titreşim.
function toast(msg,o){document.querySelectorAll('.toast').forEach(t=>t.remove());const t=document.createElement('div');t.className='toast';t.setAttribute('role','status');t.setAttribute('aria-live','polite');t.textContent=msg;document.body.appendChild(t);
  if(o&&o.err&&typeof PLATFORM!=='undefined')PLATFORM.hap('err');setTimeout(()=>{if(!t.isConnected)return;t.classList.add('out');setTimeout(()=>t.remove(),180)},2400)}
// Erişilebilirlik: eklenen her pencere (.modal) iletişim kutusu olarak işaretlenir, başlığı ad olur
let _dlgN=0;function a11yModal(m){if(m.getAttribute('role'))return;m.setAttribute('role','dialog');m.setAttribute('aria-modal','true');const h=m.querySelector('h2,h3');if(h){if(!h.id)h.id='dlg-h'+(++_dlgN);m.setAttribute('aria-labelledby',h.id)}}
// Kapanan pencere kısa ölçek+opaklıkla çıkar (kopyası üzerinden; asıl pencere hemen kaldırılmış olur). Ardından yeni pencere açılırsa kopya hemen silinir.
new MutationObserver(ms=>{for(const r of ms){for(const n of r.removedNodes)if(n.nodeType===1&&n.classList.contains('modal'))ghostOut(n,'modal','mdx',160);for(const n of r.addedNodes)if(n.nodeType===1&&n.classList.contains('modal')){a11yModal(n);ghostClear('mdx')}}}).observe(document.body,{childList:true});
// Ortak pencere: .modal (+cls) kutusu, html içeriğiyle sayfaya eklenir. Kapanış animasyonu ve role=dialog yukarıdaki gözlemciden gelir.
// o.close: ilk düğme pencereyi kapatır (fonksiyonsa kapandıktan sonra çağrılır) · o.nodismiss: dışarı dokunma / geri ile kapanmaz
function makeModal(cls,html,o={}){const d=document.createElement('div');d.className='modal'+(cls?' '+cls:'');if(o.nodismiss)d.dataset.nodismiss=1;d.innerHTML=html;
  if(o.close)d.querySelector('button').onclick=()=>{d.remove();if(typeof o.close==='function')o.close()};document.body.appendChild(d);return d}
function floatXY(x,y,txt){const f=document.createElement('div');f.className='float';f.textContent=txt;f.style.left=x+'px';f.style.top=y+'px';document.body.appendChild(f);setTimeout(()=>f.remove(),1300)}
function finRoll(){const t=todayStr();if(!S.fin)S.fin={day:'',inc:{},exp:{},hist:[]};if(S.fin.day!==t){if(S.fin.day){const sm=o=>Object.values(o).reduce((a,b)=>a+b,0);S.fin.hist.push({d:S.fin.day,i:sm(S.fin.inc),e:sm(S.fin.exp)});S.fin.hist=S.fin.hist.slice(-7)}S.fin.day=t;S.fin.inc={};S.fin.exp={}}}
const pay=(n,c='Diğer')=>{S.coins-=n;if(n>0){finRoll();S.fin.exp[c]=(S.fin.exp[c]||0)+n}}, gain=(n,c='Diğer')=>{S.coins+=n;if(n>0){finRoll();S.fin.inc[c]=(S.fin.inc[c]||0)+n}};
const addRep=n=>{S.rep=Math.min(100,S.rep+n)}; // itibar en fazla 100
function addXP(n){S.xp+=n;while(S.xp>=xpNeed(S.lv)){S.xp-=xpNeed(S.lv);S.lv++;levelUp()}}
function levelUp(){if(typeof track==='function')track('level_up',{lv:S.lv});
  const all=[...Object.values(B).filter(b=>b.lvl===S.lv).map(b=>b.n),...CROPS.filter(c=>c.lvl===S.lv).map(c=>c.n),...Object.values(REG).filter(z=>z.lvl===S.lv&&z.cost).map(z=>z.n+' arazisi')];
  S.gems+=2;sfx('level');if(typeof PLATFORM!=='undefined')PLATFORM.hap('medium');makeModal('',`<div><div class="badge">${S.lv}</div><h2>Seviye atladın!</h2><p>${all.length?'Yeni açılanlar: <b>'+all.join(', ')+'</b>':'Çiftliğin büyüyor, böyle devam.'}<br>+2 🍀</p><button class="btn big gold">Harika</button></div>`,{close:1});
}
