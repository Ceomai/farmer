// ================= DÜNYA =================
const world=new THREE.Scene();world.fog=new THREE.Fog(0xe2dcbc,90,200);
const cam=new THREE.PerspectiveCamera(36,1,.5,600);
const ctl=new THREE.OrbitControls(cam,R.domElement);ctl.enableDamping=true;ctl.dampingFactor=.09;ctl.screenSpacePanning=false;
ctl.minPolarAngle=.35;ctl.maxPolarAngle=1.15;ctl.rotateSpeed=.6;ctl.panSpeed=1.2;
ctl.mouseButtons={LEFT:THREE.MOUSE.PAN,MIDDLE:THREE.MOUSE.DOLLY,RIGHT:THREE.MOUSE.ROTATE};ctl.touches={ONE:THREE.TOUCH.PAN,TWO:THREE.TOUCH.DOLLY_ROTATE};
// Diorama haritası: alçak, sinematik maket açısı (kenarlarda tilt-shift bulanıklığı CSS ile)
const HUB_T=new V3(2,0,3),HUB_DIR=new V3(-.2,.44,.88).normalize();let HUB_D=innerWidth<700?66:50;
cam.position.copy(HUB_T).addScaledVector(HUB_DIR,HUB_D);ctl.target.copy(HUB_T);
function hubLimits(){ctl.enablePan=true;ctl.minDistance=24;ctl.maxDistance=90;ctl.minPolarAngle=.8;ctl.maxPolarAngle=1.22}
function focusLimits(){ctl.minPolarAngle=.35;ctl.maxPolarAngle=1.15}
hubLimits();
ctl.addEventListener('change',()=>{if(mode!=='hub')return;const t=ctl.target;const cx=Math.max(-32,Math.min(46,t.x)),cz=Math.max(-24,Math.min(24,t.z));if(cx!==t.x||cz!==t.z){cam.position.x+=cx-t.x;cam.position.z+=cz-t.z;t.x=cx;t.z=cz}});
const hemiL=new THREE.HemisphereLight(0xf3ead2,0x7d6a3a,.75);world.add(hemiL);
const sun=new THREE.DirectionalLight(0xffe6c0,1.25);sun.position.set(-30,48,26);sun.castShadow=true;sun.shadow.mapSize.set(GFX.shadowSize,GFX.shadowSize);sun.shadow.radius=3;
Object.assign(sun.shadow.camera,{left:-55,right:55,top:45,bottom:-45,near:1,far:160});sun.shadow.bias=-.0004;sun.shadow.normalBias=.04;world.add(sun);
const worldFx=[];let waterTex,lampPost,GROUND;
const inAnyRect=(x,z,m=0)=>Object.values(REG).some(r=>r.rect&&x>r.rect[0]-m&&x<r.rect[2]+m&&z>r.rect[1]-m&&z<r.rect[3]+m);
(function buildStatic(){
  const gr=GROUND=new THREE.Mesh(new THREE.PlaneGeometry(500,500),toonMat({map:TEX.grass()}));gr.rotation.x=-Math.PI/2;gr.receiveShadow=true;world.add(gr);
  const q=rng(42);
  // kıvrımlı dere, kumsal kıyılar, taşlar, nilüferler
  const RV=[[-140,-26],[-90,-23.5],[-50,-27.5],[-15,-23.8],[8,-25],[30,-27],[62,-23.6],[100,-26.5],[150,-24]];
  ribbon(world,RV,8.2,toonMat({color:0xd9c690,side:THREE.DoubleSide}),.03,.6);
  waterTex=TEX.water();waterTex.repeat.set(1,1);const wr=ribbon(world,RV,5.2,toonMat({map:waterTex,side:THREE.DoubleSide}),.06,.6,6);
  const rc=wr.userData.curve;for(let k=0;k<70;k++){const t=q(),p=rc.getPointAt(t),tg=rc.getTangentAt(t),sd=q()<.5?-1:1,o=3+q()*.8;P(world,'ico',[0x9b968a,0xb0a99a,0x8c8678][k%3],[.25+q()*.45,.18+q()*.2,.25+q()*.45],[p.x-tg.z*o*sd,.12,p.z+tg.x*o*sd])}
  for(let k=0;k<26;k++){const t=q(),p=rc.getPointAt(t),tg=rc.getTangentAt(t),o=(q()-.5)*3;const lp=G(world,[p.x-tg.z*o,.08,p.z+tg.x*o]);P(lp,'cyl',0x5f9a45,[.38,.04,.38]);if(k%3===0)P(lp,'lsph',0xf3b6c8,[.12,.08,.12],[.05,.07,0])}
  for(let k=0;k<40;k++){const t=q(),p=rc.getPointAt(t),tg=rc.getTangentAt(t),sd=q()<.5?-1:1,o=2.7+q()*.5;for(let m=0;m<3;m++)P(world,'cone',0x6f9a3e,[.05,.7+q()*.4,.05],[p.x-tg.z*o*sd+(q()-.5)*.3,.4,p.z+tg.x*o*sd+(q()-.5)*.3],[(q()-.5)*.3,0,(q()-.5)*.3])}
  const br=G(world,[8,0,-25]);P(br,'box',0x8a6038,[2.4,.18,7],[0,.55,0]);for(let k=0;k<9;k++)P(br,'box',0x6e4a2a,[2.5,.05,.14],[0,.66,-3.4+k*.85]);
  const rail=G(br,[0,.6,0]);for(const x of[-1.15,1.15])fenceRun(rail,x,-3.4,x,3.4,0x6e4a2a,.6);
  // kasaba yolu (hafif kıvrımlı) ve fenerler
  ribbon(world,[[-150,14.4],[-80,13.2],[-30,14.4],[0,13.6],[30,14.2],[80,13.2],[150,14]],3.8,dirtEdge(),.03,.5);
  ribbon(world,[[-150,14.4],[-80,13.2],[-30,14.4],[0,13.6],[30,14.2],[80,13.2],[150,14]],3,dirtMat(),.045,.5,3);
  for(let k=-3;k<=3;k++){if(k===0)continue;const x=k*13;if(Math.abs(x-19)<3)continue;const lp=G(world,[x,0,16]);P(lp,'cyl',0x3a3a40,[.06,2.4,.06],[0,1.2,0]);P(lp,'box',0xffe2a0,[.22,.28,.22],[0,2.45,0],null,{emissive:0xffc860,emissiveIntensity:.5})}
  // ördekli gölet
  const pd=G(world,[2.6,0,10]);const pw=new THREE.Mesh(new THREE.CircleGeometry(1,28),toonMat({map:TEX.water()}));pw.rotation.x=-Math.PI/2;pw.scale.set(2.2,1.6,1);pw.position.y=.06;pd.add(pw);
  for(let k=0;k<16;k++){const a=k/16*6.28;P(pd,'ico',[0x9b968a,0xb0a99a][k%2],[.32,.2,.3],[Math.cos(a)*2.35,.1,Math.sin(a)*1.75])}
  for(let k=0;k<7;k++){const a=2.4+k*.18;P(pd,'cone',0x6f9a3e,[.05,.9,.05],[Math.cos(a)*2,.45,Math.sin(a)*1.4]);if(k%2)P(pd,'cyl',0x6b4423,[.06,.25,.06],[Math.cos(a)*2,.95,Math.sin(a)*1.4])}
  const ducks=[];for(let k=0;k<2;k++){const d=G(pd);P(d,'sph',k?0xf6efe0:0xf5d24a,[.24,.18,.3],[0,.18,0]);const hd=G(d,[0,.38,.2]);d.userData.head=hd;movingParts(d);P(hd,'sph',k?0xf6efe0:0x3f7a4a,[.13,.13,.13]);P(hd,'box',0xf08a24,[.08,.04,.14],[0,-.02,.14]);P(hd,'lsph',0x111111,[.025,.025,.025],[.07,.04,.06]);P(hd,'lsph',0x111111,[.025,.025,.025],[-.07,.04,.06]);P(d,'box',k?0xf6efe0:0xf5d24a,[.06,.12,.12],[0,.3,-.26],[-.6,0,0]);ducks.push(d)}
  worldFx.push((dt,t)=>ducks.forEach((d,k)=>{const a=t*.35+k*3.1;d.position.set(Math.cos(a)*1.1,.02+Math.sin(t*3+k)*.02,Math.sin(a)*.75);d.rotation.y=-a;d.userData.head.rotation.x=Math.max(0,Math.sin(t*1.7+k*2))*.7}));
  // çevre: yama yama tarlalar ve çit sıraları
  const PATCH=[0xd9b44a,0x9cbf5a,0x86b04c,0xe6cf72,0xa8c46a];const plow=toonMat({map:canvasTex(64,64,(x,w,h)=>{x.fillStyle='#9a6a3c';x.fillRect(0,0,w,h);x.fillStyle='#7d5230';for(let i=0;i<w;i+=8)x.fillRect(0,i,w,4)},[4,4])});
  const quilt=(x0,z0,cols,rows,cw,ch,rot)=>{const qg=G(world,[x0,0,z0],rot);for(let i=0;i<cols;i++)for(let j=0;j<rows;j++){const x=(i-(cols-1)/2)*cw,z=(j-(rows-1)/2)*ch,c=q();
      const m=c<.22?F(qg,plow,[cw-.9,.05,ch-.9],[x,.03,z]):F(qg,PATCH[Math.floor(q()*PATCH.length)],[cw-.9,.05,ch-.9],[x,.03,z]);
      if(c>.85)for(let k=0;k<6;k++)oak(qg,x+(q()-.5)*(cw-3),z+(q()-.5)*(ch-3),.6+q()*.3)}
    for(let i=0;i<=cols;i++){const x=(i-cols/2)*cw;for(let k=0;k<rows*ch/1.6;k++)if(q()<.75)P(qg,'ico1',0x4f8a36,[.5,.42,.5],[x,.3,-rows*ch/2+k*1.6+.8])}
    for(let j=0;j<=rows;j++){const z=(j-rows/2)*ch;for(let k=0;k<cols*cw/1.6;k++)if(q()<.75)P(qg,'ico1',0x4f8a36,[.5,.42,.5],[-cols*cw/2+k*1.6+.8,.3,z])}};
  quilt(4,33,9,3,12,8,.04);quilt(-56,-2,3,4,9,10,-.06);quilt(66,-2,3,4,10,10,.08);
  const inQuilt=(x,z)=>(z>20&&z<46&&x>-52&&x<60)||(x<-40&&x>-72&&z>-22&&z<19)||(x>50&&x<82&&z>-22&&z<19);
  // orman kümeleri
  for(let c=0;c<26;c++){const cx=-110+q()*220,cz=-70+q()*125;if(inAnyRect(cx,cz,6)||inQuilt(cx,cz)||(cz>-33&&cz<-17)||(cz>10&&cz<19))continue;const pin=cz<-30||q()<.4;
    for(let k=0;k<9+q()*9;k++){const x=cx+(q()-.5)*14,z=cz+(q()-.5)*10;if(inAnyRect(x,z,1.5)||inQuilt(x,z)||(z>-31&&z<-19)||(z>11&&z<17.5))continue;const s=.8+q()*.8;pin?pine(world,x,z,s*1.2):oak(world,x,z,s)}}
  for(let k=0;k<60;k++){const x=-100+q()*200,z=-60+q()*110;if(inAnyRect(x,z,1.5)||inQuilt(x,z)||(z>-31&&z<-19)||(z>11&&z<24&&x>-20&&x<22)||(z>11.5&&z<16.5))continue;q()<.5?oak(world,x,z,.8+q()*.6):bush(world,x,z,1+q())}
  // uzak dağlar (katmanlı)
  const MT=[[0x9fb69a,-95],[0x8fa98e,-110],[0x7f9a88,-128]];MT.forEach(([c,z],i)=>{for(let k=0;k<9;k++){const x=-170+k*42+(q()-.5)*20,h=18+q()*16+i*6,r=16+q()*10;P(world,'cone6',c,[r,h,r*.7],[x,h/2-1,z+(q()-.5)*8]);if(i>0&&q()<.6)P(world,'cone6',0xf6f2e6,[r*.32,h*.32,r*.22],[x,h*.86-1,z+(q()-.5)*8+.5])}});
  // küçük ve seyrek bulutlar
  for(let k=0;k<4;k++){const c=G(world,[-160+k*95+q()*30,30+q()*6,-50+q()*70]);c.scale.setScalar(.5+q()*.25);for(let m=0;m<4;m++){const s=1.4+q()*1.4;const mm=new THREE.Mesh(GE.ico1,M(0xfdf8ec));mm.scale.set(s*1.4,s,s);mm.position.set(m*1.7-2.6,q()*.8,q()*1.2);outline(mm);c.add(mm)}
    const sp=.25+q()*.25;worldFx.push(dt=>{c.position.x+=dt*sp;if(c.position.x>190)c.position.x=-190})}
  for(let f=0;f<2;f++){const fl=G(world,[-80+f*70,18+f*4,-30+f*22]);const wings=[];for(let k=0;k<5;k++){const b=G(fl,[-Math.abs(k-2)*1.3,Math.sin(k)*.4,(k-2)*1.2]);P(b,'box',0x3a2a20,[.5,.12,.18]);
      for(const s of[-1,1]){const w2=G(b,[0,0,s*.08]);P(w2,'box',0x3a2a20,[.25,.04,.7],[0,0,s*.35]);wings.push([w2,s,k])}}
    const sp=3+f*1.5;worldFx.push((dt,t)=>{fl.position.x+=dt*sp;if(fl.position.x>100)fl.position.x=-100;wings.forEach(([w2,s,k])=>w2.rotation.x=s*Math.sin(t*9+k)*.7)})}
  // arka sokak feneri (gizli)
  lampPost=new THREE.Group();
  for(let k=0;k<2;k++){const pp=person({shirt:[0x9a3a22,0x3f6fa0][k],hat:k?'cap':'scarf',hatc:[0xf2b330,0x2a2a2a][k],dress:k?null:0x9a3a22});pp.scale.setScalar(1.25);world.add(pp);worldFx.push(walkPerson(pp,k?[[-26,14.2],[30,13.8]]:[[34,14.6],[-20,13.4]],1.2,4))}
  worldFx.push((dt,t)=>{for(const f of swayList)f(dt,t)});
})();

