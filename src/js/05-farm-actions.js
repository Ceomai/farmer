// ================= ÇİFTLİK İŞLEMLERİ =================
let popLoc=null,popPlot=null;
function buildUnit(u){const d=B[u];if(S.units[u]||S.lv<d.lvl)return;if(S.coins<d.cost)return toast('Yeterli paran yok');
  pay(d.cost,'İnşaat');S.units[u]={l:1,built:now()};markRecent(locOf(u),B[u].n);sfx('build');puff(unitWorld(u,.4),14,1.3);addXP(Math.round(d.cost/50)+2);stat('built');popLoc=locOf(u);toast(`${d.n} kuruldu!`);commit()}
const upCost=u=>Math.round(B[u].cost*1.6*S.units[u].l);
function upgradeUnit(u){const s=S.units[u];if(!s||s.l>=MAXL||upBlock(s.l+1))return;const c=upCost(u);if(S.coins<c)return toast('Yeterli paran yok');
  pay(c,'İnşaat');s.l++;s.built=now();markRecent(locOf(u),B[u].n);sfx('build');if(mode!=='interior')puff(unitWorld(u,.5),12,1.2);addXP(Math.round(c/50));popLoc=locOf(u);toast(`${B[u].n} ${s.l}. seviyeye çıktı`);commit();if(interior&&interior.key===u)buildInterior(u)}
function upgradeHouse(){const h=HOUSE[S.house];if(!h||S.lv<h.lvl)return;if(S.coins<h.cost)return toast('Yeterli paran yok');pay(h.cost,'İnşaat');S.house++;markRecent('ev',HOUSE[S.house-1].n);sfx('build');addXP(Math.round(h.cost/40));popLoc='ev';toast(`${HOUSE[S.house-1].n} hazır!`);commit();if(interior&&interior.key==='kulube')buildInterior('kulube')}
function upgradeFields(){const c=FIELD_UP[S.fieldLv];if(c==null||S.fieldLv>=MAXL||upBlock(S.fieldLv+1))return;if(S.coins<c)return toast('Yeterli paran yok');pay(c,'İnşaat');S.fieldLv++;addXP(Math.round(c/50));popLoc='tarla';toast(`Tarlalar ${S.fieldLv}. seviyede`);commit()}
function startUnit(u,rid,quiet){const s=S.units[u];if(!s||s.job||!B[u].recipes)return;const r=B[u].recipes.find(x=>x.id===rid);if(!r||r.lvl>S.lv||(r.col&&!has1(r.col)))return;
  if(!canPay(r)){if(!quiet)toast('Malzeme ya da para eksik');return}pay(r.cost||0,'Üretim');for(const k in (r.in||{}))S.items[k]-=r.in[k];
  const sc=scaled(r,s.l),t=sc.t*(u==='mandira'&&has1('bakir_kazan')?.9:1);s.job={r:rid,s:now(),e:now()+t*1000};s.last=rid;stat('plant_'+rid);if(!quiet){sfx('plant');commit()}}
function giveOut(out,x,y,xp,quiet){const n=Object.values(out).reduce((a,b)=>a+b,0);if(stored()+n>cap()){if(!quiet)toast('Ambar dolu! Pazarda sat ya da siloyu büyüt.');return false}
  for(const k in out)S.items[k]=has(k)+out[k];addXP(xp);if(quiet){autoGain+=n;return true}sfx('pop');PLATFORM.hap();if(n>=6)celebrate();if(x!=null){floatXY(x,y,Object.entries(out).map(([k,v])=>`+${v} ${ITEMS[k].e}`).join('  ')+`  +${xp} xp`);flyItems(x,y,out)}return true}
