// Birim testleri: derlenmiş oyunu (www/index.html) çevrimdışı açar, saf fonksiyonları sayfa içinde çağırıp sonuçları denetler.
// Klasik betikler tek global kapsamda olduğundan fonksiyonlar gerçek derlemeden, gerçek veri tablolarıyla (ITEMS, B, HOUSE...) sınanır.
// Her test kendi durumunu kurar; S ve TIME_OFF test sonunda eski haline döner (oyunun tick'i araya giremez: her test tek eşzamanlı çağrı).
// Kullanım: npm run build && npm run test:unit
import {createRequire} from 'node:module';import path from 'node:path';import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);const {chromium}=require('playwright');
const FILE='file://'+path.resolve(process.argv[2]||'www/index.html');
let pass=0,fail=0;
const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.route(/^https?:/,r=>r.abort());await p.goto(FILE);
await p.waitForFunction(()=>typeof S==='object'&&S&&!document.getElementById('boot'),null,{timeout:120000});
// Sayfa içi düzenek: durumu kaydedip geri yükler; base() küçük, geçerli bir kayıt üretir
await p.evaluate(()=>{window.__run=src=>{const s0=S,t0=TIME_OFF;try{return (0,eval)('('+src+')')()}finally{S=s0;TIME_OFF=t0}};
  window.__base=(o={})=>migrate({...fresh(),consent:{analytics:false},tut:{done:1},tut2:{done:1},...o})});
const run=fn=>p.evaluate(src=>window.__run(src),fn.toString());
// eq: sayfada fn() sonucunu beklenenle derin karşılaştırır
async function eq(name,fn,expected){let got;try{got=await run(fn);assert.deepStrictEqual(got,expected);pass++;console.log('✓ '+name)}
  catch(e){fail++;console.log('✗ '+name+' → '+(e.code==='ERR_ASSERTION'?`beklenen ${JSON.stringify(expected)}, gelen ${JSON.stringify(got)}`:e.message.split('\n')[0]))}}
const ok=(name,fn)=>eq(name,fn,true);

