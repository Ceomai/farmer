// ================= İÇ MEKÂN =================
let mode='desk',focus=null,interior=null;
const icam=new THREE.PerspectiveCamera(42,1,.1,200);
const ictl=new THREE.OrbitControls(icam,R.domElement);ictl.enabled=false;ictl.enablePan=false;ictl.enableDamping=true;ictl.minDistance=7;ictl.maxDistance=18;ictl.minPolarAngle=.75;ictl.maxPolarAngle=1.4;ictl.minAzimuthAngle=-.75;ictl.maxAzimuthAngle=.75;ictl.rotateSpeed=.5;
ictl.mouseButtons={LEFT:THREE.MOUSE.ROTATE,MIDDLE:THREE.MOUSE.DOLLY,RIGHT:THREE.MOUSE.ROTATE};ictl.touches={ONE:THREE.TOUCH.ROTATE,TWO:THREE.TOUCH.DOLLY_ROTATE};
function room(sc,floorMat,wallMat){
  P(sc,'box',floorMat,[14,.3,10],[0,-.15,0]).castShadow=false;
  P(sc,'box',wallMat,[14.6,5.6,.3],[0,2.8,-5.15]);P(sc,'box',wallMat,[.3,5.6,10.3],[-7.15,2.8,0]);P(sc,'box',wallMat,[.3,5.6,10.3],[7.15,2.8,0]);
  for(let x=-6;x<=6;x+=3)P(sc,'box',0x4f3119,[.32,.36,10.4],[x,5.5,0]);P(sc,'box',0x4f3119,[14.6,.4,.4],[0,5.6,4.95]);for(const x of[-6.95,6.95])P(sc,'box',0x4f3119,[.4,5.6,.4],[x,2.8,4.95]);
  P(sc,'box',0x4f3119,[14.3,.3,.15],[0,.15,-4.98]);
  const g=G(sc,[3.6,3.3,-4.98]);P(g,'box',0x4f3119,[2.1,1.7,.12]);P(g,'box',0xbfe6ff,[1.8,1.4,.14],[0,0,.01],null,{emissive:0xffe4a8,emissiveIntensity:.9});P(g,'box',0x4f3119,[.08,1.4,.18]);P(g,'box',0x4f3119,[1.8,.08,.18]);
  sc.add(new THREE.HemisphereLight(0xfff0d6,0x5a4030,.7));
  const d=new THREE.DirectionalLight(0xffe2b0,1.1);d.position.set(5,12,9);d.castShadow=true;d.shadow.mapSize.set(2048,2048);Object.assign(d.shadow.camera,{left:-10,right:10,top:10,bottom:-10});d.shadow.bias=-.0005;d.shadow.normalBias=.03;sc.add(d);
  const sl=new THREE.SpotLight(0xffe7b8,.9,22,.6,.6);sl.position.set(3.6,3.6,-4.5);sl.target.position.set(2,0,1);sc.add(sl);sc.add(sl.target);
  const dust=[];const dm=new THREE.MeshBasicMaterial({color:0xfff2c8,transparent:true,opacity:.5});for(let k=0;k<26;k++){const m=new THREE.Mesh(GE.lsph,dm);m.scale.setScalar(.025);m.position.set(1+Math.random()*5,Math.random()*4.5,-4+Math.random()*7);sc.add(m);dust.push(m)}
  return (dt,t)=>dust.forEach((m,k)=>{m.position.y+=Math.sin(t*.5+k)*.002;m.position.x+=Math.cos(t*.3+k)*.002})}
