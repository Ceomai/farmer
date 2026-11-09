// ================= MİNİ OYUNLAR =================
function mgOpen(title,desc){const d=document.createElement('div');d.className='modal mg';d.innerHTML=`<div><h2 class="h-sm">${title}</h2><p class="note">${desc}</p><div class="mgb"></div><button class="btn ghost mgx" style="align-self:center">Vazgeç</button></div>`;
  document.body.appendChild(d);const o={d,body:d.querySelector('.mgb'),onClose:null};d.querySelector('.mgx').onclick=()=>{o.onClose&&o.onClose();d.remove()};return o}
function mgEnd(o,msg){o.onClose&&o.onClose();o.body.innerHTML=`<div class="mgface">🎉</div><p style="text-align:center;font-weight:900">${msg}</p><button class="btn big gold">Harika</button>`;o.body.querySelector('button').onclick=()=>o.d.remove();const x=o.d.querySelector('.mgx');if(x)x.remove()}
function mgMilk(u){const s=S.units[u];if(!s||!s.job||now()>=s.job.e||s.job.mg)return;const job=s.job;const o=mgOpen('🥛 Sağım ritmi','İbre yeşil bölgedeyken SAĞ! düğmesine bas. 6 deneme.');
  o.body.innerHTML=`<div class="mgbar"><i class="zone"></i><i class="needle"></i></div><div class="mgscore">0 / 6</div><button class="btn big gold mgbtn">SAĞ!</button>`;
  let pos=0,dir=1,sp=70,hits=0,tries=0,zone=40,raf,last=performance.now();const z=o.body.querySelector('.zone'),nd=o.body.querySelector('.needle'),sc=o.body.querySelector('.mgscore');
  const setZone=()=>{zone=10+Math.random()*68;z.style.left=zone+'%'};setZone();
  const loop=tm=>{if(!o.d.isConnected)return; // pencere kapandıysa döngü durur, ödül verilmez
    const dt=Math.min(.05,(tm-last)/1000);last=tm;pos+=dir*sp*dt;if(pos>100){pos=100;dir=-1}if(pos<0){pos=0;dir=1}nd.style.left=pos+'%';raf=requestAnimationFrame(loop)};raf=requestAnimationFrame(loop);o.onClose=()=>cancelAnimationFrame(raf);
  o.body.querySelector('.mgbtn').onclick=()=>{tries++;const ok=pos>=zone&&pos<=zone+18;if(ok){hits++;sfx('moo')}else sfx('fail');sc.textContent=hits+' / 6';sp+=14;setZone();
    if(tries>=6){const cut=Math.min(.5,hits*.08),live=s.job===job,left=live?job.e-now():0;if(live){job.e-=Math.max(0,left*cut);job.mg=1}const bonus=(hits>=5?1:0)+(has1('nazar')&&hits>=3?1:0);if(bonus)S.items.sut=has('sut')+bonus;stat('mg');mgEnd(o,`${hits} isabet! Süre %${Math.round(cut*100)} kısaldı${bonus?' · +'+bonus+' 🥛':''}`);commit()}}}
