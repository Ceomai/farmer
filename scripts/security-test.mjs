// İstemci güvenlik testleri: dışarıdan gelen (ör. kurtarma koduyla yüklenen) kötü niyetli kayıt sayfada kod çalıştıramamalı,
// yerel depoda gereksiz gizli bilgi bulunmamalı, kaynakta gizli anahtar/hata ayıklama izi olmamalı.
// Kullanım: npm run build && node scripts/security-test.mjs
import {createRequire} from 'node:module';import path from 'node:path';import fs from 'node:fs';
const require=createRequire(import.meta.url);const {chromium}=require('playwright');
let pass=0,fail=0;const ok=(c,m,x='')=>{console.log((c?'✓ ':'✗ ')+m+(c?'':' '+x));c?pass++:fail++};
const FILE='file://'+path.resolve('www/index.html');const X='<img src=x onerror=alert(1)>';
const evil={coins:500,lv:9,house:2,regions:{baba:1,town:1,ova:1},units:{kumes:{l:1},hara:{l:1}},horses:[{n:X,spd:5,sta:5}],orders:[{who:X,items:{bugday:1},base:1,xp:1}],
  daily:{day:'x',streak:2,login:true,tasks:[{k:'sold',e:X,d:X,n:3,p:0,r:5,c:false}]},recent:{loc:'kumes',n:X,at:Date.now()},consent:{a:1},tut:{done:1},['<b>'+X]:1,decor:{owned:{[X]:1},house:{duvar:X},farm:{}}};
const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await b.newPage({viewport:{width:390,height:844}});
let dialog=false;p.on('dialog',d=>{dialog=true;d.dismiss()});const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.route(/^https?:/,r=>r.abort());
await p.addInitScript(s=>{if(window.name!=='x'){window.name='x';localStorage.setItem('ciftlik-imparatorlugu-v3',s)}},JSON.stringify(evil));
await p.goto(FILE);await p.waitForFunction(()=>typeof S==='object'&&S&&!document.getElementById('boot'),null,{timeout:120000});
await p.evaluate(async()=>{document.querySelectorAll('.modal').forEach(m=>m.remove());for(const v of[{k:'goals'},{k:'ledger'},{k:'ledger',tab:'f'},{k:'shop'},{k:'loc',loc:'hipo'},{k:'guide',tab:'items'}]){view=v;renderSheet()}farmerSay(true);enterWorld();await new Promise(r=>setTimeout(r,1500));goLocation('hipo');await new Promise(r=>setTimeout(r,800))});
await p.waitForTimeout(800);
ok(!dialog,'kötü niyetli kayıttaki betik çalışmıyor (XSS)');
ok(await p.evaluate(()=>document.querySelectorAll('[onerror],[onload]:not(body),script[src]').length===0),'sayfaya olay işleyicili öğe enjekte edilemiyor');
ok(await p.evaluate(()=>!JSON.stringify(S).match(/[<>]/)),'onarılmış kayıtta HTML işareti kalmıyor');
ok(!errs.length,'kötü niyetli kayıt oyunu çökertmiyor',errs.join('|'));
const ls=await p.evaluate(()=>Object.keys(localStorage));ok(ls.every(k=>/^(ciftlik-|ci-)/.test(k)),'yerel depoda yalnızca oyunun kendi anahtarları var',ls.join(','));
await b.close();
// kaynak taraması: gizli anahtar, özel anahtar, hata ayıklama
const src=fs.readdirSync('src/js').filter(f=>f.endsWith('.js')).map(f=>fs.readFileSync('src/js/'+f,'utf8')).join('\n');
ok(!/-----BEGIN (RSA |EC )?PRIVATE KEY-----|"private_key"|client_secret|sk_live_|AKIA[0-9A-Z]{16}/.test(src),'kaynakta özel anahtar / sunucu gizli anahtarı yok');
ok(!/\bdebugger\b/.test(src),'kaynakta debugger ifadesi yok');
ok(!/eval\(/.test(src.replace(/\/\/.*$/gm,'')),'oyun kodunda eval kullanılmıyor');
const html=fs.readFileSync('www/index.html','utf8');ok(!/sourceMappingURL=/.test(html),'yayın dosyasında kaynak haritası bağlantısı yok');
console.log(`\n${pass} geçti, ${fail} başarısız`);process.exit(fail?1:0);
