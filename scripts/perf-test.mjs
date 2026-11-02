// Performans ve stres ölçümü. Gerçek değerler ölçülür; ortam yazılımsal GPU (SwiftShader) olduğu için mutlak süreler
// telefondakinden farklıdır — eğilimler (sızıntı, büyüme, istek sayısı) ve göreli değerler anlamlıdır.
// Kullanım: npm run build && node scripts/perf-test.mjs [--net]   (--net: 65 sn ağ isteği sayımı da yapar)
import {createRequire} from 'node:module';import path from 'node:path';
const require=createRequire(import.meta.url);const {chromium}=require('playwright');
const FILE='file://'+path.resolve('www/index.html');const NET=process.argv.includes('--net');
let pass=0,fail=0;const ok=(c,m,x='')=>{console.log((c?'✓ ':'✗ ')+m+(x?' · '+x:''));c?pass++:fail++};const R={};
const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--enable-precise-memory-info','--js-flags=--expose-gc']});
const open=async(vp={width:390,height:844},init)=>{const p=await b.newPage({viewport:vp});p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));await p.route(/^https?:/,r=>r.abort());if(init)await p.addInitScript(init);
  const t0=Date.now();await p.goto(FILE);await p.waitForFunction(()=>typeof S==='object'&&S&&!document.getElementById('boot'),null,{timeout:120000});p.boot=Date.now()-t0;return p};
// 1) açılış süresi (3 ölçüm)
const boots=[];for(let i=0;i<3;i++){const p=await open();boots.push(p.boot);await p.close()}
R.boot=boots;const med=boots.sort((a,b)=>a-b)[1];ok(med<20000,`açılış süresi (yazılımsal GPU) orta değer ${med} ms`,boots.join(', ')+' ms');
// zengin oyuncu durumu
const rich=()=>{if(window.name==='r')return;window.name='r';const u={};for(const k of['kumes','silo','yemhane','degirmen','ahir','firin','agil','mandira','kovan','bahce','konserve','besi','yaghane','dokuma','sera','hara','bag','pekmezhane'])u[k]={l:3};
  localStorage.setItem('ciftlik-imparatorlugu-v3',JSON.stringify({coins:5e6,lv:30,house:4,fieldLv:3,regions:{baba:1,town:1,dere:1,kavak:1,yamac:1,ova:1,bagyolu:1},units:u,fields:Array.from({length:9},()=>({})),items:{bugday:200,yem:100,sut:50,un:50},consent:{a:1},tut:{done:1},tut2:{done:1}}))};
const p=await open({width:390,height:844},rich);await p.evaluate(()=>{document.querySelectorAll('.modal').forEach(m=>m.remove());S.fastNav=true});
// 2) çizim çağrıları
const calls=async()=>{await p.waitForTimeout(400);return p.evaluate(()=>{R.info.autoReset=true;return new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(()=>r(R.info.render.calls))))})};
R.calls={masa:await calls()};await p.evaluate(()=>enterWorld());await p.waitForTimeout(4500);R.calls.harita=await calls();
await p.evaluate(()=>goLocation('atolye'));R.calls.bolum=await calls();await p.evaluate(()=>enterInterior('kumes'));await p.waitForTimeout(800);R.calls.ic=await calls();await p.evaluate(()=>leaveInterior());await p.waitForTimeout(600);
ok(R.calls.harita<700,`çizim çağrısı: masa ${R.calls.masa}, harita ${R.calls.harita}, bölüm ${R.calls.bolum}, iç mekân ${R.calls.ic}`);
// 3) uzun oturum: 100 tur gezinme → GPU kaynakları ve JS belleği büyümemeli
const mem=()=>p.evaluate(()=>{if(window.gc)gc();return{geo:R.info.memory.geometries,tex:R.info.memory.textures,heap:performance.memory?Math.round(performance.memory.usedJSHeapSize/1048576):0,dom:document.getElementsByTagName('*').length}});
// ısınma: haritanın her yeri bir kez görülsün (ilk yüklemeler sızıntı sayılmasın)
const cycle=async n=>{for(let i=0;i<n;i++){await p.evaluate(i=>{const ks=Object.keys(LOC);const k=ks[i%ks.length];goLocation(k);if(i%5===0){enterInterior(['kumes','ahir','agil','besi','hara','kulube'][i%6])}},i);await p.waitForTimeout(60);
  await p.evaluate(i=>{if(mode==='interior')leaveInterior();if(i%10===0){toDesk()}else if(i%10===1){enterWorld()}else toHub();view={k:['barn','guide','ledger','album','settings'][i%5]};renderSheet();closeSheet()},i);await p.waitForTimeout(60)}};