// --- arazi bölgeleri ve yollar ---
let regG=null,roadG=null,regFx=[],regSig='';
const HUBP=[-1,0,5.6];
function entrance(k){const L=LOC[k];return [L.p[0],L.p[2]+(L.kind==='fields'?7.2:L.kind==='race'?7.5:L.r*.95)]}
function road(par,x1,z1,x2,z2,w=1.5){const L0=Math.hypot(x2-x1,z2-z1);if(L0<.1)return;const mx=(x1+x2)/2,mz=(z1+z2)/2,bend=(((x1*7+z2*3)%5)/5-.5)*.28*L0,nx=-(z2-z1)/L0,nz=(x2-x1)/L0;
  const pts=[[x1,z1],[mx+nx*bend,mz+nz*bend],[x2,z2]];ribbon(par,pts,w+.5,dirtEdge(),.03);ribbon(par,pts,w,dirtMat(),.045);return}
function _roadOld(par,x1,z1,x2,z2,w=1.5){const L=Math.hypot(x2-x1,z2-z1);if(L<.1)return;F(par,0xcfb27e,[L+w*.4,.05,w],[(x1+x2)/2,.035,(z1+z2)/2],[0,-Math.atan2(z2-z1,x2-x1),0])}
function syncRegions(){const sig=Object.keys(S.regions).sort().join();if(sig===regSig)return;regSig=sig;
  if(regG){world.remove(regG);disposeScene(regG)}if(roadG){world.remove(roadG);disposeScene(roadG)}regG=G(world);roadG=G(world);
  for(const r in REG){const d=REG[r];if(!d.rect||owned(r))continue;const [x1,z1,x2,z2]=d.rect,cx=(x1+x2)/2,cz=(z1+z2)/2,w=x2-x1,dd=z2-z1;const g=G(regG,[cx,0,cz]);g.userData.region=r;
    F(g,0xb9bd88,[w-.4,.06,dd-.4],[0,.04,0]);const q=rng(r.charCodeAt(0)*97+w);
    for(let k=0;k<Math.round(w*dd/22);k++){const a=(q()-.5)*(w-2),b=(q()-.5)*(dd-2);q()<.5?bush(g,a,b,.7+q()*.5,0x7d9a52):P(g,'ico',0xa9a294,[.3+q()*.3,.2,.3+q()*.3],[a,.15,b])}
    const n=Math.round(w*dd/15);for(let k=0;k<n;k++){const a=(q()-.5)*(w-1.5),b=(q()-.5)*(dd-1.5),c=G(g,[a,.5+q()*.5,b]);const m=3+Math.floor(q()*3);
      for(let j=0;j<m;j++){const s=.8+q()*1;const mm=new THREE.Mesh(GE.ico1,M(0xf6f0e2));mm.scale.set(s*1.3,s*.7,s);mm.position.set((q()-.5)*2.6,q()*.6,(q()-.5)*2.2);outline(mm);c.add(mm)}
      const ph=q()*6,y0=c.position.y,x0=c.position.x;addFx(g,(dt,t)=>{c.position.y=y0+Math.sin(t*.55+ph)*.18;c.position.x=x0+Math.sin(t*.25+ph)*.35})}}
  regFx=[];regG.traverse(o=>{if(o.userData.fx)regFx.push(...o.userData.fx)});
  for(const k in LOC){const L=LOC[k];if(!owned(L.reg)||k==='ev')continue;const [ex,ez]=entrance(k);
    if(L.reg==='town'||L.reg==='bagyolu')road(roadG,ex,ez-2.6,ex,13.8,1.4);else road(roadG,HUBP[0],HUBP[2],ex,ez)}
  road(roadG,HUBP[0],HUBP[2],HUBP[0],13.8,1.8);
  buildPaths();batchWatch(regG);batchWatch(roadG);
}

