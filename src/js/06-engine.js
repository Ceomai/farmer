// ================= 3D MOTOR =================
if(THREE.ColorManagement)THREE.ColorManagement.legacyMode=false;
const V3=THREE.Vector3;
const stage=$('#stage');
const R=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
R.setPixelRatio(GFX.pr);const MAXANI=R.capabilities.getMaxAnisotropy?R.capabilities.getMaxAnisotropy():8;R.shadowMap.enabled=GFX.shadows;R.shadowMap.type=THREE.PCFSoftShadowMap;
R.outputEncoding=THREE.sRGBEncoding;R.toneMapping=THREE.ACESFilmicToneMapping;R.toneMappingExposure=1.08;
stage.appendChild(R.domElement);
const GRAD=(()=>{const t=new THREE.DataTexture(new Uint8Array([96,150,205,255]),4,1,THREE.RedFormat);t.minFilter=t.magFilter=THREE.NearestFilter;t.generateMipmaps=false;t.needsUpdate=true;return t})();
function grade(c){const col=new THREE.Color(c);const h={};col.getHSL(h);const hh=h.h+((h.h>.5?1.1:.1)-h.h)*.05;col.setHSL(hh,h.s*.8,Math.min(.93,h.l*.96+.025));return col}
const KEEP=['emissive','emissiveIntensity','transparent','opacity','depthWrite','map','side'];
function toonMat(o){const p={gradientMap:GRAD};for(const k of KEEP)if(o&&o[k]!=null)p[k]=o[k];p.color=o&&o.color!=null?grade(o.color):new THREE.Color(0xffffff);if(p.emissive!=null)p.emissive=grade(p.emissive);return new THREE.MeshToonMaterial(p)}
const MC={};
function M(c,o){const k=c+'|'+(o?JSON.stringify(o):'');return MC[k]||(MC[k]=toonMat(Object.assign({color:c},o)))}
const OUT=new THREE.ShaderMaterial({side:THREE.BackSide,uniforms:{thick:{value:.0024},col:{value:new THREE.Color(0x2a1a10)},jit:{value:0}},
  vertexShader:'attribute vec3 onormal;uniform float thick;uniform float jit;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);vec3 n=normalize(normalMatrix*onormal);float w=thick*(1.+.12*sin(jit+position.x*9.+position.y*7.+position.z*5.));mv.xyz+=n*w*(-mv.z);gl_Position=projectionMatrix*mv;}',
  fragmentShader:'uniform vec3 col;void main(){gl_FragColor=vec4(col,1.);}'});
function smoothN(g){if(g.attributes.onormal)return;const pos=g.attributes.position,nor=g.attributes.normal,acc=new Map(),key=i=>pos.getX(i).toFixed(3)+','+pos.getY(i).toFixed(3)+','+pos.getZ(i).toFixed(3);
  for(let i=0;i<pos.count;i++){const k=key(i);const a=acc.get(k)||[0,0,0];a[0]+=nor.getX(i);a[1]+=nor.getY(i);a[2]+=nor.getZ(i);acc.set(k,a)}
  const on=new Float32Array(pos.count*3);for(let i=0;i<pos.count;i++){const a=acc.get(key(i)),l=Math.hypot(a[0],a[1],a[2])||1;on[i*3]=a[0]/l;on[i*3+1]=a[1]/l;on[i*3+2]=a[2]/l}g.setAttribute('onormal',new THREE.BufferAttribute(on,3))}
function outline(m){smoothN(m.geometry);const o=new THREE.Mesh(m.geometry,OUT);o.castShadow=o.receiveShadow=false;m.add(o);return m}
const GE={box:new THREE.BoxGeometry(1,1,1),sph:new THREE.SphereGeometry(1,16,12),lsph:new THREE.SphereGeometry(1,8,6),ico:new THREE.IcosahedronGeometry(1,0),ico1:new THREE.IcosahedronGeometry(1,1),
  cyl:new THREE.CylinderGeometry(1,1,1,14),cyl6:new THREE.CylinderGeometry(1,1,1,6),cone:new THREE.ConeGeometry(1,1,10),cone6:new THREE.ConeGeometry(1,1,6),pyr:new THREE.ConeGeometry(1,1,4),
  hsph:new THREE.SphereGeometry(1,16,8,0,Math.PI*2,0,Math.PI/2),tor:new THREE.TorusGeometry(1,.12,6,18)};
(()=>{const tri=new THREE.Shape();tri.moveTo(-.5,0);tri.lineTo(.5,0);tri.lineTo(0,1);tri.lineTo(-.5,0);GE.tri=new THREE.ExtrudeGeometry(tri,{depth:1,bevelEnabled:false});GE.tri.translate(0,0,-.5);
  const gam=new THREE.Shape();gam.moveTo(-.5,0);gam.lineTo(.5,0);gam.lineTo(.4,.58);gam.lineTo(0,1);gam.lineTo(-.4,.58);gam.lineTo(-.5,0);GE.gam=new THREE.ExtrudeGeometry(gam,{depth:1,bevelEnabled:false});GE.gam.translate(0,0,-.5);
  const arch=new THREE.Shape();arch.moveTo(-.5,0);arch.lineTo(-.5,.5);arch.absarc(0,.5,.5,Math.PI,0,true);arch.lineTo(.5,0);arch.lineTo(-.5,0);GE.arch=new THREE.ExtrudeGeometry(arch,{depth:1,bevelEnabled:false,curveSegments:10});GE.arch.translate(0,0,-.5);})();
function P(par,g,c,s,p,r,o){const m=new THREE.Mesh(typeof g==='string'?GE[g]:g,(c&&c.isMaterial)?c:M(c,o));if(s)m.scale.set(s[0],s[1],s[2]);if(p)m.position.set(p[0],p[1],p[2]);if(r)m.rotation.set(r[0],r[1],r[2]);m.castShadow=true;m.receiveShadow=true;
  const mt=m.material;if(!(mt.transparent&&mt.opacity<.9)&&!(s&&s[0]*s[1]*s[2]<.0025))outline(m);par.add(m);return m}
function F(par,c,s,p,r){const m=new THREE.Mesh(GE.box,(c&&c.isMaterial)?c:M(c));m.scale.set(...s);m.position.set(...p);if(r)m.rotation.set(...r);m.receiveShadow=true;par.add(m);return m}
function G(par,p,ry){const g=new THREE.Group();if(p)g.position.set(p[0],p[1],p[2]);if(ry)g.rotation.y=ry;if(par)par.add(g);return g}
function rng(seed){let a=seed>>>0;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const TEXQ=Math.min(3,Math.max(2,(devicePixelRatio||1)*1.5));
function canvasTex(w,h,draw,rep,q){const Q=q||TEXQ;const c=document.createElement('canvas');c.width=Math.round(w*Q);c.height=Math.round(h*Q);const cx=c.getContext('2d');cx.scale(Q,Q);cx.imageSmoothingQuality='high';draw(cx,w,h);const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.anisotropy=MAXANI;if(rep){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rep[0],rep[1])}return t}
const TEX={
  grass:()=>canvasTex(256,256,(x,w,h)=>{x.fillStyle='#78ad45';x.fillRect(0,0,w,h);const r=rng(3);for(let i=0;i<2600;i++){x.fillStyle=['#6ea23e','#86ba52','#7bb049','#91c25c'][i%4];x.fillRect(r()*w,r()*h,2,3+r()*3)}},[70,70]),
  planks:(c1,c2,rep,vert)=>canvasTex(256,256,(x,w,h)=>{const r=rng(9);for(let i=0;i<8;i++){x.fillStyle=i%2?c1:c2;const k=i*32;vert?x.fillRect(k,0,32,h):x.fillRect(0,k,w,32);x.fillStyle='rgba(0,0,0,.28)';vert?x.fillRect(k,0,2,h):x.fillRect(0,k,w,2);
    for(let j=0;j<3;j++){x.fillStyle='rgba(0,0,0,.08)';const o=r()*w;vert?x.fillRect(k+6+r()*20,o,1.5,40):x.fillRect(o,k+6+r()*20,40,1.5)}x.fillStyle='rgba(0,0,0,.2)';const s=r()*w;vert?x.fillRect(k,s,32,2):x.fillRect(s,k,2,32)}},rep),
  straw:(rep)=>canvasTex(256,256,(x,w,h)=>{x.fillStyle='#d9b45e';x.fillRect(0,0,w,h);const r=rng(5);for(let i=0;i<1400;i++){x.strokeStyle=['#c99b3f','#e8c876','#b98b35','#f0d68e'][i%4];x.lineWidth=1.5;x.beginPath();const a=r()*w,b=r()*h,an=r()*6.28,l=6+r()*12;x.moveTo(a,b);x.lineTo(a+Math.cos(an)*l,b+Math.sin(an)*l);x.stroke()}},rep),
  stone:(rep)=>canvasTex(256,256,(x,w,h)=>{x.fillStyle='#8f877a';x.fillRect(0,0,w,h);const r=rng(11);for(let y=0;y<h;y+=32){for(let k=(y/32%2)*-24;k<w;k+=48){x.fillStyle=['#b4ab9b','#a39a8a','#c2b9a8','#9d9483'][Math.floor(r()*4)];x.fillRect(k+2,y+2,44,28)}}},rep),
  water:()=>canvasTex(256,128,(x,w,h)=>{const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,'#4aa3cf');g.addColorStop(1,'#3b8fbe');x.fillStyle=g;x.fillRect(0,0,w,h);const r=rng(7);x.strokeStyle='rgba(255,255,255,.55)';x.lineWidth=2;for(let i=0;i<40;i++){const a=r()*w,b=r()*h;x.beginPath();x.moveTo(a,b);x.quadraticCurveTo(a+8,b-3,a+16,b);x.stroke()}},[12,1]),
  kilim:(p)=>canvasTex(256,384,(x,w,h)=>{const C=p||['#a3271f','#2c3e6b','#f0c24b','#f6ead0','#3f7a4a'];x.fillStyle=C[0];x.fillRect(0,0,w,h);x.fillStyle=C[1];x.fillRect(14,14,w-28,h-28);x.fillStyle=C[0];x.fillRect(26,26,w-52,h-52);
    const cols=[C[2],C[3],C[1],C[4]];for(let i=0;i<4;i++){const cy=60+i*88;x.fillStyle=cols[i%4];x.beginPath();x.moveTo(w/2,cy-38);x.lineTo(w/2+70,cy);x.lineTo(w/2,cy+38);x.lineTo(w/2-70,cy);x.fill();x.fillStyle=C[0];x.beginPath();x.moveTo(w/2,cy-18);x.lineTo(w/2+34,cy);x.lineTo(w/2,cy+18);x.lineTo(w/2-34,cy);x.fill();x.fillStyle=C[3];x.fillRect(w/2-5,cy-5,10,10)}
    x.fillStyle=C[3];for(let y=0;y<h;y+=16){x.fillRect(4,y,6,8);x.fillRect(w-10,y+8,6,8)}}),
};
const stdTex=(map,o)=>toonMat(Object.assign({map},o));
let _stoneMat;const stoneMat=()=>_stoneMat||(_stoneMat=stdTex(TEX.stone([1,.6])));
function signTex(lines){return canvasTex(256,160,(x,w,h)=>{x.fillStyle='#f5e6c4';x.fillRect(0,0,w,h);x.strokeStyle='#7a4e2d';x.lineWidth=10;x.strokeRect(5,5,w-10,h-10);x.textAlign='center';x.fillStyle='#b23a22';x.font='900 30px Nunito, sans-serif';x.fillText(lines[0],w/2,46);x.fillStyle='#3a2a18';x.font='800 24px Nunito, sans-serif';x.fillText(lines[1],w/2,84);x.font='900 32px Nunito, sans-serif';x.fillStyle='#2f6b3a';x.fillText(lines[2],w/2,128)})}