await cycle(40);await p.evaluate(()=>{if(mode==='desk')enterWorld();else toHub()});await p.waitForTimeout(4000);const m0=await mem();const t0=Date.now();await cycle(100);
await p.evaluate(()=>{if(mode==='desk')enterWorld();else toHub()});await p.waitForTimeout(1500);const m1=await mem();R.nav={m0,m1,ms:Date.now()-t0};
ok(m1.geo-m0.geo<=40,`100 tur gezinmede geometri sayısı ${m0.geo} → ${m1.geo}`);ok(m1.tex-m0.tex<=10,`100 tur gezinmede doku sayısı ${m0.tex} → ${m1.tex}`);
ok(m1.heap-m0.heap<=25,`100 tur gezinmede JS belleği ${m0.heap} → ${m1.heap} MB`);ok(m1.dom-m0.dom<=80,`100 tur gezinmede sayfa öğesi ${m0.dom} → ${m1.dom}`);
// 4) dünya yeniden kurulumu: 300 ekim/hasat/yükseltme döngüsü (bölüm grupları yeniden oluşturulur)
const w0=await mem();await p.evaluate(()=>{for(let i=0;i<300;i++){plantAll();S.fields.forEach(f=>{if(f.job)f.job.e=0});harvestAll();startUnit('kumes','besle',true);if(S.units.kumes.job)S.units.kumes.job.e=0;collectUnit('kumes',null,null,true);syncWorld()}document.querySelectorAll('.conf,.celeb,.float,.flyi,.toast').forEach(e=>e.remove())});
await p.waitForTimeout(4000);const w1=await mem();R.rebuild={w0,w1};ok(w1.geo-w0.geo<=60,`300 üretim döngüsünde geometri ${w0.geo} → ${w1.geo}`);ok(w1.heap-w0.heap<=30,`300 üretim döngüsünde JS belleği ${w0.heap} → ${w1.heap} MB`);
// 4b) masada uzun bekleme: ekinler büyüdükçe bölümler yeniden kurulur; birleştirme kuyruğu ve bellek büyümemeli
const dq=await p.evaluate(async()=>{toDesk();await new Promise(r=>setTimeout(r,800));const h0=performance.memory?performance.memory.usedJSHeapSize:0;
  for(let i=0;i<200;i++){for(const k in locSigs)locSigs[k]='x';syncWorld();tick()}await new Promise(r=>setTimeout(r,600));tick();
  return{q:_bq.length,groups:Object.keys(locGroups).length+3,heapMB:Math.round(((performance.memory?performance.memory.usedJSHeapSize:0)-h0)/1048576)}});
R.deskQueue=dq;ok(dq.q<=dq.groups,`masada 200 yeniden kurulumda birleştirme kuyruğu ${dq.q} (sınır ${dq.groups})`);
await p.evaluate(()=>enterWorld());await p.waitForTimeout(1500);
// 5) kayıt boyutu ve süresi, tick süresi
const sv=await p.evaluate(()=>{const t=[];for(let i=0;i<50;i++){const a=performance.now();save();t.push(performance.now()-a)}const tk=[];for(let i=0;i<50;i++){const a=performance.now();tick();tk.push(performance.now()-a)}
  const s=t.sort((a,b)=>a-b),k=tk.sort((a,b)=>a-b);return{kb:Math.round(JSON.stringify(S).length/102.4)/10,save:+s[25].toFixed(2),saveMax:+s[49].toFixed(2),tick:+k[25].toFixed(2),tickMax:+k[49].toFixed(2)}});
R.save=sv;ok(sv.kb<200,`kayıt boyutu ${sv.kb} KB (bulut sınırı 900 KB)`);ok(sv.save<20,`save() orta ${sv.save} ms, en kötü ${sv.saveMax} ms`);ok(sv.tick<30,`tick() orta ${sv.tick} ms, en kötü ${sv.tickMax} ms`);
// 6) kare süresi (CPU tarafı: dünya güncellemesi + çizim)
const fr=await p.evaluate(async()=>{toHub();await new Promise(r=>setTimeout(r,800));const t=[];for(let i=0;i<40;i++){const a=performance.now();worldTick(.016,i*.016);R.render(world,cam);t.push(performance.now()-a)}t.sort((a,b)=>a-b);return{med:+t[20].toFixed(1),p90:+t[36].toFixed(1)}});
R.frame=fr;ok(true,`harita kare süresi (yazılımsal GPU) orta ${fr.med} ms, %90 ${fr.p90} ms`);
ok(!p.errs.length,'ölçümler sırasında sayfa hatası yok',p.errs.slice(0,3).join('|'));await p.close();
// 7) ağ isteği sayısı (bulut açık, 65 sn)
if(NET){const q=await b.newPage({viewport:{width:390,height:844}});let n=0;const kinds={};await q.route(/^https?:/,r=>{const u=new URL(r.request().url());n++;const k=u.host.split('.')[0]+' '+r.request().method();kinds[k]=(kinds[k]||0)+1;
    if(u.host.startsWith('identitytoolkit'))return r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({idToken:'t',refreshToken:'r',expiresIn:'3600'})});if(u.host.startsWith('firestore'))return r.fulfill({status:200,contentType:'application/json',body:'{}'});r.abort()});
  await q.addInitScript(()=>{if(window.name!=='n'){window.name='n';localStorage.setItem('ciftlik-imparatorlugu-v3',JSON.stringify({coins:300,consent:{analytics:true},tut:{done:1}}))}});
  await q.goto(FILE);await q.waitForFunction(()=>typeof S==='object'&&S&&!document.getElementById('boot'),null,{timeout:120000});n=0;for(const k in kinds)delete kinds[k];await q.waitForTimeout(65000);R.net={n,kinds};
  ok(n<=8,`bulut açıkken 65 saniyede ${n} ağ isteği`,JSON.stringify(kinds));await q.close()}
await b.close();console.log('\nÖLÇÜMLER '+JSON.stringify(R));console.log(`${pass} geçti, ${fail} başarısız`);process.exit(fail?1:0);