// --- konumlar ---
const locGroups={},locSigs={};
function locSig(k){const L=LOC[k];if(!owned(L.reg))return'L';let s='';
  if(L.kind==='house')s+='h'+S.house+JSON.stringify(S.decor.farm);
  if(L.kind==='fields')s+=S.workers.fields?'W':'';
  (L.units||[]).forEach(u=>{if(S.workers[u])s+='W'+u});
  if(L.kind==='fields')s+='f'+S.fields.map(f=>f.job?f.job.r+stageOf(f.job):'_').join(',');
  (L.units||[]).forEach(u=>{const x=S.units[u];s+=u+(x?x.l+((u==='sera'||u==='bahce')&&x.job?x.job.r+stageOf(x.job):''):(S.lv>=B[u].lvl?'o':'x'))});
  return s}
function unitOffset(k,j){const L=LOC[k];return L.slots?L.slots[j]:[0,0]}
const unitScale=k=>LOC[k].slots&&LOC[k].kind!=='race'?1:1.25;
function unitWorld(u,y=0){const k=locOf(u),L=LOC[k],o=unitOffset(k,L.units.indexOf(u));return new V3(L.p[0]+o[0],y,L.p[2]+o[1])}
function plotOff(i){return [((i%3)-1)*4.2,(Math.floor(i/3)-1)*4.2]}
function plotWorld(i,y=0){const L=LOC.tarla,o=plotOff(i);return new V3(L.p[0]+o[0],y,L.p[2]+o[1])}
function breathe(g,host,ph,soft=true){g.userData.batchAnchor=1; // içindekiler bu grubun içinde birleştirilir; ezilme/nefes animasyonu korunur
addFx(host,(dt,tm)=>{if(RM()){g.userData.squash=0;host.scale.set(1,1,1);return} // hareketi azaltta nefes ve ezilme yok
  let sq=g.userData.squash||0;if(sq>0){sq=Math.max(0,sq-dt*1.8);g.userData.squash=sq}const b=(soft?Math.sin(tm*2.2+ph)*.014:0)+Math.sin((1-sq)*Math.PI*4)*sq*.16;host.scale.set(1-b*.55,1+b,1-b*.55)})}
