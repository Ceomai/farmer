// ================= PANELLER =================
let view=null,race=null;const sheet=$('#sheet');
const THUMB={};
const img=k=>THUMB[k]?`<img src="${THUMB[k]}" alt="">`:(B[k]?B[k].e:(LOC[k]?LOC[k].e:'🏠'));
function stars(n,max){return `<div class="stars">${Array.from({length:max},(_,k)=>`<i class="${k<n?'on':''}"></i>`).join('')}</div>`}
function head(thumb,title,sub){return `<div class="sh-head"><div class="thumb">${thumb}</div><div class="ttl"><h2>${title}</h2>${sub?`<div class="sub">${sub}</div>`:''}</div>${view&&view.k==='loc'&&locOrder().length>1?`<button class="nav" data-locstep="-1" aria-label="Önceki bölüm">‹</button><button class="nav" data-locstep="1" aria-label="Sonraki bölüm">›</button>`:''}<button class="x" data-act="close" aria-label="Kapat">✕</button></div>`}
function closeSheet(){if(!view)return;if(mode!=='hub'){view.mini=!view.mini;renderSheet();return}view=null;renderSheet()}
function openView(k){view={k};renderSheet()}
function setDock(){document.querySelectorAll('.dock button[data-open]').forEach(b=>b.setAttribute('aria-current',String(!!view&&b.dataset.open===view.k)))}
function renderSheet(){
  if(!view){sheet.hidden=true;document.body.classList.remove('sheet-open');setDock();return}
  sheet.hidden=false;document.body.classList.add('sheet-open');sheet.classList.toggle('dark',view.k==='alley');
  const f={loc:sheetLoc,region:sheetRegion,places:sheetPlaces,barn:sheetBarn,goals:sheetGoals,settings:sheetSettings,shop:sheetShop,album:sheetAlbum,ledger:sheetLedger,mail:sheetMail,guide:sheetGuide,borsa:sheetBorsa,budget:sheetBudget,stats:sheetStats}[view.k];
  const body=sheet.querySelector('.sh-body'),st=body?body.scrollTop:0;sheet.innerHTML=f();const nb=sheet.querySelector('.sh-body');if(nb)nb.scrollTop=st;
  sheet.classList.toggle('mini',mode!=='hub'&&!!view.mini);
  if(mode!=='hub')sheet.querySelectorAll('[data-act="close"]').forEach(b=>{b.textContent=view.mini?'▴':'▾';b.setAttribute('aria-label',view.mini?'Kartı aç':'Kartı küçült')});
  view.sig=sheetSig();setDock()}
function sheetSig(){if(!view)return'';let s='';if(view.k==='loc'){const L=LOC[view.loc];if(L.kind==='fields')s+=S.fields.map(f=>f.job?(now()>=f.job.e?'r':'g'):'i').join('');(L.units||[]).forEach(u=>{const x=S.units[u];s+=x?(x.job?(now()>=x.job.e?'r':'g'):'i'):'-'});if(L.kind==='orders')s+=readyOrders()}
  if(view.k==='loc'&&view.loc==='hipo')s+=S.horses.map(h=>(now()<h.rest?'r':'')+(now()<h.train?'t':'')).join()+has('at');return s}
const outOf=sc=>{const k=Object.keys(sc.out)[0];return `<span class="big">${ITEMS[k].e}<i>×${sc.out[k]}</i></span>`};
function recipeTiles(u){const d=B[u],s=S.units[u];return `<div class="tiles">`+d.recipes.map(r=>{const lock=r.lvl>S.lv||(r.col&&!has1(r.col)),sc=scaled(r,s.l),ok=!lock&&canPay(r);
  const ins=lock?`<b>${r.col&&r.lvl<=S.lv?'📖 Koleksiyon':'🔒 Sv '+r.lvl}</b>`:(r.cost?`<b class="${S.coins<r.cost?'miss':''}">₺${r.cost}</b>`:'')+Object.entries(r.in||{}).map(([k,n])=>`<b class="${has(k)<n?'miss':''}">${ITEMS[k].e}${n}</b>`).join('');
  return `<button class="tile" data-act="start" data-u="${u}" data-r="${r.id}" ${ok?'':'disabled'} title="${r.n}">${outOf(sc)}<span class="ins">${ins||'<b>Bedava</b>'}</span><span class="tm">${lock?'':'⏱ '+secs(sc.t)}</span></button>`}).join('')+'</div>'}
