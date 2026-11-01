// ================= GÜNLÜK ÖDÜL, GÖREVLER, DÖNÜŞ =================
const todayStr=()=>{const d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()};
const LOGIN=[{c:100},{yem:20},{c:250},{g:2},{c:500},{yem:40,c:300},{g:6}];
const rewardTxt=r=>[r.c?'₺'+r.c:'',r.yem?'🌰'+r.yem:'',r.g?'🍀'+r.g:''].filter(Boolean).join(' ');
const DTASK=[{k:'plant',e:'🌱',d:'{n} kez tarlaya ekim yap',a:5,b:12,r:80},{k:'harvest_field',e:'🌾',d:'{n} parsel hasat et',a:4,b:10,r:90},{k:'harvest_kumes',e:'🥚',d:'Kümesten {n} kez yumurta topla',a:2,b:4,r:80,need:'kumes'},
  {k:'sold',e:'💰',d:'Pazarda {n} ürün sat',a:10,b:30,r:100},{k:'orders',e:'📜',d:'{n} sipariş teslim et',a:1,b:3,r:150},{k:'harvest_ahir',e:'🥛',d:'Ahırdan {n} kez süt al',a:1,b:3,r:150,need:'ahir'},
  {k:'mg',e:'🎮',d:'{n} mini oyun oyna',a:1,b:2,r:120,need:'kumes'},{k:'contest',e:'🎪',d:'Panayırda {n} yarışmaya katıl',a:1,b:1,r:150,need:'lv3'}];
function checkDaily(){const t=todayStr();if(S.daily&&S.daily.day===t)return false;const y=new Date(Date.now()-864e5),ys=y.getFullYear()+'-'+(y.getMonth()+1)+'-'+y.getDate();
  const streak=S.daily&&S.daily.day===ys?(S.daily.streak%7)+1:1;const pool=DTASK.filter(x=>!x.need||(x.need==='lv3'?S.lv>=3:S.units[x.need])).sort(()=>Math.random()-.5).slice(0,3);
  S.daily={day:t,streak,login:false,bonus:false,tasks:pool.map(x=>{const n=x.a+Math.floor(Math.random()*(x.b-x.a+1));return{k:x.k,e:x.e,d:x.d.replace('{n}',n),n,p:0,r:x.r,c:false}})};save();return true}
function showLogin(){const D=S.daily;if(!D||D.login||document.querySelector('.modal.login'))return;const d=document.createElement('div');d.className='modal login';
  d.innerHTML=`<div><h2 style="font-size:26px">Günlük ödül</h2><p class="note">Her gün uğra, ödül büyüsün! ${D.streak}. gün</p><div class="cal">${LOGIN.map((r,i)=>`<span class="${i+1<D.streak?'got':i+1===D.streak?'now':''}"><small>${i+1}. gün</small>${rewardTxt(r)}</span>`).join('')}</div><button class="btn big gold">Ödülü al</button></div>`;
  d.querySelector('button').onclick=()=>{const r=LOGIN[D.streak-1];if(r.c)gain(r.c,'Ödül');if(r.yem)S.items.yem=has('yem')+r.yem;if(r.g)S.gems+=r.g;D.login=true;sfx('win');flyCoins(6);d.remove();commit()};document.body.appendChild(d)}
function dailyHTML(){const D=S.daily;if(!D)return'';return `<div class="unit"><div class="uhead"><span>📅 Günlük görevler</span><span class="tm">🔥 ${D.streak}. gün</span></div>`+D.tasks.map((t,i)=>`<div class="job"><span class="big">${t.e}</span><span class="pw"><b style="font-size:13px">${t.d}</b><span class="pbar"><i style="width:${Math.min(100,t.p/t.n*100)}%;animation:none"></i></span><small>${Math.min(t.p,t.n)}/${t.n} · ₺${t.r}</small></span><button class="pill-btn gold" data-act="dclaim" data-i="${i}" ${t.p>=t.n&&!t.c?'':'disabled'}>${t.c?'✓':'Al'}</button></div>`).join('')
  +(D.tasks.every(t=>t.c)&&!D.bonus?`<button class="btn big gold" data-act="dbonus">Hepsi tamam! +🍀2</button>`:'')+'</div>'}
function countReady(){let n=S.fields.filter(f=>f.job&&now()>=f.job.e).length;for(const u in S.units){const s=S.units[u];if(s.job&&now()>=s.job.e)n++}return n}
function awaySummary(away){if(away<120000)return;const mins=Math.round(away/60000),ready=countReady();if(!ready&&!autoGain)return;const d=document.createElement('div');d.className='modal login';
  d.innerHTML=`<div><div class="badge">👋</div><h2 style="font-size:28px">Hoş geldin!</h2><p>${mins>=60?Math.floor(mins/60)+' saat':mins+' dakika'} yoktun.${autoGain?`<br>İşçilerin <b>${autoGain}</b> ürün topladı.`:''}${ready?`<br><b>${ready}</b> üretim toplanmayı bekliyor.`:''}</p><button class="btn big gold">Çiftliğe dön</button></div>`;
  d.querySelector('button').onclick=()=>d.remove();document.body.appendChild(d)}
let lastReady=0;
function notifyReady(){const rc=countReady();document.title=(rc?`(${rc}) `:'')+'Çiftlik İmparatorluğu';if(S.sound.notif&&document.hidden&&rc>lastReady){try{new Notification('Çiftlik İmparatorluğu',{body:`${rc} ürün toplanmayı bekliyor 🌾`})}catch(e){}}lastReady=rc}
function migrate(s){const d=fresh();for(const k in d)if(s[k]==null)s[k]=d[k];for(const k of['house','farm','owned'])if(!s.decor[k])s.decor[k]={};delete s.dark;delete s.rooster;return s}