function hayBale(sc,x,z,y=0,ry=0){const g=G(sc,[x,y,z],ry);P(g,'box',stdTex(TEX.straw([1,1])),[1.2,.6,.7],[0,.3,0]);for(const s of[-.3,.3])P(g,'box',0x8a5a2a,[.04,.62,.72],[s,.3,0]);return g}
function stallDivider(sc,x,z1,z2){P(sc,'box',0x6e4a2a,[.16,1.4,z2-z1],[x,.7,(z1+z2)/2]);P(sc,'box',0x5a3a20,[.2,.12,z2-z1+.1],[x,1.42,(z1+z2)/2])}
function clickable(o,act){o.traverse(m=>{m.userData.act=act});return o}
const INT={
  kumes:{floor:()=>stdTex(TEX.straw([4,3])),wall:()=>stdTex(TEX.planks('#b58a58','#a87d4c',[3,1.5],true)),
    build(ic,t){const sc=ic.scene;P(sc,'box',0x7a5233,[11,.18,1.3],[0,1.5,-4.35]);for(let k=0;k<6;k++){const x=-4.5+k*1.8,nb=G(sc,[x,1.6,-4.35]);P(nb,'box',0x9a6a3e,[1.6,.08,1.1],[0,0,0]);
        for(const s of[-1,1])P(nb,'box',0x9a6a3e,[.08,.9,1.1],[s*.78,.45,0]);P(nb,'box',0x9a6a3e,[1.6,.9,.08],[0,.45,-.52]);P(nb,'box',0x8a5a32,[1.6,.25,.08],[0,.12,.52]);P(nb,'ico1',0xe0c070,[.6,.15,.4],[0,.12,0]);ic.nests.push(nb)}
      P(sc,'box',0x8a5a32,[11,.08,1.3],[0,2.55,-4.35]);
      for(let k=0;k<4;k++)P(sc,'cyl',0x8a6038,[.07,4,.07],[-6.4,.9+k*.7,-.8],[Math.PI/2,0,0]);for(const z of[-2.8,1.2])P(sc,'box',0x6e4a2a,[.12,3.4,.12],[-6.4,1.7,z]);
      P(sc,'box',0x8a5a32,[3.2,.35,.7],[0,.18,1.6]);P(sc,'box',0x7a4a28,[3.3,.1,.8],[0,.38,1.6]);
      P(sc,'cyl',0xc4492e,[.5,.15,.5],[4.6,.08,1.8]);P(sc,'cyl',0xbfe6ff,[.3,.9,.3],[4.6,.6,1.8],null,{transparent:true,opacity:.6});P(sc,'cone',0xc4492e,[.32,.3,.32],[4.6,1.2,1.8]);
      hayBale(sc,5.4,-2.6);hayBale(sc,5.4,-1.7);hayBale(sc,5.4,-2.15,.6,.3);
      const n=3+2*t.l;for(let k=0;k<n;k++){const c=chicken([0xfaf6ee,0xb8693a,0xfaf6ee,0x3a2a22,0xd99a5a][k%5]);c.scale.setScalar(1.7);sc.add(c);clickable(c,'pet');ic.fx.push(wanderFx(c,0,.2,5,2.6,.9))}},
    dyn(ic,t){const d=ic.dyn;if(t.job&&prog(t.job)<1)P(d,'box',0xe8c25a,[3,.08,.5],[0,.44,1.6]);
      if(t.job&&prog(t.job)>=1){const n=scaled(B.kumes.recipes[0],t.l).out.yumurta;for(let k=0;k<n;k++){const nb=ic.nests[k%ic.nests.length];const e=P(d,'sph',[0xf6ead2,0xd9a066][k%2],[.13,.17,.13],[nb.position.x-.3+Math.floor(k/6)*.3,nb.position.y+.32,nb.position.z+.1]);clickable(e,'collect')}}}},
  ahir:{floor:()=>stdTex(TEX.planks('#8a6a48','#7d5f40',[4,3])),wall:()=>stdTex(TEX.planks('#a33a2a','#962f22',[3,1.5],true)),
    build(ic,t){const sc=ic.scene;const n=Math.min(4,t.l+1),W=2.8,x0=-(n-1)*W/2;
      for(let k=0;k<=n;k++)stallDivider(sc,x0-W/2+k*W,-4.8,-.4);
      for(let k=0;k<n;k++){const x=x0+k*W;const c=cow();c.scale.setScalar(1.55);c.position.set(x,0,-2.6);sc.add(c);clickable(c,'pet');ic.fx.push(idleFx(c,k*1.3));P(sc,'box',0x7a4a28,[1.6,.5,.6],[x,.25,.3]);ic.buckets.push([x+.9,.9])}
      hayBale(sc,-5.6,2.4);hayBale(sc,-5.6,3.2);hayBale(sc,-5.6,2.8,.6);P(sc,'ico1',0xd9b45e,[1,.25,.8],[-4.4,.1,3]);
      const fork=G(sc,[6.4,0,-1]);fork.rotation.z=.2;P(fork,'cyl',0x8a6038,[.04,2.4,.04],[0,1.2,0]);for(const s of[-.1,0,.1])P(fork,'cyl',0x8a8a8a,[.015,.35,.015],[s,2.5,0]);
      const lan=G(sc,[0,4.6,0]);P(lan,'cyl',0x333333,[.02,.8,.02],[0,.4,0]);P(lan,'cyl',0xffd27a,[.18,.3,.18],[0,0,0],null,{emissive:0xffb648,emissiveIntensity:1.2});lan.add(new THREE.PointLight(0xffc070,.7,14))},
    dyn(ic,t){const d=ic.dyn;const run=t.job&&prog(t.job)<1,ready=t.job&&prog(t.job)>=1;
      ic.buckets.forEach(([x,z])=>{if(run)P(d,'ico1',0xd9b45e,[.6,.15,.25],[x-.9,.55,z-.6]);const b=G(d,[x,0,z]);P(b,'cyl',0xc7ccd2,[.25,.45,.22],[0,.23,0]);
        if(ready){P(b,'cyl',0xfdfcf6,[.22,.03,.22],[0,.44,0],null,{emissive:0xffffff,emissiveIntensity:.25});clickable(b,'collect')}})}},
  agil:{floor:()=>stdTex(TEX.straw([4,3])),wall:()=>stdTex(TEX.planks('#9b7a52','#8e6e48',[3,1.5],true)),
    build(ic,t){const sc=ic.scene;const rack=G(sc,[0,0,-4.6]);P(rack,'box',0x6e4a2a,[6,.15,.6],[0,1.2,0]);for(let k=0;k<12;k++)P(rack,'box',0x6e4a2a,[.06,1.2,.06],[-2.8+k*.5,1.8,.2],[.3,0,0]);P(rack,'ico1',0xd9b45e,[2.8,.4,.4],[0,1.5,0]);
      hayBale(sc,-5.5,-3);hayBale(sc,5.5,-3);P(sc,'box',0x8a5a32,[2.2,.35,.6],[3.5,.18,2.8]);
      const n=2+2*t.l;for(let k=0;k<n;k++){const s=sheep();s.scale.setScalar(1.5);sc.add(s);clickable(s,'pet');ic.fx.push(wanderFx(s,0,-.3,4.8,2.4,.5,.35))}},
    dyn(ic,t){if(t.job&&prog(t.job)>=1){const n=scaled(B.agil.recipes[0],t.l).out.yun;for(let k=0;k<n;k++){const w=G(ic.dyn,[-4+k*1.1,0,3.3]);for(let m=0;m<4;m++)P(w,'ico1',0xf6f2ea,[.35,.25,.35],[(m%2)*.3,.2+Math.floor(m/2)*.18,0]);clickable(w,'collect')}}
      if(t.job&&prog(t.job)<1)P(ic.dyn,'box',0xe8c25a,[2,.08,.45],[3.5,.38,2.8])}},
  besi:{floor:()=>stdTex(TEX.planks('#7d6a55','#736150',[4,3])),wall:()=>stdTex(TEX.stone([3,1.5])),
    build(ic,t){const sc=ic.scene;const n=Math.min(4,t.l+1),W=2.8,x0=-(n-1)*W/2;for(let k=0;k<=n;k++)stallDivider(sc,x0-W/2+k*W,-4.8,-.4);
      for(let k=0;k<n;k++){const x=x0+k*W;const c=cow(0x7a4a2a,0x5a3420,true);c.scale.setScalar(1.55);c.position.set(x,0,-2.6);sc.add(c);clickable(c,'pet');ic.fx.push(idleFx(c,k));P(sc,'box',0x7a4a28,[1.6,.5,.6],[x,.25,.3])}
      hayBale(sc,5.6,2.5);hayBale(sc,5.6,3.3)},
    dyn(ic,t){if(t.job&&prog(t.job)>=1){const n=scaled(B.besi.recipes[0],t.l).out.et;for(let k=0;k<n;k++){const c=G(ic.dyn,[-2+k*.9,0,3]);crate(c,0,0,.7,0xa7743f);P(c,'box',0xc4492e,[.3,.18,.02],[0,.45,.36]);clickable(c,'collect')}}}},
  hara:{floor:()=>stdTex(TEX.straw([4,3])),wall:()=>stdTex(TEX.planks('#8a5a34','#7e5030',[3,1.5],true)),
    build(ic,t){const sc=ic.scene;const n=Math.min(3,t.l),W=3.6,x0=-(n-1)*W/2;
      for(let k=0;k<=n;k++)stallDivider(sc,x0-W/2+k*W,-4.8,-.8);
      for(let k=0;k<n;k++){const x=x0+k*W;const h=horse([0x8a5530,0x3a2a22,0xd9c3a0][k]);h.scale.setScalar(1.35);h.position.set(x,0,-2.6);sc.add(h);clickable(h,'pet');ic.fx.push(idleFx(h,k));
        P(sc,'box',0x5e3d22,[W-.3,.9,.1],[x,.45,-.8]);P(sc,'box',0xe0b84a,[.5,.2,.04],[x,.75,-.73])}
      for(let k=0;k<3;k++)P(sc,'tor',0x8a8a8a,[.25,.25,.25],[-5.5+k*.7,3,-4.9]);P(sc,'box',0x6e4a2a,[1.2,.9,.6],[5.4,.45,-3.8]);P(sc,'box',0x5a3418,[1,.6,.5],[5.4,1.1,-3.8])},
    dyn(ic,t){if(t.job&&prog(t.job)>=1){const f=horse(0xb07a4a,0x5a3a22);f.scale.setScalar(.85);f.position.set(0,0,2.4);ic.dyn.add(f);clickable(f,'collect');const fx=idleFx(f,2);fx.dyn=1;ic.fx.push(fx)}}},
  kulube:{floor:()=>stdTex(TEX.planks('#a8733f','#9b6837',[3,3])),
    wall:(t)=>t.l===1?stdTex(TEX.planks('#8b5a32','#7e5030',[3,1.5])):toonMat({color:[0,0,0xf0e4c8,0xf3ead6,0xefe2c6][t.l]}),
    build(ic,t){const sc=ic.scene,l=t.l;
      const rug=new THREE.Mesh(GE.box,stdTex(TEX.kilim(KILIM[S.decor.house.kilim])));rug.scale.set(4,.03,6);rug.rotation.y=Math.PI/2;rug.position.set(0,.02,.6);rug.receiveShadow=true;sc.add(rug);
      const tb=G(sc,[0,0,.6]);P(tb,'box',0x8a5a32,[2.6,.12,1.4],[0,1,0]);for(const [x,z] of[[1.1,.55],[-1.1,.55],[1.1,-.55],[-1.1,-.55]])P(tb,'box',0x6e4424,[.12,1,.12],[x,.5,z]);
      P(tb,'box',0xf6efe0,[2.7,.02,.6],[0,1.07,0]);P(tb,'sph',0xc98a3a,[.35,.16,.2],[-.5,1.15,0]);P(tb,'cyl',0xc4492e,[.16,.28,.16],[.4,1.22,0]);P(tb,'cyl',0xc4492e,[.11,.18,.11],[.4,1.45,0]);
      for(let k=0;k<3;k++)P(tb,'cyl',0xb5541f,[.05,.12,.05],[.85,1.13,-.3+k*.3]);
      for(const [x,r] of[[-1.7,Math.PI/2],[1.7,-Math.PI/2]]){const c=G(sc,[x,0,.6],r);P(c,'box',0x7a4a28,[.7,.08,.7],[0,.6,0]);for(const [a,b] of[[.28,.28],[-.28,.28],[.28,-.28],[-.28,-.28]])P(c,'box',0x6e4424,[.07,.6,.07],[a,.3,b]);P(c,'box',0x7a4a28,[.7,.8,.08],[0,1,-.32])}
      const fp=G(sc,[-4,0,-4.6]);const st=stdTex(TEX.stone([1,1]));P(fp,'box',st,[2.6,2.2,.8],[0,1.1,0]);P(fp,'box',0x1e1410,[1.4,1,.1],[0,.6,.42]);P(fp,'box',st,[1.8,.12,.6],[0,.06,.65]);P(fp,'box',0x6e4424,[3,.18,1],[0,2.3,.1]);P(fp,'box',st,[1.2,3,.6],[0,3.9,-.1]);
      for(let k=0;k<3;k++)P(fp,'cyl',0x5a3a22,[.08,.9,.08],[0,.2,.6+k*.05],[0,k*.5,Math.PI/2]);const flames=[];for(let k=0;k<4;k++)flames.push(P(fp,'cone',[0xff8a2a,0xffc23a,0xff5a1a,0xffd86a][k],[.18-k*.02,.5,.18-k*.02],[-.3+k*.2,.45,.6],null,{emissive:0xff6a1a,emissiveIntensity:1.4}));
      const fl=new THREE.PointLight(0xff8a3a,1.4,10);fl.position.set(0,1,1.4);fp.add(fl);P(fp,'cyl',0x2a2a2a,[.3,.25,.3],[1,2.55,.1]);
      ic.fx.push((dt,tm)=>{flames.forEach((f,k)=>{f.scale.y=.4+Math.abs(Math.sin(tm*8+k*1.7))*.25;f.scale.x=f.scale.z=.14+Math.sin(tm*6+k)*.03});fl.intensity=1.2+Math.random()*.4});
      const sh=G(sc,[6.5,0,-1.5],-Math.PI/2);for(let k=0;k<4;k++)P(sh,'box',0x7a4a28,[3.2,.1,.6],[0,.6+k*.9,0]);for(const x of[-1.6,1.6])P(sh,'box',0x6e4424,[.1,3.4,.6],[x,1.7,0]);ic.shelf=sh;
      if(l>=2){const bd=G(sc,[4.3,0,-3.6]);P(bd,'box',0x6e4424,[2,.5,2.8],[0,.3,0]);P(bd,'box',0xf6efe0,[1.9,.25,2.7],[0,.65,0]);const bl=new THREE.Mesh(GE.box,stdTex(TEX.kilim()));bl.scale.set(1.95,.06,1.7);bl.position.set(0,.8,.5);bl.castShadow=bl.receiveShadow=true;bd.add(bl);P(bd,'box',0xffffff,[1.4,.2,.5],[0,.85,-1.05]);P(bd,'box',0x6e4424,[2,1.4,.15],[0,.7,-1.45])}
      if(l>=3){const sd=G(sc,[-6.2,0,1.5]);P(sd,'box',0x8a5a32,[1.2,.5,4.2],[0,.25,0]);P(sd,'box',0x2f5a8a,[1.1,.3,4.1],[0,.62,0]);for(let k=0;k<4;k++)P(sd,'box',[0xc4492e,0xf2b330,0x2f6b3a,0xc4492e][k],[.3,.7,.85],[-.4,1,-1.5+k*1],[0,0,-.2]);
        for(let k=0;k<2;k++){const pc=G(sc,[-6.95,3,-1.5+k*3]);P(pc,'box',0xc9a050,[.08,1.3,1.8]);P(pc,'box',[0x7aa6c8,0x9cbf6b][k],[.1,1.1,1.6])}}
      if(l>=4){const ch=G(sc,[0,4.6,.6]);P(ch,'cyl',0xe0b84a,[.03,.8,.03],[0,.4,0]);P(ch,'tor',0xe0b84a,[.7,.7,.7],[0,0,0],[Math.PI/2,0,0]);for(let k=0;k<6;k++){const a=k/6*6.28;P(ch,'cone',0xfff1c8,[.06,.22,.06],[Math.cos(a)*.7,.12,Math.sin(a)*.7],null,{emissive:0xffd27a,emissiveIntensity:1.5})}
        ch.add(new THREE.PointLight(0xffe0a0,.9,14));const gc=G(sc,[-6.5,0,-4.2]);P(gc,'box',0x5a3418,[.8,3.2,.6],[0,1.6,0]);P(gc,'cyl',0xf6efe0,[.28,.05,.28],[0,2.6,.31],[Math.PI/2,0,0]);
        P(sc,'cyl',0xc4492e,[.35,.6,.35],[2.6,.3,3.6]);P(sc,'ico1',0x3f7f34,[.6,.8,.6],[2.6,1.2,3.6])}
      houseDecor(sc);const lan=new THREE.PointLight(0xffd090,.6,16);lan.position.set(1,4,2);sc.add(lan)},
    dyn(ic,t){const sh=ic.shelf;if(!sh)return;const g=G(ic.dyn);g.position.copy(sh.position);g.rotation.copy(sh.rotation);const n=Math.round(Math.min(1,stored()/cap())*24);
      const cols=[0xc4492e,0xf2b330,0x7aa64a,0xe8d8b0,0x8a5a32,0xd9734a];for(let k=0;k<n;k++){const r=Math.floor(k/6),c=k%6;
        if(k%3===0)P(g,'cyl',cols[k%6],[.18,.4,.18],[-1.3+c*.52,.85+r*.9,0]);else{P(g,'cyl',cols[(k+2)%6],[.14,.3,.14],[-1.3+c*.52,.8+r*.9,0]);P(g,'cyl',0xf6efe0,[.15,.05,.15],[-1.3+c*.52,.97+r*.9,0])}}}},
};
const intT=key=>key==='kulube'?{b:'kulube',l:S.house}:{b:key,...S.units[key]};
// İç mekân sahnesi bırakılırken GPU kaynakları serbest bırakılır: gölge haritası (2048² doku), o sahneye özel dokular,
// malzemeler ve geometriler. Paylaşılan (önbellekteki) geometri ve malzemelere dokunulmaz.
function disposeScene(sc){if(!sc)return;const sharedG=new Set(Object.values(GE)),sharedM=new Set(Object.values(MC));sharedM.add(OUT);
  sc.traverse(o=>{if(o.isLight&&o.shadow&&o.shadow.map){o.shadow.map.dispose();o.shadow.map=null}
    if(o.isMesh||o.isPoints){if(o.geometry&&!sharedG.has(o.geometry))o.geometry.dispose();for(const m of[].concat(o.material||[])){if(!m||sharedM.has(m))continue;for(const k of['map','emissiveMap','alphaMap'])if(m[k]&&m[k].isTexture)m[k].dispose();m.dispose()}}})}
