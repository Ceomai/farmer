// Arka uç testleri: Firestore güvenlik kuralları + oyunun bulut modülü (kayıt, geri yükleme, çoklu cihaz, çevrimdışı, oturum, izin, sunucu hataları).
// Gerçek Firebase projesine DOKUNMAZ: yerel Firebase emülatöründe çalışır.
// Kullanım:  npm run test:backend
//   (= npx firebase emulators:exec --only auth,firestore --project demo-ciftlik "node scripts/backend-test.mjs")
// Gereken: Java 11+, firebase-tools (npx indirir). Oyunun derlenmiş hali: npm run build.
import {createRequire} from 'node:module';import path from 'node:path';
const require=createRequire(import.meta.url);const {chromium}=require('playwright');
const PROJ='demo-ciftlik',AUTH='http://127.0.0.1:9099',FSH='http://127.0.0.1:8085';
const FSU=`${FSH}/v1/projects/${PROJ}/databases/(default)/documents`;
let pass=0,fail=0;const ok=(c,m,extra='')=>{console.log((c?'✓ ':'✗ ')+m+(c?'':' '+extra));c?pass++:fail++};
const j=async r=>{try{return await r.json()}catch(e){return null}};
const signUp=async()=>{const r=await fetch(`${AUTH}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake`,{method:'POST',headers:{'content-type':'application/json'},body:'{"returnSecureToken":true}'});const d=await j(r);return d.idToken};
const req=(method,p,tok,body)=>fetch(FSU+p,{method,headers:{'content-type':'application/json',...(tok?{Authorization:'Bearer '+tok}:{})},body:body?JSON.stringify(body):undefined});
const admin=(method,p,body)=>fetch(FSU+p,{method,headers:{'content-type':'application/json',Authorization:'Bearer owner'},body:body?JSON.stringify(body):undefined});
const hex64=s=>[...Array(64)].map((_,i)=>'0123456789abcdef'[(s*7+i*13)%16]).join('');
const saveDoc=(json='{"coins":1}',level=1,extra={})=>({fields:{json:{stringValue:json},level:{integerValue:String(level)},updatedAt:{timestampValue:new Date().toISOString()},...extra}});
const commit=(tok,col,fields)=>fetch(FSU+':commit',{method:'POST',headers:{'content-type':'application/json',Authorization:'Bearer '+tok},body:JSON.stringify({writes:[{update:{name:`projects/${PROJ}/databases/(default)/documents/${col}/${Math.random().toString(36).slice(2,14)}`,fields}}]})});
const evF=(o={})=>({player:{stringValue:'p'},name:{stringValue:'test'},props:{stringValue:'{}'},level:{integerValue:'1'},platform:{stringValue:'web'},clientAt:{timestampValue:new Date().toISOString()},at:{timestampValue:new Date().toISOString()},...o});

// ---------------- 1) Güvenlik kuralları ----------------
console.log('\n— Firestore güvenlik kuralları');
const A=await signUp(),B=await signUp();ok(A&&B,'anonim oturum açılıyor (2 kullanıcı)');
const id=hex64(1);
ok((await req('PATCH','/saves/'+id,A,saveDoc())).ok,'kayıt oluşturma (geçerli belge)');
ok((await req('GET','/saves/'+id,B)).ok,'kodu bilen başka oturum kaydı okuyabilir (cihazlar arası kurtarma için tasarım gereği)');
ok((await req('GET','/saves/'+id,null)).status===403,'oturumsuz okuma reddediliyor');
ok((await req('GET','/saves',B)).status===403,'kayıtları listeleme reddediliyor (başkasının kaydı bulunamaz)');
ok((await req('DELETE','/saves/'+id,B)).status===403,'kayıt silme reddediliyor');
ok((await req('PATCH','/saves/'+hex64(2),A,saveDoc('{}',1,{admin:{booleanValue:true}}))).status===403,'beklenmeyen alan içeren kayıt reddediliyor');
ok((await req('PATCH','/saves/'+hex64(3),A,saveDoc('x'.repeat(900001)))).status===403,'900 KB üstü kayıt reddediliyor');
ok((await req('PATCH','/saves/'+hex64(4),A,{fields:{json:{stringValue:'{}'},level:{stringValue:'9'},updatedAt:{timestampValue:new Date().toISOString()}}})).status===403,'seviye sayı değilse reddediliyor');
ok((await req('PATCH','/saves/kisa',A,saveDoc())).status===403,'64 karakter olmayan belge adı reddediliyor');
ok((await req('PATCH','/saves/'+hex64(5),null,saveDoc())).status===403,'oturumsuz yazma reddediliyor');
ok((await commit(A,'events',evF())).ok,'olay kaydı ekleme (geçerli)');
ok((await commit(A,'events',evF({secret:{stringValue:'x'}}))).status===403,'olayda beklenmeyen alan reddediliyor');
ok((await commit(A,'events',evF({name:{stringValue:'n'.repeat(64)}}))).status===403,'64 karakterlik olay adı reddediliyor');
ok((await commit(A,'events',evF({props:{stringValue:'p'.repeat(1001)}}))).status===403,'1000 karakter üstü olay verisi reddediliyor');
ok((await req('GET','/events',A)).status===403,'olaylar istemciden okunamıyor');
ok((await commit(A,'errors',{player:{stringValue:'p'},error:{stringValue:'e'},at:{timestampValue:new Date().toISOString()}})).ok,'hata raporu ekleme (geçerli)');
ok((await commit(A,'errors',{player:{stringValue:'p'},error:{stringValue:'e'.repeat(4000)},at:{timestampValue:new Date().toISOString()}})).status===403,'4000 karakter üstü hata raporu reddediliyor');
ok((await req('GET','/errors',A)).status===403,'hata raporları istemciden okunamıyor');
ok((await commit(A,'purchases',{x:{stringValue:'1'}})).status===403,'satın alma kaydı istemciden yazılamıyor');
ok((await req('GET','/purchases',A)).status===403,'satın almalar istemciden okunamıyor');
ok((await commit(A,'users',{x:{stringValue:'1'}})).status===403,'tanımsız koleksiyona yazma reddediliyor');
ok((await req('GET','/users/x',A)).status===403,'tanımsız koleksiyondan okuma reddediliyor');
ok((await fetch(FSU+'/saves/'+id,{headers:{Authorization:'Bearer sahte.token.degeri'}})).status>=400,'sahte oturum belirteci kabul edilmiyor');

