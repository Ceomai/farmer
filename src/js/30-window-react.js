// ================= PENCERE TEPKİSİ =================
function markRecent(locKey,n){S.recent={loc:locKey,n,at:now()}}
const WIN_HOME={p:new V3(2,24,40),t:new V3(2,0,-4)};let winFocus=null,winLook=new V3(2,0,-4);
function stepWinCam(dt){const rc=S.recent;let tp=WIN_HOME.p,tt=WIN_HOME.t;
  if(rc&&now()-rc.at<60000&&LOC[rc.loc]){const L=LOC[rc.loc];tt=new V3(L.p[0],0,L.p[2]);tp=tt.clone().add(new V3(0,16,22));
    if(!rc.puffed&&mode==='desk'){rc.puffed=1;puff(new V3(L.p[0],1,L.p[2]),16,1.6)}}
  const k=Math.min(1,dt*1.2);winCam.position.lerp(tp,k);winLook.lerp(tt,k);winCam.lookAt(winLook)}
function scaffold(ug,st){if(!st.built||now()-st.built>9000)return;const g=G(ug);const c=0xc9a05a;for(const [x,z] of[[-1.7,-1.7],[1.7,-1.7],[-1.7,1.7],[1.7,1.7]])P(g,'box',c,[.1,3.2,.1],[x,1.6,z]);
  for(const y of[1.1,2.2])for(const [a,b,w2,d2] of[[0,-1.7,3.5,.1],[0,1.7,3.5,.1],[-1.7,0,.1,3.5],[1.7,0,.1,3.5]])P(g,'box',0x9a7247,[w2,.08,d2],[a,y,b]);
  const hm=G(g,[1.7,2.4,1.7]);P(hm,'box',0x6e4a2a,[.05,.4,.05],[0,.2,0]);P(hm,'box',0x707680,[.2,.1,.1],[0,.42,0]);
  addFx(ug,(dt,t)=>{const a=now()-st.built;g.visible=a<9000;if(a>7000)g.scale.setScalar(Math.max(.01,1-(a-7000)/2000));hm.rotation.z=Math.sin(t*14)*.7})}
