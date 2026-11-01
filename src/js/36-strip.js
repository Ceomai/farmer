// ================= HARİTA: ALT KART ŞERİDİ =================
// Haritadayken bölümler ekranın altında büyük, resimli kartlar olarak yana kayar.
// Kartın üstüne dokununca o bölüme gidilir; karttaki yeşil düğme ise hiçbir yere gitmeden işi yapar (topla / yeniden başlat).
const stripEl=document.getElementById('strip');let stripSig='';
function stripCards(){const own=[],lock=[];
  for(const k in LOC){const L=LOC[k];if(!owned(L.reg))continue;const st=locStatus(k);own.push({k,L,st,pri:st.c==='ok'?0:st.c==='new'?1:st.c==='idle'?2:3})}
  own.sort((a,b)=>a.pri-b.pri||Object.keys(LOC).indexOf(a.k)-Object.keys(LOC).indexOf(b.k));
  for(const r in REG){const d=REG[r];if(d.rect&&!owned(r))lock.push({r,d})}return{own,lock}}
// Bir bölümde tek dokunuşla yapılabilecek işler: hazır olanlar ve son tarifle yeniden başlatılabilecek boştakiler
function quickInfo(k){const L=LOC[k];let ready=0,idle=0;
  if(L.kind==='fields'){const c=cropOf(S.lastCrop);S.fields.forEach(f=>{if(f.job&&now()>=f.job.e)ready++;else if(!f.job&&c&&!cropLocked(c)&&S.coins>=c.cost)idle++})}
  (L.units||[]).forEach(u=>{const s=S.units[u];if(!s||!B[u].recipes)return;if(s.job){if(now()>=s.job.e)ready++;return}const r=B[u].recipes.find(x=>x.id===(s.last||B[u].recipes[0].id));if(r&&r.lvl<=S.lv&&(!r.col||has1(r.col))&&canPay(r))idle++});
  return{ready,idle}}
function quickLoc(k){const L=LOC[k],before={...S.items},g0=autoGain;let got=0,started=0,full=false;
  if(L.kind==='fields')S.fields.forEach((f,i)=>{if(f.job&&now()>=f.job.e){if(harvestPlot(i,null,null,true))got++;else full=true}});
  (L.units||[]).forEach(u=>{const s=S.units[u];if(s&&s.job&&now()>=s.job.e){if(collectUnit(u,null,null,true))got++;else full=true}});
  if(L.kind==='fields'){const c=cropOf(S.lastCrop);S.fields.forEach((f,i)=>{if(!f.job&&c&&plantPlot(i,S.lastCrop,true))started++})}
  (L.units||[]).forEach(u=>{const s=S.units[u];if(s&&!s.job&&B[u].recipes){startUnit(u,s.last||B[u].recipes[0].id,true);if(s.job)started++}});
  autoGain=g0;const out={};for(const i in S.items){const d=S.items[i]-(before[i]||0);if(d>0)out[i]=d}
  return{got,started,out,full}}
function quickFeedback(res,el){const r=el?el.getBoundingClientRect():{left:innerWidth/2,width:0,top:innerHeight-140},x=r.left+r.width/2,y=r.top;
  const txt=Object.entries(res.out).map(([k,v])=>`+${v} ${ITEMS[k].e}`).join('  ');
  if(txt){floatXY(x,y,txt);flyItems(x,y,res.out);sfx('pop')}else if(res.started)sfx('plant');
  if(res.started)floatXY(x,y-(txt?34:0),`▶ ${res.started} yeniden başladı`);
  if(res.full)toast('Ambar dolu! Pazarda sat ya da siloyu büyüt.');
  if(!txt&&!res.started&&!res.full)toast('Şu an yapılacak iş yok');
  if(res.got>=6)celebrate('Bereketli!');PLATFORM.hap(res.got?'medium':'light');commit();renderStrip(true)}
function quickAll(el){const tot={got:0,started:0,out:{},full:false};for(const k in LOC){if(!owned(LOC[k].reg))continue;const r=quickLoc(k);tot.got+=r.got;tot.started+=r.started;tot.full=tot.full||r.full;for(const i in r.out)tot.out[i]=(tot.out[i]||0)+r.out[i]}
  quickFeedback(tot,el)}
function renderStrip(force){const show=mode==='hub';stripEl.hidden=!show;if(!show)return;const {own,lock}=stripCards();
  const qi={};let tr=0,ti=0;own.forEach(o=>{qi[o.k]=quickInfo(o.k);tr+=qi[o.k].ready;ti+=qi[o.k].idle});
  const sig=own.map(o=>o.k+o.st.c+(o.st.n||'')+qi[o.k].ready+qi[o.k].idle).join()+lock.map(l=>l.r+(S.lv>=l.d.lvl?1:0)+(S.coins>=regCost(l.r)?1:0)).join()+S.house;if(!force&&sig===stripSig)return;stripSig=sig;const sl=stripEl.scrollLeft;
  const th=k=>{const L=LOC[k],src=THUMB[L.kind==='house'?'kulube'+S.house:L.units?L.units[0]:k];return src?`<img src="${src}" alt="">`:`<span class="ph">${L.e}</span>`};
  const all=tr+ti>1?`<button class="scard all" data-quickall><span class="ph">${tr?'🧺':'▶️'}</span>${tr?'Hepsini topla':'Hepsini başlat'}<small>${tr?tr+' hazır':''}${tr&&ti?' · ':''}${ti?ti+' boşta':''}</small></button>`:'';
  stripEl.innerHTML=all+own.map(({k,L,st})=>{const q=qi[k],bd=st.c==='ok'?`<i class="s ok">${st.n||'✓'}</i>`:st.c==='new'?'<i class="s new">🔨</i>':st.c==='idle'?'<i class="s idle">💤</i>':'';
      const qa=q.ready?`<span class="qa" role="button" data-quick="${k}">🧺 Topla</span>`:q.idle?`<span class="qa re" role="button" data-quick="${k}">▶ Başlat</span>`:'';
      return `<button class="scard${qa?' has-qa':''}" data-go="${k}" title="${st.t||L.n}">${th(k)}${L.n}${qa}${bd}</button>`}).join('')
    +lock.map(({r,d})=>{const can=S.lv>=d.lvl;return `<button class="scard lock" data-region="${r}"><span class="ph">🔒</span>${d.n}<small>${can?'₺'+fmt(regCost(r)):'Seviye '+d.lvl}</small>${can&&S.coins>=regCost(r)?'<i class="s new">🏳️</i>':''}</button>`}).join('');
  stripEl.scrollLeft=sl}
// Odaktayken bölümler arasında sırayla geçiş (‹ › düğmeleri ve başlıkta sağa-sola kaydırma)
function locOrder(){return Object.keys(LOC).filter(k=>owned(LOC[k].reg))}
function stepLoc(d){const o=locOrder(),cur=view&&view.loc||focus,i=o.indexOf(cur);if(i<0)return;const k=o[(i+d+o.length)%o.length];PLATFORM.hap();goLocation(k)}
