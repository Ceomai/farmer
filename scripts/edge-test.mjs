// Uç durum testleri: saat dilimleri, yaz saati geçişi, gece yarısı, çok büyük/küçük/ondalıklı sayılar, geçersiz tarihler,
// çok büyük veri, Unicode/emoji, bozuk ilişkiler. Kullanım: npm run build && node scripts/edge-test.mjs
import {createRequire} from 'node:module';import path from 'node:path';
const require=createRequire(import.meta.url);const {chromium}=require('playwright');
const FILE='file://'+path.resolve('www/index.html');let pass=0,fail=0;const ok=(c,m,x='')=>{console.log(`${c?'✓':'✗'} ${m}${c?'':' → '+x}`);c?pass++:fail++};
const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
async function open(save,opt={}){const ctx=await b.newContext({viewport:{width:390,height:844},timezoneId:opt.tz,locale:opt.locale});const p=await ctx.newPage();p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));await p.route(/^https?:/,r=>r.abort());
  if(opt.time)await p.clock.install({time:new Date(opt.time)});
  await p.addInitScript(s=>{if(window.name!=='e'){window.name='e';localStorage.clear();if(s)localStorage.setItem('ciftlik-imparatorlugu-v3',s)}},save?JSON.stringify(save):null);
  await p.goto(FILE);if(opt.time)await p.clock.runFor(3000);await p.waitForFunction(()=>typeof S==='object'&&S&&!document.getElementById('boot'),null,{timeout:120000});await p.evaluate(()=>document.querySelectorAll('.modal').forEach(m=>m.remove()));p.ctx=ctx;return p}
