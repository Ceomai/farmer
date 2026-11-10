// Yerleşim taraması: bütün paneller, bölümler ve iç mekânlar farklı ekran boyutlarında açılır; ezilen, taşan, kesilen ve çakışan öğeler raporlanır.
// Kullanım: node scripts/layout-check.mjs <çıktı-klasörü> [360x640,390x844,...] [shots]
import {createRequire} from 'node:module';import path from 'node:path';const require=createRequire(import.meta.url);const {chromium}=require('playwright');
const out=process.argv[2];const VPS=(process.argv[3]||'360x640,390x844,768x1024,1280x800').split(',').map(s=>s.split('x').map(Number));const SHOTS=process.argv[4]==='shots';
const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const check=()=>{const iss=[];const sh=document.querySelector('.sheet:not([hidden])');const vw=innerWidth,vh=innerHeight;
  const vis=e=>{const cs=getComputedStyle(e);return cs.display!=='none'&&cs.visibility!=='hidden'&&!e.closest('[hidden]')};
  const name=e=>(e.className&&typeof e.className==='string'?'.'+e.className.trim().split(/\s+/).join('.'):e.tagName)+(e.textContent?' «'+e.textContent.trim().slice(0,24)+'»':'');
  if(sh){const sr=sh.getBoundingClientRect();if(sr.bottom>vh+1)iss.push('panel ekran altına taşıyor '+Math.round(sr.bottom-vh)+'px');if(sr.right>vw+1||sr.left<-1)iss.push('panel yana taşıyor');
    sh.querySelectorAll('.sh-body *').forEach(e=>{if(!vis(e))return;const r=e.getBoundingClientRect();if(!r.width&&!r.height)return;
      if(e.scrollHeight>24&&r.height<14&&getComputedStyle(e).overflowY!=='visible')iss.push('ezilmiş '+name(e)+' h='+Math.round(r.height));
      const sc=e.closest('.seeds,.tiles,.inv,.plots,.tabs,.gall,.mgbar,.urow.mainact');
      if(!sc&&(r.right>sr.right+2||r.left<sr.left-2)&&r.width<sr.width*2)iss.push('panel dışına taşan '+name(e));
      if((e.tagName==='BUTTON'||e.classList.contains('pill-btn'))&&e.scrollWidth>e.clientWidth+3&&getComputedStyle(e).overflow!=='visible')iss.push('kesik yazı '+name(e))})}
  const fx=[...document.querySelectorAll('.hud .plate,.hud .pills,#backBtn,#guideBtn,.dock,.strip')].filter(e=>vis(e)&&!e.hidden);
  for(let i=0;i<fx.length;i++)for(let j=i+1;j<fx.length;j++){if(fx[i].contains(fx[j])||fx[j].contains(fx[i]))continue;const a=fx[i].getBoundingClientRect(),c=fx[j].getBoundingClientRect();if(a.width&&c.width&&a.left<c.right-2&&c.left<a.right-2&&a.top<c.bottom-2&&c.top<a.bottom-2)iss.push('çakışma '+name(fx[i]).slice(0,20)+' × '+name(fx[j]).slice(0,20))}
  if(sh)fx.forEach(e=>{const a=e.getBoundingClientRect(),c=sh.getBoundingClientRect();if((e.id==='backBtn'||e.id==='guideBtn')&&!sh.contains(e))if(a.left<c.right-2&&c.left<a.right-2&&a.top<c.bottom-2&&c.top<a.bottom-2)iss.push('panel düğmeyi örtüyor '+e.id)});
  {const bk=document.getElementById('backBtn');if(bk&&vis(bk)&&!bk.hidden&&!(sh&&sh.contains(bk))){const a=bk.getBoundingClientRect();document.querySelectorAll('.strip .scard,.strip .scard .s,.cam button').forEach(e=>{if(!vis(e))return;const c=e.getBoundingClientRect();if(c.width&&a.left<c.right-1&&c.left<a.right-1&&a.top<c.bottom-1&&c.top<a.bottom-1)iss.push('geri düğmesi örtüyor '+name(e).slice(0,24))})}}
  if(document.documentElement.scrollWidth>vw+1)iss.push('sayfa yana kayıyor');return [...new Set(iss)].slice(0,8)};
let total=0;
for(const [w,h] of VPS){const p=await b.newPage({viewport:{width:w,height:h},deviceScaleFactor:1.5,isMobile:w<700,hasTouch:w<700});const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.goto('file://'+path.resolve('www/index.html'));await p.waitForFunction(()=>!document.getElementById('boot')&&typeof S==='object',null,{timeout:40000});
  await p.evaluate(()=>{S.tut={done:1};S.lv=16;S.coins=99999;S.gems=50;S.house=4;for(const r in REG)S.regions[r]=1;for(const u in B)S.units[u]={l:3};while(S.fields.length<9)S.fields.push({});
    S.items={bugday:20,misir:10,yem:30,sut:12,un:8,yumurta:9,peynir:3,at:1,bal:4,kabak:1};S.horses=[{n:'Yıldız',spd:8,sta:7,w:0,rest:0,train:0}];startUnit('kumes','besle',true);S.fields.forEach((f,i)=>{if(i<4)plantPlot(i,'bugday',true)});
    document.querySelectorAll('.modal').forEach(m=>m.remove());syncWorld(true)});
  const shot=async n=>{await p.waitForTimeout(700);await p.evaluate(()=>document.querySelectorAll('.modal').forEach(m=>m.remove()));const iss=await p.evaluate(check);if(iss.length){total+=iss.length;console.log(`${w}x${h} ${n}:`,iss.join(' | '))}if(SHOTS)await p.screenshot({path:`${out}/${w}-${n}.png`})};
  await shot('masa');
  for(const v of ['ledger','mail','goals','borsa','budget','stats','barn','settings','album','shop:ev','shop:ciftlik','shop:yonca','ledger:f','ledger:c',...['start','res','items','places','events','tips'].map(t=>'guide:'+t)]){const [k,t]=v.split(':');await p.evaluate(([k,t])=>{view={k};if(t)view.tab=t;renderSheet()},[k,t]);await shot('masa-'+v.replace(':','_'))}
  await p.evaluate(()=>{closeSheet();enterWorld()});await p.waitForFunction(()=>mode==='hub');await p.waitForTimeout(600);await shot('harita');
  await p.evaluate(()=>{view={k:'region',r:'ova'};renderSheet()});await shot('bolge');await p.evaluate(()=>closeSheet());
  await p.evaluate(()=>{S.fastNav=true});
  for(const k in await p.evaluate(()=>LOC)){await p.evaluate(k=>goLocation(k),k);await p.waitForTimeout(150);await shot('yer-'+k)}
  for(const k of ['kumes','ahir','agil','besi','hara','kulube']){await p.evaluate(k=>{goLocation(k==='kulube'?'ev':Object.keys(LOC).find(x=>(LOC[x].units||[]).includes(k)));enterInterior(k)},k);await p.waitForFunction(()=>mode==='interior',null,{timeout:8000}).catch(()=>{});await p.waitForTimeout(400);await shot('ic-'+k);await p.evaluate(()=>leaveInterior());await p.waitForFunction(()=>mode!=='interior',null,{timeout:8000}).catch(()=>{})}
  if(errs.length)console.log(`${w}x${h} HATALAR:`,[...new Set(errs)].slice(0,4));await p.close()}
await b.close();console.log('toplam sorun',total);