function mgEggs(){const s=S.units.kumes;if(!s||!s.job||now()>=s.job.e||s.job.mg)return;const job=s.job;const o=mgOpen('🥚 Yumurta yakala','Sepeti sürükle, düşen yumurtaları yakala! 15 saniye.');
  o.body.innerHTML=`<div class="mgfield"><span class="basket">🧺</span></div><div class="mgscore">0</div>`;const f=o.body.querySelector('.mgfield'),bk=f.querySelector('.basket'),sc=o.body.querySelector('.mgscore');
  let bx=50,got=0,gold=0,eggs=[],tEnd=performance.now()+15000,spawn=0,raf,last=performance.now();
  const mv=e=>{const r=f.getBoundingClientRect();bx=Math.max(6,Math.min(94,(e.clientX-r.left)/r.width*100))};f.addEventListener('pointermove',mv);f.addEventListener('pointerdown',mv);
  const loop=tm=>{if(!o.d.isConnected)return; // pencere kapandıysa döngü durur, ödül verilmez
    const dt=Math.min(.05,(tm-last)/1000);last=tm;spawn-=dt;if(spawn<=0){spawn=.4+Math.random()*.4;const el=document.createElement('span'),g=Math.random()<.06;el.className='egg';el.textContent=g?'🌟':'🥚';const x=6+Math.random()*88;el.style.left=x+'%';f.appendChild(el);eggs.push({el,x,y:-10,v:30+Math.random()*28,g})}
    bk.style.left=bx+'%';for(const e of eggs){e.y+=e.v*dt;e.el.style.top=e.y+'%';if(!e.done&&e.y>80&&e.y<96&&Math.abs(e.x-bx)<10){e.done=1;e.el.remove();e.g?gold++:got++;sfx('pop');sc.textContent=got+(gold?' · 🌟'+gold:'')}else if(!e.done&&e.y>102){e.done=1;e.el.remove()}}eggs=eggs.filter(e=>!e.done);
    if(tm<tEnd){raf=requestAnimationFrame(loop);return}const bonus=Math.min(6,Math.floor(got/4)+(has1('nazar')?1:0));S.items.yumurta=has('yumurta')+bonus;if(s.job===job)job.mg=1;
    if(gold&&!S.album.altin_yumurta&&Math.random()<.5){S.album.altin_yumurta=1;S.gems+=1;setTimeout(()=>showFind(COL[0]),400)}stat('mg');mgEnd(o,`${got} yumurta yakaladın! +${bonus} 🥚`);commit()};
  raf=requestAnimationFrame(loop);o.onClose=()=>cancelAnimationFrame(raf)}
function mgHaggle(){if(now()<(S.haggleAt||0))return toast('Tüccar biraz dinleniyor, birazdan gel');const inv=Object.keys(ITEMS).filter(k=>has(k)>0&&k!=='at'&&k!=='yem');if(!inv.length)return toast('Satacak ürünün yok');
  const k=inv.sort((a,b)=>ITEMS[b].p*has(b)-ITEMS[a].p*has(a))[0],qty=Math.min(has(k),5),base=sellPrice(k);const o=mgOpen('🤝 Pazarlık',`Tüccar ${qty} ${ITEMS[k].e} ${ITEMS[k].n} için tanesine ₺${base} veriyor.`);let pat=3;
  const draw=msg=>{o.body.innerHTML=`<div class="mgface">🧔</div><p class="note" style="text-align:center">${msg}</p><div class="urow center">${[[1.15,'+%15'],[1.3,'+%30'],[1.6,'+%60']].map(([m,l])=>`<button class="pill-btn gold" data-m="${m}">${l} · ₺${Math.round(base*m)}</button>`).join('')}</div>
    <div class="urow center" style="margin-top:8px"><button class="pill-btn" data-m="1">Kabul et · ₺${base}</button></div><div class="mgscore">Sabır ${'😐'.repeat(pat)}</div>`;
    o.body.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>{const m=+b.dataset.m,acc=m===1?1:Math.max(.1,1-(m-1)*1.5-(3-pat)*.1+(has1('nazar')?.1:0));
      if(Math.random()<acc){const n=Math.min(qty,has(k));S.items[k]-=n;addSat(k,n);const earn=Math.round(base*m)*n;gain(earn,'Pazar');stat('sold',n);stat('mg');S.haggleAt=now()+180000;sfx('coin');flyCoins(6);mgEnd(o,`Anlaştınız! ${n} ${ITEMS[k].n} → +₺${fmt(earn)}`);commit()}
      else{pat--;sfx('fail');if(pat<=0){S.haggleAt=now()+180000;stat('mg');mgEnd(o,'Tüccar sinirlendi ve gitti 😤');save()}else draw(['','"Son teklifim bu!"','"Biraz in bakalım…"'][pat])}})};draw('Teklifini seç:')}
