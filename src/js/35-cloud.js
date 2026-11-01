// ================= BULUT (Firebase): kayıt, sunucu saati, analitik, hata raporu =================
// Firebase Authentication (anonim) + Cloud Firestore REST arayüzleri kullanılır; ek SDK gerekmez.
// Güvenlik kuralları: firebase/firestore.rules. CONFIG.firebaseApiKey ya da firebaseProjectId boşsa bulut tamamen kapalıdır.
const CLOUD_ON=!!(CONFIG.firebaseApiKey&&CONFIG.firebaseProjectId);
const ID_KEY='ci-account',TOK_KEY='ci-fb-token';
// Kurtarma kodu = rastgele kimlik + gizli anahtar. Firestore'daki kayıt belgesinin adı bu kodun SHA-256 özetidir;
// kodu bilmeyen kayda ulaşamaz, kurallar listelemeyi yasaklar.
function account(){let a=null;try{a=JSON.parse(localStorage.getItem(ID_KEY)||'null')}catch(e){}
  if(!a){const rnd=n=>[...crypto.getRandomValues(new Uint8Array(n))].map(b=>b.toString(16).padStart(2,'0')).join('');a={id:crypto.randomUUID?crypto.randomUUID():rnd(16),secret:rnd(16)};try{localStorage.setItem(ID_KEY,JSON.stringify(a))}catch(e){}}return a}
async function sha256(t){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(t));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}
const docIdOf=a=>sha256(a.id+'.'+a.secret);
// ---- Anonim oturum (Firebase Auth REST) ----
let TOK=null;try{TOK=JSON.parse(localStorage.getItem(TOK_KEY)||'null')}catch(e){}
async function fbToken(){if(TOK&&TOK.exp>Date.now()+60000)return TOK.id;const key=CONFIG.firebaseApiKey;let r;
  if(TOK&&TOK.refresh)r=await fetch('https://securetoken.googleapis.com/v1/token?key='+key,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:'grant_type=refresh_token&refresh_token='+encodeURIComponent(TOK.refresh)});
  if(!r||!r.ok){r=await fetch('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key='+key,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({returnSecureToken:true})});if(!r.ok)throw new Error('auth '+r.status);const j=await r.json();TOK={id:j.idToken,refresh:j.refreshToken,exp:Date.now()+(+j.expiresIn||3600)*1000}}
  else{const j=await r.json();TOK={id:j.id_token,refresh:j.refresh_token,exp:Date.now()+(+j.expires_in||3600)*1000}}
  try{localStorage.setItem(TOK_KEY,JSON.stringify(TOK))}catch(e){}return TOK.id}
const FS=()=>`https://firestore.googleapis.com/v1/projects/${CONFIG.firebaseProjectId}/databases/(default)/documents`;
async function fs(method,path,body){if(!CLOUD_ON)throw new Error('bulut kapalı');const t0=Date.now();
  const r=await fetch(FS()+path,{method,headers:{'Content-Type':'application/json',Authorization:'Bearer '+await fbToken()},body:body?JSON.stringify(body):undefined});
  const dh=r.headers.get('date');if(dh){const srv=Date.parse(dh)+(Date.now()-t0)/2;if(!isNaN(srv))serverTime(srv)}
  if(r.status===404)return null;if(!r.ok)throw new Error('firestore '+r.status);return r.json()}
