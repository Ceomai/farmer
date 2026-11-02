// ================= HARİTA: ALT KART ŞERİDİ =================
// Haritadayken bölümler ekranın altında büyük, resimli kartlar olarak yana kayar.
// Kartın üstüne dokununca o bölüme gidilir; karttaki yeşil düğme ise hiçbir yere gitmeden işi yapar (topla / yeniden başlat).
const stripEl=document.getElementById('strip');let stripSig='';
function stripCards(){const own=[],lock=[];
  for(const k in LOC){const L=LOC[k];if(!owned(L.reg))continue;const st=locStatus(k);own.push({k,L,st,pri:st.c==='ok'?0:st.c==='new'?1:st.c==='idle'?2:3})}
  own.sort((a,b)=>a.pri-b.pri||Object.keys(LOC).indexOf(a.k)-Object.keys(LOC).indexOf(b.k));
  for(const r in REG){const d=REG[r];if(d.rect&&!owned(r))lock.push({r,d})}return{own,lock}}
// Bir bölümde tek dokunuşla yapılabilecek işler: hazır olanlar ve son tarifle yeniden başlatılabilecek boştakiler
function quickInfo(k){const L=LOC[k];let ready=0,idle=0,brk=0,next=Infinity;const nx=j=>{if(j&&j.e>now())next=Math.min(next,j.e)};if(L.kind==='fields')S.fields.forEach(f=>nx(f.job));(L.units||[]).forEach(u=>{const s=S.units[u];if(s)nx(s.job)});const wk=u=>{if(S.workers[u]&&!workOn(u))brk++};if(L.kind==='fields')wk('fields');(L.units||[]).forEach(wk);
  if(L.kind==='fields'){const c=cropOf(S.lastCrop);S.fields.forEach(f=>{if(f.job&&now()>=f.job.e)ready++;else if(!f.job&&c&&!cropLocked(c)&&S.coins>=c.cost)idle++})}
  (L.units||[]).forEach(u=>{const s=S.units[u];if(!s||!B[u].recipes)return;if(s.job){if(now()>=s.job.e)ready++;return}const r=B[u].recipes.find(x=>x.id===(s.last||B[u].recipes[0].id));if(r&&r.lvl<=S.lv&&(!r.col||has1(r.col))&&canPay(r))idle++});
  return{ready,idle,brk,next}}
function quickLoc(k){const L=LOC[k],before={...S.items},g0=autoGain;let got=0,started=0,full=false,renewed=0;
  if(L.kind==='fields'&&renewWorker('fields',true))renewed++;(L.units||[]).forEach(u=>{if(renewWorker(u,true))renewed++});
  if(L.kind==='fields')S.fields.forEach((f,i)=>{if(f.job&&now()>=f.job.e){if(harvestPlot(i,null,null,true))got++;else full=true}});
  (L.units||[]).forEach(u=>{const s=S.units[u];if(s&&s.job&&now()>=s.job.e){if(collectUnit(u,null,null,true))got++;else full=true}});
  if(L.kind==='fields'){const c=cropOf(S.lastCrop);S.fields.forEach((f,i)=>{if(!f.job&&c&&plantPlot(i,S.lastCrop,true))started++})}
  (L.units||[]).forEach(u=>{const s=S.units[u];if(s&&!s.job&&B[u].recipes){if(!queueNext(u)&&!(s.q&&s.q.length))startUnit(u,s.last||B[u].recipes[0].id,true);if(s.job)started++}});
  autoGain=g0;const out={};for(const i in S.items){const d=S.items[i]-(before[i]||0);if(d>0)out[i]=d}
  return{got,started,out,full,renewed}}