function makeLoc(k){const L=LOC[k],g=G(null,L.p);g.userData.loc=k;if(!owned(L.reg))return g;
  switch(L.kind){
    case'house':{const hg=G(g);const h=house(S.house);h.scale.multiplyScalar(1.35);hg.add(h);breathe(g,hg,1);if(h.userData.chimney)addSmoke(h,h.userData.chimney,()=>true,hg);
      well(g,3.8,1.6);flowers(g,-3.2,2.6,1.6,3);flowers(g,2.6,3.2,1.2,9);bush(g,-3.4,-1.6,.9);bush(g,3.4,-1.8,.8);F(g,0xd8c8a2,[1.2,.05,2.6],[0,.03,3.4]);
      const mb=G(g,[1.2,0,4.3]);P(mb,'box',0x6e4a2a,[.08,.9,.08],[0,.45,0]);P(mb,'box',0x3f6fa0,[.3,.25,.45],[0,.95,0]);farmDecor(g);break}
    case'fields':{const h=6.5;fenceRun(g,-h,-h,h,-h);fenceRun(g,-h,-h,-h,h);fenceRun(g,h,-h,h,h);fenceRun(g,-h,h,-1.2,h);fenceRun(g,1.2,h,h,h);scarecrow(g,-7.4,6.6);if(S.workers.fields){const w=person({shirt:0x7a9a4a,hat:'straw'});g.add(w);addFx(g,walkPerson(w,[[-2.1,-2.1],[2.1,-2.1],[2.1,2.1],[-2.1,2.1]],1,1.5))}
      for(let i=0;i<9;i++){const [x,z]=plotOff(i);const pg=G(g,[x,0,z]);
        if(i<S.fields.length){pg.userData.plot=i;fieldBed(pg,S.fields[i]);if(popPlot===i){pg.userData.pop=0;popPlot=null}}
        else if(i===S.fields.length){pg.userData.plotBuy=1;P(pg,'box',0xa7c46a,[3.7,.08,3.7],[0,.04,0]);for(const [a,b] of[[-1.7,-1.7],[1.7,-1.7],[-1.7,1.7],[1.7,1.7]])P(pg,'box',0xc9a05a,[.08,.6,.08],[a,.35,b]);
          const s=G(pg,[0,0,.4]);P(s,'box',0x6e4a2a,[.08,1,.08],[0,.5,0]);const b=P(s,'box',0xf2b330,[.9,.55,.06],[0,1,0]);P(s,'box',0x2f6b3a,[.4,.1,.08],[0,1,.03]);P(s,'box',0x2f6b3a,[.1,.4,.08],[0,1,.03]);addFx(g,(dt,t)=>{b.rotation.z=Math.sin(t*2.4)*.1})}
        else{const q=rng(i*13);P(pg,'box',0x93a85a,[3.7,.06,3.7],[0,.03,0]).castShadow=false;for(let m=0;m<5;m++)P(pg,'cone',0x7d9a45,[.08,.4,.08],[(q()-.5)*3,.25,(q()-.5)*3])}}
      break}
    case'market':marketModel(g);break;
    case'orders':hanModel(g);break;
    case'race':raceTrack(g,S.units.hara);break;
    case'fair':fairModel(g);break;
  }
  (L.units||[]).forEach((u,j)=>{const o=unitOffset(k,j);const ug=G(g,[o[0],0,o[1]]);ug.userData.unit=u;const st=S.units[u];
    if(st){const sc=G(ug);sc.scale.setScalar(unitScale(k));const inner=G(sc);MODELS[u](inner,{b:u,...st});scaffold(ug,st);breathe(ug,inner,j*.9+k.length,!B[u].field);if(S.workers[u]){const w=person({shirt:0xc98a3a,hat:'cap',hatc:0x3f6fa0});w.position.set(1.9,0,2.1);ug.add(w);addFx(ug,idlePerson(w,j))}}else foundation(ug,S.lv<B[u].lvl)});
  if(k==='atolye'){F(g,stdTex(TEX.stone([6,3])),[17.5,.06,9.5],[0,.03,0]);for(const [x,z] of[[-8.8,4.4],[8.8,4.4]]){const lp=G(g,[x,0,z]);P(lp,'cyl',0x3a3a40,[.06,2.4,.06],[0,1.2,0]);P(lp,'box',0xffe2a0,[.22,.28,.22],[0,2.45,0],null,{emissive:0xffc860,emissiveIntensity:.5})}}
  return g}
