// ================= KASABA RESTORASYONU VE YENİ NESİL =================

// --- Kasaba projeleri: büyük para + ürün katkısıyla tamamlanır, kalıcı bonus verir (geç oyun para yutağı) ---
const PROJ=[
  {id:'cesme',e:'⛲',n:'Köy çeşmesi',lv:8,c:15000,need:{bal:5,sut:10},bonus:'Hayvanların mutluluğu iki kat yavaş azalır'},
  {id:'okul',e:'🏫',n:'Köy okulu',lv:12,c:50000,need:{ekmek:20,yumurta:30},bonus:'Sipariş ve sözleşme ödülleri +%10'},
  {id:'kopru',e:'🌉',n:'Taş köprü',lv:15,c:120000,need:{kumas:10,yag:6},bonus:'Sözleşme ödülleri ayrıca +%15'},
  {id:'pazaryeri',e:'🏛️',n:'Kapalı pazar',lv:18,c:250000,need:{peynir:15,recel:10},bonus:'Pazar iki kat geç doyar'},
  {id:'saat',e:'🕰️',n:'Saat kulesi',lv:22,c:500000,need:{baklava:5,hali:2},bonus:'Bütün üretim %5 daha hızlı'},
  {id:'tribun',e:'🏟️',n:'Hipodrom tribünü',lv:26,c:900000,need:{at:3,yorgan:2},bonus:'At yarışı ödülleri +%50'},
];
const projOn=id=>!!(S&&S.proj&&S.proj[id]);
function projBody(){if(!S.proj||typeof S.proj!=='object')S.proj={};
  return `<p class="note">Kasabayı birlikte güzelleştirin: her proje büyük bir bağış ve açılış ikramı ister, karşılığında kalıcı bir avantaj verir.</p>`+PROJ.map(p=>{const done=projOn(p.id),lock=S.lv<p.lv,ok=!done&&!lock&&S.coins>=p.c&&Object.entries(p.need).every(([k,n])=>has(k)>=n);
    return `<div class="order ${done?'pdone':''}"><div class="who">${p.e} ${p.n}<span>${done?'✓ Açıldı':lock?'🔒 Sv '+p.lv:'₺'+fmt(p.c)}</span></div><p class="note" style="margin:2px 0 6px">${p.bonus}</p>
      ${done?'':`<div class="needs">${Object.entries(p.need).map(([k,n])=>`<span class="need ${has(k)<n?'miss':''}" title="${ITEMS[k].n}"><em>${ITEMS[k].e}</em>${Math.min(has(k),n)}/${n}</span>`).join('')}</div>
      <div class="urow"><button class="pill-btn gold" data-act="proj" data-id="${p.id}" ${ok?'':'disabled'}>🏗️ Bağışla ve aç</button></div>`}</div>`}).join('')}
function doProj(id){const p=PROJ.find(x=>x.id===id);if(!p||projOn(id)||S.lv<p.lv)return;if(S.coins<p.c)return toast('Yeterli paran yok');for(const k in p.need)if(has(k)<p.need[k])return toast('Eksik ürün var');
  pay(p.c,'Kasaba');for(const k in p.need)S.items[k]-=p.need[k];if(!S.proj)S.proj={};S.proj[id]=now();S.rep=Math.min(100,S.rep+5);addXP(Math.round(p.c/200));stat('proj');sfx('win');celebrate(p.n+' açıldı!');
  const d=document.createElement('div');d.className='modal login';d.innerHTML=`<div><div class="badge">${p.e}</div><h2>${p.n} açıldı!</h2><p>Kasaba sana minnettar. ★ +5<br><b>${p.bonus}</b></p><button class="btn big gold">Harika</button></div>`;d.querySelector('button').onclick=()=>d.remove();document.body.appendChild(d);commit()}

// --- Yeni nesil: Konak ve seviye 30'dan sonra çiftlik yeni nesle devredilir ---
// Sıfırlanır: para, ürünler, binalar, araziler, ev, tarla, seviye. Kalır: yonca, koleksiyon, başarımlar, süsler, dostluklar, hikâyeler, kasaba projeleri, ayarlar.
// Kazanılır: her nesil kalıcı +%10 üretim ve 10 yonca.
const GEN_LV=30;
const genReady=()=>S.lv>=GEN_LV&&S.house>=4;
function genHTML(){const g=S.gen||0;return `<div class="unit"><div class="uhead"><span>🌳 Yeni nesil</span><span class="tm">${g?g+'. nesil · üretim +%'+g*10:''}</span></div>
  <p class="note">Çiftliği çocuklarına devret: baştan başlarsın ama bütün üretim kalıcı olarak +%10 artar. Yonca, koleksiyon, başarımlar, süsler, dostluklar ve kasaba projeleri seninle kalır.</p>
  ${genReady()?`<button class="btn big gold" data-act="gen">🌳 Yeni nesle devret (+%10 üretim, +🍀10)</button>`:`<button class="btn big" disabled>🔒 Konak + seviye ${GEN_LV} gerekli</button>`}</div>`}
function askGen(){if(!genReady())return;const d=document.createElement('div');d.className='modal login';
  d.innerHTML=`<div><div class="badge">🌳</div><h2 style="font-size:24px">Yeni nesle devret?</h2><p style="font-size:13px;text-align:left"><b>Sıfırlanır:</b> para, ürünler, binalar, araziler, ev, tarlalar, seviye.<br><b>Kalır:</b> 🍀 yonca, koleksiyon, başarımlar, süsler, dostluklar, hikâyeler, kasaba projeleri.<br><b>Kazanılır:</b> kalıcı +%10 üretim ve +🍀10.</p>
    <button class="btn big gold" data-g="1">Evet, devret</button><button class="btn ghost" data-g="0">Vazgeç</button></div>`;
  document.body.appendChild(d);d.querySelectorAll('[data-g]').forEach(b=>b.onclick=()=>{d.remove();if(b.dataset.g==='1')doGen()})}
function doGen(){if(!genReady())return;const keep={};for(const k of['gems','album','ach','decor','friends','quests','proj','sound','consent','ui','stats','keepN','autoSell','fastNav','created'])if(S[k]!=null)keep[k]=S[k];
  const g=(S.gen||0)+1;S=Object.assign(fresh(),keep,{gen:g,tut:{done:1},tut2:{done:1}});S.gems=(S.gems||0)+10;S.stats.gens=(S.stats.gens||0)+1;
  refreshMarket(true);ensureOrders();save();regSig='';view=null;toHub();syncWorld(true);renderHUD();celebrate(g+'. nesil!');toast(`🌳 ${g}. nesil başladı: bütün üretim +%${g*10}`);track('prestige',{gen:g})}
