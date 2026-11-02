// ================= GİRDİ =================
const ray=new THREE.Raycaster(),ndc=new THREE.Vector2();let down=null,hoverT=0;
function pick(ev){const r=R.domElement.getBoundingClientRect();ndc.set((ev.clientX-r.left)/r.width*2-1,-(ev.clientY-r.top)/r.height*2+1);
  if(mode==='desk'){ray.setFromCamera(ndc,dcam);const hit=ray.intersectObjects(DESKP,true)[0];if(!hit)return null;let o=hit.object;while(o&&!o.userData.desk)o=o.parent;return o?{desk:o.userData.desk}:null}
  if(mode!=='interior'){ray.setFromCamera(ndc,cam);const list=Object.values(locGroups).concat(farmer,dog);if(regG)list.push(regG);if(lampPost.visible)list.push(lampPost);
    const hit=ray.intersectObjects(list,true)[0];if(!hit)return null;let o=hit.object;const res={};
    while(o){const u=o.userData;if(u.plot!=null&&res.plot==null)res.plot=u.plot;if(u.plotBuy)res.plotBuy=1;if(u.unit&&!res.unit)res.unit=u.unit;
      if(u.loc){res.loc=u.loc;break}if(u.region){res.region=u.region;break}if(u.farmer){res.farmer=1;break}if(u.open){res.open=u.open;break}o=o.parent}return res}
  if(!interior)return null;ray.setFromCamera(ndc,icam);const hit=ray.intersectObjects(interior.scene.children,true).find(h=>h.object.userData.act);return hit?{act:hit.object.userData.act,obj:hit.object}:null}
// ---- Sürükleyerek ekme / toplama ----
// Tarlalar'dayken parmağı parsellerin üzerinde gezdirince ilk parselin durumuna göre hepsi ekilir ya da toplanır.
let swipe=null;
function swipeKind(i){const f=S.fields[i];if(!f)return null;if(!f.job)return'plant';if(now()>=f.job.e)return'harvest';return null}
function swipeApply(i,x,y){if(!swipe||swipe.done.has(i))return;const f=S.fields[i];if(!f)return;swipe.done.add(i);
  if(swipe.kind==='plant'&&!f.job){if(plantPlot(i,S.lastCrop)){swipe.n++;floatXY(x,y,ITEMS[S.lastCrop].e);PLATFORM.hap()}}
  else if(swipe.kind==='harvest'&&f.job&&now()>=f.job.e){if(harvestPlot(i,x,y))swipe.n++}}
function swipeEnd(){if(!swipe)return;const s=swipe;swipe=null;ctl.enabled=mode!=='interior'&&mode!=='desk';if(s.n){if(s.kind==='harvest'&&s.n>=3)celebrate(s.n>=6?'Bereket yağdı!':'Bereketli!');commit()}}
// Çoklu parmak: iki parmakla yakınlaştırma/döndürme sırasında hiçbir parmak dokunma ya da sürükleyerek ekim sayılmaz
const ptrs=new Set();let multi=false;
R.domElement.addEventListener('pointerdown',e=>{ptrs.add(e.pointerId);if(ptrs.size>1){multi=true;down=null;if(swipe)swipeEnd();return}if(multi)return;down={x:e.clientX,y:e.clientY,lx:e.clientX};
  if(mode==='focus'&&focus==='tarla'){const h=pick(e);if(h&&h.plot!=null){const k=swipeKind(h.plot);if(k){swipe={kind:k,done:new Set(),n:0};ctl.enabled=false;swipeApply(h.plot,e.clientX,e.clientY-24);down.sw=1}}}});
addEventListener('pointerup',swipeEnd);addEventListener('pointercancel',swipeEnd);
for(const ev of['pointerup','pointercancel'])addEventListener(ev,e=>{ptrs.delete(e.pointerId);if(!ptrs.size)setTimeout(()=>{if(!ptrs.size)multi=false},0)});
R.domElement.addEventListener('pointerup',e=>{if(!down||multi)return;const wasSw=down.sw,moved=Math.hypot(e.clientX-down.x,e.clientY-down.y)>10;down=null;if(moved||wasSw)return;const h=pick(e),x=e.clientX,y=e.clientY-24;
  if(mode==='desk'){if(h&&h.desk){sfx('click');deskAction(h.desk)}return}
  if(mode==='interior'){if(!h)return;if(h.act==='collect'&&interior.key!=='kulube')collectUnit(interior.key,x,y);
    else if(h.act==='pet'){let o=h.obj;while(o.parent&&o.parent!==interior.scene)o=o.parent;o.userData.hop=1;sfx(UNIT_SFX[interior.key]||'pop');const pl=interior.scene.children.filter(c=>c.userData.act==='pet');petAnimal(interior.key,Math.max(0,pl.indexOf(o)),x,y)}return}
  if(!h)return;
  if(h.farmer){fWave=1.6;floatXY(x,y,['Merhaba!','Hayırlı işler!','Hav hav!','Bereketli olsun!'][Math.floor(Math.random()*4)]);return}
  if(h.open){openView(h.open);return}
  if(h.region){openRegion(h.region);return}
  if(!h.loc)return;
  if(mode==='focus'&&h.loc===focus){
    if(h.plot!=null){plotTap(h.plot,x,y);return}
    if(h.plotBuy){buyPlot();return}
    if(h.unit){const s=S.units[h.unit];if(s&&s.job&&now()>=s.job.e){collectUnit(h.unit,x,y);return}if(s&&INSIDE_UNITS[h.unit]){enterInterior(h.unit);return}}
    if(focus==='ev'){enterInterior('kulube');return}
    return}
  goLocation(h.loc)});
R.domElement.addEventListener('pointermove',e=>{if(swipe){const h=pick(e);if(h&&h.plot!=null)swipeApply(h.plot,e.clientX,e.clientY-24);return}
  if(mode==='desk'){const r=R.domElement.getBoundingClientRect();dPar.x=((e.clientX-r.left)/r.width-.5)*2;dPar.y=-((e.clientY-r.top)/r.height-.5)*2;if(down){const rg=deskPanRange();dcamX=Math.max(-rg,Math.min(rg,dcamX-(e.clientX-down.lx)*.012));down.lx=e.clientX;return}}
  if(down||now()-hoverT<60)return;hoverT=now();const h=pick(e);R.domElement.style.cursor=h&&(h.loc||h.region||h.farmer||h.open||h.act||h.desk)?'pointer':'';hoverLoc=mode!=='interior'&&h&&h.loc?h.loc:null;hoverDesk=mode==='desk'&&h&&h.desk?h.desk:null});
R.domElement.addEventListener('contextmenu',e=>e.preventDefault());
