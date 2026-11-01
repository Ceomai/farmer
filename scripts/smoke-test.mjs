// Otomatik duman testi: dist/index.html'i internet tamamen kapalıyken açar, temel akışları dener.
// Kullanım: npm run build && npm test   (Playwright gerekir: npm i -D playwright && npx playwright install chromium)
import {createRequire} from 'node:module';import path from 'node:path';
const require=createRequire(import.meta.url);const {chromium}=require('playwright');
const file='file://'+path.resolve(process.argv[2]||'www/index.html');let fail=0;const ok=(c,m)=>{console.log((c?'✓ ':'✗ ')+m);if(!c)fail++};
const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
for(const vp of[{width:390,height:844,n:'telefon'},{width:1280,height:800,n:'masaüstü'}]){
  const p=await b.newPage({viewport:vp});const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.route(/^https?:/,r=>r.abort());await p.goto(file);await p.waitForFunction(()=>!document.getElementById('boot')&&typeof S==='object',null,{timeout:30000}).catch(()=>{});
  ok(await p.evaluate(()=>!document.getElementById('boot')&&typeof S==='object'),`${vp.n}: çevrimdışı açıldı`);
  ok(await p.evaluate(()=>mode==='desk'),`${vp.n}: masa ana menüsü`);
  ok(await p.evaluate(()=>document.querySelector('.plate h1').textContent==='Çiftlik İmparatorluğu'),`${vp.n}: Türkçe karakterler doğru`);
  await p.evaluate(()=>{document.querySelectorAll('.modal').forEach(m=>m.remove());enterWorld()});await p.waitForFunction(()=>mode==='hub',null,{timeout:15000}).catch(()=>{});
  ok(await p.evaluate(()=>mode==='hub'),`${vp.n}: haritaya çıkış`);
  const before=await p.evaluate(()=>S.coins);await p.evaluate(()=>{goLocation('tarla');plantAll()});await p.waitForTimeout(400);
  ok(await p.evaluate(b=>S.coins<b&&S.fields.some(f=>f.job),before),`${vp.n}: tarlaya ekim`);
  await p.evaluate(()=>{S.fields.forEach(f=>{if(f.job)f.job.e=Date.now()-1});harvestAll()});ok(await p.evaluate(()=>has('bugday')>0),`${vp.n}: hasat`);
  await p.evaluate(()=>{toHub();S.fields.forEach((f,i)=>plantPlot(i,'bugday',true));S.fields.forEach(f=>{f.job.e=Date.now()-1})});const w0=await p.evaluate(()=>has('bugday'));
  ok(await p.evaluate(w=>{const r=quickLoc('tarla');return has('bugday')>w&&r.got>0&&S.fields.every(f=>f.job)},w0),`${vp.n}: karttan tek dokunuşla topla + yeniden ek`);
  ok(await p.evaluate(()=>{openView('guide');const t=['start','res','items','places','events','tips'].every(k=>{view.tab=k;renderSheet();return sheet.querySelectorAll('.gd').length>0});closeSheet();return t}),`${vp.n}: rehber tüm sekmeler`);
  ok(await p.evaluate(()=>{while(S.fields.length<9)S.fields.push({});goLocation('tarla');renderSheet();const r=document.querySelector('.seeds').getBoundingClientRect();return r.height>30}),`${vp.n}: tarlada tohum düğmeleri görünüyor (9 parsel)`);
  await p.evaluate(()=>{goLocation('pazar');sell('bugday',1)});ok(await p.evaluate(()=>S.stats.sold>0),`${vp.n}: pazarda satış`);
  await p.evaluate(()=>goLocation('kumes'));await p.waitForFunction(()=>mode==='focus'&&focus==='kumes',null,{timeout:15000}).catch(()=>{});
  ok(await p.evaluate(()=>mode==='focus'),`${vp.n}: karttan bölüme gidince içeri otomatik girmiyor`);await p.evaluate(()=>enterInterior('kumes'));await p.waitForFunction(()=>mode==='interior',null,{timeout:15000}).catch(()=>{});ok(await p.evaluate(()=>mode==='interior'),`${vp.n}: kümes iç mekânı`);
  await p.evaluate(()=>{leaveInterior()});await p.waitForFunction(()=>mode!=='interior',null,{timeout:15000}).catch(()=>{});await p.evaluate(()=>toDesk());await p.waitForFunction(()=>mode==='desk',null,{timeout:15000}).catch(()=>{});
  ok(await p.evaluate(()=>{save();return !!localStorage.getItem(SAVE)}),`${vp.n}: kayıt`);
  ok(errs.length===0,`${vp.n}: konsolda hata yok${errs.length?' → '+errs.slice(0,3).join(' | '):''}`);await p.close()}
await b.close();console.log(fail?`\n${fail} kontrol başarısız`:'\nTüm kontroller geçti');process.exit(fail?1:0);
