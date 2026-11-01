// Simülasyon (fuzz) testi: oyunu çok sayıda rastgele senaryoyla oynatır ve her adımda hata ve tutarlılık denetler.
// Her koşu bir "tohum" (seed) ile başlar; aynı tohum aynı rastgele hamleleri üretir, bulunan hata tekrar oynatılabilir.
//
// Senaryolar: sıfırdan oyun, eski/bozuk/eksik kayıtlar, uç değerler, günler süren yokluk, saatin geri gitmesi,
// ekran boyutu değişimi, rastgele dokunma/sürükleme/kaydırma, rastgele düğmeler, oyun fonksiyonlarına geçersiz girdiler.
// Denetimler: yakalanmamış hata ve söz (promise) hatası, console.error, para/yonca/ürün sayılarının sonlu ve eksi olmaması,
// seviye/xp tutarlılığı, kaydın JSON'a dönüp geri yüklenebilmesi, kamera konumunun sayı olması, ekranda "NaN"/"undefined" yazmaması.
//
// Kullanım: node scripts/fuzz.mjs [koşu=24] [adım=250] [ilk-tohum=1] [paralel=4]
//           node scripts/fuzz.mjs 1 400 1337        → yalnızca 1337 numaralı tohumu tekrar oynatır
import {createRequire} from 'node:module';import path from 'node:path';
const require=createRequire(import.meta.url);const {chromium}=require('playwright');
const [RUNS=24,STEPS=250,SEED0=1,PAR=4]=process.argv.slice(2).map(Number);
const FILE='file://'+path.resolve('www/index.html');
const VPS=[[360,640],[375,667],[390,844],[412,915],[430,932],[768,1024],[844,390],[1280,800],[1920,1080]];
const mulberry=a=>()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};

// --- Başlangıç kayıtları: oyuncuların karşılaşabileceği her türlü kayıt durumu ---
function makeSave(r,kind){const base={coins:300,xp:0,lv:1,rep:50,items:{yem:6},house:1,regions:{baba:1,town:1},units:{kumes:{l:1}},fields:[{},{}],fieldLv:1,lastCrop:'bugday',
    orders:[],market:{at:0,m:{},h:{}},fin:{day:'',inc:{},exp:{},hist:[]},stats:{},goal:0,created:Date.now(),gems:5,album:{},workers:{},contracts:[],horses:[],league:{tier:0,pts:0},
    decor:{owned:{},house:{},farm:{}},ads:{day:'',n:0},sound:{music:false,sfx:true,notif:false},daily:null,contests:{day:'',list:[],done:{}},weather:{k:'sun',until:0},lastSeen:Date.now(),consent:{a:1},tut:{done:1}};
  const D=JSON.parse(JSON.stringify(base));
  switch(kind){
    case'yok':return null;                                        // ilk kez açılış
    case'bozukjson':return '{"coins":12,"items":{';               // yarıda kesilmiş kayıt
    case'bos':return '{}';                                        // boş nesne
    case'eski':return JSON.stringify({coins:900,xp:40,lv:3,items:{bugday:5,yem:2},house:1,units:{kumes:{l:2}},fields:[{},{},{}],fieldLv:1}); // çok eski sürüm: birçok alan yok
    case'uzun-yokluk':{D.lastSeen=Date.now()-1000*3600*24*(3+Math.floor(r()*60));D.fields=[{job:{r:'bugday',s:0,e:1}},{job:{r:'misir',s:0,e:2}},{}];D.units.kumes.job={r:'besle',s:0,e:5};D.workers={fields:1,kumes:1};D.lv=6;return JSON.stringify(D)}
    case'gelecek':{D.lastSeen=Date.now()+1000*3600*24*30;D.fields=[{job:{r:'bugday',s:Date.now()+9e8,e:Date.now()+1e9}},{}];D.daily={day:'2099-1-1',streak:9,login:true,bonus:false,tasks:[]};return JSON.stringify(D)} // saat geri alınmış
    case'zengin':{D.lv=40;D.xp=10;D.coins=9e8;D.gems=999;D.house=4;D.fieldLv=5;for(const k of['dere','kavak','yamac','ova'])D.regions[k]=1;
      for(const u of['kumes','silo','yemhane','degirmen','ahir','firin','agil','mandira','kovan','bahce','konserve','besi','yaghane','dokuma','sera','hara'])D.units[u]={l:1+Math.floor(r()*5)};
      D.fields=Array.from({length:9},()=>({}));D.items={bugday:400,misir:200,un:50,sut:80,yem:300,at:3,yumurta:40,bal:20,tereyag:5,kumas:9,yun:20,elma:30,domates:30,aycicegi:20,pamuk:10,kabak:3};
      D.horses=[{n:'Rüzgar',spd:20,sta:20,w:3,rest:0,train:0},{n:'Bozok',spd:5,sta:5,w:0,rest:0,train:0}];D.league={tier:3,pts:8};return JSON.stringify(D)}
    case'garip':{D.coins=-50;D.gems=null;D.items={bugday:-3,yok_urun:5,misir:'7',un:NaN};D.fields=[{job:{r:'olmayan',s:0,e:0}},null,{}];D.units={kumes:{l:9},olmayan_bina:{l:1}};D.house=7;D.lastCrop='silinmis';D.weather={k:'kasirga',until:0};D.regions={baba:1};D.horses=[{n:'X'}];D.league={tier:9,pts:-1};D.contracts=[{who:'Kimse',k:'yok',total:5,got:0,until:0}];D.orders=[{who:'Biri',items:{yok:2},r:10}];return JSON.stringify(D)}
    case'tipler':{D.coins='500';D.lv='4';D.fields='bozuk';D.units=[];D.items=[];D.stats=null;D.album=null;D.decor=null;D.sound=null;D.market=null;D.fin=null;return JSON.stringify(D)}
    case'ambar-dolu':{D.house=1;D.items={bugday:79,yem:1};D.fields=[{job:{r:'bugday',s:0,e:1}},{job:{r:'bugday',s:0,e:1}}];return JSON.stringify(D)}
    default:return JSON.stringify(D)}}
