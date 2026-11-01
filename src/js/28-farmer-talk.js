// ================= ÇİFTÇİ BALONCUĞU =================
const sayB=document.createElement('button');sayB.className='farmer-say';sayB.hidden=true;document.body.appendChild(sayB);let sayT=0,sayAct=null,sayKey='';
function farmerHints(){const H=[],idle=S.fields.filter(f=>!f.job).length,rf=S.fields.filter(f=>f.job&&now()>=f.job.e).length,ro=readyOrders(),wx=S.weather.k;
  if(rf)H.push(['tarla',`Tarlada ${rf} parsel hasada hazır, haydi toplayalım!`,()=>goLocation('tarla')]);
  for(const u in S.units){const s=S.units[u];if(s.job&&now()>=s.job.e&&B[u].recipes){H.push([u,`${B[u].n} hazır! ${UNIT_SFX[u]==='cluck'?'Tavuklar gıdaklıyor.':UNIT_SFX[u]==='moo'?'İnekler sesleniyor.':''}`,()=>goLocation(locOf(u))]);break}}
  if(ro)H.push(['han',`${ro} sipariş teslime hazır. Kasabalılar bekliyor!`,()=>mode==='desk'?deskAction('ledger'):goLocation('han')]);
  if(stored()/cap()>=.9)H.push(['ambar','Ambar dolmak üzere, pazara gidip biraz satalım.',()=>goLocation('pazar')]);
  if(idle&&wx==='rain')H.push(['yag','Yağmur yağıyor, ekim için tam zamanı!',()=>goLocation('tarla')]);else if(idle)H.push(['bos',`${idle} parsel boş duruyor. Bir şeyler ekelim mi?`,()=>goLocation('tarla')]);
  if(has('yem')<3&&S.units.kumes)H.push(['yem','Yem azaldı. Mısırdan öğütelim ya da pazardan alalım.',()=>goLocation('pazar')]);
  for(const u of LOVE_U)if(S.units[u]&&loveOf(u).v<40){H.push(['sev'+u,`${B[u].n} hayvanları biraz sevgi bekliyor.`,()=>{goLocation(locOf(u))}]);break}
  if(S.daily&&!S.daily.login)H.push(['gun','Günlük ödülün takvimde seni bekliyor!',()=>showLogin()]);
  const rc=S.recent;if(rc&&now()-rc.at<120000&&mode==='desk')H.unshift(['yeni',`Yeni ${rc.n} pencereden ne güzel görünüyor!`,null]);
  const amb=[['hava',wx==='storm'?'Fırtına var, hayvanları içeride tutalım.':wx==='snow'?'Kar yağıyor, sobayı yakmanın tam zamanı.':dayFactor()<.3?'Gece oldu, çiftlik uyuyor… ama işler beklemez!':'Güzel bir gün, çiftlik seni bekliyor!',null],
    ['mev',`${SEASONS[season()].n} geldi, ${['çiçekler açtı!','güneş yakıyor!','yapraklar sararıyor.','her yer bembeyaz.'][season()]}`,null]];
  return H.length?H:[amb[Math.floor(now()/20000)%2]]}
function farmerSay(force){if(tutStep()>=0){sayB.hidden=true;return}if(document.querySelector('.modal')||mode==='interior'||(view&&innerWidth<700)){sayB.hidden=true;return}
  if(!force&&now()-sayT<9000&&!sayB.hidden)return;const H=farmerHints();const h=H[Math.floor(now()/9000)%H.length];sayT=now();sayAct=h[2];
  if(h[0]!==sayKey||sayB.hidden){sayKey=h[0];sayB.innerHTML=`<span class="fs-face">👨‍🌾</span><span class="fs-t">${h[1]}</span>${h[2]?'<span class="fs-go">▸</span>':''}`;sayB.hidden=false;sayB.classList.remove('in');void sayB.offsetWidth;sayB.classList.add('in')}}
sayB.addEventListener('click',()=>{sfx('click');const a=sayAct;sayB.hidden=true;sayT=now();if(a)a()});
// Çiftçinin sözü artık haritanın ortasında değil: üst çubuğun hemen altında, sağa yaslı küçük bir bildirim.
// Masaüstünde panel açıksa panelin soluna kayar. Konum 4 kez/sn hesaplanır (her karede düzen ölçmemek için).
const hudEl=document.querySelector('.hud');let bubT=0;
function placeBubble(){if(sayB.hidden)return;const t=performance.now();if(t-bubT<250)return;bubT=t;
  const hb=hudEl.getBoundingClientRect().bottom;let right=12;
  if(!sheet.hidden&&innerWidth>=700){const r=sheet.getBoundingClientRect();if(r.top<hb+90)right=Math.max(12,innerWidth-r.left+12)}
  sayB.style.top=Math.round(hb+8)+'px';sayB.style.right=Math.round(right)+'px'}
