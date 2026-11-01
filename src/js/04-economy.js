// ================= PAZAR / SİPARİŞ / HEDEF =================
function refreshMarket(force){if(!force&&now()-S.market.at<180000)return;S.market.at=now();if(!S.market.h)S.market.h={};for(const k in ITEMS){S.market.m[k]=+(0.8+Math.random()*0.45).toFixed(2);const h=S.market.h[k]||(S.market.h[k]=[]);h.push(S.market.m[k]);if(h.length>8)h.shift()}}
// Pazar doygunluğu: aynı üründen çok satınca fiyat düşer (en fazla %60), 15 dakikada yarıya iner.
// Satılan değer (₺) üzerinden ölçülür; oyuncu büyüdükçe pazar da büyür.
const satNow=k=>{const s=S.market.sat&&S.market.sat[k];return s?s.v*Math.pow(.5,(now()-s.t)/900000):0};
const satCap=()=>(1500+400*S.lv)*(typeof projOn==='function'&&projOn('pazaryeri')?2:1);
const satF=(k,add=0)=>Math.max(.4,1/(1+(satNow(k)+add)/satCap()));
const basePrice=k=>ITEMS[k].p*(S.market.m[k]||1);
const sellPrice=(k,n=1)=>Math.max(1,Math.round(basePrice(k)*satF(k,ITEMS[k].p*n/2)));
function addSat(k,n){if(!S.market.sat)S.market.sat={};S.market.sat[k]={v:satNow(k)+ITEMS[k].p*n,t:now()}}
function sell(k,n){n=Math.min(n,has(k));if(n<=0)return;const pr=sellPrice(k,n);S.items[k]-=n;addSat(k,n);gain(pr*n,'Pazar');stat('sold',n);sfx('coin');flyCoins(Math.min(6,2+n));toast(`${n} ${ITEMS[k].n} satıldı · +₺${fmt(pr*n)}${satF(k)<.8?' · pazar bu üründen doydu, fiyat düşük':''}`);commit()}
// Fazlayı sat: her üründen "keep" kadar bırakıp gerisini satar (yem ve taylar hariç). Tek bir özet bildirim gösterir.
function sellExcess(keep,quiet){let tot=0,n=0;for(const k in S.items){if(k==='yem'||k==='at')continue;const x=has(k)-keep;if(x<=0)continue;const pr=sellPrice(k,x);S.items[k]-=x;addSat(k,x);tot+=pr*x;n+=x}
  if(!n){if(!quiet)toast('Satılacak fazla ürün yok');return 0}gain(tot,'Pazar');stat('sold',n);sfx('coin');flyCoins(6);toast(`${quiet?'📦 Ambar dolmak üzereydi: ':''}${n} ürün satıldı · +₺${fmt(tot)}`);commit();return tot}
// Ambar %95 dolunca (ayar açıksa) fazlası kendiliğinden satılır
function autoSellTick(){if(!S.autoSell||stored()<cap()*.95)return;sellExcess(S.keepN??10,true)}
function buyFeed(n){const c=ITEMS.yem.buy*n;if(S.coins<c)return toast('Yeterli paran yok');if(stored()+n>cap())return toast('Ambar dolu');pay(c,'Yem');S.items.yem=has('yem')+n;toast(`${n} yem alındı`);commit()}
// Oyuncunun şu an üretebileceği ürünler (sipariş/sözleşme/yarışma bunlardan seçilir): koleksiyon tohumu bulunmamış ve mevsimi olmayan ürünler hariç
function producible(){const set=new Set(CROPS.filter(c=>!cropLocked(c)).map(c=>c.id));for(const u in S.units){const d=B[u];if(d.recipes)d.recipes.filter(r=>r.lvl<=S.lv&&(!r.col||has1(r.col))).forEach(r=>Object.keys(r.out).forEach(k=>{if(k!=='at')set.add(k)}))}return [...set]}
const NAMES=['Kasap Rıza','Fırıncı Nuri','Lokantacı Sevim','Manav Hilmi','Otelci Gülten','Kooperatif','Bakkal Ahmet','Konakçı Halit Bey','Pazarcı Zehra'];
function genOrder(){const pool=producible();
  const n=Math.min(pool.length,1+Math.floor(Math.random()*Math.min(3,1+S.lv/3)));const items={};let val=0;
  pool.sort(()=>Math.random()-.5).slice(0,n).forEach(k=>{const q=Math.max(1,Math.round((3+Math.random()*6)*(20/Math.max(ITEMS[k].p,6))**0.5));items[k]=q;val+=ITEMS[k].p*q});
  return {who:NAMES[Math.floor(Math.random()*NAMES.length)],items,base:Math.round(val*1.5),xp:Math.round(5+val/12)}}
const repMult=()=>(0.7+0.6*S.rep/100)*(has1('kangal')?1.05:1)*(typeof projOn==='function'&&projOn('okul')?1.1:1);
function ensureOrders(){while(S.orders.length<3)S.orders.push(genOrder())}
function fillOrder(i){const o=S.orders[i];for(const k in o.items)if(has(k)<o.items[k])return toast('Eksik ürün var');
  for(const k in o.items)S.items[k]-=o.items[k];const r=Math.round(o.base*repMult()*frMult(o.who));gain(r,'Sipariş');addXP(o.xp);befriend(o.who,1);S.rep=Math.min(100,S.rep+1);stat('orders');
  S.orders.splice(i,1,genOrder());sfx('coin');flyCoins(7);toast(`${o.who} memnun kaldı · +₺${fmt(r)}`);commit()}