function dropInterior(){const o=interior;interior=null;if(o&&o.scene)setTimeout(()=>disposeScene(o.scene),0)}
function buildInterior(key){if(interior&&interior.scene)disposeScene(interior.scene);const t=intT(key),def=INT[key];const sc=new THREE.Scene();sc.background=new THREE.Color(0x2b1d12);sc.fog=new THREE.Fog(0x2b1d12,24,42);
  const ic={key,scene:sc,fx:[],dyn:G(sc),nests:[],buckets:[],shelf:null,sig:''};
  ic.fx.push(room(sc,def.floor(t),def.wall(t)));def.build(ic,t);
  ic.refresh=()=>{sc.remove(ic.dyn);ic.dyn=G(sc);ic.fx=ic.fx.filter(f=>!f.dyn);def.dyn(ic,intT(key));ic.sig=intSig(key)};
  ic.refresh();interior=ic}
function intSig(key){const t=intT(key);return (t.job?(prog(t.job)>=1?'r':'g'):'i')+t.l+(key==='kulube'?Math.round(stored()/cap()*24):'')}
function fade(fn){const ir=$('#iris');document.body.classList.toggle('fastnav',!!(S&&S.fastNav));ir.classList.add('close');setTimeout(()=>{fn();requestAnimationFrame(()=>requestAnimationFrame(()=>ir.classList.remove('close')))},S&&S.fastNav?160:290)}
// Yazı boyutu ve sol el modu: gövdeye sınıf olarak uygulanır
function applyUI(){const u=(S&&S.ui)||{};document.body.classList.toggle('fs-b',u.fs==='b');document.body.classList.toggle('fs-xb',u.fs==='xb');document.body.classList.toggle('lefty',!!u.left);setTimeout(()=>{try{resize()}catch(e){}},0)}
function setModeUI(){if(typeof closeQpop==='function')closeQpop();applyUI();document.body.dataset.mode=mode;if(typeof wxUI==='function'&&S)wxUI();document.body.classList.toggle('hub',mode==='hub');document.body.classList.toggle('lowgfx',GFX.low);if(mode==='hub')hubLimits();else if(mode==='focus')focusLimits();renderStrip(true);if(mode!=='hub'&&document.body.classList.contains('photo'))photoMode(false);document.body.classList.toggle('focus',mode==='focus');document.body.classList.toggle('inside',mode==='interior');
  document.body.classList.toggle('desk',mode==='desk');const b=$('#backBtn');b.hidden=mode==='desk';b.textContent=mode==='interior'?'← Dışarı':mode==='focus'?'← Harita':'← Masa'}
function enterInterior(key){if(!INT[key]||(key!=='kulube'&&!S.units[key]))return;fade(()=>{buildInterior(key);mode='interior';const lk=key==='kulube'?'ev':locOf(key);if(!LOC[focus])focus=lk;if(!view||view.k!=='loc')view={k:'loc',loc:lk};ctl.enabled=false;ictl.enabled=true;
  icam.position.set(0,6.4,14.5);ictl.target.set(0,1.4,-.6);ictl.update();if(view)view.mini=false;setModeUI();renderSheet();syncMarks();stat('enter_'+key)})}
function leaveInterior(){if(mode!=='interior')return;fade(()=>{mode='focus';dropInterior();ctl.enabled=true;ictl.enabled=false;setModeUI();renderSheet();syncMarks()})}