// --- çizgi film ahşap tabelalar ---
const SIGNC={};const PLANE=new THREE.PlaneGeometry(1,1);
function signBoard(lines){const key=JSON.stringify(lines);if(SIGNC[key])return SIGNC[key];const c=document.createElement('canvas'),x=c.getContext('2d'),pad=34;
  const L=lines.map(l=>typeof l==='string'?{t:l,s:64}:l),font=sz=>`${sz}px "Titan One","Arial Rounded MT Bold",sans-serif`;
  let w=0;L.forEach(l=>{x.font=font(l.s);w=Math.max(w,x.measureText(l.t).width)});
  c.width=Math.ceil(w+pad*2.4);c.height=Math.ceil(L.reduce((a,l)=>a+l.s*1.1,0)+pad*1.4+12);const W=c.width-10,h=c.height-12;
  const rr=(ox,oy)=>{x.beginPath();const r=22;x.moveTo(r+ox,4+oy);x.lineTo(W-r+ox,oy);x.quadraticCurveTo(W+ox,oy,W+ox,r+oy);x.lineTo(W-4+ox,h-r+oy);x.quadraticCurveTo(W-4+ox,h+oy,W-r-4+ox,h+oy);x.lineTo(r+ox,h-4+oy);x.quadraticCurveTo(4+ox,h-4+oy,4+ox,h-r+oy);x.lineTo(6+ox,r+4+oy);x.quadraticCurveTo(6+ox,4+oy,r+ox,4+oy);x.closePath()};
  rr(7,9);x.fillStyle='#24160c';x.fill();rr(0,0);const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,'#c0803f');g.addColorStop(1,'#8f5629');x.fillStyle=g;x.fill();
  x.save();rr(0,0);x.clip();x.strokeStyle='rgba(70,35,10,.35)';x.lineWidth=3;for(let i=1;i<4;i++){const yy=h*i/4;x.beginPath();x.moveTo(0,yy);x.bezierCurveTo(W*.3,yy-7,W*.6,yy+7,W,yy);x.stroke()}x.restore();
  rr(0,0);x.lineWidth=7;x.strokeStyle='#24160c';x.stroke();for(const nx of[22,W-22]){x.fillStyle='#3a2a1a';x.beginPath();x.arc(nx,21,5,0,7);x.fill()}
  let y=pad*.7;x.textAlign='center';x.textBaseline='top';x.lineJoin='round';
  L.forEach(l=>{x.font=font(l.s);x.lineWidth=l.s*.22;x.strokeStyle='#24160c';x.strokeText(l.t,W/2,y);x.fillStyle=l.c||'#fff1cf';x.fillText(l.t,W/2,y);y+=l.s*1.1});
  const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.anisotropy=MAXANI;return SIGNC[key]={tex:t,aspect:c.width/c.height}}