function quickFeedback(res,el){const r=el?el.getBoundingClientRect():{left:innerWidth/2,width:0,top:innerHeight-140},x=r.left+r.width/2,y=r.top;
  const txt=Object.entries(res.out).map(([k,v])=>`+${v} ${ITEMS[k].e}`).join('  ');
  if(txt){floatXY(x,y,txt);flyItems(x,y,res.out);sfx('pop')}else if(res.started)sfx('plant');
  if(res.started)floatXY(x,y-(txt?34:0),`▶ ${res.started} yeniden başladı`);if(res.renewed)floatXY(x,y-68,`☕ ${res.renewed} işçi işe döndü`);
  if(res.full)toast('Ambar dolu! Pazarda sat ya da siloyu büyüt.');
  if(!txt&&!res.started&&!res.full&&!res.renewed)toast('Şu an yapılacak iş yok');
  if(res.got>=6)celebrate('Bereketli!');PLATFORM.hap(res.got?'medium':'light');commit();renderStrip(true)}
function quickAll(el){const tot={got:0,started:0,out:{},full:false,renewed:0};for(const k in LOC){if(!owned(LOC[k].reg))continue;const r=quickLoc(k);tot.got+=r.got;tot.started+=r.started;tot.renewed+=r.renewed;tot.full=tot.full||r.full;for(const i in r.out)tot.out[i]=(tot.out[i]||0)+r.out[i]}
  quickFeedback(tot,el)}
function renderStrip(force){const show=mode==='hub';stripEl.hidden=!show;if(!show)return;const {own,lock}=stripCards();
  const qi={};let tr=0,ti=0,tb=0;own.forEach(o=>{qi[o.k]=quickInfo(o.k);tr+=qi[o.k].ready;ti+=qi[o.k].idle;tb+=qi[o.k].brk});
  const sig=own.map(o=>o.k+o.st.c+(o.st.n||'')+qi[o.k].ready+qi[o.k].idle+qi[o.k].brk).join()+lock.map(l=>l.r+(S.lv>=l.d.lvl?1:0)+(S.coins>=regCost(l.r)?1:0)).join()+S.house;if(!force&&sig===stripSig)return;stripSig=sig;const sl=stripEl.scrollLeft;
  const th=k=>{const L=LOC[k],src=THUMB[L.kind==='house'?'kulube'+S.house:L.units?L.units[0]:k];return src?`<img src="${src}" alt="">`:`<span class="ph">${L.e}</span>`};
  const all=tr+ti+tb>1?`<button class="scard all" data-quickall><span class="ph">${tr?'🧺':'▶️'}</span>${tr?'Hepsini topla':'Hepsini başlat'}<small>${tr?tr+' hazır':''}${tr&&ti?' · ':''}${ti?ti+' boşta':''}${tb?(tr||ti?' · ':'')+'☕'+tb:''}</small></button>`:'';
  stripEl.innerHTML=all+own.map(({k,L,st})=>{const q=qi[k],bd=st.c==='ok'?`<i class="s ok">${st.n||'✓'}</i>`:st.c==='new'?'<i class="s new">🔨</i>':st.c==='idle'?'<i class="s idle">💤</i>':'';
      const qa=q.ready?`<span class="qa" role="button" data-quick="${k}">🧺 Topla</span>`:q.idle?`<span class="qa re" role="button" data-quick="${k}">▶ Başlat</span>`:q.brk?`<span class="qa re" role="button" data-quick="${k}">☕ Devam</span>`:'';
      const cd=!qa&&q.next<Infinity?`<small class="cd" data-left="${q.next}" data-pre="⏱" data-short="1">⏱ ${secShort(Math.ceil((q.next-now())/1000))}</small>`:'';
      return `<button class="scard${qa?' has-qa':''}" data-go="${k}" title="${st.t||L.n}">${th(k)}${L.n}${cd}${qa}${bd}</button>`}).join('')
    +lock.map(({r,d})=>{const can=S.lv>=d.lvl;return `<button class="scard lock" data-region="${r}"><span class="ph">🔒</span>${d.n}<small>${can?'₺'+fmt(regCost(r)):'Seviye '+d.lvl}</small>${can&&S.coins>=regCost(r)?'<i class="s new">🏳️</i>':''}</button>`}).join('');
  stripEl.scrollLeft=sl}