function collectUnit(u,x,y,quiet){const s=S.units[u];if(!s||!s.job||now()<s.job.e)return false;const r=unitRecipe(u),sc=scaled(r,s.l),out={...sc.out};const cb=COL_BONUS[u];if(cb&&has1(cb)){const k0=Object.keys(out)[0];out[k0]+=1}if(loveBonus(u)){const k0=Object.keys(out)[0];out[k0]+=1}
  if(!quiet&&x==null){const p=screenOfW(unitWorld(u,markH(u)));x=p.x;y=p.y}
  if(!giveOut(out,x,y,Math.ceil(r.t/12)+1,quiet))return !quiet;stat('harvest_'+u);stat('make_'+r.id);s.job=null;tryDrop(u);if(quiet)return true;
  sfx(UNIT_SFX[u]);if(mode!=='interior')puff(unitWorld(u,1),8);if(locGroups[locOf(u)])squash(locOf(u),u);commit();return true}
function plantPlot(i,rid,quiet){const f=S.fields[i];if(!f||f.job)return false;const r=cropOf(rid);if(!r||cropLocked(r))return false;if(S.coins<r.cost){if(!quiet)toast('Tohum için paran yetmiyor');return false}
  pay(r.cost,'Tohum');const sc=scaled(r,S.fieldLv);f.job={r:rid,s:now(),e:now()+sc.t*1000};S.lastCrop=rid;stat('plant_'+rid);if(!quiet)sfx('plant');return true}
function harvestPlot(i,x,y,quiet){const f=S.fields[i];if(!f||!f.job||now()<f.job.e)return false;const r=cropOf(f.job.r),sc=scaled(r,S.fieldLv);
  if(!quiet&&x==null){const p=screenOfW(plotWorld(i,1.5));x=p.x;y=p.y}
  if(!giveOut(sc.out,x,y,Math.ceil(r.t/12)+1,quiet))return false;stat('harvest_field');stat('make_'+r.id);f.job=null;tryDrop('field');if(!quiet)puff(plotWorld(i,.6),6,.8);return true}
function plotTap(i,x,y){const f=S.fields[i];if(!f)return;if(f.job&&now()>=f.job.e){harvestPlot(i,x,y);commit()}else if(!f.job){if(plantPlot(i,S.lastCrop)){floatXY(x,y,ITEMS[S.lastCrop].e+' ekildi');commit()}}else toast(`${cropOf(f.job.r).n} büyüyor · ${secs(Math.ceil((f.job.e-now())/1000))}`)}
function plantAll(){let n=0;S.fields.forEach((f,i)=>{if(!f.job&&plantPlot(i,S.lastCrop))n++});if(n)toast(`${n} parsele ${cropOf(S.lastCrop).n} ekildi`);commit()}
function harvestAll(){let n=0;S.fields.forEach((f,i)=>{if(f.job&&now()>=f.job.e&&harvestPlot(i))n++});if(n>=3)celebrate(n>=6?'Bereket yağdı!':'Bereketli!');commit()}
function buyPlot(){const n=S.fields.length;if(n>=9)return;if(S.lv<PLOT_LV[n])return toast(`Yeni parsel için seviye ${PLOT_LV[n]} gerekli`);if(S.coins<PLOT_COST[n])return toast('Yeterli paran yok');
  pay(PLOT_COST[n],'Arazi');S.fields.push({});sfx('build');puff(plotWorld(n,.4),10);popPlot=n;addXP(Math.round(PLOT_COST[n]/40));toast('Yeni tarla parseli!');commit()}
function buyRegion(r){const d=REG[r];if(owned(r)||S.lv<d.lvl)return;if(S.coins<regCost(r))return toast('Yeterli paran yok');pay(regCost(r),'Arazi');S.regions[r]=1;{const lk=Object.keys(LOC).find(k=>LOC[k].reg===r);if(lk)markRecent(lk,REG[r].n+' arazisi')}sfx('whoosh');{const [x1,z1,x2,z2]=d.rect;puff(new V3((x1+x2)/2,1,(z1+z2)/2),18,3)}addXP(Math.round(d.cost/60));toast(`${d.n} artık senin!`);view=null;renderSheet();commit()}