const fsStr=v=>({stringValue:String(v)}),fsInt=v=>({integerValue:String(Math.round(v||0))}),fsTime=t=>({timestampValue:new Date(t).toISOString()});
const randId=()=>[...crypto.getRandomValues(new Uint8Array(15))].map(b=>'abcdefghijklmnopqrstuvwxyz0123456789'[b%36]).join('');
// Sunucu saati: telefonun saati 2 dakikadan fazla saparsa oyun sunucu saatini kullanır (saat ileri alma hilesi)
function serverTime(srv){const off=srv-Date.now();if(Math.abs(off)>120000){if(Math.abs(off-TIME_OFF)>60000)track('clock_skew',{off:Math.round(off/1000)});TIME_OFF=off}else TIME_OFF=0}
const CLOUD={status:CLOUD_ON?'bekliyor':'kapalı',last:0};
async function loadRemote(a){const d=await fs('GET','/saves/'+await docIdOf(a));if(!d||!d.fields||!d.fields.json)return null;try{return JSON.parse(d.fields.json.stringValue)}catch(e){return null}}
async function syncCloud(pull){if(!CLOUD_ON||!S)return;const a=account();try{
    if(pull){const remote=await loadRemote(a);
      if(remote&&(remote.lastSeen||0)>(S.lastSeen||0)+5000){S=migrate(remote);try{localStorage.setItem(SAVE,JSON.stringify(S))}catch(e){}regSig='';syncWorld(true);renderHUD();buildDesk();toast('☁️ Buluttaki daha yeni kayıt yüklendi')}}
    await fs('PATCH','/saves/'+await docIdOf(a),{fields:{json:fsStr(JSON.stringify(S)),level:fsInt(S.lv),updatedAt:fsTime(Date.now())}});CLOUD.status='eşitlendi';CLOUD.last=Date.now()}catch(e){CLOUD.status='bağlantı yok'}}
async function restoreAccount(code){const m=String(code||'').trim().match(/^([0-9a-f-]{32,36})\.([0-9a-f]{32})$/i);if(!m)return toast('Kod geçersiz');if(!CLOUD_ON)return toast('Bulut kaydı bu sürümde kapalı');
  try{const remote=await loadRemote({id:m[1],secret:m[2]});if(!remote)return toast('Bu koda ait kayıt bulunamadı');
    localStorage.setItem(ID_KEY,JSON.stringify({id:m[1],secret:m[2]}));localStorage.setItem(SAVE,JSON.stringify(remote));toast('Kayıt geri yüklendi, oyun yeniden açılıyor');setTimeout(()=>location.reload(),900)}catch(e){toast('Bağlantı kurulamadı')}}
const recoveryCode=()=>{const a=account();return a.id+'.'+a.secret};
// ---- Analitik (izne bağlı) ----
const EVQ_KEY='ci-events';let EVQ=[];try{EVQ=JSON.parse(localStorage.getItem(EVQ_KEY)||'[]')}catch(e){}
function consentOk(){return S&&S.consent&&S.consent.analytics}
function track(name,props){if(!consentOk())return;EVQ.push({n:name,p:props||{},t:Date.now(),lv:S?S.lv:0,pl:PLAT});if(EVQ.length>200)EVQ=EVQ.slice(-200);try{localStorage.setItem(EVQ_KEY,JSON.stringify(EVQ))}catch(e){}}
let PLAYER='';docIdOf(account()).then(h=>{PLAYER=h.slice(0,16)}).catch(()=>{});
const evDoc=(col,f)=>({update:{name:`projects/${CONFIG.firebaseProjectId}/databases/(default)/documents/${col}/${randId()}`,fields:f}});
async function flushEvents(){if(!CLOUD_ON||!consentOk()||!EVQ.length||!PLAYER)return;const batch=EVQ.slice(0,100);try{
    await fs('POST',':commit',{writes:batch.map(e=>evDoc('events',{player:fsStr(PLAYER),name:fsStr(e.n),props:fsStr(JSON.stringify(e.p).slice(0,1000)),level:fsInt(e.lv),platform:fsStr(e.pl),clientAt:fsTime(e.t),at:{timestampValue:new Date(now()).toISOString()}}))});
    EVQ=EVQ.slice(batch.length);localStorage.setItem(EVQ_KEY,JSON.stringify(EVQ))}catch(e){}}