// Odaktayken bölümler arasında sırayla geçiş (‹ › düğmeleri ve başlıkta sağa-sola kaydırma)
function locOrder(){return Object.keys(LOC).filter(k=>owned(LOC[k].reg))}
function stepLoc(d){const o=locOrder(),cur=view&&view.loc||focus,i=o.indexOf(cur);if(i<0)return;const k=o[(i+d+o.length)%o.length];PLATFORM.hap();goLocation(k)}
// Uzun basma: karta basılı tutunca o bölümün tarifleri kartın üstünde açılır; gitmeden üretim başlatılır ya da sıraya eklenir.
const qpop=document.createElement('div');qpop.className='qpop';qpop.hidden=true;document.body.appendChild(qpop);let lpT=null,lpKey=null,lpSuppress=0,lpStart=null;
function qpopHTML(k){const L=LOC[k];let h=`<div class="qp-h"><b>${L.e} ${L.n}</b><button class="x" data-act="qpclose" aria-label="Kapat">✕</button></div><div class="qp-b">`;
  if(L.kind==='fields'){h+=`<div class="seeds">${CROPS.filter(c=>!c.col||has1(c.col)).filter(cropSeasonOk).map(c=>{const lock=cropLocked(c);return `<button class="seed ${c.id===S.lastCrop?'on':''}" data-act="seed" data-r="${c.id}" ${lock?'disabled':''}><em>${ITEMS[c.id].e}</em><small>${lock?'🔒'+c.lvl:'₺'+c.cost}</small></button>`}).join('')}</div>
    <button class="btn big gold" data-act="qpplant">🌱 Boş parsellere ${ITEMS[S.lastCrop].e} ek</button>`}
  const us=(L.units||[]).filter(u=>S.units[u]&&B[u].recipes);
  for(const u of us){const s=S.units[u];h+=`<div class="uhead"><span>${B[u].e} ${B[u].n}</span></div>`+(s.job?jobRow(u)+queueHTML(u):recipeTiles(u))}
  if(!us.length&&L.kind!=='fields')h+='<p class="note">Bu bölümde başlatılacak üretim yok.</p>';
  return h+'</div>'}
function openQpop(k){lpKey=k;qpop.innerHTML=qpopHTML(k);qpop.hidden=false;PLATFORM.hap('medium')}
function closeQpop(){qpop.hidden=true;lpKey=null}
function refreshQpop(){if(!qpop.hidden&&lpKey)qpop.innerHTML=qpopHTML(lpKey)}
stripEl.addEventListener('pointerdown',e=>{const c=e.target.closest('.scard[data-go]');if(!c||e.target.closest('[data-quick]'))return;lpStart={x:e.clientX,y:e.clientY};clearTimeout(lpT);
  lpT=setTimeout(()=>{lpT=null;lpSuppress=1;openQpop(c.dataset.go)},480)});
for(const ev of['pointerup','pointercancel','pointerleave'])stripEl.addEventListener(ev,()=>{clearTimeout(lpT);lpT=null});
stripEl.addEventListener('pointermove',e=>{if(lpT&&lpStart&&Math.hypot(e.clientX-lpStart.x,e.clientY-lpStart.y)>9){clearTimeout(lpT);lpT=null}});
stripEl.addEventListener('contextmenu',e=>{if(e.target.closest('.scard'))e.preventDefault()});
// uzun basmadan hemen sonraki tıklama karta gitmesin
document.addEventListener('click',e=>{if(lpSuppress&&e.target.closest('.scard')){lpSuppress=0;e.stopPropagation();e.preventDefault()}},true);
// uzun basmadan sonra başka bir yere dokunulursa yutma işareti temizlenir
document.addEventListener('pointerdown',e=>{if(lpSuppress&&!lpT&&!e.target.closest('.scard'))lpSuppress=0},true);
document.addEventListener('pointerdown',e=>{if(!qpop.hidden&&!e.target.closest('.qpop')&&!e.target.closest('.scard'))closeQpop()},true);
