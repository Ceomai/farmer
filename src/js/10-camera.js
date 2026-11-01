// ================= KAMERA VE GEÇİŞLER =================
let fly=null,hubSaved=null,hoverLoc=null;
function flyCam(tt,tp){fly={t0:now(),ft:ctl.target.clone(),fp:cam.position.clone(),tt:tt.clone(),tp:tp.clone()}}
function rotateCam(a){const off=cam.position.clone().sub(ctl.target);fly={t0:now(),ft:ctl.target.clone(),fp:cam.position.clone(),tt:ctl.target.clone(),arc:a,off}}
function zoomCam(f){const off=cam.position.clone().sub(ctl.target);const d=Math.max(ctl.minDistance,Math.min(ctl.maxDistance,off.length()*f));flyCam(ctl.target,ctl.target.clone().add(off.setLength(d)))}
const Y=new V3(0,1,0);
function stepFly(){if(!fly)return;const k=S&&S.fastNav?1:Math.min(1,(now()-fly.t0)/420),e=k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2;ctl.target.lerpVectors(fly.ft,fly.tt,e);
  if(fly.arc){cam.position.copy(ctl.target).add(fly.off.clone().applyAxisAngle(Y,fly.arc*e))}else cam.position.lerpVectors(fly.fp,fly.tp,e);if(k>=1)fly=null}
const FOCUS_DIR=new V3(.16,.8,.58).normalize();
function goLocation(k){if(mode==='desk'){enterWorld(()=>goLocation(k));return}const L=LOC[k];if(!owned(L.reg)){openRegion(L.reg);return}
  if(mode==='interior'){fade(()=>{mode='hub';interior=null;ctl.enabled=true;ictl.enabled=false;goLocation(k)});return}
  if(mode==='hub')hubSaved={t:ctl.target.clone(),p:cam.position.clone()};
  if(locGroups[k]&&mode==='hub')locGroups[k].userData.pop=.55;
  mode='focus';focus=k;view={k:'loc',loc:k};setModeUI();renderSheet();
  const d=L.r*2.3+9;ctl.enablePan=false;ctl.minDistance=d*.55;ctl.maxDistance=d*1.5;
  const tt=new V3(L.p[0],0,L.p[2]);flyCam(tt,tt.clone().addScaledVector(FOCUS_DIR,d));syncMarks();
}
function toHub(){const go=()=>{mode='hub';focus=null;view=null;interior=null;ctl.enabled=true;ictl.enabled=false;hubLimits();setModeUI();renderSheet();syncMarks();
    const h=hubSaved||{t:HUB_T,p:HUB_T.clone().addScaledVector(HUB_DIR,HUB_D)};flyCam(h.t,h.p)};
  if(mode==='interior')fade(go);else go()}
function openRegion(r){if(!REG[r]||!REG[r].rect)return;if(mode==='desk'){enterWorld(()=>openRegion(r));return}if(mode!=='hub'){toHub()}view={k:'region',r};renderSheet();const d=REG[r],[x1,z1,x2,z2]=d.rect;const tt=new V3((x1+x2)/2,0,(z1+z2)/2);flyCam(tt,tt.clone().addScaledVector(HUB_DIR,Math.max(50,cam.position.distanceTo(ctl.target)*.8)))}
