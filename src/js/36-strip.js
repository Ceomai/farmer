// ================= HARİTA: ALT KART ŞERİDİ =================
// Haritadayken bölümler ekranın altında büyük, resimli kartlar olarak yana kayar. Karta dokununca o bölüme gidilir.
const stripEl=document.getElementById('strip');let stripSig='';
function stripCards(){const own=[],lock=[];
  for(const k in LOC){const L=LOC[k];if(!owned(L.reg))continue;const st=locStatus(k);own.push({k,L,st,pri:st.c==='ok'?0:st.c==='new'?1:st.c==='idle'?2:3})}
  own.sort((a,b)=>a.pri-b.pri||Object.keys(LOC).indexOf(a.k)-Object.keys(LOC).indexOf(b.k));
  for(const r in REG){const d=REG[r];if(d.rect&&!owned(r))lock.push({r,d})}return{own,lock}}
function renderStrip(force){const show=mode==='hub';stripEl.hidden=!show;if(!show)return;const {own,lock}=stripCards();
  const sig=own.map(o=>o.k+o.st.c+(o.st.n||'')).join()+lock.map(l=>l.r+(S.lv>=l.d.lvl?1:0)+(S.coins>=regCost(l.r)?1:0)).join()+S.house;if(!force&&sig===stripSig)return;stripSig=sig;const sl=stripEl.scrollLeft;
  const th=k=>{const L=LOC[k],src=THUMB[L.kind==='house'?'kulube'+S.house:L.units?L.units[0]:k];return src?`<img src="${src}" alt="">`:`<span class="ph">${L.e}</span>`};
  stripEl.innerHTML=own.map(({k,L,st})=>{const bd=st.c==='ok'?`<i class="s ok">${st.n||'✓'}</i>`:st.c==='new'?'<i class="s new">🔨</i>':st.c==='idle'?'<i class="s idle">💤</i>':'';
      return `<button class="scard" data-go="${k}" title="${st.t||L.n}">${th(k)}${L.n}${bd}</button>`}).join('')
    +lock.map(({r,d})=>{const can=S.lv>=d.lvl;return `<button class="scard lock" data-region="${r}"><span class="ph">🔒</span>${d.n}<small>${can?'₺'+fmt(regCost(r)):'Seviye '+d.lvl}</small>${can&&S.coins>=regCost(r)?'<i class="s new">🏳️</i>':''}</button>`}).join('');
  stripEl.scrollLeft=sl}