function signMesh(lines,H){const sb=signBoard(lines);const m=new THREE.Mesh(PLANE,new THREE.MeshBasicMaterial({map:sb.tex,transparent:true,alphaTest:.3,side:THREE.DoubleSide,toneMapped:false}));m.scale.set(H*sb.aspect,H,1);return m}
// --- kıvrımlı şeritler (dere, patika) ---
function ribbon(par,pts,w,mat,y=.04,segK=1.5,vRep=4){const curve=new THREE.CatmullRomCurve3(pts.map(p=>new V3(p[0],0,p[1])),false,'catmullrom',.5);const N=Math.max(8,Math.round(curve.getLength()*segK));const pos=[],uv=[],idx=[];
  for(let i=0;i<=N;i++){const t=i/N,p=curve.getPointAt(t),tg=curve.getTangentAt(t),nx=-tg.z,nz=tg.x;pos.push(p.x+nx*w/2,y,p.z+nz*w/2,p.x-nx*w/2,y,p.z-nz*w/2);const v=t*curve.getLength()/vRep;uv.push(0,v,1,v);if(i<N){const a=i*2;idx.push(a,a+2,a+1,a+1,a+2,a+3)}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();
  const m=new THREE.Mesh(g,mat);m.receiveShadow=true;par.add(m);m.userData.curve=curve;return m}
let _dirt,_dirtEdge;
const dirtMat=()=>_dirt||(_dirt=toonMat({side:THREE.DoubleSide,map:canvasTex(64,128,(x,w,h)=>{x.fillStyle='#d6bb86';x.fillRect(0,0,w,h);const r=rng(21);for(let i=0;i<90;i++){x.fillStyle=['#c4a672','#e2cb9a','#b8986a'][i%3];x.beginPath();x.arc(r()*w,r()*h,1+r()*2.2,0,7);x.fill()}x.fillStyle='rgba(120,85,45,.25)';x.fillRect(0,0,5,h);x.fillRect(w-5,0,5,h)},[1,1])}));
const dirtEdge=()=>_dirtEdge||(_dirtEdge=toonMat({color:0x8fa456,side:THREE.DoubleSide}));
// --- toz bulutları ---
const puffs=[];
function puff(v,n=9,sz=1){for(let k=0;k<n;k++){const m=new THREE.Mesh(GE.ico1,M(0xfdf8ec));outline(m);const a=k/n*6.28+Math.random()*.4;m.position.copy(v);m.userData.vel=new V3(Math.cos(a)*2.4*sz,1+Math.random()*1.2,Math.sin(a)*2.4*sz);m.userData.life=0;m.userData.sz=sz;m.scale.setScalar(.25*sz);world.add(m);puffs.push(m)}}
function stepPuffs(dt){for(let i=puffs.length-1;i>=0;i--){const m=puffs[i],u=m.userData;u.life+=dt;m.position.addScaledVector(u.vel,dt*Math.max(0,1-u.life*1.6));m.scale.setScalar((.25+u.life*1.1)*u.sz*(u.life>.45?Math.max(0,1-(u.life-.45)*5):1));if(u.life>.65){world.remove(m);puffs.splice(i,1)}}}
// --- yapı parçaları ---
function gableRoof(par,w,d,h,y,roofC,wallC,axis='x',ov=.28,th=.12){
  const across=axis==='x'?d:w, len=(axis==='x'?w:d)+ov*2, half=across/2, k=h/half;
  for(const s of [-1,1]){const a1=s*(half+ov),y1=y-ov*k,a2=0,y2=y+h,L=Math.hypot(a2-a1,y2-y1),ma=(a1+a2)/2,my=(y1+y2)/2+th/2;
    if(axis==='x')P(par,'box',roofC,[len,th,L],[0,my,ma],[Math.atan2(-(y2-y1),(a2-a1)),0,0]);
    else P(par,'box',roofC,[L,th,len],[ma,my,0],[0,0,Math.atan2(y2-y1,a2-a1)])}
  if(axis==='x')P(par,'box',roofC,[len,.14,.16],[0,y+h+.07,0]);else P(par,'box',roofC,[.16,.14,len],[0,y+h+.07,0]);
  const gm=P(par,'tri',wallC,axis==='x'?[d,h,w]:[w,h,d],[0,y,0]);if(axis==='x')gm.rotation.y=Math.PI/2;return gm}
function windowM(par,x,y,z,w=.42,h=.48,ry=0,lit=.5){const g=G(par,[x,y,z],ry);P(g,'box',0xf3ead8,[w+.12,h+.12,.06],[0,0,0]);P(g,'box',0xffd27a,[w,h,.08],[0,0,.012],null,{emissive:0xffa53a,emissiveIntensity:lit});
  P(g,'box',0xf3ead8,[.04,h,.1],[0,0,.03]);P(g,'box',0xf3ead8,[w,.04,.1],[0,0,.03]);P(g,'box',0xf3ead8,[w+.2,.06,.14],[0,-h/2-.06,.05]);return g}
function door(par,x,y,z,w=.5,h=.85,c=0x6b3f20,ry=0){const g=G(par,[x,y,z],ry);P(g,'box',0xf3ead8,[w+.1,h+.06,.05],[0,h/2,0]);P(g,'box',c,[w,h,.08],[0,h/2,.01]);P(g,'sph',0xe0b84a,[.04,.04,.04],[w*.32,h*.48,.07]);return g}
function fenceRun(par,x1,z1,x2,z2,c=0x9a7247,ht=.62){const L=Math.hypot(x2-x1,z2-z1),n=Math.max(1,Math.round(L/.85)),ang=Math.atan2(z2-z1,x2-x1);
  for(let k=0;k<=n;k++){const t=k/n;P(par,'box',c,[.11,ht,.11],[x1+(x2-x1)*t,ht/2,z1+(z2-z1)*t])}
  for(const hh of [ht*.45,ht*.85])P(par,'box',c,[L,.07,.05],[(x1+x2)/2,hh,(z1+z2)/2],[0,-ang,0])}
function bush(par,x,z,s=1,c=0x4f8f37){P(par,'ico1',c,[.45*s,.38*s,.45*s],[x,.3*s,z]);P(par,'ico1',c,[.3*s,.28*s,.3*s],[x+.28*s,.22*s,z+.1*s])}
function flowers(par,x,z,r,seed){const q=rng(seed);for(let k=0;k<7;k++){const a=x+(q()-.5)*r,b=z+(q()-.5)*r;P(par,'cyl',0x4f8f37,[.015,.2,.015],[a,.1,b]);P(par,'lsph',[0xf4d03f,0xe8657a,0xffffff,0xb78be0][k%4],[.07,.05,.07],[a,.22,b])}}
const swayList=[];
function addFx(g,fn){(g.userData.fx||(g.userData.fx=[])).push(fn)}
function swayFx(par,top,x){const fn=(dt,t)=>{top.rotation.z=Math.sin(t*1.3+x*.37)*.05;top.rotation.x=Math.cos(t*1.1+x*.21)*.03};if(par===world)swayList.push(fn);else addFx(par,fn)}
function pine(par,x,z,s=1){P(par,'cyl',0x6b4423,[.12*s,.6*s,.12*s],[x,.3*s,z]);const top=G(par,[x,.5*s,z]);for(let k=0;k<3;k++)P(top,'cone6',[0x2f6b3a,0x3a7d42,0x2a5f33][k],[(1-k*.25)*.9*s,1.1*s,(1-k*.25)*.9*s],[0,(.4+k*.6)*s,0]);swayFx(par,top,x+z)}
function oak(par,x,z,s=1,apples){P(par,'cyl',0x6e4527,[.16*s,1*s,.16*s],[x,.5*s,z]);const top=G(par,[x,.9*s,z]);const c=[0x5c9a3e,0x4f8a36,0x68a846];P(top,'ico1',c[0],[1*s,.85*s,1*s],[0,.55*s,0]);P(top,'ico1',c[1],[.7*s,.6*s,.7*s],[.5*s,.35*s,.2*s]);P(top,'ico1',c[2],[.6*s,.55*s,.6*s],[-.4*s,.85*s,-.2*s]);
  if(apples){const q=rng(Math.round(x*100+z*7+500));for(let k=0;k<9;k++){const a=q()*6.28,b=q()*1.2;P(top,'lsph',0xd43a2a,[.1*s,.1*s,.1*s],[Math.cos(a)*.85*s,.3*s+b*.5*s,Math.sin(a)*.85*s])}}swayFx(par,top,x*1.7+z)}
function addSmoke(host,ch,isOn,fxHost){const sm=[];for(let k=0;k<5;k++){const m=new THREE.Mesh(GE.ico1,toonMat({color:0xf2ede0,transparent:true,opacity:.7}));m.scale.setScalar(.15);host.add(m);sm.push(m)}
  addFx(fxHost||host,(dt,tm)=>{const on=isOn();sm.forEach((m,k)=>{const ph=(tm*.35+k/5)%1;m.visible=on;m.position.set(ch[0]+Math.sin(ph*6+k)*.15,ch[1]+ph*2.2,ch[2]-ph*.4);m.scale.setScalar(.14+ph*.42);m.material.opacity=.65*(1-ph)})})}

// --- hayvanlar ---
function chicken(col=0xfaf6ee){const g=G(null);P(g,'sph',col,[.22,.2,.28],[0,.32,0]);P(g,'box',col,[.08,.18,.14],[0,.42,-.24],[-.5,0,0]);
  const h=G(g,[0,.5,.17]);P(h,'sph',col,[.12,.13,.12]);P(h,'box',0xd8352a,[.035,.09,.11],[0,.13,0]);P(h,'cone',0xf2b134,[.04,.11,.04],[0,-.01,.13],[Math.PI/2,0,0]);P(h,'lsph',0xd8352a,[.03,.05,.03],[0,-.08,.08]);
  P(h,'lsph',0x1a1a1a,[.018,.018,.018],[.08,.03,.06]);P(h,'lsph',0x1a1a1a,[.018,.018,.018],[-.08,.03,.06]);
  for(const s of[-1,1])P(g,'cyl',0xf2b134,[.02,.16,.02],[s*.07,.08,0]);g.userData.head=h;return g}
function cow(body=0xf7f3ea,spot=0x2b2522,bull){const g=G(null);P(g,'box',body,[.62,.56,1.15],[0,.78,0]);
  P(g,'box',spot,[.64,.3,.36],[0,.86,.18]);P(g,'box',spot,[.64,.24,.28],[0,.72,-.32]);P(g,'box',spot,[.3,.04,.3],[.12,1.07,-.05]);
  const h=G(g,[0,1.02,.62]);P(h,'box',body,[.36,.36,.4],[0,0,.08]);P(h,'box',bull?0x5a3a2a:0xe8a8a0,[.38,.18,.16],[0,-.1,.32]);P(h,'lsph',0x111111,[.04,.04,.04],[.19,.07,.16]);P(h,'lsph',0x111111,[.04,.04,.04],[-.19,.07,.16]);
  for(const s of[-1,1]){P(h,'box',body,[.18,.08,.1],[s*.25,.1,0]);P(h,'cone',0xe9dcc0,bull?[.06,.26,.06]:[.04,.14,.04],[s*.16,.25,0],[0,0,-s*(bull?.9:.3)])}
  for(const [x,z] of [[.2,.42],[-.2,.42],[.2,-.42],[-.2,-.42]]){P(g,'box',body,[.13,.52,.13],[x,.26,z]);P(g,'box',0x2a2420,[.14,.08,.14],[x,.04,z])}
  if(!bull)P(g,'lsph',0xf0b0a8,[.15,.1,.15],[0,.48,-.2]);
  const tail=G(g,[0,.95,-.58]);P(tail,'box',body,[.05,.55,.05],[0,-.27,0]);P(tail,'box',spot,[.09,.12,.09],[0,-.55,0]);g.userData.head=h;g.userData.tail=tail;return g}
function sheep(){const g=G(null);const w=0xf3efe6;P(g,'ico1',w,[.42,.36,.55],[0,.62,0]);for(const [x,y,z] of [[.2,.78,.2],[-.2,.78,-.15],[0,.85,-.3],[.15,.6,-.4],[-.2,.62,.3]])P(g,'ico1',w,[.22,.22,.22],[x,y,z]);
  const h=G(g,[0,.82,.5]);P(h,'box',0x2b2522,[.22,.26,.3],[0,0,.08]);P(h,'ico1',w,[.16,.12,.14],[0,.16,0]);for(const s of[-1,1])P(h,'box',0x2b2522,[.16,.06,.08],[s*.16,.04,0]);
  for(const [x,z] of [[.16,.3],[-.16,.3],[.16,-.3],[-.16,-.3]])P(g,'box',0x2b2522,[.09,.4,.09],[x,.2,z]);g.userData.head=h;return g}
function horse(c=0x8a5530,m=0x2e1d12,jockey){const g=G(null);P(g,'box',c,[.48,.52,1.25],[0,1.12,0]);
  const n=G(g,[0,1.3,.52]);n.rotation.x=-.55;P(n,'box',c,[.26,.75,.32],[0,.32,0]);P(n,'box',m,[.08,.75,.14],[0,.34,-.16]);
  const h=G(n,[0,.72,.1]);h.rotation.x=1.15;P(h,'box',c,[.24,.28,.58],[0,0,.15]);P(h,'box',0x3a2a20,[.22,.2,.12],[0,-.03,.46]);for(const k of[-1,1]){P(h,'box',c,[.06,.16,.06],[k*.08,.17,-.08]);P(h,'lsph',0x111111,[.035,.035,.035],[k*.125,.06,.14])}
  const legs=[];for(const [x,z] of [[.17,.48],[-.17,.48],[.17,-.48],[-.17,-.48]]){const l=G(g,[x,.86,z]);P(l,'box',c,[.13,.86,.13],[0,-.43,0]);P(l,'box',0x2a2420,[.14,.08,.14],[0,-.82,0]);legs.push(l)}
  if(jockey){P(g,'box',jockey,[.36,.5,.32],[0,1.62,.05]);P(g,'sph',0xe8b48a,[.14,.15,.14],[0,1.98,.1]);P(g,'hsph',jockey,[.16,.12,.16],[0,2.05,.1])}
  const tail=G(g,[0,1.25,-.62]);tail.rotation.x=.5;P(tail,'box',m,[.1,.7,.12],[0,-.35,0]);g.userData.head=n;g.userData.tail=tail;g.userData.headRest=-.55;g.userData.legs=legs;return g}
function wanderFx(a,cx,cz,rx,rz,speed=.6,peck=.6){const u=a.userData;u.tx=cx;u.tz=cz;u.wait=Math.random()*2;a.position.set(cx+(Math.random()-.5)*rx,0,cz+(Math.random()-.5)*rz);a.rotation.y=Math.random()*6.28;
  const rest=u.headRest||0;
  return (dt,t)=>{const p=a.position,dx=u.tx-p.x,dz=u.tz-p.z,d=Math.hypot(dx,dz);
    if(u.tail)u.tail.rotation.z=Math.sin(t*3+cx)*.25;
    if(u.hop)return;
    if(u.wait>0){if(u.bs!=null)a.scale.setScalar(u.bs);u.wait-=dt;if(u.head)u.head.rotation.x=rest+Math.max(0,Math.sin(t*(peck>0.5?9:2)+cz))*peck;p.y=0;return}
    if(d<.05){u.tx=cx+(Math.random()*2-1)*rx;u.tz=cz+(Math.random()*2-1)*rz;u.wait=.5+Math.random()*3;return}
    const s=Math.min(d,speed*dt);p.x+=dx/d*s;p.z+=dz/d*s;let da=Math.atan2(dx,dz)-a.rotation.y;da=Math.atan2(Math.sin(da),Math.cos(da));a.rotation.y+=da*Math.min(1,dt*7);
    if(u.bs==null)u.bs=a.scale.x;const hop=Math.abs(Math.sin(t*11+cx));p.y=hop*.06*u.bs;a.scale.set(u.bs*(1-hop*.05),u.bs*(1+hop*.08),u.bs*(1-hop*.05));if(u.head)u.head.rotation.x=rest}}
function idleFx(a,ph=0){const u=a.userData,rest=u.headRest||0;return(dt,t)=>{if(u.head)u.head.rotation.x=rest+Math.max(0,Math.sin(t*.9+ph))*.45;if(u.tail)u.tail.rotation.z=Math.sin(t*2.6+ph)*.3}}

// --- ekinler ---
function plant(par,type,stage,x,z,q){
  const j=(q()-.5)*.12;
  if(stage===1){P(par,'cone',0x7cc04a,[.05,.18,.05],[x+j,.09,z]);P(par,'cone',0x6ab03e,[.04,.14,.04],[x+j+.05,.07,z+.03],[0,0,.4]);return}
  if(stage===2){const hh=type==='misir'||type==='aycicegi'?.6:.32;P(par,'cone',0x5fa83a,[.13,hh,.13],[x+j,hh/2,z]);return}
  switch(type){
    case'bugday':for(let k=0;k<3;k++){const a=x+j+(k-1)*.07,b=z+(q()-.5)*.08;P(par,'cyl',0xd9b44a,[.012,.5,.012],[a,.25,b]);P(par,'cyl',0xe8c25a,[.035,.16,.035],[a,.55,b])}break;
    case'misir':P(par,'cyl',0x4f9a35,[.04,1.05,.04],[x+j,.52,z]);P(par,'box',0x5fae3d,[.5,.03,.08],[x+j,.55,z],[0,0,.5]);P(par,'box',0x5fae3d,[.45,.03,.08],[x+j,.75,z],[0,0,-.5]);P(par,'cyl',0xf3c63c,[.06,.24,.06],[x+j+.08,.7,z],[0,0,.25]);P(par,'cone',0xc9b24a,[.05,.18,.05],[x+j,1.12,z]);break;
    case'domates':P(par,'ico1',0x4f9636,[.22,.24,.22],[x+j,.24,z]);for(let k=0;k<3;k++)P(par,'lsph',0xe03c2c,[.07,.07,.07],[x+j+Math.cos(k*2.1)*.17,.2+k*.06,z+Math.sin(k*2.1)*.17]);break;
    case'aycicegi':{P(par,'cyl',0x4f9a35,[.03,1,.03],[x+j,.5,z]);P(par,'box',0x5fae3d,[.25,.02,.12],[x+j,.5,z]);const h=G(par,[x+j,1.02,z+.03]);h.rotation.x=-.35;P(h,'cyl',0xf5c518,[.2,.03,.2],[0,0,0],[Math.PI/2,0,0]);P(h,'cyl',0x5a3a1a,[.1,.05,.1],[0,0,.02],[Math.PI/2,0,0]);break}
    case'pamuk':P(par,'ico1',0x5a8f3a,[.18,.22,.18],[x+j,.22,z]);for(let k=0;k<4;k++)P(par,'ico1',0xffffff,[.07,.07,.07],[x+j+Math.cos(k*1.6)*.14,.36+((k%2)*.06),z+Math.sin(k*1.6)*.14]);break;
    case'kabak':P(par,'ico1',0x4f9636,[.25,.12,.25],[x+j,.1,z]);P(par,'sph',0xf08a24,[.2,.16,.2],[x+j+.1,.16,z]);break;
    case'altinbugday':for(let k=0;k<3;k++){const a=x+j+(k-1)*.07;P(par,'cyl',0xe8c25a,[.012,.5,.012],[a,.25,z]);P(par,'cyl',0xffd23f,[.04,.17,.04],[a,.56,z],null,{emissive:0xf2b330,emissiveIntensity:.5})}break;
    case'morhavuc':for(let k=0;k<3;k++)P(par,'cone',0x5fae3d,[.04,.25,.04],[x+j+(k-1)*.05,.18,z],[0,0,(k-1)*.3]);P(par,'cone',0x7a2f8a,[.07,.14,.07],[x+j,.05,z],[Math.PI,0,0]);break;
    case'cilek':P(par,'ico1',0x4f9636,[.18,.1,.18],[x+j,.1,z]);for(let k=0;k<3;k++)P(par,'cone',0xe0303c,[.05,.09,.05],[x+j+Math.cos(k*2)*.14,.07,z+Math.sin(k*2)*.14],[Math.PI,0,0]);break;
  }
}
function fieldBed(par,t,w=3.7,d=3.7,rows=5,cols=6){
  P(par,'box',0x6b4423,[w,.18,d],[0,.09,0]);const crop=t&&t.job?t.job.r:null;const stage=crop?stageOf(t.job):0;const q=rng(7);
  const pg=G(par,[0,.28,0]);const piv=[];
  for(let r=0;r<rows;r++){const z=-d/2+d/rows*(r+.5);P(par,'box',0x7d5230,[w-.2,.12,d/rows*.55],[0,.22,z]);
    if(crop)for(let c=0;c<cols;c++){const x=-w/2+w/cols*(c+.5);const pv=G(pg,[x,0,z]);plant(pv,crop,stage,0,0,q);piv.push(pv)}}
  if(stage>=2)addFx(par,(dt,tm)=>{for(const pv of piv){pv.rotation.z=Math.sin(tm*2.1+pv.position.x*.9+pv.position.z*.4)*.09;pv.rotation.x=Math.cos(tm*1.7+pv.position.z)*.04}})}

// --- binalar ---
function house(l){const g=G(null);
  if(l===1){P(g,'box',0x8b5a32,[2.2,1.3,1.8],[0,.65,0]);for(let k=0;k<5;k++)P(g,'cyl',0x74482a,[.09,2.24,.09],[0,.13+k*.26,.92],[0,0,Math.PI/2]);
    for(let k=0;k<5;k++)P(g,'cyl',0x74482a,[.09,1.84,.09],[1.12,.13+k*.26,0],[Math.PI/2,0,0]);
    gableRoof(g,2.2,1.8,1.05,1.3,0xc9a050,0x8b5a32,'x',.32,.18);door(g,.45,0,.95);windowM(g,-.5,.75,.96,.42,.42);
    P(g,'box',0x8a8478,[.32,1.1,.32],[-.7,1.95,-.35]);P(g,'box',0x6f6a60,[.38,.1,.38],[-.7,2.5,-.35]);
    for(let k=0;k<3;k++)for(let m=0;m<3-k;m++)P(g,'cyl',0xa6773f,[.1,.6,.1],[1.45+m*.2+k*.1,.1+k*.17,.3],[Math.PI/2,0,0]);
    P(g,'cyl',0x8a6038,[.18,.4,.18],[-1.4,.2,.9]);g.userData.chimney=[-.7,2.6,-.35];return g}
  if(l===2){P(g,'box',stdTex(TEX.stone([2,1.2])),[2.7,1.6,2.1],[0,.8,0]);
    gableRoof(g,2.7,2.1,1.1,1.6,0xb4432c,0xd8cdb8,'x',.3);door(g,0,0,1.06,.55,.95,0x5a3418);windowM(g,-.85,.95,1.07);windowM(g,.85,.95,1.07);
    for(const x of[-.85,.85]){P(g,'box',0x6b4423,[.55,.12,.16],[x,.6,1.14]);for(let k=0;k<4;k++)P(g,'lsph',[0xe8657a,0xf4d03f,0xffffff,0xe8657a][k],[.06,.06,.06],[x-.2+k*.13,.7,1.15])}
    P(g,'box',0xa34a32,[.34,1.1,.34],[.8,2.3,-.4]);P(g,'box',0x7a3524,[.42,.1,.42],[.8,2.86,-.4]);bush(g,-1.6,.6,.9);bush(g,1.6,.7,.8);
    P(g,'box',0x9b9282,[.9,.1,.5],[0,.05,1.32]);g.userData.chimney=[.8,2.95,-.4];return g}
  if(l===3){P(g,'box',0xf2ead8,[2.8,2.2,2.1],[-.3,1.1,-.2]);gableRoof(G(g,[-.3,0,-.2]),2.8,2.1,1.2,2.2,0x9c3a2a,0xf2ead8,'x',.3);
    for(let k=0;k<6;k++)P(g,'box',0xe2d8c2,[2.82,.03,2.12],[-.3,.2+k*.36,-.2]);
    P(g,'box',0xe9dfc8,[1.2,1.5,1.8],[1.75,.75,-.35]);gableRoof(G(g,[1.75,0,-.35]),1.2,1.8,.8,1.5,0x9c3a2a,0xe9dfc8,'z',.2);
    P(g,'box',0x9a7247,[3,.14,.9],[-.3,.12,1.3]);for(const x of[-1.65,-.3,1.05])P(g,'box',0xf8f2e4,[.12,1.1,.12],[x,.7,1.68]);
    {const pr=P(g,'box',0x7a2f22,[3.2,.1,1.1],[-.3,1.3,1.35]);pr.rotation.x=.18}
    door(g,-.3,.18,.86,.6,1,0x2f5a3a);windowM(g,-1.25,.9,.87);windowM(g,.65,.9,.87);windowM(g,-1.25,1.75,.87,.4,.42);windowM(g,.65,1.75,.87,.4,.42);windowM(g,1.75,.85,.56,.38,.42);
    P(g,'box',0x8b8478,[.36,1.2,.36],[-1.3,3.2,-.6]);g.userData.chimney=[-1.3,3.85,-.6];
    P(g,'cyl',0xbb5d3a,[.16,.2,.16],[-1.75,.3,1.55]);P(g,'ico1',0x4f8f37,[.22,.22,.22],[-1.75,.52,1.55]);g.scale.setScalar(.92);return g}
  P(g,'box',0xf3e6c8,[2.4,2.6,2],[0,1.3,-.2]);gableRoof(G(g,[0,0,-.2]),2.4,2,1,2.6,0x44536f,0xf3e6c8,'z',.25);
  for(const s of[-1,1]){P(g,'box',0xeadbbb,[1.1,1.9,1.7],[s*1.75,.95,-.3]);gableRoof(G(g,[s*1.75,0,-.3]),1.1,1.7,.7,1.9,0x44536f,0xeadbbb,'x',.2);windowM(g,s*1.75,1.05,.56,.42,.6)}
  for(const x of[-.85,-.3,.3,.85])P(g,'cyl',0xfffaf0,[.1,2.2,.1],[x,1.25,1.05]);P(g,'box',0xfffaf0,[2.2,.2,.5],[0,2.4,1]);
  {const pd=G(g,[0,2.5,1.02]);P(pd,'tri',0xfffaf0,[2.2,.55,.4],[0,0,0])}
  for(let k=0;k<3;k++)P(g,'box',0xd8ccb2,[1.8-k*.2,.1,.35],[0,.05+k*.1,1.45-k*.15]);
  door(g,0,.3,.81,.6,1.1,0x3a2f5a);windowM(g,-.65,1.9,.81,.36,.45);windowM(g,.65,1.9,.81,.36,.45);windowM(g,-.65,.95,.81,.3,.5);windowM(g,.65,.95,.81,.3,.5);
  P(g,'box',0xf3e6c8,[.7,.8,.7],[0,3.9,-.2]);P(g,'pyr',0x44536f,[.6,.8,.6],[0,4.7,-.2],[0,Math.PI/4,0]);P(g,'sph',0xe0b84a,[.07,.07,.07],[0,5.15,-.2]);
  for(const x of[-2.1,2.1])P(g,'box',0x3f7f34,[.5,.45,1.6],[x,.22,1.25]);P(g,'cyl',0xd8ccb2,[.35,.2,.35],[0,.1,1.85]);g.scale.setScalar(.82);return g}
function workshop(g,wall,roof,w=2.5,h=1.5,d=1.9,z=-.4){P(g,'box',wall,[w,h,d],[0,h/2,z]);gableRoof(G(g,[0,0,z]),w,d,.85,h,roof,wall,'x',.25);door(g,0,0,z+d/2+.01,.6,.95,0x5c3a1f);windowM(g,-w/2+.45,h*.6,z+d/2+.02,.36,.4);windowM(g,w/2-.45,h*.6,z+d/2+.02,.36,.4)}
function crate(g,x,z,s=.38,c=0x9a6b3c){P(g,'box',c,[s,s,s],[x,s/2,z]);P(g,'box',0x6e4a28,[s+.02,.05,s+.02],[x,s*.8,z])}
function sack(g,x,z,c=0xe2d3ae){P(g,'sph',c,[.22,.26,.2],[x,.24,z]);P(g,'cyl',0xc9b48a,[.07,.1,.07],[x,.5,z])}
const MODELS={
  kumes:(g,t)=>{const c=G(g,[-.6,0,-.9]);for(const [x,z] of[[-.7,-.5],[.7,-.5],[-.7,.5],[.7,.5]])P(c,'box',0x7a5233,[.1,.45,.1],[x,.22,z]);
    P(c,'box',0xe7c48c,[1.7,1,1.3],[0,.95,0]);gableRoof(c,1.7,1.3,.7,1.45,0xb5402c,0xe7c48c,'x',.2);P(c,'box',0x3a2a1a,[.36,.4,.05],[.3,.75,.66]);
    {const ramp=P(c,'box',0x9a7247,[.3,.05,1],[.3,.25,1.05]);ramp.rotation.x=.5}windowM(c,-.4,1.05,.67,.3,.3,0,.2);
    fenceRun(g,-1.8,.2,1.8,.2,0xd9c8a5,.45);fenceRun(g,-1.8,1.85,1.8,1.85,0xd9c8a5,.45);fenceRun(g,-1.8,.2,-1.8,1.85,0xd9c8a5,.45);fenceRun(g,1.8,.2,1.8,1.85,0xd9c8a5,.45);
    P(g,'box',0xc9a05a,[3.4,.03,1.5],[0,.02,1.02]);const n=2+(t?t.l:1);for(let k=0;k<n;k++){const ch=chicken([0xfaf6ee,0xb8693a,0xfaf6ee,0x3a2a22][k%4]);ch.scale.setScalar(.85);g.add(ch);addFx(g,wanderFx(ch,0,1.02,1.4,.55,.5));addFx(g,()=>{ch.visible=S.weather.k!=='storm'})}
    P(g,'box',0x9a7247,[.6,.15,.25],[1.1,.08,-.2]);P(g,'box',0xe8c25a,[.5,.04,.18],[1.1,.16,-.2])},
  silo:(g,t)=>{const l=t?t.l:1;P(g,'cyl',0xc7ccd2,[.9,3.2,.9],[-.4,1.6,-.3]);for(let k=0;k<6;k++)P(g,'cyl',0xa9afb8,[.92,.05,.92],[-.4,.3+k*.5,-.3]);
    P(g,'hsph',0xb5402c,[.92,.6,.92],[-.4,3.2,-.3]);if(l>=2){P(g,'cyl',0xc7ccd2,[.6,2.4,.6],[1.1,1.2,.4]);P(g,'hsph',0xb5402c,[.62,.4,.62],[1.1,2.4,.4])}
    if(l>=3){P(g,'cyl',0xc7ccd2,[.55,2,.55],[1.2,1,-1.1]);P(g,'hsph',0xb5402c,[.57,.35,.57],[1.2,2,-1.1])}
    P(g,'box',0x6e6e6e,[.08,3,.08],[-1.32,1.5,.2]);for(let k=0;k<8;k++)P(g,'box',0x6e6e6e,[.3,.04,.04],[-1.32,.3+k*.36,.2]);sack(g,.4,1.2);sack(g,.75,1.3,0xd8c79e)},
  yemhane:(g,t)=>{workshop(g,0xa47148,0x5d6b4a,2.2,1.4,1.6,-.6);P(g,'cone',0xa9afb8,[.55,.8,.55],[1.3,1.8,.5],[Math.PI,0,0]);P(g,'cyl',0xa9afb8,[.55,.5,.55],[1.3,2.45,.5]);
    for(const [x,z] of[[1,.25],[1.6,.25],[1,.75],[1.6,.75]])P(g,'box',0x6e6e6e,[.06,1.4,.06],[x,.7,z]);for(let k=0;k<4;k++)sack(g,-1.3+k*.32,1.1+(k%2)*.15,0xe2d3ae);
    const gear=P(g,'cyl',0x707680,[.35,.08,.35],[-.9,1.15,.24],[Math.PI/2,0,0]);addFx(g,(dt)=>{gear.rotation.y+=dt*(S.units.yemhane&&S.units.yemhane.job?3:.3)})},
  ahir:(g,t)=>{const b=G(g,[0,0,-.5]);P(b,'box',0xb23b2b,[2.8,1.7,2.3],[0,.85,0]);P(b,'gam',0xb23b2b,[2.8,1.35,2.3],[0,1.7,0]);
    const rc=0x5e2a22;for(const s of[-1,1]){const pts=[[s*1.5,1.62],[s*1.16,2.48],[0,3.1]];for(let k=0;k<2;k++){const [a1,y1]=pts[k],[a2,y2]=pts[k+1];P(b,'box',rc,[Math.hypot(a2-a1,y2-y1)+.04,.1,2.55],[(a1+a2)/2,(y1+y2)/2+.05,0],[0,0,Math.atan2(y2-y1,a2-a1)])}}
    for(const x of[-1.42,1.42])P(b,'box',0xf6f0e0,[.1,1.7,.1],[x,.85,1.16]);P(b,'box',0xf6f0e0,[2.9,.1,.1],[0,1.7,1.16]);
    P(b,'box',0x8f2a1e,[1.1,1.15,.06],[0,.58,1.16]);P(b,'box',0xf6f0e0,[1.2,.08,.08],[0,1.17,1.19]);for(const s of[-1,1]){P(b,'box',0xf6f0e0,[.08,1.2,.08],[s*.56,.6,1.19]);P(b,'box',0xf6f0e0,[1.5,.07,.07],[0,.58,1.2],[0,0,s*.83])}
    P(b,'box',0x8f2a1e,[.6,.55,.06],[0,2.2,1.17]);P(b,'box',0xf6f0e0,[.68,.62,.04],[0,2.2,1.155]);
    for(let k=0;k<2;k++)P(g,'cyl',0xd9b45e,[.35,.6,.35],[1.6,.35,.8+k*.7],[Math.PI/2,0,0]);
    const n=1+(t?t.l:1);for(let k=0;k<Math.min(n,3);k++){const c=cow();c.scale.setScalar(.62);g.add(c);addFx(g,wanderFx(c,-.6+k*.4,1.35,.9,.35,.25,.5))}},
  degirmen:(g,t)=>{const tw=new THREE.Mesh(new THREE.CylinderGeometry(.62,1.05,3,8),M(0xeee4cc));tw.position.y=1.5;tw.castShadow=tw.receiveShadow=true;outline(tw);g.add(tw);
    P(g,'cone',0x7a3a28,[.85,1,.85],[0,3.45,0]);door(g,0,0,1.0,.45,.8);windowM(g,0,1.9,.82,.28,.32);
    const hub=G(g,[0,3.05,.86]);P(hub,'cyl',0x5a3a22,[.15,.25,.15],[0,0,0],[Math.PI/2,0,0]);for(let k=0;k<4;k++){const bl=G(hub);bl.rotation.z=k*Math.PI/2;P(bl,'box',0x6e4a2a,[.08,1.9,.05],[0,1,0]);P(bl,'box',0xf8f1de,[.42,1.4,.03],[.25,1.15,.02])}
    addFx(g,(dt)=>{hub.rotation.z+=dt*(S.units.degirmen&&S.units.degirmen.job?2.4:.35)});sack(g,1.2,.9);sack(g,1.45,1.15,0xd8c79e)},
  firin:(g,t)=>{workshop(g,0xc9774a,0x6b3a28,2.4,1.4,1.7,-.6);P(g,'hsph',0xb25a36,[.85,.9,.85],[1.05,0,.75]);P(g,'arch',0x2a1a12,[.5,.5,.2],[1.05,0,1.55]);
    P(g,'box',0x9a4a30,[.35,1.2,.35],[-.8,2.2,-.9]);for(let k=0;k<3;k++)P(g,'cyl',0xa6773f,[.08,.6,.08],[-1.1+k*.18,.08,.95],[Math.PI/2,0,0]);addSmoke(g,[-.8,2.85,-.9],()=>!!(S.units.firin&&S.units.firin.job))},
  agil:(g,t)=>{const sh=G(g,[0,0,-1]);P(sh,'box',0xa77b4f,[3.2,1.1,1.3],[0,.55,0]);{const r=P(sh,'box',0x5e4b38,[3.5,.12,1.8],[0,1.25,.15]);r.rotation.x=-.18}
    fenceRun(g,-1.8,-.3,-1.8,1.85);fenceRun(g,1.8,-.3,1.8,1.85);fenceRun(g,-1.8,1.85,1.8,1.85);P(g,'box',0xa58a4a,[3.3,.03,2],[0,.02,.8]);
    const n=2+(t?t.l:1);for(let k=0;k<n;k++){const s=sheep();s.scale.setScalar(.62);g.add(s);addFx(g,wanderFx(s,0,.85,1.3,.7,.3,.4))}
    P(g,'box',0x9a7247,[.8,.4,.35],[-1.2,.2,-.2]);P(g,'box',0xd9b45e,[.7,.12,.3],[-1.2,.42,-.2])},
  mandira:(g,t)=>{workshop(g,0xf4f1ea,0x3f6fa0,2.6,1.6,1.9,-.5);P(g,'box',0x3f6fa0,[2.62,.25,1.92],[0,.12,-.5]);
    for(let k=0;k<3;k++){const x=-1.4+k*.35;P(g,'cyl',0xc7ccd2,[.13,.38,.13],[x,.19,.85]);P(g,'cyl',0xc7ccd2,[.08,.08,.08],[x,.42,.85])}
    P(g,'cyl',0xf2c94c,[.32,.18,.32],[1.3,.09,.9]);P(g,'cyl',0xf2c94c,[.28,.16,.28],[1.3,.26,.9])},
  kovan:(g,t)=>{for(let k=0;k<4;k++){const x=-1.2+(k%2)*1.9,z=-.9+Math.floor(k/2)*1.5;P(g,'box',0x8a6a44,[.7,.15,.6],[x,.08,z]);
      for(let m=0;m<3;m++)P(g,'box',[0xf4e3b0,0xf0c75e,0xfff3d0][m],[.6,.3,.5],[x,.3+m*.31,z]);P(g,'box',0xb5402c,[.72,.08,.62],[x,1.2,z]);P(g,'box',0x2a1a12,[.2,.05,.02],[x,.22,z+.26])}
    flowers(g,.3,.2,3.2,4);flowers(g,0,1.3,3,8);
    const bees=[];for(let k=0;k<6;k++)bees.push(P(g,'lsph',0x2a1a12,[.05,.04,.06],[0,1,0],null,{emissive:0xf2b330,emissiveIntensity:.6}));
    addFx(g,(dt,tm)=>bees.forEach((b,k)=>{b.position.set(Math.sin(tm*(1+k*.2)+k)*1.4,1+Math.sin(tm*3+k)*.3,Math.cos(tm*(.8+k*.15)+k*2)*1.2)}))},
  bahce:(g,t)=>{const ready=t&&t.job&&prog(t.job)>.6;P(g,'box',0x6b8f3a,[3.8,.02,3.8],[0,.01,0]);for(const [x,z] of[[-1,-1],[1,-1],[-1,1],[1,1]])oak(g,x,z,.75,ready);crate(g,0,.2,.35)},
  konserve:(g,t)=>{workshop(g,0xd56b3f,0x5e3a2a,2.4,1.5,1.7,-.6);for(let k=0;k<3;k++)crate(g,-1.2+k*.42,1.05,.36,0xa7743f);for(let k=0;k<5;k++)P(g,'cyl',0xb5262a,[.07,.14,.07],[.6+k*.17,.07,1.1]);
    P(g,'cyl',0xc7ccd2,[.4,.9,.4],[1.2,.45,.6])},
  besi:(g,t)=>{const sh=G(g,[0,0,-.7]);for(const x of[-1.6,0,1.6])for(const z of[-.8,.8])P(sh,'box',0x6e4a2a,[.14,1.5,.14],[x,.75,z]);P(sh,'box',0x6e4a2a,[3.4,1.5,.1],[0,.75,-.85]);
    {const r=P(sh,'box',0x4d5a6b,[3.7,.1,2.1],[0,1.62,0]);r.rotation.x=.12}P(sh,'box',0x9a7247,[3.2,.35,.3],[0,.18,.75]);P(sh,'box',0xd9b45e,[3,.1,.22],[0,.37,.75]);
    fenceRun(g,-1.8,.3,-1.8,1.85);fenceRun(g,1.8,.3,1.8,1.85);fenceRun(g,-1.8,1.85,1.8,1.85);
    const n=1+(t?t.l:1);for(let k=0;k<n;k++){const c=cow(0x7a4a2a,0x5a3420,true);c.scale.setScalar(.6);g.add(c);addFx(g,wanderFx(c,-.8+k*.6,1.1,.6,.4,.2,.5))}},
  yaghane:(g,t)=>{workshop(g,0xe9c45a,0x5d4b3a,2.4,1.5,1.7,-.6);for(const x of[.9,1.5])P(g,'cyl',0xd7a82b,[.32,1.3,.32],[x,.65,.85]);
    P(g,'box',0x6e6e6e,[.9,.06,.06],[1.2,1.25,.85]);for(let k=0;k<4;k++)P(g,'cyl',0xf2c94c,[.06,.2,.06],[-1.2+k*.16,.1,1.1])},
  dokuma:(g,t)=>{workshop(g,0x8e6aa8,0x4a3a5a,2.5,1.5,1.8,-.6);for(let k=0;k<3;k++){P(g,'cyl',[0xd8435a,0x3f6fa0,0xf2c94c][k],[.17,.4,.17],[-1.2+k*.42,.2,1.05]);P(g,'cyl',0x8a6038,[.06,.48,.06],[-1.2+k*.42,.24,1.05])}
    P(g,'box',0x9a7247,[.9,.7,.3],[1.2,.35,1]);P(g,'box',0xd8435a,[.8,.5,.04],[1.2,.45,1.16])},
  sera:(g,t)=>{const glass=toonMat({color:0xcfeefa,transparent:true,opacity:.28,depthWrite:false});
    fieldBed(G(g),t,3.1,3.1,4,5);
    const frame=0xf4f1ea;for(const x of[-1.65,-.55,.55,1.65])for(const z of[-1.65,1.65])P(g,'box',frame,[.07,1.6,.07],[x,.8,z]);for(const z of[-1.65,1.65])P(g,'box',frame,[3.3,.07,.07],[0,1.6,z]);for(const x of[-1.65,1.65])P(g,'box',frame,[.07,.07,3.3],[x,1.6,0]);
    const box=new THREE.Mesh(GE.box,glass);box.scale.set(3.3,1.6,3.3);box.position.y=.8;g.add(box);const roof=new THREE.Mesh(GE.tri,glass);roof.scale.set(3.3,.9,3.3);roof.position.y=1.6;g.add(roof);
    P(g,'box',frame,[.06,.06,3.3],[0,2.5,0]);for(const z of[-1.65,1.65]){P(g,'box',frame,[1.75,.06,.06],[-.82,2.05,z],[0,0,.5]);P(g,'box',frame,[1.75,.06,.06],[.82,2.05,z],[0,0,-.5])}},
  hara:(g,t)=>{const st=G(g,[0,0,-.4]);P(st,'box',0x9a6a3e,[3.3,1.3,1.2],[0,.65,0]);gableRoof(st,3.3,1.2,.6,1.3,0x4f3b2a,0x9a6a3e,'x',.2);
    for(let k=0;k<3;k++){P(st,'box',0x5e3d22,[.75,.6,.05],[-1.05+k*1.05,.35,.61]);P(st,'box',0x2a1a12,[.75,.5,.04],[-1.05+k*1.05,.95,.6])}
    const n=Math.min(2,t?t.l:1);for(let k=0;k<n;k++){const h=horse([0x8a5530,0x3a2a22][k]);h.scale.setScalar(.5);g.add(h);addFx(g,wanderFx(h,0,1.1,1.3,.3,.5,.4))}},
};
// --- insanlar (pazarcılar, tüccar, işçiler, köylüler) ---
function person(o={}){const g=G(null);const skin=o.skin||0xe8b48a,shirt=o.shirt||0xe9e2cf,pants=o.pants||0x3f5f8a;const legs=[],arms=[];
  for(const s of[-1,1]){const l=G(g,[s*.11,.52,0]);P(l,'box',pants,[.15,.5,.17],[0,-.25,0]);P(l,'box',0x3a2416,[.17,.09,.24],[0,-.5,.03]);legs.push(l)}
  P(g,'box',o.dress||shirt,[o.dress?.5:.4,o.dress?.72:.46,.28],[0,o.dress?.66:.76,0]);if(o.apron)P(g,'box',o.apron,[.3,.42,.03],[0,.7,.15]);
  for(const s of[-1,1]){const a=G(g,[s*.27,1.06,0]);P(a,'box',shirt,[.13,.44,.14],[0,-.21,0]);P(a,'sph',skin,[.075,.075,.075],[0,-.46,0]);arms.push(a)}
  const hd=G(g,[0,1.33,0]);P(hd,'sph',skin,[.21,.22,.21]);P(hd,'sph',0xd99a6a,[.055,.055,.055],[0,-.03,.21]);P(hd,'lsph',0x1a1a1a,[.03,.035,.03],[.08,.05,.18]);P(hd,'lsph',0x1a1a1a,[.03,.035,.03],[-.08,.05,.18]);
  if(o.mus)P(hd,'box',0x5a3a22,[.22,.06,.05],[0,-.1,.19]);
  if(o.hat==='fez'){P(hd,'cyl',0xb5262a,[.15,.22,.13],[0,.25,0])}
  else if(o.hat==='cap'){P(hd,'hsph',o.hatc||0x3f6fa0,[.22,.14,.22],[0,.08,0]);P(hd,'box',o.hatc||0x3f6fa0,[.2,.03,.16],[0,.09,.18])}
  else if(o.hat==='scarf'){P(hd,'hsph',o.hatc||0xc4492e,[.24,.2,.24],[0,0,-.02])}
  else if(o.hat==='straw'){P(hd,'cyl',0xe2c46a,[.38,.03,.38],[0,.15,0]);P(hd,'cyl',0xe2c46a,[.18,.2,.18],[0,.26,0]);P(hd,'cyl',0xb5402c,[.185,.045,.185],[0,.19,0])}
  g.userData.legs=legs;g.userData.arms=arms;g.userData.head=hd;return g}
function idlePerson(p,ph){return(dt,t)=>{const u=p.userData;u.head.rotation.y=Math.sin(t*.7+ph)*.5;u.arms[1].rotation.x=Math.sin(t*.9+ph)>.75?-1.3+Math.sin(t*9)*.3:Math.sin(t*1.3+ph)*.1;u.arms[0].rotation.x=Math.sin(t*1.1+ph)*.08;p.position.y=Math.abs(Math.sin(t*1.6+ph))*.02}}
function walkPerson(p,pts,speed=1.2,pause=1.5){let i=0,w=Math.random()*2;p.position.set(pts[0][0],0,pts[0][1]);return(dt,t)=>{const u=p.userData,[tx,tz]=pts[i],dx=tx-p.position.x,dz=tz-p.position.z,d=Math.hypot(dx,dz);let walking=false;
  if(w>0)w-=dt;else if(d<.06){i=(i+1)%pts.length;w=pause*(.5+Math.random())}else{walking=true;const s=Math.min(d,speed*dt);p.position.x+=dx/d*s;p.position.z+=dz/d*s;p.rotation.y=lerpA(p.rotation.y,Math.atan2(dx,dz),Math.min(1,dt*8))}
  const sw=walking?Math.sin(t*9):0;u.legs[0].rotation.x=sw*.6;u.legs[1].rotation.x=-sw*.6;u.arms[0].rotation.x=-sw*.5;u.arms[1].rotation.x=sw*.5;p.position.y=walking?Math.abs(Math.sin(t*9))*.06:0}}
// --- dekorasyon ---
const KILIM={kilim_mavi:['#2c4f8a','#c4492e','#f0c24b','#f6ead0','#a3271f'],kilim_yesil:['#3f7a4a','#f0c24b','#a3271f','#f6ead0','#2c3e6b'],kilim_altin:['#c98a12','#7a2f22','#f6ead0','#2c3e6b','#3f7a4a']};
function houseDecor(sc){const D=S.decor.house;
  if(D.duvar){const g=G(sc,[-.8,3.1,-4.92]);P(g,'box',0x8a5a32,[1.7,1.25,.08]);if(D.duvar==='nal'){P(g,'box',0xf3e6c4,[1.5,1.05,.1]);P(g,'tor',0x9aa0a8,[.32,.36,.32],[0,0,.08])}
    else{P(g,'box',D.duvar==='tablo_at'?0xc9a06a:0x9fc7de,[1.5,1.05,.1]);if(D.duvar==='tablo_koy'){P(g,'box',0x7fae47,[1.5,.45,.11],[0,-.3,0]);P(g,'cyl',0xf2c94c,[.13,.02,.13],[.45,.25,.06],[Math.PI/2,0,0]);P(g,'box',0xc4492e,[.25,.2,.12],[-.3,-.05,0])}
      else{const h=horse(0x6a4a30,0x2e1d12);h.scale.setScalar(.3);h.rotation.y=Math.PI/2;h.position.set(-.05,-.45,.08);g.add(h)}}}
  if(D.kose){const g=G(sc,[5.6,0,3]);if(D.kose==='saksi'){P(g,'cyl',0xbb5d3a,[.35,.6,.35],[0,.3,0]);P(g,'cyl',0x6e4527,[.06,.6,.06],[0,.8,0]);P(g,'ico1',0x3f7f34,[.7,.9,.7],[0,1.5,0])}
    else if(D.kose==='sandik'){P(g,'box',0x9a3a22,[1.2,.7,.7],[0,.35,0]);P(g,'box',0xe0b84a,[1.22,.08,.72],[0,.55,0]);P(g,'box',0xe0b84a,[.08,.72,.72],[-.35,.35,0]);P(g,'box',0xe0b84a,[.08,.72,.72],[.35,.35,0])}
    else{P(g,'box',0x6e4424,[.7,.6,.6],[0,.3,0]);P(g,'cyl',0x3a2a20,[.25,.04,.25],[0,.62,0]);P(g,'cone',0xe0b84a,[.35,.7,.35],[.1,1,0],[0,0,-.9])}}
  if(D.masa){const g=G(sc,[-1.05,1.08,.6]);if(D.masa==='semaver'){P(g,'cyl',0xc98a3a,[.18,.5,.18],[0,.25,0]);P(g,'cone',0xc98a3a,[.12,.15,.12],[0,.56,0]);P(g,'cyl',0xc4492e,[.09,.12,.09],[0,.68,0])}
    else if(D.masa==='vazo'){P(g,'cyl',0x3f6fa0,[.12,.3,.12],[0,.15,0]);for(let k=0;k<5;k++)P(g,'lsph',[0xe8657a,0xf4d03f,0xffffff][k%3],[.08,.08,.08],[Math.cos(k*1.3)*.1,.38+(k%2)*.06,Math.sin(k*1.3)*.1])}
    else{P(g,'cyl',0xa6773f,[.25,.14,.25],[0,.07,0]);for(let k=0;k<6;k++)P(g,'lsph',[0xd43a2a,0xf3c63c,0x7cc04a][k%3],[.08,.08,.08],[Math.cos(k)*.12,.17,Math.sin(k)*.12])}}
  if(D.tavan){const g=G(sc,[-2.6,4.3,2.2]);P(g,'cyl',0x333333,[.02,1,.02],[0,.5,0]);if(D.tavan==='fener'){P(g,'cyl',0xffd27a,[.16,.3,.16],[0,-.1,0],null,{emissive:0xffb648,emissiveIntensity:1.2});g.add(new THREE.PointLight(0xffc070,.6,12))}
    else{P(g,'tor',0xc98a3a,[.6,.6,.6],[0,-.1,0],[Math.PI/2,0,0]);for(let k=0;k<6;k++){const a=k/6*6.28;P(g,'cone',0xfff1c8,[.05,.2,.05],[Math.cos(a)*.6,.02,Math.sin(a)*.6],null,{emissive:0xffd27a,emissiveIntensity:1.5})}g.add(new THREE.PointLight(0xffe0a0,.7,12))}}}
function farmDecor(g){const D=S.decor.farm;
  if(D.bahce1){const s=G(g,[-3.6,0,4.4]);if(D.bahce1==='heykel'){P(s,'cyl',stoneMat(),[.4,.6,.4],[0,.3,0]);P(s,'sph',0xf5d24a,[.3,.25,.38],[0,.8,0]);P(s,'sph',0xf5d24a,[.17,.17,.17],[0,1.1,.2]);P(s,'box',0xf08a24,[.1,.05,.18],[0,1.08,.38])}
    else{F(s,0x7a4a28,[1.6,.12,1],[0,.06,0]);flowers(s,0,0,1.3,77)}}
  if(D.bahce2){const s=G(g,[3.4,0,4.2]);if(D.bahce2==='kusevi'){P(s,'box',0x6e4a2a,[.08,1.6,.08],[0,.8,0]);P(s,'box',0xc9774a,[.45,.4,.4],[0,1.75,0]);gableRoof(G(s),.45,.4,.25,1.95,0x2f6b3a,0xc9774a,'x',.06);P(s,'cyl',0x2a1a10,[.07,.02,.07],[0,1.75,.21],[Math.PI/2,0,0])}
    else{P(s,'cyl',stoneMat(),[.8,.45,.8],[0,.22,0]);P(s,'cyl',0x5aa0c8,[.68,.05,.68],[0,.44,0]);P(s,'cyl',0xb4ab9b,[.12,.8,.12],[0,.7,0]);P(s,'sph',0xb4ab9b,[.25,.12,.25],[0,1.1,0])}}
  if(D.giris){const s=G(g,[0,0,5.4]);if(D.giris==='bayrak'){for(const x of[-1.6,1.6])P(s,'cyl',0x6e4a2a,[.05,2.2,.05],[x,1.1,0]);for(let k=0;k<9;k++){const x=-1.4+k*.35,y=2-Math.sin(k/8*Math.PI)*.35;P(s,'cone',[0xc4492e,0xf2b330,0x3f6fa0,0x2f6b3a][k%4],[.13,.3,.03],[x,y-.15,0],[Math.PI,0,0])}}
    else{const ar=new THREE.Mesh(new THREE.TorusGeometry(1.4,.12,6,18,Math.PI),M(0x7a4e2d));ar.position.y=.1;ar.castShadow=true;outline(ar);s.add(ar);for(let k=0;k<12;k++){const a=k/11*Math.PI;P(s,'lsph',[0xf3b6c8,0xffffff,0xe8657a][k%3],[.13,.13,.13],[Math.cos(a)*1.4,.1+Math.sin(a)*1.4,.1])}}}}
// --- panayır ---
function fairModel(g){const stripes=toonMat({map:canvasTex(128,32,(x,w,h)=>{for(let i=0;i<8;i++){x.fillStyle=i%2?'#f6efe0':'#c4492e';x.fillRect(i*16,0,16,h)}},[2,1])});
  F(g,0xd8c8a2,[11,.04,7.5],[0,.02,1]);
  P(g,'cyl',stripes,[2.4,1.8,2.4],[0,.9,-1]);P(g,'cone',stripes,[2.8,1.8,2.8],[0,2.7,-1]);P(g,'cyl',0x6e4a2a,[.05,.8,.05],[0,3.9,-1]);const fl=P(g,'box',0xf2b330,[.6,.35,.03],[.3,4.1,-1]);addFx(g,(dt,t)=>{fl.rotation.y=Math.sin(t*3)*.4});
  P(g,'box',0x2a1a10,[1,1.3,.05],[0,.65,1.4]);
  const pd=G(g,[3.4,0,1.2]);[[0,.6,0xf2b330],[-.8,.4,0xc9ccd2],[.8,.25,0xc98a3a]].forEach(([x,h,c])=>P(pd,'box',c,[.75,h,.75],[x,h/2,0]));
  const jt=G(g,[-3.2,0,1.4]);P(jt,'box',0xf6efe0,[2,.8,.7],[0,.4,0]);P(jt,'box',0x3f6fa0,[2.02,.2,.72],[0,.7,0]);
  const judge=person({shirt:0x2a2a2a,pants:0x2a2a2a,hat:'cap',hatc:0x2a2a2a,mus:true});judge.position.set(-3.2,0,.7);g.add(judge);addFx(g,idlePerson(judge,1));
  P(g,'sph',0xf08a24,[.75,.55,.75],[1.8,.55,2.6]);P(g,'cyl',0x5f8a3a,[.06,.25,.06],[1.8,1.15,2.6]);
  for(const x of[-5,5])P(g,'cyl',0x6e4a2a,[.06,3.3,.06],[x,1.65,3]);
  for(let k=0;k<15;k++){const t=k/14,x=-5+10*t,y=3.2-Math.sin(t*Math.PI)*.6;P(g,'cone',[0xc4492e,0xf2b330,0x3f6fa0,0x2f6b3a][k%4],[.14,.32,.03],[x,y-.15,3],[Math.PI,0,0])}
  const v1=person({dress:0xc4492e,shirt:0xc4492e,hat:'scarf',hatc:0xf2b330});g.add(v1);addFx(g,walkPerson(v1,[[-2,3.8],[2.5,3.8],[2.5,2.2],[-2,2.6]],1,2));
  const v2=person({shirt:0x2f6b3a,hat:'cap',hatc:0x7a4e2d});g.add(v2);addFx(g,walkPerson(v2,[[3.5,4],[-3.5,3.4]],.9,3))}

// --- kasaba ve özel konum modelleri ---
function stall(par,x,z,ry,ac){const g=G(par,[x,0,z],ry);P(g,'box',0x9a6a3e,[2.6,.9,1],[0,.45,0]);P(g,'box',0x7a4e2d,[2.8,.1,1.2],[0,.93,0]);for(const sx of[-1.25,1.25])for(const sz of[-.45,.45])P(g,'box',0x6e4a2a,[.1,2.1,.1],[sx,1.05,sz]);
  for(let k=0;k<6;k++){const a=P(g,'box',k%2?0xf6efe0:ac,[.46,.05,1.5],[-1.15+k*.46,2.15,.15]);a.rotation.x=.3}
  const prod=[0xe03c2c,0xf3c63c,0x7cc04a,0xf5a623];for(let k=0;k<3;k++){crate(g,-.8+k*.8,.7,.36);for(let m=0;m<3;m++)P(g,'lsph',prod[(k+m)%4],[.1,.1,.1],[-.85+k*.8+(m%2)*.15,1.02,.62+(m>1?.12:0)])}return g}
function marketModel(g){stall(g,-3.3,-.2,.3,0xc4492e);stall(g,0,-1.3,0,0x3f6fa0);stall(g,3.3,-.2,-.3,0x2f6b3a);
  [[-3.5,-1.25,.3,{shirt:0xf6efe0,apron:0xc4492e,hat:'scarf',hatc:0xc4492e,dress:0x8a5a32}],[0,-2.35,0,{shirt:0x3f6fa0,hat:'cap',hatc:0x3f6fa0,mus:true}],[3.5,-1.25,-.3,{shirt:0xe9e2cf,apron:0x2f6b3a,hat:'straw'}]].forEach(([x,z,ry,o],i)=>{const p=person(o);p.position.set(x,0,z);p.rotation.y=ry;g.add(p);addFx(g,idlePerson(p,i*2))});
  const cu=person({shirt:0xb5402c,hat:'cap',hatc:0x2a2a2a});g.add(cu);addFx(g,walkPerson(cu,[[-3.3,.9],[0,.1],[3.3,.9],[0,3]],.9,2.5));
  const fn=G(g,[0,0,2.2]);P(fn,'cyl',stoneMat(),[1,.5,1],[0,.25,0]);P(fn,'cyl',0x5aa0c8,[.85,.05,.85],[0,.49,0]);P(fn,'cyl',0xb4ab9b,[.15,1,.15],[0,.8,0]);P(fn,'sph',0xb4ab9b,[.3,.15,.3],[0,1.3,0]);
  const drops=[];for(let k=0;k<6;k++){const d=new THREE.Mesh(GE.lsph,toonMat({color:0xbfe6ff}));d.scale.setScalar(.06);fn.add(d);drops.push(d)}addFx(g,(dt,t)=>drops.forEach((d,k)=>{const ph=(t*1.2+k/6)%1,a=k/6*6.28;d.position.set(Math.cos(a)*ph*.7,1.35+ph*.4-ph*ph*1.3,Math.sin(a)*ph*.7)}));
  sack(g,-4.8,1.5);sack(g,-4.5,1.9,0xd8c79e);const cart=G(g,[4.9,0,1.8],.4);P(cart,'box',0x9a6a3e,[1.4,.4,.9],[0,.75,0]);for(const s of[-1,1])P(cart,'tor',0x5a3a22,[.38,.38,.38],[0,.42,s*.5]);P(cart,'box',0x6e4a2a,[1.2,.06,.06],[1.2,.6,0]);for(let k=0;k<4;k++)P(cart,'lsph',0xf3c63c,[.18,.18,.18],[-.3+k*.2,1.05,0]);
  F(g,0xcfb27e,[11,.04,6],[0,.02,.6])}
function hanModel(g){{const m=person({shirt:0x3f6fa0,pants:0x2a2a2a,hat:'fez',mus:true});m.position.set(1.7,0,2.3);m.rotation.y=.3;g.add(m);addFx(g,idlePerson(m,3))}P(g,'box',0xe9d6aa,[4.6,2.4,3],[0,1.2,-.6]);P(g,'box',0x8a5a32,[4.7,.15,3.1],[0,1.25,-.6]);gableRoof(G(g,[0,0,-.6]),4.6,3,1.4,2.4,0x7a3a28,0xe9d6aa,'x',.3);door(g,0,0,.92,.8,1.05,0x5a3418);
  for(const x of[-1.6,1.6]){windowM(g,x,.75,.92,.5,.5);windowM(g,x,1.8,.92,.45,.45)}windowM(g,0,1.85,.92,.45,.4);P(g,'box',0x8b8478,[.4,1.2,.4],[1.6,3.5,-1.2]);addSmoke(g,[1.6,4.2,-1.2],()=>true);
  const sg=G(g,[1.0,1.5,1.25]);P(sg,'box',0x4f3119,[.06,.06,.7],[0,.3,-.35]);const pl=P(sg,'box',0xc9a050,[.75,.45,.06],[0,0,0]);addFx(g,(dt,t)=>{pl.rotation.x=Math.sin(t*1.4)*.12});
  for(let k=0;k<3;k++)P(g,'cyl',0x8a5a32,[.32,.7,.32],[-2+k*.7,.35,1.5]);
  const bd=G(g,[2.9,0,1.9],-.3);for(const x of[-.8,.8])P(bd,'box',0x6e4a2a,[.13,2,.13],[x,1,0]);P(bd,'box',0x9a6a3e,[1.9,1.1,.1],[0,1.4,0]);P(bd,'box',0x5e3d22,[2.1,.12,.35],[0,2.05,0]);
  for(let k=0;k<4;k++){const n=P(bd,'box',[0xfff8e6,0xf6e7b8,0xe8f0ff,0xfff8e6][k],[.36,.42,.02],[-.6+k*.4,1.4+(k%2)*.1,.07]);n.rotation.z=(k-1.5)*.06}
  F(g,0xcfb27e,[8,.04,5],[0,.02,.8])}
function well(par,x,z){const g=G(par,[x,0,z]);P(g,'cyl',stoneMat(),[.6,.6,.6],[0,.3,0]);P(g,'cyl',0x2a3a4a,[.5,.05,.5],[0,.58,0]);for(const s of[-1,1])P(g,'box',0x6e4a2a,[.08,1.2,.08],[s*.5,1.1,0]);P(g,'cyl',0x6e4a2a,[.05,1.1,.05],[0,1.45,0],[0,0,Math.PI/2]);
  gableRoof(G(g),1.3,1,.45,1.65,0xb5402c,0x8a5a32,'x',.1);P(g,'cyl',0x8a6038,[.12,.18,.12],[.2,.9,0]);return g}
function scarecrow(par,x,z){const g=G(par,[x,0,z]);P(g,'cyl',0x6e4a2a,[.06,1.8,.06],[0,.9,0]);const top=G(g,[0,1.3,0]);P(top,'box',0x6e4a2a,[1.4,.07,.07]);P(top,'box',0x5a7ab0,[.5,.6,.25],[0,-.1,0]);
  for(const s of[-1,1])P(top,'box',0x5a7ab0,[.45,.16,.18],[s*.45,0,0]);P(top,'sph',0xe2c890,[.22,.22,.22],[0,.42,0]);P(top,'cyl',0x8a6a3a,[.38,.03,.38],[0,.6,0]);P(top,'cyl',0x8a6a3a,[.18,.2,.18],[0,.7,0]);
  P(top,'lsph',0x2a1a10,[.035,.035,.035],[.08,.45,.2]);P(top,'lsph',0x2a1a10,[.035,.035,.035],[-.08,.45,.2]);addFx(par,(dt,t)=>{top.rotation.z=Math.sin(t*1.6)*.08;top.rotation.y=Math.sin(t*.7)*.15});return g}
function foundation(par,locked){const g=G(par);P(g,'box',0x9a8f7a,[3.4,.16,3.4],[0,.08,0]);P(g,'box',0xc2b494,[3,.18,3],[0,.1,0]);
  for(const [a,b] of[[-1.5,-1.5],[1.5,-1.5],[-1.5,1.5],[1.5,1.5]])P(g,'box',0xc9a05a,[.09,.7,.09],[a,.45,b]);
  for(const [a1,b1,a2,b2] of[[-1.5,-1.5,1.5,-1.5],[1.5,-1.5,1.5,1.5],[1.5,1.5,-1.5,1.5],[-1.5,1.5,-1.5,-1.5]])P(g,'box',0xe8d9b0,[Math.hypot(a2-a1,b2-b1),.03,.03],[(a1+a2)/2,.68,(b1+b2)/2],[0,-Math.atan2(b2-b1,a2-a1),0]);
  const s=G(g,[0,0,1.1]);P(s,'box',0x6e4a2a,[.09,1.1,.09],[0,.55,0]);const b=P(s,'box',locked?0x8a8478:0xf2b330,[.8,.5,.06],[0,1.05,0]);
  if(!locked){for(let k=0;k<3;k++)P(g,'box',[0xb4ab9b,0xc9a05a,0xb4ab9b][k],[.5,.18,.3],[-.6+k*.25,.28+k*.18,-.6]);addFx(par,(dt,t)=>{b.rotation.z=Math.sin(t*2.4)*.08})}return g}
function raceTrack(g,hara){const rx=7.5,rz=5;
  const ring=new THREE.Mesh(new THREE.RingGeometry(.7,1,72),toonMat({color:0xc9a06a}));ring.rotation.x=-Math.PI/2;ring.scale.set(rx,rz,1);ring.position.y=.05;ring.receiveShadow=true;g.add(ring);
  const inner=new THREE.Mesh(new THREE.CircleGeometry(.7,64),toonMat({color:0x8cb655}));inner.rotation.x=-Math.PI/2;inner.scale.set(rx,rz,1);inner.position.y=.045;inner.receiveShadow=true;g.add(inner);
  const N=56;for(const rr of[1.02,.68]){let prev=null;for(let k=0;k<=N;k++){const a=k/N*Math.PI*2,x=Math.cos(a)*rx*rr,z=Math.sin(a)*rz*rr;if(k<N&&k%2===0)P(g,'box',0xfaf6ee,[.09,.6,.09],[x,.3,z]);
    if(prev){P(g,'box',0xfaf6ee,[Math.hypot(x-prev[0],z-prev[1])+.02,.07,.07],[(x+prev[0])/2,.58,(z+prev[1])/2],[0,-Math.atan2(z-prev[1],x-prev[0]),0])}prev=[x,z]}}
  P(g,'box',0xfaf6ee,[.25,.06,rz*.32],[rx*.85,.07,0]).castShadow=false;
  const gs=G(g,[0,0,rz+2.3]);for(let k=0;k<3;k++)P(gs,'box',[0x9a6a3e,0x8a5a32,0x7a4e2d][k],[7,.5,1],[0,.25+k*.5,-k*.0+k*.9-0.9],[0,0,0]);
  for(const x of[-3.4,3.4])P(gs,'box',0x6e4a2a,[.15,2.8,.15],[x,1.4,1.4]);{const rf=P(gs,'box',0xc4492e,[7.6,.12,2.8],[0,2.8,.5]);rf.rotation.x=-.12}
  const crowd=[];const q=rng(77);for(let k=0;k<18;k++){const row=k%3;const c=P(gs,'sph',[0xc4492e,0x3f6fa0,0xf2b330,0x2f6b3a,0xf6efe0][k%5],[.17,.2,.17],[-3+Math.floor(k/3)*1.2+q()*.3,.75+row*.5,-.9+row*.9]);crowd.push(c)}
  addFx(g,(dt,t)=>crowd.forEach((c,k)=>{c.position.y=c.userData.y0??(c.userData.y0=c.position.y);c.position.y=c.userData.y0+Math.max(0,Math.sin(t*6+k))*.12}));
  for(const x of[-rx-1,rx+1]){P(g,'cyl',0xfaf6ee,[.05,3,.05],[x,1.5,rz+.5]);const fl=P(g,'box',0xc4492e,[.6,.35,.03],[x+.32,2.8,rz+.5]);addFx(g,(dt,t)=>{fl.rotation.y=Math.sin(t*3+x)*.3})}
  if(hara){const n=2+hara.l;const cols=[[0x8a5530,0xc4492e],[0x3a2a22,0x3f6fa0],[0xd9c3a0,0xf2b330],[0x6a4a30,0x2f6b3a],[0xb07a4a,0xf6efe0]];
    for(let k=0;k<n;k++){const h=horse(cols[k][0],0x2e1d12,cols[k][1]);h.scale.setScalar(.55);g.add(h);let a=k*.5;const sp=.42+k*.03+Math.random()*.05,rr=.85-k*.035;
      addFx(g,(dt,t)=>{a+=dt*sp*(1+Math.sin(t*.7+k)*.15);const x=Math.cos(a)*rx*rr,z=Math.sin(a)*rz*rr;h.position.set(x,Math.abs(Math.sin(t*10+k))*.15,z);h.rotation.y=Math.atan2(-Math.sin(a)*rx,Math.cos(a)*rz);
        h.userData.legs.forEach((l,i)=>l.rotation.x=Math.sin(t*10+k+(i>1?Math.PI:0)+(i%2)*.6)*.7)})}}}