const base=(o={})=>({coins:300,lv:3,house:1,regions:{baba:1,town:1},units:{kumes:{l:1}},fields:[{},{}],items:{yem:6},consent:{analytics:false},tut:{done:1},tut2:{done:1},...o});
const bad=t=>/\bNaN\b|\bundefined\b|\bInfinity\b|\[object|e\+\d/.test(t);
// 1) saat dilimleri ve yerel ayar
for(const [tz,loc] of [['Europe/Istanbul','tr-TR'],['Pacific/Kiritimati','en-US'],['Pacific/Pago_Pago','en-US'],['America/St_Johns','fr-CA'],['Asia/Kathmandu','ar-EG'],['Australia/Lord_Howe','ja-JP'],['UTC','de-DE']]){
  const p=await open(base(),{tz,locale:loc});const r=await p.evaluate(()=>{checkDaily();renderHUD();return{day:todayStr(),daily:!!S.daily,hud:document.querySelector('.hud').innerText,fmt:fmt(1234567.89)}});
  ok(r.daily&&/^\d{4}-\d{1,2}-\d{1,2}$/.test(r.day)&&!bad(r.hud)&&r.fmt==='1.234.567',`saat dilimi ${tz} / ${loc}: günlük çalışıyor, sayı biçimi ${r.fmt}`,JSON.stringify(r));ok(!p.errs.length,`${tz}: sayfa hatası yok`,p.errs.join('|'));await p.ctx.close()}
// 2) yaz saati geçişi (New York, 8 Mart 2026 02:00 → 03:00) ve gece yarısı geçişi
{const p=await open(base(),{tz:'America/New_York',time:'2026-03-08T06:58:00Z'});const d0=await p.evaluate(()=>{checkDaily();return{day:S.daily.day,login:S.daily.login}});
  await p.clock.runFor(4*60*1000);const d1=await p.evaluate(()=>{const ch=checkDaily();return{day:S.daily.day,ch,coins:S.coins}});
  ok(d0.day===d1.day&&!d1.ch,'yaz saatine geçişte (saat 1 ileri) günlük ödül sıfırlanmıyor',JSON.stringify([d0,d1]));
  await p.clock.runFor(22*3600*1000);const d2=await p.evaluate(()=>{const ch=checkDaily();return{day:S.daily.day,ch}});ok(d2.ch&&d2.day!==d1.day,'gece yarısından sonra yeni gün başlıyor',JSON.stringify(d2));
  ok(!p.errs.length,'yaz saati testinde sayfa hatası yok',p.errs.join('|'));await p.ctx.close()}
{const p=await open(base(),{tz:'Europe/Berlin',time:'2026-10-25T00:30:00Z'});await p.evaluate(()=>checkDaily());await p.clock.runFor(2*3600*1000);
  ok(await p.evaluate(()=>!checkDaily()&&isFinite(S.coins)),'kış saatine geçişte (saat 1 geri) aynı gün tekrar ödül vermiyor');await p.ctx.close()}
// 3) uç sayılar
for(const [n,v] of [['sıfır',0],['ondalık',0.1+0.2],['çok büyük',1e15],['aşırı büyük',1e21],['negatif',-500],['metin','12abc'],['NaN',null]]){
  const p=await open(base({coins:v,gems:v,items:{bugday:v,yem:v}}));const r=await p.evaluate(()=>{renderHUD();view={k:'barn'};renderSheet();return{c:S.coins,g:S.gems,hud:document.querySelector('.hud').innerText,sh:sheet.innerText}});
  ok(isFinite(r.c)&&r.c>=0&&isFinite(r.g)&&r.g>=0&&!bad(r.hud)&&!bad(r.sh),`para/yonca/ürün = ${n}: değerler sonlu ve ekranda düzgün`,JSON.stringify({c:r.c,hud:r.hud.slice(0,60)}));await p.ctx.close()}
{const p=await open(base({coins:1e15,lv:30}));const r=await p.evaluate(()=>{const c0=S.coins;buildUnit('ahir');upgradeHouse();sell('yem',3);return{d:c0-S.coins,c:S.coins}});ok(isFinite(r.c)&&r.c>0,'çok büyük parayla alışveriş doğru hesaplanıyor',JSON.stringify(r));await p.ctx.close()}
// 4) geçersiz tarihler ve bozuk ilişkiler
{const p=await open(base({lastSeen:'dün',created:'x',fields:[{job:{r:'bugday',s:'a',e:'b'}},{job:{r:'bugday',s:null,e:Infinity}}],units:{kumes:{l:1,job:{r:'besle',s:NaN,e:'yarın'}}},daily:{day:12,streak:'beş',login:'evet',tasks:'yok'},horses:[{n:'X',rest:'x',train:{}}],contests:{day:5,list:['olmayan'],done:[]}}));
  const r=await p.evaluate(()=>{tick();return{f:S.fields.map(f=>f.job&&[f.job.s,f.job.e].every(Number.isFinite)),k:S.units.kumes.job&&Number.isFinite(S.units.kumes.job.e),h:Number.isFinite(S.horses[0].rest)}});
  ok(r.f.every(x=>x!==false)&&r.k!==false&&r.h,'geçersiz tarihli işler ve atlar onarılıyor',JSON.stringify(r));ok(!p.errs.length,'geçersiz tarihlerle sayfa hatası yok',p.errs.join('|'));
  await p.evaluate(()=>{view={k:'loc',loc:'panayir'};renderSheet()});ok(!p.errs.length,'bozuk panayır listesiyle panel açılıyor',p.errs.join('|'));await p.ctx.close()}
// 5) çok büyük veri
{const stats={};for(let i=0;i<20000;i++)stats['make_x'+i]=i;const contracts=Array.from({length:2000},(_,i)=>({who:'Kasap Rıza',k:'bugday',total:10,got:0,until:Date.now()+1e9,reward:10,xp:1,gems:1}));
  const p=await open(base({stats,contracts,orders:Array.from({length:500},()=>({who:'Bakkal Ahmet',items:{bugday:1},base:5,xp:1}))}));
  const r=await p.evaluate(()=>{const t0=performance.now();save();const ts=performance.now()-t0;view={k:'mail'};const t1=performance.now();renderSheet();const tr=performance.now()-t1;return{kb:Math.round(JSON.stringify(S).length/1024),ts:Math.round(ts),tr:Math.round(tr),c:S.contracts.length}});
  ok(r.ts<500&&r.tr<2000,`20.000 istatistik + 2.000 sözleşme + 500 sipariş: kayıt ${r.ts} ms, panel ${r.tr} ms, ${r.kb} KB`,JSON.stringify(r));ok(!p.errs.length,'büyük veride sayfa hatası yok',p.errs.join('|'));await p.ctx.close()}
// 6) Unicode / emoji / sağdan sola metin
{const p=await open(base({lv:9,units:{kumes:{l:1},hara:{l:1}},regions:{baba:1,town:1,ova:1},horses:[{n:'🐎🔥مرحبا 𝔘𝔫𝔦𝔠𝔬𝔡𝔢 '+'Ş'.repeat(100),spd:5,sta:5,w:0,rest:0,train:0}]}));
  const r=await p.evaluate(()=>{view={k:'loc',loc:'hipo'};renderSheet();return{n:S.horses[0].n.length,ov:sheet.scrollWidth<=sheet.clientWidth+2}});ok(r.n<=24&&r.ov,'emoji/Arapça/uzun at adı kısaltılıyor, panel taşmıyor',JSON.stringify(r));await p.ctx.close()}
await b.close();console.log(`\n${pass} geçti, ${fail} başarısız`);process.exit(fail?1:0);
