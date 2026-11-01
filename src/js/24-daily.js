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
// Kayıt onarımı: eski sürüm, yarım kalmış, elle bozulmuş ya da tanınmayan değer içeren her kayıt oyunu açılabilir hale getirilir.
// Bilinmeyen bina/ürün/tarif atılır, sayılar sınırlara çekilir, ileri tarihli işler (saat geri alınmışsa) makul süreye indirilir.
function migrate(s){const d=fresh();if(!s||typeof s!=='object'||Array.isArray(s))return d;
  const obj=v=>v&&typeof v==='object'&&!Array.isArray(v),num=(v,def,lo=-Infinity,hi=Infinity,int=false)=>{v=Number(v);if(!isFinite(v))v=def;v=Math.min(hi,Math.max(lo,v));return int?Math.floor(v):v};
  for(const k in d){if(s[k]==null)s[k]=d[k];else if(obj(d[k])&&!obj(s[k]))s[k]=d[k];else if(Array.isArray(d[k])&&!Array.isArray(s[k]))s[k]=d[k]}
  s.coins=num(s.coins,d.coins,0);s.gems=num(s.gems,d.gems,0,1e9,true);s.lv=num(s.lv,1,1,999,true);s.xp=num(s.xp,0,0);s.rep=num(s.rep,50,0,100);
  s.house=num(s.house,1,1,HOUSE.length,true);s.fieldLv=num(s.fieldLv,1,1,MAXL,true);s.goal=num(s.goal,0,0,GOALS.length,true);
  const items={};for(const k in s.items)if(ITEMS[k]){const v=num(s.items[k],0,0,1e9,true);if(v)items[k]=v}s.items=items;
  const rg={baba:1,town:1};for(const k in s.regions)if(REG[k]&&s.regions[k])rg[k]=1;s.regions=rg;
  const T=now(),fixJob=(j,sec)=>{if(!obj(j))return null;j.s=num(j.s,T);j.e=num(j.e,T);if(j.e>T+sec*1000*2){j.s=T;j.e=T+sec*1000}return j};
  const un={};for(const u in s.units){if(!B[u]||!obj(s.units[u]))continue;const x=s.units[u],o={l:num(x.l,1,1,MAXL,true)};const rs=B[u].recipes||[];
    if(x.job&&obj(x.job)){const r=rs.find(r=>r.id===x.job.r);if(r){o.job=fixJob(x.job,r.t)}}if(rs.find(r=>r.id===x.last))o.last=x.last;un[u]=o}s.units=un;
  s.fields=s.fields.slice(0,9).map(f=>{if(!obj(f))return{};if(f.job){const c=obj(f.job)&&cropOf(f.job.r);return c?{job:fixJob(f.job,c.t)}:{}}return{}});while(s.fields.length<2)s.fields.push({});
  if(!cropOf(s.lastCrop))s.lastCrop='bugday';if(!WEATHER[s.weather.k])s.weather={k:'sun',until:0};
  const wk={};for(const k in s.workers)if(k==='fields'||B[k]){const v=Number(s.workers[k]);wk[k]=v>1e12&&v<T+SHIFT*2?v:T+SHIFT}s.workers=wk;
  s.horses=s.horses.filter(obj).slice(0,4).map(h=>({n:typeof h.n==='string'&&h.n?h.n:'Rüzgar',spd:num(h.spd,5,1,20,true),sta:num(h.sta,5,1,20,true),w:num(h.w,0,0,1e6,true),rest:num(h.rest,0),train:num(h.train,0)}));
  s.league=obj(s.league)?s.league:d.league;s.league.tier=num(s.league.tier,0,0,TIERS.length-1,true);s.league.pts=num(s.league.pts,0,0,1e6,true);
  const okItems=o=>obj(o)&&Object.keys(o).length&&Object.keys(o).every(k=>ITEMS[k]&&num(o[k],0)>0);
  s.orders=s.orders.filter(o=>obj(o)&&okItems(o.items));s.contracts=s.contracts.filter(c=>obj(c)&&ITEMS[c.k]&&num(c.total,0)>0);
  if(s.daily!=null&&!(obj(s.daily)&&Array.isArray(s.daily.tasks)))s.daily=null;
  for(const k of['house','farm','owned'])if(!obj(s.decor[k]))s.decor[k]={};
  for(const k of['music','sfx','notif'])s.sound[k]=typeof s.sound[k]==='boolean'?s.sound[k]:d.sound[k];
  if(!obj(s.market.m))s.market.m={};if(!obj(s.market.h))s.market.h={};s.market.at=num(s.market.at,0);
  for(const k of['inc','exp'])if(!obj(s.fin[k]))s.fin[k]={};if(!Array.isArray(s.fin.hist))s.fin.hist=[];
  if(!obj(s.contests)||!Array.isArray(s.contests.list)||!obj(s.contests.done))s.contests=d.contests;
  for(const k of['love','friends'])if(s[k]!=null&&!obj(s[k]))delete s[k];
  if(s.tut!=null&&!obj(s.tut))s.tut={done:1};
  s.lastSeen=Math.min(num(s.lastSeen,Date.now()),Date.now());
  delete s.dark;delete s.rooster;return s}
