// ================= OLAYLAR, HAFTANIN YARIŞMASI, KASABALI HİKÂYELERİ, BAŞARIMLAR =================

// --- Ödül verme yardımcısı: ürün ambara sığmazsa karşılığı para olarak verilir ---
function giveItems(out){let money=0;const got={};for(const k in out){const free=Math.max(0,cap()-stored());const n=k==='at'?out[k]:Math.min(out[k],free);if(n>0){S.items[k]=has(k)+n;got[k]=n}const rest=out[k]-n;if(rest>0)money+=rest*ITEMS[k].p}
  if(money)gain(money,'Ödül');return Object.entries(got).map(([k,n])=>`+${n} ${ITEMS[k].e}`).join(' ')+(money?` +₺${fmt(money)}`:'')}

// --- Rastgele olaylar: 20–40 dakikada bir, çiftçinin balonunda duyurulur; 10 dakika içinde dokunulmazsa kaybolur ---
const EVENTS={
  tilki:{ok:()=>S.units.kumes,say:'🦊 Kümese tilki dadandı! Kovalayalım mı?',run:foxGame},
  kuzu:{ok:()=>S.units.agil,say:'🐑 Bir kuzu kayboldu, çalılıklarda arayalım mı?',run:lambGame},
  tuccar:{ok:()=>S.lv>=3,say:'🧳 Gezgin tüccar kasabaya uğradı, nadir mallar getirmiş!',run:traderModal},
  ogul:{ok:()=>S.units.kovan,say:'🐝 Arılar oğul verdi! Petekleri hemen toplayalım mı?',run:()=>{const r=giveItems({bal:3+lvOf('kovan')});evtEnd(`Petekler toplandı! ${r}`)}},
  yagmurdurasi:{ok:()=>S.fields.length>=3,say:'🌈 Gökkuşağı çıktı! Tarlada bereket var, bir bakalım mı?',run:()=>{let n=0;S.fields.forEach(f=>{if(f.job&&now()<f.job.e){f.job.e=Math.max(now(),f.job.e-60000);n++}});evtEnd(n?`${n} parseldeki ekinler bir dakika erken olgunlaşacak!`:`Tarlalar boştu ama gökkuşağı güzeldi. +1 🍀`,n?0:1)}},
};
function evtState(){if(!S.evt||typeof S.evt!=='object')S.evt={next:now()+15*60000};return S.evt}
function evtTick(){const E=evtState();if(E.cur&&now()>E.until){E.cur=null}
  if(E.cur||now()<E.next||mode==='desk'||tutStep()>=0||tut2Step()>=0||document.querySelector('.modal'))return;
  const ok=Object.keys(EVENTS).filter(k=>EVENTS[k].ok());E.next=now()+(20+Math.random()*20)*60000;if(!ok.length)return;
  E.cur=ok[Math.floor(Math.random()*ok.length)];E.until=now()+10*60000;sfx('chime');farmerSay(true)}
function evtHint(){const E=S&&S.evt;if(!E||!E.cur||now()>E.until||!EVENTS[E.cur])return null;return ['evt'+E.cur,EVENTS[E.cur].say,()=>runEvent()]}
function runEvent(){const E=evtState(),ev=EVENTS[E.cur];E.cur=null;if(!ev)return;stat('event');try{ev.run()}catch(e){console.warn(e)}}
function evtEnd(msg,gems=0){if(gems)S.gems+=gems;toast(msg);sfx('win');commit()}
function foxGame(){const o=mgOpen('🦊 Tilkiyi kovala','Tilki kümesin etrafında koşuyor. 10 saniyede 5 kez dokun!');let hits=0,done=false,iv,tm;
  o.body.innerHTML=`<div class="mgfield fox"><button class="foxbtn" aria-label="Tilki">🦊</button></div><div class="mgscore">0 / 5</div>`;const f=o.body.querySelector('.mgfield'),b=f.querySelector('.foxbtn'),sc=o.body.querySelector('.mgscore');
  const hop=()=>{b.style.transform=`translate(${Math.round(f.clientWidth*(5+Math.random()*75)/100)}px,${Math.round(f.clientHeight*(8+Math.random()*70)/100)}px) translate(-50%,-50%)`}; // konum transform ile (yerleşim tetiklenmez)
  hop();iv=setInterval(hop,800);
  const end=win=>{if(done)return;done=true;clearInterval(iv);clearTimeout(tm);if(win){const r=giveItems({yumurta:4+2*lvOf('kumes')});S.gems+=1;stat('fox');mgEnd(o,`Tilki kaçtı, tavuklar güvende! ${r} +1 🍀`)}else mgEnd(o,'Tilki ormana kaçtı. Tavuklar korktu ama hepsi yerinde.');commit()};
  b.onclick=()=>{hits++;sc.textContent=hits+' / 5';PLATFORM.hap();sfx('pop');hop();if(hits>=5)end(true)};o.onClose=()=>{clearInterval(iv);clearTimeout(tm);done=true};tm=setTimeout(()=>end(false),10000)}