// Ortam koşulları: her koşu bunlardan birinde çalışır
const ENVS=['normal','normal','depolama-yok','depolama-dolu','gfx-dusuk','gfx-yuksek','webgl-kayip','hizli','hareket-azalt','dpr2'];
const KINDS=['yok','normal','normal','eski','uzun-yokluk','gelecek','zengin','zengin','garip','tipler','bozukjson','bos','ambar-dolu'];

// --- Sayfa içinde çalışan denetim: tutarlılık kuralları ---
const INVARIANTS=()=>{const bad=[];const fin=v=>typeof v==='number'&&isFinite(v);
  if(typeof S!=='object'||!S)return['S yok'];
  if(!fin(S.coins)||S.coins<0)bad.push('para='+S.coins);if(!fin(S.gems)||S.gems<0)bad.push('yonca='+S.gems);
  if(!fin(S.lv)||S.lv<1)bad.push('seviye='+S.lv);if(!fin(S.xp)||S.xp<0)bad.push('xp='+S.xp);if(!fin(S.rep))bad.push('itibar='+S.rep);
  for(const k in S.items){const v=S.items[k];if(!fin(v)||v<0)bad.push(`ürün ${k}=${v}`)}
  if(!Array.isArray(S.fields))bad.push('fields dizi değil');else S.fields.forEach((f,i)=>{if(!f||typeof f!=='object')bad.push('parsel '+i+' bozuk');else if(f.job&&!cropOf(f.job.r))bad.push('parsel '+i+' bilinmeyen ürün '+f.job.r)});
  for(const u in S.units)if(!B[u])bad.push('bilinmeyen bina '+u);else if(S.units[u].job&&!B[u].recipes.find(r=>r.id===S.units[u].job.r))bad.push(u+' bilinmeyen tarif');
  if(!(S.house>=1&&S.house<=HOUSE.length))bad.push('ev='+S.house);
  try{const j=JSON.stringify(S);const back=migrate(JSON.parse(j));if(back.coins!==S.coins)bad.push('kayıt geri yüklemesi farklı')}catch(e){bad.push('kayıt JSON hatası '+e.message)}
  for(const c of[cam.position,ctl.target,icam.position])if(![c.x,c.y,c.z].every(fin))bad.push('kamera NaN');
  const txt=[...document.querySelectorAll('.hud,.sheet:not([hidden]),.toast,.modal,.strip:not([hidden]),.farmer-say:not([hidden]),#marks')].map(e=>e.innerText).join(' ');
  const m=txt.match(/.{0,25}\b(NaN|undefined|null|\[object Object\]|Infinity)\b.{0,25}/);if(m)bad.push('ekranda: '+m[0].replace(/\s+/g,' '));
  if(!['desk','hub','focus','interior'].includes(mode))bad.push('mod='+mode);
  return bad};