function jobRow(u){const s=S.units[u],r=unitRecipe(u),sc=scaled(r,s.l);
  if(now()>=s.job.e)return `<button class="job ready" data-act="collect" data-u="${u}">${outOf(sc)}<b>Topla!</b></button>`;
  return `<div class="job" title="${r.n}">${outOf(sc)}<span class="pw"><span class="pbar"><i data-s="${s.job.s}" data-e="${s.job.e}"></i></span><small data-left="${s.job.e}" data-pre="⏱"></small></span></div>`}
function upBtn(u){const s=S.units[u];if(s.l>=MAXL)return'';const bl=upBlock(s.l+1);return `<button class="up" data-act="upU" data-u="${u}" ${bl||S.coins<upCost(u)?'disabled':''} title="+%30 ürün, %10 daha kısa süre">⬆ Sv ${s.l+1} <span>${bl||'₺'+fmt(upCost(u))}</span></button>`}
function unitHTML(u,multi){const d=B[u],s=S.units[u];
  if(!s){const lock=S.lv<d.lvl;return `<div class="unit"><div class="build ${lock?'off':''}"><span class="thumb sm">${img(u)}</span><span class="t"><b>${d.n}</b><small>${d.d}</small></span><button class="btn gold" data-act="build" data-u="${u}" ${lock||S.coins<d.cost?'disabled':''}>${lock?'🔒 '+d.lvl:'🔨 ₺'+fmt(d.cost)}</button></div></div>`}
  let h=multi?`<div class="uhead"><span>${d.e} ${d.n}</span>${stars(s.l,MAXL)}</div>`:'';
  if(d.storage)h+=`<div class="job"><span class="big">📦</span><span class="pw"><b>+${d.storage*s.l} yer</b><small>Ambar ${stored()} / ${cap()}</small></span></div>`;
  h+=loveRow(u);if(s.job)h+=jobRow(u);else if(d.recipes)h+=recipeTiles(u);
  const ent=INSIDE_UNITS[u]&&mode!=='interior'?`<button class="pill-btn go" data-act="enterIn" data-k="${u}">🚪 İçeri</button>`:'';
  return `<div class="unit">${h}<div class="urow">${ent}${upBtn(u)}${extraRow(u)}</div></div>`}