function lambGame(){const o=mgOpen('🐑 Kayıp kuzu','Kuzu üç çalıdan birinin arkasında. İki hakkın var!');const at=Math.floor(Math.random()*3);let tries=2,done=false;
  o.body.innerHTML=`<div class="bushes">${[0,1,2].map(i=>`<button class="bush" data-i="${i}">🌳</button>`).join('')}</div><div class="mgscore">2 hak</div>`;const sc=o.body.querySelector('.mgscore');
  o.body.querySelectorAll('.bush').forEach(b=>b.onclick=()=>{if(done||b.disabled)return;const i=+b.dataset.i;if(i===at){done=true;b.textContent='🐑';const r=giveItems({yun:3+lvOf('agil')});stat('lamb');sfx('win');setTimeout(()=>{mgEnd(o,`Kuzu bulundu, annesine kavuştu! ${r}`);commit()},600)}
    else{b.textContent='🍃';b.disabled=true;tries--;sc.textContent=tries+' hak';sfx('pop');if(!tries){done=true;setTimeout(()=>{const r=giveItems({yun:1});mgEnd(o,`Kuzu akşam kendisi döndü. ${r}`);commit()},500)}}})}
function traderModal(){const own=Object.keys(ITEMS).filter(k=>has(k)>=8&&ITEMS[k].p<60&&k!=='yem');const rare=['kestane','kasar','baklava','hali','pastirma','sabun'].filter(k=>ITEMS[k]);
  const deals=[];if(own.length){const g=own[Math.floor(Math.random()*own.length)],t=rare[Math.floor(Math.random()*rare.length)],n=Math.max(4,Math.min(has(g),Math.ceil(ITEMS[t].p*0.65/ITEMS[g].p)));if(has(g)>=n)deals.push({give:{[g]:n},get:{[t]:1}})}
  const seeds=COL.filter(c=>c.src==='field'&&!S.album[c.id]);if(seeds.length)deals.push({gems:8,col:seeds[0].id});
  deals.push({coins:Math.max(200,S.lv*120),get:{yem:30}});
  const d=document.createElement('div');d.className='modal login';
  d.innerHTML=`<div><div class="badge">🧳</div><h2 class="h-sm">Gezgin tüccar</h2><p class="note">"Bugün buradayım, yarın yolda! Ne dersin?"</p>${deals.map((x,i)=>{const txt=x.col?`8 🍀 → ${COL.find(c=>c.id===x.col).e} ${COL.find(c=>c.id===x.col).n}`:x.give?`${Object.entries(x.give).map(([k,n])=>n+' '+ITEMS[k].e).join(' ')} → ${Object.entries(x.get).map(([k,n])=>n+' '+ITEMS[k].e+' '+ITEMS[k].n).join(' ')}`:`₺${fmt(x.coins)} → 30 🌰 yem`;
    const can=x.col?S.gems>=x.gems:x.give?Object.entries(x.give).every(([k,n])=>has(k)>=n):S.coins>=x.coins;return `<button class="btn big ${can?'gold':''}" data-deal="${i}" ${can?'':'disabled'}>${txt}</button>`}).join('')}<button class="btn ghost" data-deal="x">Teşekkürler, sonra</button></div>`;
  document.body.appendChild(d);d.querySelectorAll('[data-deal]').forEach(b=>b.onclick=()=>{const v=b.dataset.deal;d.remove();if(v==='x')return;const x=deals[+v];
    if(x.col){if(S.gems<x.gems)return;S.gems-=x.gems;S.album[x.col]=(S.album[x.col]||0)+1;stat('trade');showFind(COL.find(c=>c.id===x.col));commit();return}
    if(x.give){for(const k in x.give)if(has(k)<x.give[k])return toast('Eksik ürün var');for(const k in x.give)S.items[k]-=x.give[k]}else{if(S.coins<x.coins)return toast('Yeterli paran yok');pay(x.coins,'Tüccar')}
    stat('trade');evtEnd('Anlaştınız! '+giveItems(x.get))})}