// --- Rastgele hamle: sayfa içinde seçilir, Playwright ile gerçek dokunuşa çevrilir ---
const PICK=(r)=>{const vis=e=>{if(e.closest('[hidden]'))return false;const b=e.getBoundingClientRect();if(!b.width||!b.height||b.bottom<0||b.top>innerHeight||b.right<0||b.left>innerWidth)return false;const s=getComputedStyle(e);return s.visibility!=='hidden'&&s.display!=='none'&&s.pointerEvents!=='none'};
  const all=[...document.querySelectorAll('button,[data-act],[data-go],[data-quick],[data-quickall],[data-region],[data-desk],[data-locstep],.plot,summary,input[type=checkbox],.mark,.tile,.seed,.scard')].filter(e=>vis(e)&&!e.disabled);
  // tehlikeli/uzun süren: oyunu sıfırlama ve sayfayı yeniden yükleyen grafik ayarı yalnızca nadiren
  const pool=all.filter(e=>!/reset|gfx|restore|iap|delAcc/.test(e.dataset.act||'')||r<.02);
  if(!pool.length)return null;const e=pool[Math.floor(r*pool.length*0.9999)];const b=e.getBoundingClientRect();
  return{x:b.left+b.width/2,y:b.top+b.height/2,label:(e.dataset.act||e.dataset.go||e.dataset.desk||e.className||e.tagName).toString().slice(0,40)}};

const API_CALLS=[ // oyun fonksiyonlarına doğrudan (bazen geçersiz) çağrılar
  'plantPlot(__R(12)-1,__P(CROPS).id)','harvestPlot(__R(10))','plantAll()','harvestAll()','buyPlot()','upgradeFields()','upgradeHouse()',
  'buildUnit(__P(Object.keys(B)))','upgradeUnit(__P(Object.keys(B)))','startUnit(__P(Object.keys(B)),__P(["besle","un","ekmek","yok","yem","tay","kasar"]))','collectUnit(__P(Object.keys(B)))',
  'sell(__P(Object.keys(ITEMS)),__R(30)-3)','buyFeed(__R(40))','buyRegion(__P(Object.keys(REG)))','hire(__P(["fields","kumes","ahir","firin","yok"]))',
  'quickAll()','quickFeedback(quickLoc(__P(Object.keys(LOC))))','stepLoc(__R(3)-1)','goLocation(__P(Object.keys(LOC)))','toHub()','toDesk()','enterWorld()',
  'enterInterior(__P(["kumes","ahir","agil","besi","hara","kulube","silo","yok"]))','leaveInterior()','openRegion(__P(Object.keys(REG)))',
  'openView(__P(["guide","barn","goals","settings","shop","album","ledger","mail","borsa","budget","stats","places"]))','closeSheet()',
  'deliverContract(__R(3))','enterContest(__P(CONTESTS).id)','stableHorse()','trainHorse(__R(3))','leagueRace(__R(3))','petAnimal(__P(LOVE_U),__R(5),100,100)',
  'TIME_OFF+=__R(4)*60000','TIME_OFF+=__R(3)*3600000','TIME_OFF+=86400000*__R(3)','updateWeather()','S.weather.until=0;updateWeather()','refreshMarket(true)','tick()','save()',
  'farmerSay(true)','renderStrip(true)','syncWorld(true)','checkDaily()&&showLogin()','friendGifts()','automate()','rescue()',
  // geçiş animasyonunun ortasında başka yere atlama
  'enterInterior("kumes");toDesk()','toDesk();enterWorld()','goLocation("tarla");enterInterior("kumes");leaveInterior()','enterWorld();goLocation(__P(Object.keys(LOC)));toHub()','leaveInterior();enterInterior("ahir")',
  // saat geri gidiyor (telefon saati elle değiştirildi)
  'TIME_OFF-=__R(5)*3600000','TIME_OFF-=86400000*__R(3)',
  // oyun sürerken kayıt bozuluyor, sonra yeniden yükleniyor gibi
  'try{localStorage.setItem(SAVE,"{bozuk")}catch(e){};S=migrate(load()||JSON.parse(JSON.stringify(S)))',
  'S=migrate(JSON.parse(JSON.stringify(S)))','photoMode&&photoMode(true)','photoMode&&photoMode(false)',
  'view={k:"loc",loc:__P(Object.keys(LOC))};renderSheet()','view={k:"region",r:__P(Object.keys(REG))};renderSheet()',
  'setModeUI()','resize()','PLATFORM.hap("heavy")','celebrate("Test")','flyCoins(8)',
];