function squash(k,u){const g=locGroups[k];if(!g)return;if(u){g.children.forEach(c=>{if(c.userData.unit===u)c.userData.squash=1})}else g.userData.squash=1}
function syncWorld(force){syncRegions();
  for(const k in LOC){const s=locSig(k);if(!force&&s===locSigs[k])continue;locSigs[k]=s;if(locGroups[k]){world.remove(locGroups[k]);disposeScene(locGroups[k])}
    const g=makeLoc(k);const fx=[];g.traverse(o=>{if(o.userData.fx)fx.push(...o.userData.fx)});g.userData.allFx=fx;locGroups[k]=g;world.add(g);batchWatch(g);if(popLoc===k){g.userData.pop=0;popLoc=null}}
  lampPost.visible=false;syncMarks()}

// --- çiftçi ve köpeği ---
function farmerModel(){const g=G(null);const skin=0xe8b48a;const legs=[],arms=[];
  for(const s of[-1,1]){const l=G(g,[s*.11,.52,0]);P(l,'box',0x3f5f8a,[.15,.5,.17],[0,-.25,0]);P(l,'box',0x3a2416,[.17,.09,.24],[0,-.5,.03]);legs.push(l)}
  P(g,'box',0x3f5f8a,[.4,.44,.26],[0,.74,0]);P(g,'box',0xe9e2cf,[.42,.22,.28],[0,1.0,0]);for(const s of[-1,1])P(g,'box',0x3f5f8a,[.06,.3,.03],[s*.12,.98,.14]);
  for(const s of[-1,1]){const a=G(g,[s*.27,1.06,0]);P(a,'box',0xe9e2cf,[.13,.44,.14],[0,-.21,0]);P(a,'sph',skin,[.075,.075,.075],[0,-.46,0]);arms.push(a)}
  const hd=G(g,[0,1.33,0]);P(hd,'sph',skin,[.21,.22,.21]);P(hd,'sph',0xd99a6a,[.06,.06,.06],[0,-.03,.21]);P(hd,'lsph',0x1a1a1a,[.03,.035,.03],[.08,.05,.18]);P(hd,'lsph',0x1a1a1a,[.03,.035,.03],[-.08,.05,.18]);
  P(hd,'box',0x8a5a32,[.22,.06,.05],[0,-.1,.19]);P(hd,'cyl',0xe2c46a,[.38,.03,.38],[0,.15,0]);P(hd,'cyl',0xe2c46a,[.18,.2,.18],[0,.26,0]);P(hd,'cyl',0xb5402c,[.185,.045,.185],[0,.19,0]);
  g.userData={legs,arms,head:hd,farmer:1};return g}