// --- Haftanın yarışması: her hafta bir panayır yarışmasının ödülü iki katı ---
const weekNo=()=>Math.floor((Date.now()-Date.UTC(2024,0,1))/(7*864e5));
function weeklyContest(){const pool=producible();const ok=CONTESTS.filter(c=>Object.keys(c.need).every(k=>pool.includes(k)));return ok.length?ok[weekNo()%ok.length].id:null}

// --- Kasabalı hikâyeleri: Tanıdık olunca her kasabalının 3 adımlık küçük bir isteği açılır ---
const QUESTS={
  'Kasap Rıza':[['Dükkânın vitrini boş kaldı, biraz yumurta getirir misin?',{yumurta:8}],['Bayram yaklaşıyor, kavurma için ete ihtiyacım var.',{et:4}],['Oğlumun düğününe pastırma lazım, senden iyisini kimse yapamaz!',{pastirma:3}]],
  'Fırıncı Nuri':[['Sabah ekmeği için un bitti, yardım eder misin?',{un:6}],['Mahalleye simit dağıtacağım, ekmeklerini alabilir miyim?',{ekmek:5}],['Ustamın tarifiyle baklava yapacağım, senin baklavandan tadına bakmalıyım!',{baklava:1}]],
  'Lokantacı Sevim':[['Menüye taze domates salatası koyacağım.',{domates:10}],['Kışlık turşu için lahana lazım.',{lahana:6}],['Yeni lokantamın açılışına salça ve tereyağı gerek.',{salca:3,tereyag:2}]],
  'Manav Hilmi':[['Tezgâhta mısır kalmadı, biraz getirir misin?',{misir:12}],['Okul çocuklarına elma dağıtacağım.',{elma:15}],['Pazarda en güzel karpuz benim tezgâhımda olsun!',{karpuz:4}]],
  'Otelci Gülten':[['Odalara taze süt koyacağım.',{sut:8}],['Kahvaltı tabağına peynir ve bal lazım.',{peynir:3,bal:3}],['Otelin lobisine el dokuma bir halı istiyorum.',{hali:1}]],
  'Kooperatif':[['Ortak ambara buğday desteği verir misin?',{bugday:30}],['Köylüler için yem stoku yapıyoruz.',{yem:25}],['Kooperatif dokuma atölyesi kuruyor, kumaş gerek.',{kumas:4}]],
  'Bakkal Ahmet':[['Rafta yoğurt kalmadı.',{yogurt:4}],['Kış için reçel stoklamak istiyorum.',{recel:3}],['Bakkalın yanına küçük bir sabun köşesi açıyorum.',{sabun:4}]],
  'Konakçı Halit Bey':[['Konağın bahçesine lale diktirmek istiyorum.',{lale:9}],['Misafirlerime kek ikram edeceğim.',{kek:3}],['Konağın kilerine eski kaşar koymalıyım, şan olsun!',{kasar:2}]],
  'Pazarcı Zehra':[['Tezgâhıma patates lazım evladım.',{patates:12}],['Yünden çorap öreceğim, yün getir.',{yun:8}],['Pazarın en güzel ayçiçek yağı benim tezgâhımda olsun.',{yag:4}]],
};
function questOf(n){if(!S.quests||typeof S.quests!=='object')S.quests={};const i=S.quests[n]||0,Q=QUESTS[n];return Q&&i<Q.length?{i,txt:Q[i][0],need:Q[i][1],last:i===Q.length-1}:null}
const questReward=(q)=>({c:Math.round(Object.entries(q.need).reduce((a,[k,n])=>a+ITEMS[k].p*n,0)*2.5),g:q.last?5:2});
function questHTML(n){if(frLv(n)<1)return'';const q=questOf(n);if(!q)return `<div class="quest done">✓ ${n} ile bütün hikâye tamam</div>`;const r=questReward(q),ok=Object.entries(q.need).every(([k,v])=>has(k)>=v);
  return `<div class="quest"><p>“${q.txt}”</p><div class="needs">${Object.entries(q.need).map(([k,v])=>`<span class="need ${has(k)<v?'miss':''}" title="${ITEMS[k].n}"><em>${ITEMS[k].e}</em>${Math.min(has(k),v)}/${v}</span>`).join('')}</div>
    <div class="urow"><button class="pill-btn gold" data-act="quest" data-n="${n}" data-i="${q.i}" ${ok?'':'disabled'}>Teslim et · ₺${fmt(r.c)} +🍀${r.g}</button><span class="tm">${q.i+1}/3</span></div></div>`}
