// Mağaza görselleri: uygulama simgesi (assets/icon.png), özellik grafiği ve 1080x1920 ekran görüntüleri.
// Kullanım: npm run build && npm run screenshots
import {createRequire} from 'node:module';import path from 'node:path';import fs from 'node:fs';
const require=createRequire(import.meta.url);const {chromium}=require('playwright');
const file='file://'+path.resolve('www/index.html');
const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const demo=()=>{const now=Date.now();const d=new Date();localStorage.setItem('ci-gfx','high');localStorage.setItem('ciftlik-imparatorlugu-v3',JSON.stringify({coins:18450,xp:120,lv:11,rep:78,gems:24,
  items:{yem:40,bugday:22,misir:14,yumurta:16,sut:9,peynir:3,elma:12,bal:5,yun:6},house:3,regions:{baba:1,town:1,dere:1,kavak:1,yamac:1},
  units:{kumes:{l:2},silo:{l:2},ahir:{l:2},yemhane:{l:1},degirmen:{l:2,job:{r:'un',s:now,e:now+60000}},firin:{l:1},agil:{l:2},kovan:{l:1},mandira:{l:2},bahce:{l:1,job:{r:'elma',s:now-250000,e:now+60000}},besi:{l:1},sera:{l:1,job:{r:'domates',s:now-30000,e:now+30000}}},
  fields:[0,1,2,3,4,5].map(i=>({job:{r:['bugday','misir','domates','bugday','aycicegi','misir'][i],s:now-[30000,20000,80000,10000,100000,40000][i],e:now+[-1,25000,10000,9000,50000,-1][i]}})),fieldLv:2,lastCrop:'bugday',
  decor:{owned:{},house:{kilim:'kilim_mavi',masa:'semaver',duvar:'tablo_koy',kose:'saksi',tavan:'fener'},farm:{bahce1:'heykel',bahce2:'kusevi',giris:'kemer'}},
  stats:{welcomed:1},goal:8,lastSeen:now,consent:{analytics:false,at:now},daily:{day:d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate(),streak:3,login:true,bonus:false,tasks:[]},
  album:{kangal:1,altin_yumurta:1},love:{ahir:{v:85,t:now,pet:{}},kumes:{v:80,t:now,pet:{}}}}))};
const page=async(vp,dsf)=>{const p=await b.newPage({viewport:vp,deviceScaleFactor:dsf});await p.addInitScript(demo);await p.route(/^https?:/,r=>r.abort());await p.goto(file);
  await p.waitForFunction(()=>!document.getElementById('boot')&&typeof S==='object',null,{timeout:40000});
  await p.evaluate(()=>{document.querySelectorAll('.modal,.toast').forEach(m=>m.remove());const r=Date.now;let off=0;while(((r()+off)%DAY_MS)/DAY_MS<.4||((r()+off)%DAY_MS)/DAY_MS>.46)off+=DAY_MS/60;Date.now=()=>r()+off;S.weather={k:'sun',until:Date.now()+9e9}});return p};
const clean=p=>p.evaluate(()=>{document.querySelectorAll('.modal,.toast').forEach(m=>m.remove());sayB.hidden=true;sayT=Date.now()+1e9});
// 1) Ekran görüntüleri (360x640 @3x = 1080x1920)
const shots=[['01-masa',async p=>{}],['02-harita',async p=>{await p.evaluate(()=>enterWorld());await p.waitForFunction(()=>mode==='hub',null,{timeout:20000});await p.waitForTimeout(2500)}],
  ['03-tarlalar',async p=>{await p.evaluate(()=>{enterWorld(()=>goLocation('tarla'))});await p.waitForTimeout(2600)}],
  ['04-kumes',async p=>{await p.evaluate(()=>{enterWorld(()=>goLocation('kumes'))});await p.waitForFunction(()=>mode==='interior',null,{timeout:20000});await p.waitForTimeout(1500);await p.evaluate(()=>{view.mini=true;renderSheet()})}],
  ['05-ev',async p=>{await p.evaluate(()=>{enterWorld(()=>goLocation('ev'))});await p.waitForFunction(()=>mode==='interior',null,{timeout:20000});await p.waitForTimeout(1500);await p.evaluate(()=>{view.mini=true;renderSheet()})}],
  ['06-borsa',async p=>{await p.evaluate(()=>deskAction('borsa'));await p.waitForTimeout(600)}]];
const p=await page({width:360,height:640},3);
for(const [n,fn] of shots){await p.evaluate(()=>{document.querySelectorAll('.modal').forEach(m=>m.remove());if(mode!=='desk'){mode='desk';interior=null;view=null;setModeUI();renderSheet();syncMarks()}view=null;renderSheet()});await p.waitForTimeout(500);
  await fn(p);await clean(p);await p.waitForTimeout(900);await p.screenshot({path:`docs/store/screenshots/${n}.png`});console.log('ekran görüntüsü',n)}