// ---- Hata raporu ----
let errCount=0;
function reportError(msg,stack){if(!consentOk()||errCount++>20)return;const e={m:String(msg).slice(0,500),s:String(stack||'').slice(0,2000),v:CONFIG.version,pl:PLAT,ua:navigator.userAgent.slice(0,200),mode:typeof mode!=='undefined'?mode:''};
  if(CLOUD_ON)fs('POST',':commit',{writes:[evDoc('errors',{player:fsStr(PLAYER||'?'),error:fsStr(JSON.stringify(e)),at:fsTime(now())})]}).catch(()=>{});else console.warn('[hata]',e)}
addEventListener('error',e=>reportError(e.message,e.error&&e.error.stack));
addEventListener('unhandledrejection',e=>reportError('promise: '+(e.reason&&e.reason.message||e.reason),e.reason&&e.reason.stack));
// ---- KVKK / izin ekranı (ilk açılış) ----
function askConsent(){if(S.consent)return;const d=document.createElement('div');d.className='modal login';
  d.innerHTML=`<div><div class="badge">🌾</div><h2 style="font-size:24px">Hoş geldin!</h2><p style="text-align:left;font-size:13px">Oyunu geliştirebilmek için <b>anonim</b> kullanım verisi (hangi bölümlerin oynandığı, hata raporları) toplamak istiyoruz. Adın, e-postan ya da konumun toplanmaz. ${NATIVE?'Ücretsiz sürümde isteğe bağlı ödüllü reklamlar gösterilir.':''}</p>
  <label class="switch" style="text-align:left"><input type="checkbox" id="cAn" checked><span><b>Anonim kullanım verisi ve hata raporu</b><br><span class="note">İstediğin zaman Ayarlar'dan değiştirebilirsin.</span></span></label>
  <p class="note" style="margin-top:8px"><a href="${CONFIG.privacyUrl}" target="_blank" rel="noopener">Gizlilik Politikası</a> · <a href="${CONFIG.termsUrl}" target="_blank" rel="noopener">Kullanım Koşulları</a></p><button class="btn big gold" style="margin-top:10px">Başlayalım</button></div>`;
  d.querySelector('button').onclick=()=>{S.consent={analytics:d.querySelector('#cAn').checked,at:Date.now()};save();d.remove();track('first_open',{w:innerWidth,h:innerHeight,gfx:GFX.mode});showLogin()};document.body.appendChild(d)}
function accountHTML(){return `<div class="uhead"><span>☁️ Hesap ve kayıt</span><span class="tm">${CLOUD.status}</span></div>
  ${CLOUD_ON?`<div class="job" style="padding:8px 10px"><span class="pw"><b>Kurtarma kodun</b><small style="word-break:break-all;font-family:monospace;user-select:all;-webkit-user-select:all">${recoveryCode()}</small><small>Bu kodu sakla. Yeni telefonda girince çiftliğin geri gelir.</small></span><button class="pill-btn" data-act="copyCode">📋</button></div>
  <div class="urow"><input id="rcode" placeholder="Kurtarma kodunu yapıştır" style="flex:1;min-width:0;border:2px solid var(--ink);border-radius:10px;padding:7px 9px;font:inherit;background:#fffaf0;user-select:text;-webkit-user-select:text"><button class="pill-btn gold" data-act="restore">Geri yükle</button></div>`
  :'<p class="note">Bulut kaydı bu sürümde kapalı; ilerleme yalnızca bu cihazda saklanıyor.</p>'}
  <label class="switch"><input type="checkbox" id="optAn" ${consentOk()?'checked':''}><span><b>Anonim kullanım verisi</b><br><span class="note">Oyunu iyileştirmek için hangi bölümlerin oynandığı ve hata raporları.</span></span></label>
  <p class="note"><a href="${CONFIG.privacyUrl}" target="_blank" rel="noopener">Gizlilik Politikası</a> · <a href="${CONFIG.termsUrl}" target="_blank" rel="noopener">Kullanım Koşulları</a> · Destek: ${CONFIG.supportEmail} · Sürüm ${CONFIG.version}</p>`}
setInterval(()=>{flushEvents();if(CLOUD_ON&&S&&Date.now()-CLOUD.last>60000)syncCloud(false)},30000);
