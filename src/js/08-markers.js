// ================= TABELALAR VE BALONCUKLAR =================
const marks=$('#marks');const MK={};
function markH(u){const k=locOf(u);return ({ahir:3.8,degirmen:4.4,silo:4,sera:3,hara:2.4,bahce:2.6,kovan:2,kumes:2.6}[u]||2.6)*unitScale(k)}
function locStatus(k){const L=LOC[k];let ready=0,run=0,idle=0,minLeft=Infinity,unbuilt=0,canBuild=0;
  if(L.kind==='market')return{c:'',t:'Al · Sat'};
  if(L.kind==='fair'){ensureContests();const n=S.contests.list.filter(id=>!S.contests.done[id]&&Object.entries(CONTESTS.find(x=>x.id===id).need).every(([kk,v])=>has(kk)>=v)).length;return n?{c:'ok',t:n+' yarışmaya katılabilirsin',n}:{c:'',t:''}}
  if(L.kind==='orders'){const r=readyOrders();return r?{c:'ok',t:r+' sipariş teslime hazır',n:r}:{c:'',t:''}}
  if(L.kind==='house'){const nx=HOUSE[S.house];return nx&&S.lv>=nx.lvl&&S.coins>=nx.cost?{c:'new',t:'Büyütülebilir'}:{c:'',t:HOUSE[S.house-1].n}}
  if(L.kind==='fields')S.fields.forEach(f=>{if(!f.job)idle++;else if(now()>=f.job.e)ready++;else{run++;minLeft=Math.min(minLeft,f.job.e-now())}});
  (L.units||[]).forEach(u=>{const s=S.units[u];if(!s){unbuilt++;if(S.lv>=B[u].lvl&&S.coins>=B[u].cost)canBuild++;return}if(!B[u].recipes)return;if(!s.job)idle++;else if(now()>=s.job.e)ready++;else{run++;minLeft=Math.min(minLeft,s.job.e-now())}});
  if(ready)return{c:'ok',t:ready+' hazır',n:ready};
  if(L.units&&unbuilt===L.units.length&&!L.kind){const u=L.units[0];return S.lv<B[u].lvl?{c:'lock',t:'Seviye '+B[u].lvl}:S.coins>=B[u].cost?{c:'new',t:'İnşa et ₺'+fmt(B[u].cost)}:{c:'',t:''}}
  if(idle)return{c:'idle',t:idle+' boşta'};
  if(run)return{c:'run',t:'⏱ '+secs(Math.ceil(minLeft/1000))};
  if(canBuild)return{c:'new',t:'Yeni bina kurulabilir'};
  if(k==='silo')return{c:'',t:'Ambar '+stored()+'/'+cap()};
  return{c:'',t:''}}
function wantMarks(){const w={};if(mode==='desk'){for(const k in deskObjs)w['D:'+k]=1;return w}
  if(mode==='hub'){}
  else if(mode==='focus'){const L=LOC[focus];if(!L)return w;if(L.kind==='fields')S.fields.forEach((f,i)=>{if(f.job)w['P:'+i]=1});(L.units||[]).forEach(u=>{const s=S.units[u];if(s&&s.job)w['U:'+u]=1})}
  return w}
function syncMarks(){const w=wantMarks();for(const k in MK)if(!w[k]){MK[k].el.remove();delete MK[k]}for(const k in w)if(!MK[k]){const el=document.createElement('div');el.className='mk';marks.appendChild(el);MK[k]={el,sig:''}}updateMarks()}
function bubble(m,em,pg,act,id){if(pg>=1){const h=`<button class="bub ready" data-act="${act}" data-id="${id}" aria-label="Topla">${em}</button>`;if(m.sig!==h){m.sig=h;m.el.innerHTML=h}}
  else if(m.sig==='p'+em)m.el.firstElementChild.style.setProperty('--p',(pg*100).toFixed(1)+'%');else{m.sig='p'+em;m.el.innerHTML=`<div class="prog" style="--p:${(pg*100).toFixed(1)}%"><span>${em}</span></div>`}}
