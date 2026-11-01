// ================= YARDIMCILAR =================
const $=s=>document.querySelector(s);
const fmt=n=>Math.floor(n).toLocaleString('tr-TR');
let TIME_OFF=0;const now=()=>Date.now()+TIME_OFF;
const has=k=>S.items[k]||0;
const stored=()=>Object.entries(S.items).reduce((a,[k,v])=>k==='at'?a:a+v,0); // taylar ambarda değil ahırda durur
const owned=r=>!!S.regions[r];
function cap(){return [80,160,260,400][S.house-1]+(S.units.silo?150*S.units.silo.l:0)}
const xpNeed=l=>Math.round(60*Math.pow(l,1.55));
const TRACKED=new Set(['built','orders','contracts','contest','race','mg','photo','sold','harvest_field','iap']);
const stat=(k,n=1)=>{S.stats[k]=(S.stats[k]||0)+n;if(TRACKED.has(k)&&typeof track==='function')track(k,{n});if(S.daily)for(const t of S.daily.tasks){if(t.k===k||(t.k==='plant'&&k.startsWith('plant_')&&CROPS.some(c=>'plant_'+c.id===k)))t.p+=n}};
const secs=s=>s>=3600?Math.floor(s/3600)+' sa'+(Math.floor(s%3600/60)?' '+Math.floor(s%3600/60)+' dk':''):s>=60?Math.floor(s/60)+' dk'+(s%60?' '+String(s%60).padStart(2,'0')+' sn':''):s+' sn';
// Seviye başına +%30 ürün ve %10 kısa süre (Sv5: 2,2 kat ürün, %60 süre). Yeni nesil bonusu (S.gen) tüm üretime eklenir.
function scaled(r,l){const g=1+0.1*((S&&S.gen)||0),out={};for(const k in r.out)out[k]=Math.max(1,Math.round(r.out[k]*(1+0.3*(l-1))*g));return {out,t:Math.round(r.t*Math.max(.6,1-0.1*(l-1))*(typeof projOn==='function'&&projOn('saat')?.95:1))}}
function canPay(r){if((r.cost||0)>S.coins)return false;for(const k in (r.in||{}))if(has(k)<r.in[k])return false;return true}
const prog=j=>Math.min(1,(now()-j.s)/(j.e-j.s));
const stageOf=j=>{const p=prog(j);return p<.34?1:p<.67?2:3};
const unitRecipe=u=>B[u].recipes.find(x=>x.id===S.units[u].job.r);
const secShort=s=>s<=0?'hazır':s<60?s+'sn':s<3600?Math.ceil(s/60)+'dk':s<86400?Math.floor(s/3600)+'sa'+(s%3600>=60?' '+Math.floor(s%3600/60)+'dk':''):Math.floor(s/86400)+'g';
// Mevsim ürünleri yalnızca kendi mevsiminde ekilir
const cropSeasonOk=c=>!c.season||c.season.includes(season());
const cropOf=id=>CROPS.find(c=>c.id===id);
function chips(obj,check,cls=''){return Object.entries(obj).map(([k,n])=>`<span class="chip ${cls} ${check&&has(k)<n?'miss':''}"><em>${ITEMS[k].e}</em>${n}${check?`<span style="opacity:.55;font-weight:800">/${has(k)}</span>`:''}</span>`).join('')}
function toast(msg){document.querySelectorAll('.toast').forEach(t=>t.remove());const t=document.createElement('div');t.className='toast';t.textContent=msg;document.body.appendChild(t);setTimeout(()=>t.remove(),2400)}
function floatXY(x,y,txt){const f=document.createElement('div');f.className='float';f.textContent=txt;f.style.left=x+'px';f.style.top=y+'px';document.body.appendChild(f);setTimeout(()=>f.remove(),1300)}
function finRoll(){const t=todayStr();if(!S.fin)S.fin={day:'',inc:{},exp:{},hist:[]};if(S.fin.day!==t){if(S.fin.day){const sm=o=>Object.values(o).reduce((a,b)=>a+b,0);S.fin.hist.push({d:S.fin.day,i:sm(S.fin.inc),e:sm(S.fin.exp)});S.fin.hist=S.fin.hist.slice(-7)}S.fin.day=t;S.fin.inc={};S.fin.exp={}}}
const pay=(n,c='Diğer')=>{S.coins-=n;if(n>0){finRoll();S.fin.exp[c]=(S.fin.exp[c]||0)+n}}, gain=(n,c='Diğer')=>{S.coins+=n;if(n>0){finRoll();S.fin.inc[c]=(S.fin.inc[c]||0)+n}};
function addXP(n){S.xp+=n;while(S.xp>=xpNeed(S.lv)){S.xp-=xpNeed(S.lv);S.lv++;levelUp()}}
function levelUp(){if(typeof track==='function')track('level_up',{lv:S.lv});
  const all=[...Object.values(B).filter(b=>b.lvl===S.lv).map(b=>b.n),...CROPS.filter(c=>c.lvl===S.lv).map(c=>c.n),...Object.values(REG).filter(z=>z.lvl===S.lv&&z.cost).map(z=>z.n+' arazisi')];
  S.gems+=2;sfx('level');const d=document.createElement('div');d.className='modal';
  d.innerHTML=`<div><div class="badge">${S.lv}</div><h2>Seviye atladın!</h2><p>${all.length?'Yeni açılanlar: <b>'+all.join(', ')+'</b>':'Çiftliğin büyüyor, böyle devam.'}<br>+2 🍀</p><button class="btn big gold">Harika</button></div>`;
  d.querySelector('button').onclick=()=>d.remove();document.body.appendChild(d);
}