async function run(b,seed){const r=mulberry(seed),R=n=>Math.floor(r()*n);const [w,h]=VPS[R(VPS.length)];const kind=KINDS[R(KINDS.length)];const env=ENVS[R(ENVS.length)];
  const p=await b.newPage({viewport:{width:w,height:h},deviceScaleFactor:env==='dpr2'?2:1,isMobile:w<700,hasTouch:w<700,reducedMotion:env==='hareket-azalt'?'reduce':'no-preference'});
  const errs=[];const log=[];p.on('pageerror',e=>errs.push('hata: '+e.message+' @ '+((e.stack||'').split('\n').slice(1,3).map(l=>l.trim().replace(/file:.*index.html:/,'')).join(' < '))));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|net::ERR|favicon/.test(m.text()))errs.push('console.error: '+m.text().slice(0,200))});
  await p.route(/^https?:/,rt=>rt.abort());
  const save=makeSave(r,kind);
  await p.addInitScript(([seed,save,env])=>{let a=seed*7919;Math.random=()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
    if(window.name!=='fz'){window.name='fz';localStorage.clear();if(save!=null)localStorage.setItem('ciftlik-imparatorlugu-v3',save);
      if(env==='gfx-dusuk')localStorage.setItem('ci-gfx','low');if(env==='gfx-yuksek')localStorage.setItem('ci-gfx','high')}
    // gizli sekme / engellenmiş depolama: her erişim hata fırlatır; dolu depolama: yazma hata fırlatır
    if(env==='depolama-yok'){const th=()=>{throw new DOMException('SecurityError','SecurityError')};Storage.prototype.getItem=th;Storage.prototype.setItem=th;Storage.prototype.removeItem=th}
    if(env==='depolama-dolu'){Storage.prototype.setItem=function(){throw new DOMException('QuotaExceededError','QuotaExceededError')}}
    addEventListener('unhandledrejection',e=>console.error('unhandledrejection: '+(e.reason&&e.reason.message||e.reason)))},[seed,save,env]);
  const res={seed,vp:`${w}x${h}`,kind:kind+'/'+env,steps:0,errs,bad:[],log};
  try{await p.goto(FILE,{timeout:240000});await p.waitForFunction(()=>typeof S==='object'&&S&&!document.getElementById('boot'),null,{timeout:240000})}
  catch(e){errs.push('açılmadı: '+e.message.split('\n')[0]);await p.close();return res}
  await p.evaluate(()=>{window.__R=n=>Math.floor(Math.random()*n);window.__P=a=>a[Math.floor(Math.random()*a.length)]});
  for(let i=0;i<STEPS;i++){res.steps=i+1;const t=r();let act;
    try{
      if(t<.45){const m=await p.evaluate(PICK,r());if(m){act='dokun '+m.label;await p.mouse.click(m.x,m.y)}}
      else if(t<.60){const x=R(w),y=R(h);act=`tuval ${x},${y}`;await p.mouse.click(x,y)}
      else if(t<.68){const x=R(w),y=R(h),x2=R(w),y2=R(h);act=`sürükle ${x},${y}→${x2},${y2}`;await p.mouse.move(x,y);await p.mouse.down();for(let k=1;k<=5;k++)await p.mouse.move(x+(x2-x)*k/5,y+(y2-y)*k/5);await p.mouse.up()}
      else if(t<.70){act='kaydır';await p.mouse.wheel(0,R(800)-400)}
      else if(t<.72){const [w2,h2]=VPS[R(VPS.length)];act=`ekran ${w2}x${h2}`;await p.setViewportSize({width:w2,height:h2})}
      else if(t<.73){act='Escape';await p.keyboard.press('Escape')}
      else if(t<.735&&env!=='depolama-yok'&&env!=='depolama-dolu'){act='yeniden başlat';const SIG=()=>{const v=[S.lv,S.lv*1e6+S.xp,Object.keys(S.units).length,Object.keys(S.regions).length,S.house,S.goal,S.fields.length];return v};const before=await p.evaluate(`(${SIG})()`).then(async v=>{await p.evaluate(()=>save());return v});const raw0=await p.evaluate(()=>{try{return (localStorage.getItem(SAVE)||'YOK').slice(0,160)}catch(e){return 'ERR '+e.message}});await p.reload({timeout:240000});
        await p.waitForFunction(()=>typeof S==='object'&&S&&!document.getElementById('boot'),null,{timeout:240000});await p.evaluate(()=>{window.__R=n=>Math.floor(Math.random()*n);window.__P=a=>a[Math.floor(Math.random()*a.length)]});
        const after=await p.evaluate(`(${SIG})()`);if(after.some((x,k)=>x<before[k])){const raw1=await p.evaluate(()=>{try{return (localStorage.getItem(SAVE)||'YOK').slice(0,160)}catch(e){return 'ERR '+e.message}});errs.push(`kayıt kaybı: yeniden açınca [sv,xp,bina,arazi,ev,hedef,parsel] ${before} → ${after} · önce: ${raw0} · sonra: ${raw1} · son: ${log.slice(-5).join(' › ')}`)}}
      else if(t<.745&&env==='webgl-kayip'){act='webgl kayıp';await p.evaluate(()=>{const x=R.getContext().getExtension('WEBGL_lose_context');if(x){x.loseContext();setTimeout(()=>x.restoreContext(),400)}})}
      else if(t<.76){const n=3+R(6);act=`hızlı ${n} dokunuş`;const ms=[];for(let k=0;k<n;k++){const m=await p.evaluate(PICK,r());if(m)ms.push(m)}for(const m of ms)p.mouse.click(m.x,m.y).catch(()=>{});await p.waitForTimeout(30)}
      else if(t<.77){act='çift dokunuş';const m=await p.evaluate(PICK,r());if(m){await p.mouse.click(m.x,m.y,{clickCount:2})}}
      else if(t<.74){act='arka plan';await p.evaluate(()=>{document.dispatchEvent(new Event('visibilitychange'));dispatchEvent(new Event('blur'));dispatchEvent(new Event('focus'))})}
      else{const c=API_CALLS[R(API_CALLS.length)];act='api '+c;await p.evaluate(c=>{try{eval(c)}catch(e){console.error('api hatası ['+c+']: '+e.message)}},c)}
    }catch(e){if(!/Target closed|navigation|Execution context/.test(e.message))errs.push(`adım ${i} (${act}): `+e.message.split('\n')[0])}
    log.push(act);if(log.length>12)log.shift();
    if(i%3===2){if(env!=='hizli')await p.waitForTimeout(40);try{const bad=await p.evaluate(INVARIANTS);if(bad.length){res.bad.push({step:i,act,bad});if(res.bad.length>=3)break}}catch(e){}}
    if(errs.length>=3)break}
  await p.waitForTimeout(300);try{const bad=await p.evaluate(INVARIANTS);if(bad.length)res.bad.push({step:'son',bad})}catch(e){}
  await p.close();return res}

