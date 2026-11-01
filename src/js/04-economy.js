// ================= PAZAR / SİPARİŞ / HEDEF =================
function refreshMarket(force){if(!force&&now()-S.market.at<180000)return;S.market.at=now();if(!S.market.h)S.market.h={};for(const k in ITEMS){S.market.m[k]=+(0.8+Math.random()*0.45).toFixed(2);const h=S.market.h[k]||(S.market.h[k]=[]);h.push(S.market.m[k]);if(h.length>8)h.shift()}}
const sellPrice=k=>Math.max(1,Math.round(ITEMS[k].p*(S.market.m[k]||1)));
function sell(k,n){n=Math.min(n,has(k));if(n<=0)return;S.items[k]-=n;gain(sellPrice(k)*n,'Pazar');stat('sold',n);sfx('coin');flyCoins(Math.min(6,2+n));toast(`${n} ${ITEMS[k].n} satıldı · +₺${fmt(sellPrice(k)*n)}`);commit()}
function buyFeed(n){const c=ITEMS.yem.buy*n;if(S.coins<c)return toast('Yeterli paran yok');if(stored()+n>cap())return toast('Ambar dolu');pay(c,'Yem');S.items.yem=has('yem')+n;toast(`${n} yem alındı`);commit()}
function producible(){const set=new Set(CROPS.filter(c=>c.lvl<=S.lv).map(c=>c.id));for(const u in S.units){const d=B[u];if(d.recipes)d.recipes.filter(r=>r.lvl<=S.lv).forEach(r=>Object.keys(r.out).forEach(k=>{if(k!=='at')set.add(k)}))}return [...set]}
const NAMES=['Kasap Rıza','Fırıncı Nuri','Lokantacı Sevim','Manav Hilmi','Otelci Gülten','Kooperatif','Bakkal Ahmet','Konakçı Halit Bey','Pazarcı Zehra'];
function genOrder(){const pool=producible();
  const n=Math.min(pool.length,1+Math.floor(Math.random()*Math.min(3,1+S.lv/3)));const items={};let val=0;
  pool.sort(()=>Math.random()-.5).slice(0,n).forEach(k=>{const q=Math.max(1,Math.round((3+Math.random()*6)*(20/Math.max(ITEMS[k].p,6))**0.5));items[k]=q;val+=ITEMS[k].p*q});
  return {who:NAMES[Math.floor(Math.random()*NAMES.length)],items,base:Math.round(val*1.5),xp:Math.round(5+val/12)}}
const repMult=()=>(0.7+0.6*S.rep/100)*(has1('kangal')?1.05:1);
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
];
const goalReady=()=>{const g=GOALS[S.goal];return g&&g.ok()};
function claimGoal(){const g=GOALS[S.goal];if(!g||!g.ok())return;gain(g.r,'Ödül');addXP(Math.round(g.r/5));S.goal++;if(typeof track==='function')track('goal',{i:S.goal});toast(`Hedef tamam · +₺${fmt(g.r)}`);commit()}