// ---------------- 2) Oyun + bulut entegrasyonu (tarayıcıda, emülatöre yönlendirilmiş) ----------------
console.log('\n— Oyunun bulut modülü (gerçek tarayıcıda, emülatöre yönlendirilmiş)');
const FILE='file://'+path.resolve('www/index.html');
const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
let NET='ok';// 'ok' | 'down' | 'err500' | 'garbage'
async function device(name){const ctx=await b.newContext({viewport:{width:390,height:844}});const p=await ctx.newPage();p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));
  await p.route(/googleapis\.com/,async route=>{if(NET==='down')return route.abort('internetdisconnected');const u=new URL(route.request().url());
    if(NET==='err500'&&u.host.startsWith('firestore'))return route.fulfill({status:500,body:'{"error":"x"}'});
    if(NET==='garbage'&&u.host.startsWith('firestore')&&route.request().method()==='GET')return route.fulfill({status:200,contentType:'application/json',body:'{"fields":{"json":{"stringValue":"{bozuk"}}}'});
    let t;if(u.host.startsWith('firestore'))t=FSH+u.pathname.replace('/projects/ciftlik-empire/','/projects/'+PROJ+'/')+u.search;else t=AUTH+'/'+u.host+u.pathname+u.search;
    const pd=route.request().postData();try{const resp=await route.fetch({url:t,...(pd?{postData:pd.split('projects/ciftlik-empire/').join('projects/'+PROJ+'/')}:{})});await route.fulfill({response:resp})}catch(e){await route.abort()}});
  await p.route(/^https?:\/\/(?!.*googleapis)/,r=>r.abort());
  await p.goto(FILE);await p.waitForFunction(()=>typeof S==='object'&&S&&!document.getElementById('boot'),null,{timeout:120000});p.name=name;return p}