function sheetLoc(){const k=view.loc,L=LOC[k];const th=img(L.kind==='house'?'kulube'+S.house:L.units?L.units[0]:k);let h,b='';
  switch(L.kind){
    case'house':{h=head(th,HOUSE[S.house-1].n,stars(S.house,4));const nx=HOUSE[S.house];
      b+=`<div class="job"><span class="big">📦</span><span class="pw"><b>Kiler</b><span class="pbar"><i style="width:${Math.min(100,stored()/cap()*100)}%;animation:none"></i></span><small>${stored()} / ${cap()}</small></span></div>`;
      b+=`<div class="urow">${mode!=='interior'?`<button class="pill-btn go" data-act="enterIn" data-k="kulube">🚪 Eve gir</button>`:''}${nx?`<button class="up" data-act="upHouse" ${S.lv>=nx.lvl&&S.coins>=nx.cost?'':'disabled'} title="Ambar büyür, binalar daha üst seviyeye çıkabilir">⬆ ${nx.n} <span>${S.lv>=nx.lvl?'₺'+fmt(nx.cost):'🔒 Sv '+nx.lvl}</span></button>`:''}</div>`;break}
    case'fields':h=head(th,L.n,stars(S.fieldLv,MAXL));b+=fieldsBody();break;
    case'market':h=head(th,L.n,'');b+=`<button class="btn big gold" data-act="mg" data-k="haggle" ${now()<(S.haggleAt||0)?'disabled':''}>🤝 Tüccarla pazarlık et</button>`+marketBody();break;
    case'orders':{h=head(th,L.n,'★ ×'+repMult().toFixed(2));const tb=view.tab||'o';b+=`<div class="tabs"><button aria-selected="${tb==='o'}" data-act="vtab" data-t="o">📜 Sipariş</button><button aria-selected="${tb==='c'}" data-act="vtab" data-t="c">🤝 Sözleşme</button><button aria-selected="${tb==='f'}" data-act="vtab" data-t="f">❤️ Dostlar</button></div>`+(tb==='o'?ordersBody():tb==='c'?contractsBody():friendsBody());break}
    case'fair':h=head(th,L.n,'Bugünün yarışmaları');b+=fairBody();break;
    case'race':h=head(th,L.n,S.units.hara?stars(S.units.hara.l,MAXL):'');b+=unitHTML('hara')+raceBody();break;
    default:{const single=L.units.length===1,s0=S.units[L.units[0]];h=head(th,L.n,single&&s0?stars(s0.l,MAXL):'');L.units.forEach(u=>b+=unitHTML(u,!single))}}
  return h+`<div class="sh-body">${b}</div>`}
function fieldsBody(){const ready=S.fields.filter(f=>f.job&&now()>=f.job.e).length,empty=S.fields.filter(f=>!f.job).length,n=S.fields.length,seedE=ITEMS[S.lastCrop].e;
  let h=`<div class="seeds">${CROPS.filter(c=>!c.col||has1(c.col)).map(c=>{const lock=cropLocked(c);return `<button class="seed ${c.id===S.lastCrop?'on':''}" data-act="seed" data-r="${c.id}" ${lock?'disabled':''} title="${c.n} · ${secs(scaled(c,S.fieldLv).t)}"><em>${ITEMS[c.id].e}</em><small>${lock?'🔒'+c.lvl:'₺'+c.cost}</small></button>`}).join('')}</div>`;
  h+=`<div class="plots">`+S.fields.map((f,i)=>{if(!f.job)return `<button class="plot empty" data-act="plot" data-i="${i}" title="Ek"><em>${seedE}</em>ek</button>`;
      const c=cropOf(f.job.r);return now()>=f.job.e?`<button class="plot ready" data-act="plot" data-i="${i}"><em>${ITEMS[c.id].e}</em>topla!</button>`:`<button class="plot" data-act="plot" data-i="${i}"><em>${['','🌱','🌿',ITEMS[c.id].e][stageOf(f.job)]}</em><span class="pbar"><i data-s="${f.job.s}" data-e="${f.job.e}"></i></span></button>`}).join('')
    +(n<9?`<button class="plot buy" data-act="buyPlot" ${S.lv>=PLOT_LV[n]&&S.coins>=PLOT_COST[n]?'':'disabled'} title="Yeni parsel"><em>➕</em>${S.lv<PLOT_LV[n]?'🔒 Sv '+PLOT_LV[n]:'₺'+fmt(PLOT_COST[n])}</button>`:'')+`</div>`;
  const fu=S.fieldLv<MAXL?(()=>{const bl=upBlock(S.fieldLv+1);return `<button class="up" data-act="upFields" ${bl||S.coins<FIELD_UP[S.fieldLv]?'disabled':''} title="+%30 hasat, daha hızlı büyüme">⬆ Sv ${S.fieldLv+1} <span>${bl||'₺'+fmt(FIELD_UP[S.fieldLv])}</span></button>`})():'';
  const run=S.fields.filter(f=>f.job&&now()<f.job.e);
  return h+`<div class="urow"><button class="pill-btn go" data-act="plantAll" ${empty?'':'disabled'}>🌱 Ek (${empty})</button><button class="pill-btn gold" data-act="harvestAll" ${ready?'':'disabled'}>🧺 Topla (${ready})</button>${fu}${run.length?speedBtns('F',Math.max(...run.map(f=>f.job.e-now()))):''}${workerBtn('fields')}</div>`}