function updateMarks(){for(const id in MK){const m=MK[id],[t,k]=id.split(':');
  if(t==='L'){const L=LOC[k],st=locStatus(k);m.pos=new V3(L.p[0]+L.s[0],.5,L.p[2]+L.s[1]);m.tag=k;
    const dot=st.c==='ok'?`<i class="s ok">${st.n||'✓'}</i>`:st.c==='new'?'<i class="s new">🔨</i>':st.c==='idle'?'<i class="s idle">💤</i>':'';
    const h=`<button class="tag" data-go="${k}" title="${st.t||L.n}"><span class="ti">${L.e}</span><b>${L.n}</b>${dot}</button>`;if(h!==m.sig){m.sig=h;m.el.innerHTML=h;m.w=0}}
  else if(t==='R'){const d=REG[k],[x1,z1,x2,z2]=d.rect;m.pos=new V3((x1+x2)/2,3,(z1+z2)/2);m.tag='R';
    const h=`<button class="tag lock" data-region="${k}"><span class="ti">🔒</span><span><b>${d.n}</b><small>₺${fmt(regCost(k))} · Sv ${d.lvl}</small></span></button>`;if(h!==m.sig){m.sig=h;m.el.innerHTML=h;m.w=0}}
  else if(t==='D'){const g=deskObjs[k];if(!g)continue;const an=DANCH[k]||[0,0,.4];g.updateMatrixWorld();const v=g.localToWorld(new V3(an[0],an[1],an[2]));m.pos=v;m.tag=k;m.below=1;const sd=an[3]==='side';const st=deskStatus(k),[ic,nm]=DNAMES[k];
    const h=`<button class="tag ${sd?'side':'below'} dk" data-desk="${k}"><span class="ti">${ic}</span><b>${nm}</b>${st?`<i class="s ${st.c}">${st.n}</i>`:''}</button>`;if(h!==m.sig){m.sig=h;m.el.innerHTML=h;m.w=0}}
  else if(t==='P'){const f=S.fields[+k];if(!f||!f.job)continue;m.pos=plotWorld(+k,1.7);bubble(m,ITEMS[f.job.r].e,prog(f.job),'harvestP',k)}
  else if(t==='U'){const s=S.units[k];if(!s||!s.job)continue;m.pos=unitWorld(k,markH(k));bubble(m,ITEMS[Object.keys(unitRecipe(k).out)[0]].e,prog(s.job),'collectU',k)}}}
const _v=new V3();
function placeMarks(){const W=R.domElement.clientWidth,H=R.domElement.clientHeight,tags=[];
  for(const k in MK){const m=MK[k];if(!m.pos)continue;_v.copy(m.pos).project(mode==='desk'?dcam:cam);const vis=_v.z<1&&mode!=='interior'&&Math.abs(_v.x)<1.15&&Math.abs(_v.y)<1.15;if(m._vis!==vis){m._vis=vis;m.el.style.display=vis?'':'none'}if(!vis)continue; // stil yalnızca değer değişince yazılır
    const x=(_v.x+1)/2*W,y=(1-_v.y)/2*H;if(m.tag){if(!m.w){const c=m.el.firstElementChild;m.w=c?c.offsetWidth:0;m.h=c?c.offsetHeight:0;m._hot=null}tags.push({m,x,y});const c=m.el.firstElementChild,hot=(mode==='desk'?hoverDesk:hoverLoc)===m.tag;if(c&&m._hot!==hot){m._hot=hot;c.classList.toggle('hot',hot)}continue}
    setTf(m.el,m,Math.round(x),Math.round(y))}
  tags.sort((a,b)=>b.y-a.y);const placed=[];
  if(tags.some(t=>t.m.below))tags.sort((a,b)=>a.y-b.y);
  for(const t of tags){let y=t.y;const dn=t.m.below?1:-1,gy=Math.max(t.m.h+8,40);for(let it=0;it<6;it++){const hit=placed.find(p=>Math.abs(p.x-t.x)<Math.max(p.w,44)/2+Math.max(t.m.w,44)/2+4&&Math.abs(p.y-y)<gy);if(!hit)break;y=hit.y+dn*gy}
    y=dn>0?Math.min(y,H-t.m.h-14):Math.max(y,t.m.h+14); // aralık 44 px dokunma alanına göre (etiketler ekran dışına itilmez)
    placed.push({x:t.x,y,w:t.m.w});setTf(t.m.el,t.m,Math.round(t.x),Math.round(y))}}
function setTf(el,m,x,y){if(m._x===x&&m._y===y)return;m._x=x;m._y=y;el.style.transform=`translate(${x}px,${y}px)`}
function screenOfW(p){_v.copy(p).project(cam);return{x:(_v.x+1)/2*R.domElement.clientWidth,y:(1-_v.y)/2*R.domElement.clientHeight-30}}