const st=p=>p.evaluate(()=>({coins:S.coins,lv:S.lv,last:S.lastSeen,cloud:CLOUD.status,code:recoveryCode()}));
const D1=await device('telefon');
await D1.evaluate(()=>{document.querySelectorAll('.modal').forEach(m=>m.remove());S.consent={analytics:true,at:Date.now()};S.tut={done:1};S.coins=1234;S.lv=4;save()});
await D1.evaluate(()=>syncCloud(false));let s1=await st(D1);
ok(s1.cloud==='eşitlendi','ilk cihaz buluta kaydediyor',s1.cloud);
const docId=await D1.evaluate(()=>docIdOf(account()));const remote=await (await admin('GET','/saves/'+docId)).json();
ok(remote&&remote.fields&&JSON.parse(remote.fields.json.stringValue).coins===1234,'buluttaki kayıt oyundaki durumla aynı');
ok(remote&&remote.fields.level.integerValue==='4','buluttaki seviye alanı doğru');
await D1.evaluate(()=>{track('test_ev',{a:1});return flushEvents()});
const evs=await (await admin('GET','/events?pageSize=300')).json();ok(evs&&evs.documents&&evs.documents.some(d=>d.fields.name.stringValue==='test_ev'),'izin verilince analitik olayı gönderiliyor');
// ikinci cihaz: kurtarma koduyla geri yükleme
const D2=await device('tablet');await D2.evaluate(()=>{document.querySelectorAll('.modal').forEach(m=>m.remove())});
await D2.evaluate(c=>{const i=document.createElement('input');restoreAccount(c)},s1.code);await D2.waitForTimeout(1500);
await D2.waitForFunction(()=>typeof S==='object'&&S&&!document.getElementById('boot'),null,{timeout:120000});let s2=await st(D2);
ok(s2.coins===1234&&s2.code===s1.code,'ikinci cihaz kurtarma koduyla aynı çiftliği açıyor',JSON.stringify(s2));
ok((await D2.evaluate(()=>{restoreAccount('gecersiz-kod');return document.querySelector('.toast')?.textContent||''})).includes('geçersiz'),'geçersiz kurtarma kodu reddediliyor');
// çoklu cihaz çakışması: telefon ilerliyor, tablet (eski durumla) arka planda eşitliyor → ilerleme kaybolmamalı
await D1.evaluate(()=>{S.coins=9999;S.lv=7;S.stats.harvest_field=(S.stats.harvest_field||0)+5;save();return syncCloud(false)});
await D2.evaluate(()=>{CLOUD.last=0;return syncCloud(false)});
await D1.waitForTimeout(300);
const after=JSON.parse((await (await admin('GET','/saves/'+docId)).json()).fields.json.stringValue);
ok(after.coins===9999,'çoklu cihaz: eski cihazın eşitlemesi yeni ilerlemenin üzerine yazmıyor',`bulutta para=${after.coins} (beklenen 9999)`);
const s2b=await st(D2);ok(s2b.coins===9999,'çoklu cihaz: eski cihaz buluttaki yeni ilerlemeyi alıyor',`tablette para=${s2b.coins}`);
// ters yön: tablette daha çok oynanmışsa (ve bulut değişmişse) tabletin ilerlemesi korunur
await D2.evaluate(()=>{S.coins=7777;S.stats.harvest_field=(S.stats.harvest_field||0)+50;save()});await D1.evaluate(()=>{S.coins=1111;S.stats.sold=(S.stats.sold||0)+1;save();return syncCloud(false)});
await D2.evaluate(()=>syncCloud(false));const after2=JSON.parse((await (await admin('GET','/saves/'+docId)).json()).fields.json.stringValue);
ok(after2.coins===7777,'çoklu cihaz: daha çok oynanmış cihazın ilerlemesi kazanıyor',`bulutta para=${after2.coins}`);
await D1.evaluate(()=>{CLOUD.last=0;return syncCloud(false)});ok((await st(D1)).coins===7777,'çoklu cihaz: geride kalan cihaz güncel kaydı alıyor');
// çevrimdışı ve yeniden bağlanma
NET='down';await D1.evaluate(()=>{S.coins=5555;save();return syncCloud(false)});s1=await st(D1);ok(s1.cloud==='bağlantı yok','çevrimdışında bulut durumu "bağlantı yok", oyun çalışmaya devam ediyor',s1.cloud);
await D1.evaluate(()=>{plantAll();harvestAll()});ok(!D1.errs.length,'çevrimdışında oyun hatasız oynanıyor',D1.errs.join('|'));
NET='ok';await D1.evaluate(()=>syncCloud(false));const r2=JSON.parse((await (await admin('GET','/saves/'+docId)).json()).fields.json.stringValue);ok(r2.coins===(await st(D1)).coins,'bağlantı gelince çevrimdışı ilerleme buluta yazılıyor',`bulut ${r2.coins}`);
// sunucu hatası ve bozuk yanıt
NET='err500';await D1.evaluate(()=>syncCloud(true));ok((await st(D1)).cloud==='bağlantı yok'&&!D1.errs.length,'sunucu 500 dönünce oyun çökmüyor');
NET='garbage';await D1.evaluate(()=>syncCloud(true));ok(!D1.errs.length&&(await st(D1)).coins>0,'bozuk buluttaki kayıt oyunu bozmuyor');NET='ok';
// oturum süresi dolması → yenileme belirteciyle devam
await D1.evaluate(()=>{TOK.exp=0;return syncCloud(false)});ok((await st(D1)).cloud==='eşitlendi','oturum süresi dolunca yenileme belirteciyle devam ediyor');
await D1.evaluate(()=>{TOK={id:'x',refresh:'gecersiz',exp:0};return syncCloud(false)});ok((await st(D1)).cloud==='eşitlendi','yenileme belirteci geçersizse yeni anonim oturum açılıyor');
// izin kapalıyken analitik gönderilmiyor
const n0=((await (await admin('GET','/events?pageSize=300')).json()).documents||[]).length;
await D1.evaluate(()=>{S.consent={analytics:false};track('izinsiz',{});return flushEvents()});
const n1=((await (await admin('GET','/events?pageSize=300')).json()).documents||[]).length;ok(n1===n0,'izin kapalıyken analitik olayı gönderilmiyor');
ok(!D1.errs.length&&!D2.errs.length,'iki cihazda da sayfa hatası yok',[...D1.errs,...D2.errs].join('|'));
await b.close();
console.log(`\n${pass} geçti, ${fail} başarısız`);process.exit(fail?1:0);