function dogModel(){const g=G(null);const c=0xb07a46;P(g,'box',c,[.26,.24,.55],[0,.34,0]);P(g,'box',0xf0e2c4,[.2,.12,.3],[0,.24,.08]);
  const h=G(g,[0,.5,.3]);P(h,'box',c,[.24,.22,.24]);P(h,'box',0xf0e2c4,[.14,.1,.14],[0,-.04,.15]);P(h,'lsph',0x1a1a1a,[.035,.03,.03],[0,0,.23]);for(const s of[-1,1]){P(h,'box',0x6e4424,[.07,.16,.09],[s*.12,.06,-.03],[0,0,s*.45]);P(h,'lsph',0x1a1a1a,[.025,.025,.025],[s*.06,.05,.12])}
  const tail=G(g,[0,.42,-.27]);P(tail,'box',c,[.06,.06,.24],[0,.06,-.1],[.7,0,0]);const legs=[];for(const [x,z] of[[.09,.19],[-.09,.19],[.09,-.19],[-.09,-.19]]){const l=G(g,[x,.24,z]);P(l,'box',c,[.08,.24,.08],[0,-.12,0]);legs.push(l)}
  g.userData={tail,head:h,legs,farmer:1};return g}
const farmer=farmerModel();farmer.scale.setScalar(1.35);world.add(farmer);const dog=dogModel();dog.scale.setScalar(1.25);world.add(dog);
farmer.position.set(HUBP[0],.07,HUBP[2]);dog.position.set(HUBP[0]+.8,.07,HUBP[2]+.4);
let fRoute=[],fWait=1,fWave=0;
function buildPaths(){fRoute=[]}
const lerpA=(a,b,k)=>{let d=b-a;d=Math.atan2(Math.sin(d),Math.cos(d));return a+d*k};
worldFx.push((dt,t)=>{const u=farmer.userData,fp=farmer.position;let walking=false;
  if(!fRoute.length){fWait-=dt;if(fWait<=0){const ks=Object.keys(LOC).filter(k=>owned(LOC[k].reg)&&k!=='ev'&&LOC[k].reg!=='town');const k=ks[Math.floor(Math.random()*ks.length)];
      if(k){const [ex,ez]=entrance(k);fRoute=[[ex,ez,1.5+Math.random()*2.5],[HUBP[0],HUBP[2],1+Math.random()*2]]}}}
  else{const [tx,tz]=fRoute[0],dx=tx-fp.x,dz=tz-fp.z,d=Math.hypot(dx,dz);if(d<.06){fWait=fRoute[0][2];fRoute.shift();if(fRoute.length)fRoute._hold=fWait}
    else if((fRoute._hold||0)>0)fRoute._hold-=dt;
    else{walking=true;const s=Math.min(d,1.9*dt);fp.x+=dx/d*s;fp.z+=dz/d*s;farmer.rotation.y=lerpA(farmer.rotation.y,Math.atan2(dx,dz),Math.min(1,dt*8))}}
  const sw=walking?Math.sin(t*9):0;u.legs[0].rotation.x=sw*.6;u.legs[1].rotation.x=-sw*.6;u.arms[0].rotation.x=-sw*.5;u.arms[1].rotation.x=sw*.5;fp.y=.07+(walking?Math.abs(Math.sin(t*9))*.08:0);
  if(fWave>0){fWave-=dt;u.arms[1].rotation.z=-2.4+Math.sin(t*14)*.35;u.arms[1].rotation.x=0}else u.arms[1].rotation.z=0;
  u.head.rotation.y=walking?0:Math.sin(t*.8)*.5;
  const du=dog.userData,dp=dog.position,ox=fp.x-Math.sin(farmer.rotation.y+.7)*1.1,oz=fp.z-Math.cos(farmer.rotation.y+.7)*1.1,ddx=ox-dp.x,ddz=oz-dp.z,dd=Math.hypot(ddx,ddz);let dw=false;
  if(dd>.15){dw=true;const s=Math.min(dd,(dd>1.5?3.4:2.2)*dt);dp.x+=ddx/dd*s;dp.z+=ddz/dd*s;dog.rotation.y=lerpA(dog.rotation.y,Math.atan2(ddx,ddz),Math.min(1,dt*9))}
  du.tail.rotation.y=Math.sin(t*(dw?16:9))*.7;const ds=dw?Math.sin(t*16):0;du.legs.forEach((l,k)=>l.rotation.x=(k%2?ds:-ds)*.6);dp.y=.07+(dw?Math.abs(ds)*.05:0);du.head.rotation.z=dw?0:Math.sin(t*1.3)*.15});