function doQuest(n,i){const q=questOf(n);if(!q||(i!=null&&q.i!==i))return;for(const k in q.need)if(has(k)<q.need[k])return toast('Eksik ürün var');for(const k in q.need)S.items[k]-=q.need[k];const r=questReward(q);
  gain(r.c,'Hikâye');S.gems+=r.g;S.quests[n]=q.i+1;befriend(n,2);addXP(Math.round(r.c/20));stat('quest');sfx('win');flyCoins(8);toast(q.last?`${face(n)} ${n}: "Sen olmasan ne yapardık!" Hikâye tamam · +₺${fmt(r.c)} +🍀${r.g}`:`${face(n)} ${n} çok sevindi · +₺${fmt(r.c)} +🍀${r.g}`);commit()}

// --- Başarımlar: koşulu sağlanınca ödülü Koleksiyon > Başarımlar'dan alınır ---
const achSt=k=>(S.stats&&S.stats[k])||0;
const ACH=[
  {id:'ilkhasat',e:'🌾',n:'İlk hasat',d:'Tarladan 1 kez hasat yap',ok:()=>achSt('harvest_field')>=1,g:1},
  {id:'hasat100',e:'🚜',n:'Toprak ana',d:'100 kez hasat yap',ok:()=>achSt('harvest_field')>=100,g:3},
  {id:'hasat1000',e:'🏆',n:'Bereket ustası',d:'1000 kez hasat yap',ok:()=>achSt('harvest_field')>=1000,g:10},
  {id:'satis100',e:'💰',n:'Pazarcı',d:'Pazarda 100 ürün sat',ok:()=>achSt('sold')>=100,g:2},
  {id:'satis2000',e:'🏪',n:'Tüccar ruhu',d:'2000 ürün sat',ok:()=>achSt('sold')>=2000,g:6},
  {id:'siparis10',e:'📜',n:'Güvenilir çiftçi',d:'10 sipariş teslim et',ok:()=>achSt('orders')>=10,g:3},
  {id:'siparis100',e:'🤝',n:'Kasabanın gözdesi',d:'100 sipariş teslim et',ok:()=>achSt('orders')>=100,g:10},
  {id:'sozlesme5',e:'✍️',n:'Sözünün eri',d:'5 sözleşme tamamla',ok:()=>achSt('contracts')>=5,g:4},
  {id:'bina5',e:'🔨',n:'Usta inşaatçı',d:'5 bina kur',ok:()=>Object.keys(S.units).length>=5,g:2},
  {id:'binahepsi',e:'🏗️',n:'Çiftlik kompleksi',d:'Bütün binaları kur',ok:()=>Object.keys(B).every(u=>S.units[u]),g:10},
  {id:'sv5',e:'⭐',n:'Yeni başlayan değil',d:'Bir binayı 5. seviyeye çıkar',ok:()=>Object.values(S.units).some(s=>s.l>=5),g:5},
  {id:'arazi',e:'🗺️',n:'Toprak ağası',d:'Bütün arazileri satın al',ok:()=>Object.keys(REG).every(r=>S.regions[r]),g:10},
  {id:'konak',e:'🏰',n:'Konak sahibi',d:'Evini Konağa büyüt',ok:()=>S.house>=4,g:8},
  {id:'sev50',e:'💗',n:'Hayvan dostu',d:'Hayvanları 50 kez sev',ok:()=>achSt('pet')>=50,g:3},
  {id:'panayir',e:'🎪',n:'Panayır birincisi',d:'Bir panayır yarışmasını kazan',ok:()=>achSt('contest_win')>=1,g:3},
  {id:'panayir10',e:'🥇',n:'Kupa avcısı',d:'10 panayır yarışması kazan',ok:()=>achSt('contest_win')>=10,g:8},
  {id:'koleksiyon5',e:'📖',n:'Meraklı',d:'Koleksiyonda 5 buluntu',ok:()=>COL.filter(c=>S.album[c.id]).length>=5,g:4},
  {id:'dost',e:'❤️',n:'Can dostu',d:'Bir kasabalıyla can dostu ol',ok:()=>NAMES.some(n=>frLv(n)>=3),g:5},
  {id:'hikaye',e:'📚',n:'Hikâye anlatıcısı',d:'Bir kasabalının hikâyesini bitir',ok:()=>Object.values(S.quests||{}).some(v=>v>=3),g:5},
  {id:'olay10',e:'🎲',n:'Maceracı',d:'10 rastgele olaya katıl',ok:()=>achSt('event')>=10,g:4},
  {id:'tilki',e:'🦊',n:'Tilki kovalayan',d:'Tilkiyi 3 kez kovala',ok:()=>achSt('fox')>=3,g:3},
  {id:'mevsim',e:'🍂',n:'Dört mevsim',d:'Dört mevsim ürününün hepsini hasat et',ok:()=>['lale','karpuz','patates','lahana'].every(k=>achSt('make_'+k)>0),g:6},
  {id:'restorasyon',e:'🏛️',n:'Kasabanın hayırseveri',d:'Bir kasaba projesini tamamla',ok:()=>Object.keys(S.proj||{}).length>=1,g:5},
  {id:'nesil',e:'🌳',n:'Yeni nesil',d:'Çiftliği yeni nesle devret',ok:()=>(S.gen||0)>=1,g:10},
];
function achReady(){if(!S.ach||typeof S.ach!=='object')S.ach={};return ACH.filter(a=>!S.ach[a.id]&&a.ok())}
let achSeen='';function achTick(){const r=achReady();const sig=r.map(a=>a.id).join();if(sig&&sig!==achSeen){const nw=r.filter(a=>!achSeen.split(',').includes(a.id));if(nw.length&&achSeen!=='')toast(`🏅 Başarım: ${nw[0].e} ${nw[0].n} · ödülünü Koleksiyon'dan al`);}achSeen=sig}
function claimAch(id){const a=ACH.find(x=>x.id===id);if(!a||S.ach[id]||!a.ok())return;S.ach[id]=1;S.gems+=a.g;sfx('win');toast(`🏅 ${a.n} · +🍀${a.g}`);commit()}
function achHTML(){achReady();const done=ACH.filter(a=>S.ach[a.id]).length;return `<p class="note">${done} / ${ACH.length} başarım. Koşulu sağladığın başarımın ödülünü buradan al.</p><div class="achs">${ACH.map(a=>{const got=S.ach[a.id],ok=!got&&a.ok();
  return `<div class="ach ${got?'got':ok?'ok':''}"><span class="ae">${a.e}</span><span class="at"><b>${a.n}</b><small>${a.d}</small></span>${got?'<span class="tm">✓</span>':`<button class="pill-btn ${ok?'gold':''}" data-act="ach" data-id="${a.id}" ${ok?'':'disabled'}>🍀${a.g}</button>`}</div>`}).join('')}</div>`}
function funTick(){evtTick();achTick()}
// Koleksiyon sayfasına "Başarımlar" sekmesi
const sheetAlbumCol=sheetAlbum;sheetAlbum=function(){const tb=view.tab||'c',n=achReady().length;const tabs=`<div class="tabs"><button aria-selected="${tb==='c'}" data-act="vtab" data-t="c">📖 Koleksiyon</button><button aria-selected="${tb==='ach'}" data-act="vtab" data-t="ach">🏅 Başarımlar${n?' ('+n+')':''}</button></div>`;
  if(tb==='ach')return head('🏅','Başarımlar',`${ACH.filter(a=>S.ach[a.id]).length} / ${ACH.length}`)+`<div class="sh-body">${tabs}${achHTML()}</div>`;
  return sheetAlbumCol().replace('<div class="sh-body">','<div class="sh-body">'+tabs)};