function marketBody(){const inv=Object.keys(ITEMS).filter(k=>has(k)>0);
  return `<div class="job"><span class="big">🌰</span><span class="pw"><b>Yem · ₺${ITEMS.yem.buy}</b><small>Elde ${has('yem')}</small></span><button class="pill-btn" data-act="feed" data-n="5">+5</button><button class="pill-btn gold" data-act="feed" data-n="20">+20</button></div>
  ${inv.some(k=>satF(k)<.85)?'<p class="note">📉 Pazar bu ürünlerden doydu: çok satınca fiyat düşer, 15 dakikada toparlanır. Siparişler ve sözleşmeler bundan etkilenmez.</p>':''}${inv.length?`<div class="tiles">${inv.map(k=>{const m=S.market.m[k]||1,tr=m>=1.1?' <span style="color:var(--green)">▲</span>':m<=.9?' <span class="miss">▼</span>':'';
    return `<div class="tile sell" title="${ITEMS[k].n}"><span class="big">${ITEMS[k].e}<i>×${has(k)}</i></span><span class="tm">₺${sellPrice(k)}${tr}${satF(k)<.85?' <span class="miss" title="Pazar bu üründen doydu, fiyat zamanla toparlanır">📉</span>':''}</span><span class="two"><button data-act="sell" data-k="${k}" data-n="1">1</button><button data-act="sell" data-k="${k}" data-n="999999">Tümü</button></span></div>`}).join('')}</div>`:'<p class="note">Ambar boş. Önce bir şeyler üret.</p>'}`}
function ordersBody(){ensureOrders();return S.orders.map((o,i)=>{const ok=Object.entries(o.items).every(([k,n])=>has(k)>=n);
  return `<div class="order"><div class="who">${face(o.who)} ${o.who} <small style="font-size:10px">${hearts(o.who)}</small><span>₺${fmt(o.base*repMult()*frMult(o.who))} · ${o.xp} xp</span></div><div class="needs">${Object.entries(o.items).map(([k,n])=>`<span class="need ${has(k)<n?'miss':''}" title="${ITEMS[k].n}"><em>${ITEMS[k].e}</em>${Math.min(has(k),n)}/${n}</span>`).join('')}</div>
  <div class="urow"><button class="pill-btn gold" data-act="order" data-i="${i}" ${ok?'':'disabled'}>✓ Teslim et</button><button class="pill-btn" data-act="reorder" data-i="${i}" title="Başka sipariş iste">↻</button></div></div>`}).join('')}
function sheetRegion(){const r=view.r,d=REG[r],ok=S.lv>=d.lvl;const locs=Object.keys(LOC).filter(k=>LOC[k].reg===r);
  return head('🗺️',d.n,'Satılık arazi')+`<div class="sh-body"><div class="places">${locs.map(k=>`<div class="place"><span class="thumb sm">${img(LOC[k].units?LOC[k].units[0]:k)}</span>${LOC[k].n}</div>`).join('')}</div>
  <button class="btn big gold" data-act="region" data-r="${r}" ${ok&&S.coins>=regCost(r)?'':'disabled'}>${ok?`🏳️ Satın al · ₺${fmt(regCost(r))}`:`🔒 Seviye ${d.lvl}`}</button></div>`}
function sheetPlaces(){return head('📍','Konumlar','')+`<div class="sh-body"><div class="places">`+Object.keys(LOC).map(k=>{const L=LOC[k],own=owned(L.reg),st=own?locStatus(k):null;
  const bd=st&&st.c==='ok'?`<i class="s ok">${st.n||'✓'}</i>`:st&&st.c==='new'?'<i class="s new">🔨</i>':st&&st.c==='idle'?'<i class="s idle">💤</i>':'';
  return `<button class="place ${own?'':'locked'}" data-go="${k}"><span class="thumb sm">${own?img(L.kind==='house'?'kulube'+S.house:L.units?L.units[0]:k):'🔒'}</span>${L.n}${bd}</button>`}).join('')+'</div></div>'}