const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const seeds=Array.from({length:RUNS},(_,i)=>SEED0+i);let fails=0;const t0=Date.now();const sig=new Map();
const queue=[...seeds];await Promise.all(Array.from({length:PAR},async()=>{while(queue.length){const s=queue.shift();const r=await run(b,s);
  const ok=!r.errs.length&&!r.bad.length;if(!ok){fails++;for(const e of[...r.errs,...r.bad.flatMap(x=>x.bad)]){const k=e.replace(/\d+/g,'#').slice(0,120);if(!sig.has(k))sig.set(k,{e,seed:r.seed,kind:r.kind,vp:r.vp,log:r.log.slice(-6)})}}
  console.log(`${ok?'✓':'✗'} tohum ${r.seed} · ${r.kind} · ${r.vp} · ${r.steps} adım${ok?'':' → '+[...r.errs,...r.bad.map(x=>'['+x.step+'] '+x.bad.join(', '))].slice(0,3).join(' | ')}`)}}));
await b.close();
console.log(`\n${RUNS} koşu, ${fails} sorunlu · ${Math.round((Date.now()-t0)/1000)} sn`);
if(sig.size){console.log('\nFarklı sorunlar:');for(const [,v] of sig)console.log(`- ${v.e}\n    tohum ${v.seed} (${v.kind}, ${v.vp}) · son hamleler: ${v.log.join(' › ')}`)}
process.exit(fails?1:0);