console.log('— migrate (kayıt onarımı)');
await ok('boş/geçersiz kayıt → yeni oyun',()=>[null,undefined,[],5,'x'].every(v=>{const s=migrate(v);return s.coins===300&&s.lv===1&&s.house===1&&s.fields.length===2}));
await eq('bozuk sayı tipleri varsayılana döner',()=>{const s=migrate({coins:'abc',lv:'x',gems:null,xp:NaN,rep:{}});return [s.coins,s.lv,s.gems,s.xp,s.rep]},[300,1,5,0,50]);
await eq('sayı sınırları (alt/üst, tam sayı)',()=>{const s=migrate({coins:-50,gems:1e12,lv:5000,rep:150,house:99,fieldLv:0,goal:-3});return [s.coins,s.gems,s.lv,s.rep,s.house===HOUSE.length,s.fieldLv,s.goal]},[0,1e9,999,100,true,1,0]);
await eq('kesirli yonca aşağı yuvarlanır',()=>migrate({gems:3.7}).gems,3);
await eq('ürünler: bilinmeyen atılır, metin sayıya, negatif/sıfır atılır',()=>migrate({items:{bugday:'5',zzz:3,yem:-2,misir:0}}).items,{bugday:5});
await eq('araziler: bilinmeyen atılır, başlangıç arazileri her zaman var',()=>Object.keys(migrate({regions:{foo:1,dere:1}}).regions).sort(),['baba','dere','town']);
await eq('binalar: bilinmeyen atılır, seviye MAXL ile sınırlı',()=>{const s=migrate({units:{zzz:{l:1},kumes:{l:99},ahir:'x'}});return [Object.keys(s.units),s.units.kumes.l===MAXL]},[['kumes'],true]);
await eq('üretim sırası: geçersiz tarifler atılır, en fazla 3',()=>migrate({units:{kumes:{l:1,q:['besle','yok','besle','besle','besle']}}}).units.kumes.q,['besle','besle','besle']);
await eq('tarlalar: en fazla 9, en az 2, bozuk parsel boş olur',()=>{const a=migrate({fields:Array(12).fill({})}).fields.length,b=migrate({fields:[]}).fields.length,c=migrate({fields:[5,{job:{r:'yok'}}]}).fields;return [a,b,c]},[9,2,[{},{}]]);
await ok('ileri tarihli iş makul süreye indirilir',()=>{const T=now(),s=migrate({fields:[{job:{r:'bugday',s:T,e:T+864e5*30}},{}]});const j=s.fields[0].job;return j.e<=now()+20*1000+50&&j.e>=T});
await ok('HTML karakterleri tüm metinlerden temizlenir',()=>{const s=migrate({horses:[{n:'<img src=x onerror=alert(1)>',spd:5,sta:5}],daily:{day:'x',streak:1,tasks:[{k:'sold',d:'"a`b\'c<d>',n:3,p:0,r:10}]}});
  return !/[<>"'`]/.test(s.horses[0].n+s.daily.tasks[0].d)&&s.daily.tasks[0].d==='abcd'});
await ok('anahtarlardaki HTML karakterleri temizlenir',()=>{const s=migrate({stats:{'<b>x':3}});return s.stats.bx===3&&!('<b>x' in s.stats)});
await eq('at adı en fazla 24 karakter, boşsa Rüzgar',()=>migrate({horses:[{n:'a'.repeat(40)},{n:''},{n:5}]}).horses.map(h=>h.n),['a'.repeat(24),'Rüzgar','Rüzgar']);
await eq('ui.rm/ui.hap: boolean değilse silinir, boolean korunur',()=>{const a=migrate({ui:{rm:'evet',hap:1}}).ui,b=migrate({ui:{rm:true,hap:false}}).ui,c=migrate({ui:5}).ui;return [a,b,c===undefined]},[{},{rm:true,hap:false},true]);
await eq('eski kayıt (eksik alanlar) tamamlanır',()=>{const s=migrate({coins:1000,lv:3,house:2,items:{bugday:4}});return [s.coins,s.lv,s.house,s.daily,s.sound,Array.isArray(s.orders),typeof s.market.m,s.fin.hist]},[1000,3,2,null,{music:true,sfx:true,notif:false},true,'object',[]]);
await eq('keepN yalnızca 0/5/10/20, autoSell boolean',()=>{const s=migrate({keepN:7,autoSell:'x'}),t=migrate({keepN:20});return [s.keepN,s.autoSell,t.keepN]},[10,true,20]);
await ok('gelecekteki lastSeen bugüne çekilir',()=>migrate({lastSeen:Date.now()+864e5*5}).lastSeen<=Date.now());
await eq('pazar: aralık dışı çarpan ve gelecekteki doygunluk atılır',()=>{const s=migrate({market:{at:0,m:{bugday:9,misir:1.1,zzz:1},sat:{bugday:{v:10,t:now()+1e7},misir:{v:5,t:1}}}});return [s.market.m,s.market.sat]},[{misir:1.1},{misir:{v:5,t:1}}]);
await eq('günlük: seri 1..7, bozuk görev atılır',()=>{const s=migrate({daily:{day:'x',streak:9,tasks:[{k:'a',d:'ok',n:2,p:-1,r:5},{k:'b',d:5,n:2},null]}});return [s.daily.streak,s.daily.tasks.length,s.daily.tasks[0].p]},[7,1,0]);
await eq('günlük alanı bozuksa null',()=>migrate({daily:{tasks:'x'}}).daily,null);
await eq('siparişler: tanınmayan müşteri ve ürün atılır',()=>migrate({orders:[{who:'Kasap Rıza',items:{bugday:2},base:5},{who:'Hacker',items:{bugday:1}},{who:'Kasap Rıza',items:{zzz:1}}]}).orders.length,1);

console.log('— scaled');
await eq('seviye 1, nesil 0: tarif aynen',()=>{S=__base();return scaled({out:{a:2},t:100},1)},{out:{a:2},t:100});
await eq('seviye 5: 2,2 kat ürün, %60 süre',()=>{S=__base();return scaled({out:{a:2,b:10},t:100},5)},{out:{a:4,b:22},t:60});
await eq('nesil bonusu %10 ve ürün en az 1',()=>{S=__base({gen:1});return scaled({out:{a:10,b:0.1},t:50},1)},{out:{a:11,b:1},t:50});
await eq('Saat Kulesi projesi süreyi %5 kısaltır',()=>{S=__base({proj:{saat:1}});return scaled({out:{a:1},t:100},1).t},95);

console.log('— pazar ekonomisi');
await eq('doygunluk yokken satNow 0, satF 1',()=>{S=__base();return [satNow('bugday'),satF('bugday')]},[0,1]);
await ok('addSat satılan değeri ekler, 15 dakikada yarıya iner',()=>{S=__base();addSat('bugday',10);const v=ITEMS.bugday.p*10,a=satNow('bugday');TIME_OFF+=900000;const h=satNow('bugday');return Math.abs(a-v)<1e-3&&Math.abs(h-v/2)<1e-3});
await ok('addSat üst üste eklenir',()=>{S=__base();addSat('misir',5);addSat('misir',5);return Math.abs(satNow('misir')-ITEMS.misir.p*10)<1e-3});
await eq('bozuk doygunluk kaydı 0 sayılır',()=>{S=__base();S.market.sat={bugday:{v:NaN,t:1},misir:{v:5,t:Infinity}};return [satNow('bugday'),satNow('misir')]},[0,0]);
await ok('saat geri alınsa da doygunluk büyümez',()=>{S=__base();addSat('bugday',10);const a=satNow('bugday');TIME_OFF-=864e5;return satNow('bugday')<=a+1e-9});
await eq('satF en düşük 0,4',()=>{S=__base();S.market.sat={bugday:{v:1e12,t:now()}};return satF('bugday')},.4);
await eq('sellPrice: taban fiyat × pazar çarpanı',()=>{S=__base();S.market.m={domates:1.2};return sellPrice('domates')},Math.max(1,Math.round(16*1.2*(1/(1+16/2/(1500+400))))));
await ok('sellPrice en az 1, büyük satışta düşer',()=>{S=__base();S.market.m={};return sellPrice('bugday',1)>=1&&sellPrice('domates',500)<sellPrice('domates',1)});
await eq('sellPrice: geçersiz pazar çarpanı 1 sayılır',()=>{S=__base();S.market.m={misir:NaN};const a=sellPrice('misir');S.market.m={};return a===sellPrice('misir')},true);

await eq('sellOut ürünü düşer, doygunluk ekler, birim fiyatı döner',()=>{S=__base({items:{bugday:20}});S.market.m={};const p0=sellPrice('bugday',10),pr=sellOut('bugday',10);return [pr===p0,has('bugday'),Math.abs(satNow('bugday')-ITEMS.bugday.p*10)<1e-3]},[true,10,true]);
console.log('— sayı biçimleri');
await eq('fmt: binlik ayraç, aşağı yuvarlama',()=>[fmt(1234567.89),fmt(0),fmt(999.99),fmt(-1500)],['1.234.567','0','999','-1.500']);
await eq('fmtShort: 10.000 altı tam sayı',()=>[fmtShort(9999),fmtShort(150.7)],['9.999','150']);
await eq('fmtShort: B / Mn / Mr ve dar boşluk',()=>[fmtShort(12345),fmtShort(123456),fmtShort(1234567),fmtShort(123456789),fmtShort(2.5e9)],['12,3 B','123 B','1,2 Mn','123 Mn','2,5 Mr']);
await eq('fmtShort: negatif ve kesme (yuvarlamaz)',()=>[fmtShort(-12345),fmtShort(19999)],['-12,3 B','19,9 B']);

console.log('— progressOf (bulut eşitleme)');
await eq('boş/bozuk kayıt 0',()=>[progressOf(null),progressOf({}),progressOf({stats:5})],[0,0,0]);
await eq('yalnızca sonlu sayılar toplanır',()=>progressOf({stats:{a:2,b:'x',c:Infinity,d:3}}),5);
await ok('yeni nesil her zaman daha ileri sayılır',()=>progressOf({gen:1,stats:{}})>progressOf({gen:0,stats:{a:1e8}}));

console.log('— üretim sırası');
await ok('boş binaya ekleme işi hemen başlatır',()=>{S=__base({items:{yem:10}});queueAdd('kumes','besle');return !!S.units.kumes.job&&!S.units.kumes.q&&has('yem')===9});
await eq('çalışırken eklenen işler sıraya girer, en fazla QMAX',()=>{S=__base({items:{yem:10}});for(let i=0;i<6;i++)queueAdd('kumes','besle');return [QMAX,S.units.kumes.q.length]},[3,3]);
await eq('bilinmeyen tarif sıraya girmez',()=>{S=__base({items:{yem:10}});queueAdd('kumes','besle');queueAdd('kumes','yok');return S.units.kumes.q||[]},[]);
await eq('queueDel sıradan çıkarır',()=>{S=__base({items:{yem:10}});for(let i=0;i<3;i++)queueAdd('kumes','besle');queueDel('kumes',0);return S.units.kumes.q.length},1);
await eq('iş bitince queueNext sıradakini başlatır',()=>{S=__base({items:{yem:10}});for(let i=0;i<3;i++)queueAdd('kumes','besle');S.units.kumes.job=null;const r=queueNext('kumes');return [r,!!S.units.kumes.job,S.units.kumes.q.length]},[true,true,1]);
await eq('malzeme yoksa iş sırada bekler',()=>{S=__base({items:{yem:1}});queueAdd('kumes','besle');queueAdd('kumes','besle');S.units.kumes.job=null;const r=queueNext('kumes');return [r,S.units.kumes.q.length]},[false,1]);

console.log('— günlük');
await ok('todayStr Y-A-G biçiminde',()=>/^\d{4}-\d{1,2}-\d{1,2}$/.test(todayStr()));
await ok('todayStr oyun saatini (now) izler',()=>{const a=todayStr();TIME_OFF+=864e5;const b=todayStr();const d=new Date(now());return a!==b&&b===d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()});
await eq('checkDaily aynı gün ikinci kez yenilemez',()=>{S=__base();const a=checkDaily(),b=checkDaily();return [a,b,S.daily.tasks.length,S.daily.streak]},[true,false,3,1]);
await eq('ertesi gün seri artar, gün atlanırsa 1e döner',()=>{S=__base();checkDaily();TIME_OFF+=864e5;checkDaily();const a=S.daily.streak;TIME_OFF+=864e5*3;checkDaily();return [a,S.daily.streak]},[2,1]);
await eq('gün anahtarı geri gitmez: saat geri alınınca ödül/görev sıfırlanmaz',()=>{S=__base();TIME_OFF+=864e5*2;checkDaily();S.daily.login=true;const d=S.daily.day;TIME_OFF-=864e5*2;const r=checkDaily();return [r,S.daily.day===d,S.daily.login]},[false,true,true]);
await ok('dayNum ay/gün sırasını doğru karşılaştırır',()=>dayNum('2026-11-10')>dayNum('2026-11-9')&&dayNum('2026-12-1')>dayNum('2026-11-30')&&dayNum('x')===0);
await eq('7. günden sonra seri 1e döner',()=>{S=__base();checkDaily();S.daily.streak=7;TIME_OFF+=864e5;checkDaily();return S.daily.streak},1);
await ok('günlük görev ilerlemesi stat ile artar',()=>{S=__base();checkDaily();S.daily.tasks=[{k:'sold',n:3,p:0,r:1,d:'x'}];stat('sold',2);return S.daily.tasks[0].p===2});

console.log('— bildirim');
await eq('toast: hata titreşimi yalnızca {err:1} ile, metin aynı',()=>{const h=PLATFORM.hap,c=[];PLATFORM.hap=k=>c.push(k);try{toast('Yeterli paran yok');toast('Yeterli paran yok',{err:1});return [c,document.querySelector('.toast').textContent]}finally{PLATFORM.hap=h}},[['err'],'Yeterli paran yok']);
await eq('yetersiz para ve dolu ambar uyarıları hata titreşimi verir',()=>{const h=PLATFORM.hap,c=[];PLATFORM.hap=k=>c.push(k);try{S=__base({coins:0});buyFeed(5);S=__base({coins:1e6});S.items.bugday=cap();buyFeed(5);return c}finally{PLATFORM.hap=h}},['err','err']);
console.log('— ortak pencere');
await eq('makeModal: sınıf, içerik, ilk düğme kapatır ve geri çağırır',()=>{let c=0;const d=makeModal('login','<div><h2>Başlık</h2><button>Tamam</button></div>',{close:()=>c++});
  const a=[d.className,d.isConnected,d.querySelector('h2').textContent];d.querySelector('button').click();return [...a,d.isConnected,c]},['modal login',true,'Başlık',false,1]);
await eq('makeModal: nodismiss işareti, close yoksa düğme kendisi bağlanır',()=>{const d=makeModal('',"<div><button>x</button></div>",{nodismiss:1});const r=[d.className,d.dataset.nodismiss,d.querySelector('button').onclick];d.remove();return r},['modal','1',null]);
await eq('makeModal: gözlemci role=dialog ve başlık adı ekler',()=>new Promise(res=>{const d=makeModal('mg','<div><h2>Deneme</h2></div>');setTimeout(()=>{const r=[d.getAttribute('role'),d.getAttribute('aria-modal'),document.getElementById(d.getAttribute('aria-labelledby')).textContent];d.remove();res(r)},0)}),['dialog','true','Deneme']);
console.log('— birleştirme kuyruğu');
await eq('batchWatch: kaldırılmış grubun kaydı atılır, masadayken anlık görüntü alınmaz',()=>{const n=_bq.length,g=G(world);batchWatch(g);world.remove(g);const g2=G(world);batchWatch(g2);
  const q=_bq[_bq.length-1],r=[_bq.length-n,mode,q.root===g2,q.stale,q.list];world.remove(g2);_bq.splice(_bq.indexOf(q),1);return r},[1,'desk',true,true,null]);
console.log('— itibar');
await eq('addRep artırır, 100 ile sınırlar',()=>{S=__base({rep:90});const a=[];addRep(3);a.push(S.rep);addRep(10);a.push(S.rep);return a},[93,100]);

if(errs.length){fail++;console.log('✗ sayfa hatası: '+errs.join(' | '))}
await b.close();console.log(`\n${pass} geçti, ${fail} kaldı`);process.exit(fail?1:0);