function sheetBarn(){const inv=Object.keys(ITEMS).filter(k=>has(k)>0);
  return head('📦','Ambar',`${stored()} / ${cap()}`)+`<div class="sh-body"><div class="pbar"><i style="width:${Math.min(100,stored()/cap()*100)}%;animation:none"></i></div>
  ${inv.length?`<div class="inv">${inv.map(k=>`<div class="slot" title="${ITEMS[k].n}"><em>${ITEMS[k].e}</em><b>${has(k)}</b></div>`).join('')}</div>`:'<p class="note">Ambar boş.</p>'}
  <div class="urow"><button class="pill-btn gold" data-go="pazar">🏪 Pazara git</button></div></div>`}
function sheetGoals(){const g=GOALS[S.goal];
  return head('🎯','Hedefler',`${S.goal} / ${GOALS.length}`)+`<div class="sh-body">${dailyHTML()}<div class="uhead"><span>🎯 Ana hedef</span></div>
  ${g?`<div class="job"><span class="big">${g.ok()?'✅':'🎯'}</span><span class="pw"><b style="font-size:14px">${g.d}</b><small>Ödül ₺${fmt(g.r)}</small></span><button class="pill-btn gold" data-act="goal" ${g.ok()?'':'disabled'}>Al</button></div>`:'<p class="note">Bütün hedefler bitti!</p>'}
  <p class="note">Haritadaki tabelaya dokun, o bölüme git. ✓ hazır ürün, 🔨 kurulabilir bina, 💤 boşta bekleyen bina demek.</p></div>`}
function sheetSettings(){return head('⚙️','Ayarlar','')+`<div class="sh-body">${accountHTML()}
  <div class="uhead"><span>🖥️ Grafik</span><span class="tm">${GFX.low?'Pil tasarrufu açık':''}</span></div><div class="tabs">${[['auto','Otomatik'],['high','Yüksek'],['low','Pil tasarrufu']].map(([k,n])=>`<button aria-selected="${GFX.mode===k}" data-act="gfx" data-k="${k}">${n}</button>`).join('')}</div>
  <p class="note">Otomatik: cihaza göre ayarlanır, takılırsa çözünürlüğü düşürür. Pil tasarrufu: gölgeler kapanır, 30 FPS. Değişiklik oyunu yeniden yükler.</p>
  <label class="switch"><input type="checkbox" id="optMusic" ${S.sound.music?'checked':''}><span><b>Müzik</b><br><span class="note">50'ler tarzı çiftlik ezgisi</span></span></label>
  <label class="switch"><input type="checkbox" id="optSfx" ${S.sound.sfx?'checked':''}><span><b>Ses efektleri</b><br><span class="note">Hayvanlar, hasat, para sesi</span></span></label>
  <label class="switch"><input type="checkbox" id="optFast" ${S.fastNav?'checked':''}><span><b>Hızlı gezinme</b><br><span class="note">Kamera uçmadan bölümler arasında anında geçer</span></span></label>
  <label class="switch"><input type="checkbox" id="optNotif" ${S.sound.notif?'checked':''}><span><b>Hazır bildirimleri</b><br><span class="note">Sekme arka plandayken ürün hazır olunca haber verir. Tarayıcı izin vermezse çalışmaz.</span></span></label>
  ${view.confirm?`<div class="urow"><span class="note">Tüm ilerleme silinsin mi?</span><button class="btn red" data-act="reset2">Sil</button><button class="btn soft" data-act="reset0">Vazgeç</button></div>`:`<button class="btn ghost" data-act="reset">Baştan başla</button>`}</div>`}

// --- at isimleri ---
const HNAMES=['Rüzgar','Karayel','Şahbatur','Gümüşnal','Yıldırım','Bozok','Sultan','Asil Bey','Fırtına','Demirkır'];
