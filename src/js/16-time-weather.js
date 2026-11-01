// ================= ZAMAN, MEVSİM, HAVA =================
const DAY_MS=12*60*1000;
const SEASONS=[{n:'İlkbahar',e:'🌸'},{n:'Yaz',e:'☀️'},{n:'Sonbahar',e:'🍂'},{n:'Kış',e:'❄️'}];
const WEATHER={sun:{n:'Güneşli',e:'☀️'},rain:{n:'Yağmurlu',e:'🌧️'},storm:{n:'Fırtına',e:'⛈️'},snow:{n:'Karlı',e:'🌨️'}};
const gameDay=()=>Math.floor(now()/DAY_MS),dayPhase=()=>(now()%DAY_MS)/DAY_MS,season=()=>Math.floor(gameDay()/5)%4;
const clockStr=()=>{const m=Math.floor(dayPhase()*1440);return String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0')};
function dayFactor(){const a=(dayPhase()-.25)*Math.PI*2;return Math.max(0,Math.min(1,Math.sin(a)*1.7+.45))}
function updateWeather(){const w=S.weather;if(now()<w.until)return;const tbl=[{sun:5,rain:4,storm:1},{sun:8,rain:1,storm:1},{sun:4,rain:4,storm:2},{sun:3,snow:6,storm:1}][season()];
  let r=Math.random()*Object.values(tbl).reduce((a,b)=>a+b,0),k='sun';for(const [kk,v] of Object.entries(tbl)){r-=v;if(r<=0){k=kk;break}}
  const prev=w.k;w.k=k;w.until=now()+(120+Math.random()*150)*1000;if(k!==prev&&booted){if(k==='rain')toast('🌧️ Yağmur başladı: ekinler daha hızlı büyüyor');if(k==='storm'){toast('⛈️ Fırtına! Tavuklar kümese kaçtı');sfx('thunder')}if(k==='snow')toast('🌨️ Kar yağıyor')}}
const FOL={oak:[0x5c9a3e,0x4f8a36,0x68a846],pine:[0x2f6b3a,0x3a7d42,0x2a5f33],bush:[0x4f8f37,0x5c8a3a]};
const SEAS_COL=[{oak:[0x8fcf6a,0xf2b8c6,0x7cc04a],grass:0xffffff,em:0},{grass:0xf6f0cc,em:0},{oak:[0xd9822b,0xc4562a,0xe8b13a],bush:[0xb98a3a,0xa8722e],grass:0xe6d29a,em:0},
  {oak:[0xe9eef2,0xdfe7ea,0xf4f7f8],pine:[0x6f9a8a,0x86ab9c,0x5e8a7a],bush:[0xdfe7ea,0xd0dbe0],grass:0xd8e2e8,em:0x6d7d8a}];
let seasonNow=-1;
function applySeason(){const se=season();if(se===seasonNow)return;const first=seasonNow<0;seasonNow=se;const sc=SEAS_COL[se];
  for(const g of['oak','pine','bush'])FOL[g].forEach((c,i)=>{const m=MC[c+'|'];if(m)m.color.copy(grade(sc[g]?sc[g][i%sc[g].length]:c))});
  GROUND.material.color.copy(grade(sc.grass));GROUND.material.emissive.setHex(sc.em||0);if(!first){toast(`${SEASONS[se].e} ${SEASONS[se].n} geldi!`);sfx('chime')}}
const SKY={day:[0xa3c4c0,0xefe0b6],dusk:[0xd98a5a,0xf3c58a],night:[0x2e3d66,0x6a74a0]};
const _c1=new THREE.Color(),_c2=new THREE.Color(),_c3=new THREE.Color(),_c4=new THREE.Color();
let ambT=-1,flash=0,GLOWM=[],glowN=0;
function glowMats(){const n=Object.keys(MC).length;if(n===glowN)return;glowN=n;GLOWM=Object.values(MC).filter(m=>m.emissive&&m.emissiveIntensity>0&&(m.emissive.r+m.emissive.g+m.emissive.b)>.1);GLOWM.forEach(m=>{if(m.userData.base==null)m.userData.base=m.emissiveIntensity})}
const starGeo=new THREE.BufferGeometry();{const a=[];for(let i=0;i<500;i++){const th=Math.random()*Math.PI*2,ph=Math.random()*1.2;a.push(Math.cos(th)*Math.sin(ph)*220,Math.cos(ph)*220+20,Math.sin(th)*Math.sin(ph)*220)}starGeo.setAttribute('position',new THREE.Float32BufferAttribute(a,3))}
const starPts=new THREE.Points(starGeo,new THREE.PointsMaterial({color:0xfff8e0,size:2,sizeAttenuation:false,transparent:true,opacity:0,fog:false,depthWrite:false}));world.add(starPts);
const WXN=900,wxArr=new Float32Array(WXN*3);for(let i=0;i<WXN;i++){wxArr[i*3]=(Math.random()-.5)*70;wxArr[i*3+1]=Math.random()*30;wxArr[i*3+2]=(Math.random()-.5)*70}
const wxGeo=new THREE.BufferGeometry();wxGeo.setAttribute('position',new THREE.BufferAttribute(wxArr,3));
const wxPts=new THREE.Points(wxGeo,new THREE.PointsMaterial({color:0xcfe3f5,size:3,sizeAttenuation:false,transparent:true,opacity:.8,depthWrite:false}));wxPts.frustumCulled=false;world.add(wxPts);
function stepWeather(dt,t){const k=S.weather.k,on=k!=='sun';wxPts.visible=on;if(!on)return;const snow=k==='snow';wxPts.material.size=snow?4.5:2.4;wxPts.material.color.setHex(snow?0xffffff:0xbcd6f2);
  wxPts.position.set(ctl.target.x,0,ctl.target.z);const sp=snow?3:k==='storm'?34:26;
  for(let i=0;i<WXN;i++){let y=wxArr[i*3+1]-sp*dt;if(snow)wxArr[i*3]+=Math.sin(t+i)*dt*.6;if(k==='storm')wxArr[i*3]+=dt*8;if(y<0){y=30;wxArr[i*3]=(Math.random()-.5)*70;wxArr[i*3+2]=(Math.random()-.5)*70}wxArr[i*3+1]=y}wxGeo.attributes.position.needsUpdate=true}
function ambience(dt,t){const ph=dayPhase(),a=(ph-.25)*Math.PI*2,d=dayFactor(),wx=S.weather.k,cloudy=wx==='rain'||wx==='storm'?1:wx==='snow'?.5:0,sa=Math.sin(a);
  const dusk=Math.max(0,1-Math.abs(sa)*3)*(sa>-.35?1:0);
  sun.position.set(Math.cos(a)*-55,Math.max(14,Math.abs(sa)*50+8),26);sun.intensity=(.55+.7*d)*(1-cloudy*.35);hemiL.intensity=(.62+.18*d)*(1-cloudy*.15)+flash;
  sun.color.setHex(0xffe6c0).lerp(_c2.setHex(0xff9a55),dusk*.8).lerp(_c3.setHex(0xb8c8f0),Math.max(0,.8-d)*1.1);hemiL.color.setHex(0xf3ead2).lerp(_c2.setHex(0xb4c0e8),(1-d)*.85);
  if(t-ambT>.25||ambT<0){ambT=t;const top=_c1.setHex(SKY.day[0]).lerp(_c2.setHex(SKY.night[0]),1-d).lerp(_c3.setHex(SKY.dusk[0]),dusk*.6).lerp(_c2.setHex(0x8e959a),cloudy*.5);
    const low=_c4.setHex(SKY.day[1]).lerp(_c2.setHex(SKY.night[1]),1-d).lerp(_c3.setHex(SKY.dusk[1]),dusk*.7).lerp(_c2.setHex(0xb8b9b0),cloudy*.5);
    document.body.style.background=`linear-gradient(180deg,#${top.getHexString()} 0%,#${low.getHexString()} 100%)`;world.fog.color.copy(low);
    skyTop.copy(top);glowMats();const glow=.4+(1-d)*1.5;for(const m of GLOWM)m.emissiveIntensity=m.userData.base*glow;starPts.material.opacity=Math.max(0,(1-d)*1.2-cloudy)*.9}
  flash=Math.max(0,flash-dt*3);if(wx==='storm'&&Math.random()<dt*.07){flash=1.3;sfx('thunder')}}