const readyOrders=()=>S.orders.filter(o=>Object.entries(o.items).every(([k,n])=>has(k)>=n)).length;
const GOALS=[
  {d:'Tarlalar\'a git, buğday ek',ok:()=>S.stats.plant_bugday>=1,r:40},
  {d:'Buğdayı hasat et',ok:()=>S.stats.harvest_field>=1,r:40},
  {d:'Kümese gir, tavukları besle ve yumurtaları topla',ok:()=>S.stats.harvest_kumes>=1,r:50},
  {d:'Köy Pazarı\'nda ürün sat',ok:()=>S.stats.sold>=1,r:60},
  {d:'Tarlalar\'da üçüncü parseli satın al',ok:()=>S.fields.length>=3,r:80},
  {d:'Tüccar Hanı\'nda bir sipariş teslim et',ok:()=>S.stats.orders>=1,r:120},
  {d:'Silo kur',ok:()=>!!S.units.silo,r:150},
  {d:'Dere Kenarı arazisini satın al',ok:()=>owned('dere'),r:200},
  {d:'Değirmen Sokağı\'nda yem değirmeni kur',ok:()=>!!S.units.yemhane,r:150},
  {d:'Kulübeyi Taş Ev\'e büyüt',ok:()=>S.house>=2,r:300},
  {d:'Ahır kur ve süt sağ',ok:()=>S.stats.harvest_ahir>=1,r:300},
  {d:'Bir binayı 2. seviyeye çıkar',ok:()=>Object.values(S.units).some(u=>u.l>=2),r:400},
  {d:'5 sipariş teslim et',ok:()=>S.stats.orders>=5,r:600},
  {d:'Kavaklık arazisini satın al',ok:()=>owned('kavak'),r:800},
  {d:'Mandıradan peynir çıkar',ok:()=>S.stats.make_peynir>=1,r:800},
  {d:'Çiftlik Evi\'ne geç',ok:()=>S.house>=3,r:1500},
  {d:'Besi ahırından et al',ok:()=>S.stats.harvest_besi>=1,r:2000},
  {d:'Yarış Alanı\'nda tayınla bir yarışa gir',ok:()=>S.stats.race>=1,r:3000},
  {d:'Konak inşa et',ok:()=>S.house>=4,r:10000},
  {d:'Tüm arazileri satın al',ok:()=>Object.keys(REG).every(owned),r:25000},
  {d:'Tarlaları 3. seviyeye çıkar',ok:()=>S.fieldLv>=3,r:3000},
  {d:'3 tedarik sözleşmesi tamamla',ok:()=>S.stats.contracts>=3,r:3500},
  {d:'Panayırda birinci ol',ok:()=>S.stats.contest_win>=1,r:3500},
  {d:'Koleksiyondan 6 parça bul',ok:()=>COL.filter(c=>S.album[c.id]).length>=6,r:4000},
  {d:'Mandırada tereyağı üret',ok:()=>S.stats.make_tereyag>=1,r:4500},
  {d:'25 sipariş teslim et',ok:()=>S.stats.orders>=25,r:5000},
  {d:'Reçel kaynat',ok:()=>(S.stats.make_recel||0)+(S.stats.make_recel2||0)>=1,r:5000},
  {d:'Bir binayı 4. seviyeye çıkar',ok:()=>Object.values(S.units).some(u=>u.l>=4),r:6000},
  {d:'Bal sabunu yap',ok:()=>S.stats.make_sabun>=1,r:6000},
  {d:'Bir kasabalıyla can dostu ol',ok:()=>NAMES.some(n=>frLv(n)>=3),r:7000},
  {d:'Baklava pişir',ok:()=>S.stats.make_baklava>=1,r:8000},
  {d:'5 işçi çalıştır',ok:()=>Object.keys(S.workers).length>=5,r:8000},
  {d:'El dokuma halı dokut',ok:()=>S.stats.make_hali>=1,r:10000},
  {d:'Bölge Ligi\'ne yüksel',ok:()=>S.league.tier>=2,r:10000},
  {d:'Pastırma yap',ok:()=>S.stats.make_pastirma>=1,r:12000},
  {d:'Seviye 16\'ya ulaş',ok:()=>S.lv>=16,r:15000},
  {d:'Tarlaları 5. seviyeye çıkar',ok:()=>S.fieldLv>=5,r:18000},
  {d:'Bir binayı 5. seviyeye çıkar',ok:()=>Object.values(S.units).some(u=>u.l>=5),r:20000},
  {d:'Ulusal Lig\'e yüksel',ok:()=>S.league.tier>=3,r:25000},
  {d:'Bütün binaları kur',ok:()=>Object.keys(B).every(u=>S.units[u]),r:30000},
  {d:'Kasada 250.000 ₺ biriktir',ok:()=>S.coins>=250000,r:40000},
  {d:'Seviye 20\'ye ulaş',ok:()=>S.lv>=20,r:50000},
  {d:'Koleksiyonu tamamla',ok:()=>COL.every(c=>S.album[c.id]),r:60000},
  {d:'Bütün binaları 5. seviyeye çıkar',ok:()=>Object.keys(B).every(u=>S.units[u]&&S.units[u].l>=5),r:100000},
];
const goalReady=()=>{const g=GOALS[S.goal];return g&&g.ok()};
function claimGoal(){const g=GOALS[S.goal];if(!g||!g.ok())return;gain(g.r,'Ödül');addXP(Math.round(g.r/5));S.goal++;if(typeof track==='function')track('goal',{i:S.goal});toast(`Hedef tamam · +₺${fmt(g.r)}`);commit()}
