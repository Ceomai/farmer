// ================= PANAYIR =================
const lvOf=u=>S.units[u]?S.units[u].l:0;
const CONTESTS=[{id:'kabak',n:'En Büyük Kabak',e:'🎃',need:{kabak:1},sk:()=>S.fieldLv*12},{id:'peynir',n:'Peynir Yarışması',e:'🧀',need:{peynir:2},sk:()=>lvOf('mandira')*12},
  {id:'ekmek',n:'Ekmek Yarışması',e:'🍞',need:{ekmek:2},sk:()=>lvOf('firin')*12},{id:'inek',n:'En Güzel İnek',e:'🐄',need:{sut:5},sk:()=>lvOf('ahir')*13},{id:'bal',n:'Bal Tadımı',e:'🍯',need:{bal:3},sk:()=>lvOf('kovan')*12},
  {id:'yun',n:'Yün Eğirme',e:'🧶',need:{yun:4},sk:()=>lvOf('agil')*12},{id:'domates',n:'Domates Güzeli',e:'🍅',need:{domates:6},sk:()=>S.fieldLv*12},{id:'yumurta',n:'Yumurta Sepeti',e:'🥚',need:{yumurta:8},sk:()=>lvOf('kumes')*12},
  {id:'bugday',n:'Başak Demeti',e:'🌾',need:{bugday:10},sk:()=>S.fieldLv*12}];
function ensureContests(){const t=todayStr();if(S.contests.day===t&&S.contests.list.length)return;const pool=producible();const ok=CONTESTS.filter(c=>Object.keys(c.need).every(k=>pool.includes(k)));
  const list=ok.sort(()=>Math.random()-.5).slice(0,3).map(c=>c.id);const wk=typeof weeklyContest==='function'&&weeklyContest();if(wk&&!list.includes(wk)){list.pop();list.unshift(wk)}
  S.contests={day:t,list,done:{}}}
function enterContest(id){const c=CONTESTS.find(x=>x.id===id);if(!c||S.contests.done[id])return;for(const k in c.need)if(has(k)<c.need[k])return toast('Eksik ürün var');for(const k in c.need)S.items[k]-=c.need[k];
  const me=Math.round(c.sk()+25+Math.random()*45),opp=[0,1,2].map(()=>Math.round(30+Math.random()*45+S.lv*1.5));
  const all=[{n:'Sen',s:me,me:1},...opp.map((s,i)=>({n:['Hacer Hanım','Muhtar Cemil','Komşu Ali'][i],s}))].sort((a,b)=>b.s-a.s);const place=all.findIndex(x=>x.me)+1;
  const wx=typeof weeklyContest==='function'&&weeklyContest()===id?2:1;const prize=[null,{c:600,g:3},{c:250,g:1},{c:100,g:0},{c:0,g:0}][place];prize.c*=wx;prize.g*=wx;gain(prize.c,'Panayır');S.gems+=prize.g;addXP(place===1?60:20);
  if(place===1){stat('contest_win');S.rep=Math.min(100,S.rep+3);if(!S.album.kupa){S.album.kupa=1;S.rep=Math.min(100,S.rep+5);S.gems+=1;setTimeout(()=>showFind(COL.find(x=>x.id==='kupa')),700)}}
  S.contests.done[id]={place,all};stat('contest');sfx(place===1?'win':place<=3?'coin':'fail');if(prize.c)flyCoins(place===1?8:4);commit()}
function fairBody(){ensureContests();return S.contests.list.map(id=>{const c=CONTESTS.find(x=>x.id===id),r=S.contests.done[id];
  if(r)return `<div class="order"><div class="who">${c.e} ${c.n}<span>${['','🥇','🥈','🥉','🎗️'][r.place]} ${r.place}. oldun</span></div><div class="needs">${r.all.map((x,j)=>`<span class="need ${x.me?'':'miss'}" style="${x.me?'':'background:#efe5cf;color:var(--muted)'}">${j+1}. ${x.n} · ${x.s}</span>`).join('')}</div></div>`;
  const ok=Object.entries(c.need).every(([k,n])=>has(k)>=n),wk=typeof weeklyContest==='function'&&weeklyContest()===id;return `<div class="order${wk?' weekly':''}"><div class="who">${c.e} ${c.n}${wk?' <b class="wk">⭐ Haftanın yarışması · ödül ×2</b>':''}<span>🥇 ₺${wk?1200:600} + 🍀${wk?6:3}</span></div><div class="needs">${Object.entries(c.need).map(([k,n])=>`<span class="need ${has(k)<n?'miss':''}"><em>${ITEMS[k].e}</em>${Math.min(has(k),n)}/${n}</span>`).join('')}</div>
  <div class="urow"><button class="pill-btn gold" data-act="contest" data-id="${id}" ${ok?'':'disabled'}>🎪 Katıl</button><span class="tm">Bina seviyesi puanı artırır</span></div></div>`}).join('')||'<p class="note">Yarışmalara katılmak için önce ürün çeşitliliğini artır.</p>'}