// 2) Simge: oyunun çiftlik evi modeli, güneş ışınlı zemin
const icon=await p.evaluate(()=>{const S2=1024,tr=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});tr.setSize(S2,S2,false);tr.setPixelRatio(1);tr.outputEncoding=THREE.sRGBEncoding;tr.toneMapping=THREE.ACESFilmicToneMapping;tr.toneMappingExposure=1.1;
  OUT.uniforms.thick.value=.004;OUT.uniforms.jit.value=0;const sc=new THREE.Scene();sc.add(new THREE.HemisphereLight(0xfff0d6,0x7d6a3a,1));const dl=new THREE.DirectionalLight(0xffe6c0,1.2);dl.position.set(-4,8,6);sc.add(dl);
  const g=new THREE.Group();sc.add(g);const base=P(g,'cyl',0x7fbf4a,[3.1,.4,3.1],[0,-.2,0]);g.add(house(2));const ch=chicken(0xfaf6ee);ch.position.set(1.7,0,1.6);ch.rotation.y=-.6;ch.scale.setScalar(1.6);g.add(ch);oak(g,-2,-1.1,.85);bush(g,-1.6,1.7,.9);
  const c=new THREE.PerspectiveCamera(30,1,.1,100);c.position.set(5.6,6.2,8.4);c.lookAt(0,1.05,0);tr.render(sc,c);const cv=document.createElement('canvas');cv.width=cv.height=S2;const x=cv.getContext('2d');
  const gr=x.createRadialGradient(S2/2,S2*.45,40,S2/2,S2/2,S2*.75);gr.addColorStop(0,'#ffe9a3');gr.addColorStop(1,'#f2b330');x.fillStyle=gr;x.fillRect(0,0,S2,S2);
  x.save();x.translate(S2/2,S2*.47);for(let i=0;i<16;i++){x.rotate(Math.PI/8);x.fillStyle=i%2?'rgba(255,255,255,.18)':'rgba(196,73,46,.12)';x.beginPath();x.moveTo(0,0);x.lineTo(-90,-S2);x.lineTo(90,-S2);x.fill()}x.restore();
  x.drawImage(tr.domElement,0,20);tr.dispose();return cv.toDataURL('image/png')});
fs.writeFileSync('assets/icon.png',Buffer.from(icon.split(',')[1],'base64'));fs.writeFileSync('assets/icon-foreground.png',Buffer.from(icon.split(',')[1],'base64'));
// arka plan katmanı (Android uyarlanabilir simge)
const bg=await p.evaluate(()=>{const c=document.createElement('canvas');c.width=c.height=1024;const x=c.getContext('2d');x.fillStyle='#f2b330';x.fillRect(0,0,1024,1024);return c.toDataURL('image/png')});
fs.writeFileSync('assets/icon-background.png',Buffer.from(bg.split(',')[1],'base64'));
fs.writeFileSync('assets/splash.png',Buffer.from((await p.evaluate(()=>{const c=document.createElement('canvas');c.width=c.height=2732;const x=c.getContext('2d');x.fillStyle='#c4492e';x.fillRect(0,0,2732,2732);
  x.fillStyle='#ffd23f';x.strokeStyle='#2a1a10';x.lineWidth=18;x.font='170px "Alfa Slab One",Georgia,serif';x.textAlign='center';x.strokeText('Çiftlik',1366,1330);x.fillText('Çiftlik',1366,1330);x.strokeText('İmparatorluğu',1366,1530);x.fillText('İmparatorluğu',1366,1530);return c.toDataURL('image/png')})).split(',')[1],'base64'));
fs.copyFileSync('assets/splash.png','assets/splash-dark.png');console.log('simge ve açılış görseli');
await p.close();
// 3) Özellik grafiği 1024x500
const f=await page({width:1024,height:500},1);await f.evaluate(()=>enterWorld());await f.waitForFunction(()=>mode==='hub');await f.waitForTimeout(2500);
await f.evaluate(()=>{document.body.classList.add('photo');sayB.hidden=true;document.querySelectorAll('.photo-x,.shutter,.cam').forEach(e=>e.style.display='none');const d=document.createElement('div');d.style.cssText='position:fixed;left:40px;top:50%;transform:translateY(-50%) rotate(-3deg);z-index:50;background:#c4492e;border:4px solid #2a1a10;border-radius:22px;padding:14px 26px;box-shadow:7px 8px 0 #2a1a10;font:56px "Alfa Slab One",Georgia,serif;color:#ffd23f;-webkit-text-stroke:2px #2a1a10;line-height:1.05';d.innerHTML='Çiftlik<br>İmparatorluğu';document.body.appendChild(d)});
await f.waitForTimeout(800);await f.screenshot({path:'docs/store/feature-graphic.png'});console.log('özellik grafiği');await b.close();
