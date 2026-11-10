// ================= KÜÇÜK RESİMLER =================
// Bir bölüm kartının küçük resim anahtarı (ev: o anki ev modeli, binalı bölüm: ilk binası, diğerleri: bölümün kendisi)
function locThumb(k){const L=LOC[k];return L.kind==='house'?'kulube'+S.house:L.units?L.units[0]:k}
// Açılışta yalnızca şeritte ilk görünen kartların küçük resimleri hemen üretilir; kalanlar boşta kalan zamanda dilim dilim üretilir
// (açılışta ana iş parçacığı uzun süre kilitlenmez). Hazır olmayan küçük resmin yerinde emoji yedeği durur; her dilimden sonra şerit,
// hepsi bitince açık panel yeniden çizilir.
const THUMB_FIRST=4;
function makeThumbs(){let tr;try{tr=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true})}catch(e){return}
  tr.setSize(220,220);tr.setPixelRatio(1);tr.outputEncoding=THREE.sRGBEncoding;tr.toneMapping=THREE.ACESFilmicToneMapping;tr.toneMappingExposure=1.1;
  const sc=new THREE.Scene();sc.add(new THREE.HemisphereLight(0xf3ead2,0x7d6a3a,.9));const dl=new THREE.DirectionalLight(0xffe6c0,1.3);dl.position.set(-4,8,6);sc.add(dl);
  const c=new THREE.PerspectiveCamera(30,1,.1,200);
  const doOne=(key,fn,base=2.6)=>{const g=G(sc);P(g,'cyl',0x86bc4f,[base,.3,base],[0,-.15,0]);const inner=G(g);fn(inner);const box=new THREE.Box3().setFromObject(inner),sz=box.getSize(new V3()),ct=box.getCenter(new V3());
    const d=Math.max(sz.x,sz.y*1.2,sz.z)*2.55+1.2;c.position.set(ct.x+d*.62,ct.y+d*.5,ct.z+d*.75);c.lookAt(ct.x,ct.y*.85,ct.z);tr.render(sc,c);THUMB[key]=tr.domElement.toDataURL('image/png');sc.remove(g)};
  const jobs=[],add=(key,fn,base)=>jobs.push([key,fn,base]);
  for(const k in MODELS)add(k,g=>MODELS[k](g,{b:k,l:1,job:k==='sera'?{r:'domates',s:0,e:1}:k==='bahce'?{r:'elma',s:0,e:1}:null}));
  for(let l=1;l<=4;l++)add('kulube'+l,g=>g.add(house(l)));
  add('tarla',g=>fieldBed(g,{job:{r:'bugday',s:0,e:1}}));add('pazar',g=>marketModel(g),5);add('han',g=>hanModel(g),4);
  add('panayir',g=>fairModel(g),5);
  add('hipo',g=>{const h=horse(0x8a5530,0x2e1d12,0xc4492e);g.add(h)},1.6);
  // ilk görünen şerit kartlarınınki öne alınır (sıralama kararlı: kalanlar eski sırasını korur)
  let first=new Set();try{first=new Set(stripCards().own.slice(0,THUMB_FIRST).map(o=>locThumb(o.k)))}catch(e){}
  const pri=jobs.filter(j=>first.has(j[0])),rest=jobs.filter(j=>!first.has(j[0]));
  // çizgi kalınlığı küçük resim için biraz ince; her dilimden sonra ana sahnenin değerine döner
  const batch=(list,more)=>{OUT.uniforms.thick.value=.0022;try{do doOne(...list.shift());while(list.length&&more())}finally{OUT.uniforms.thick.value=.0024}stripSig=''};
  const end=()=>{tr.dispose();if(tr.forceContextLoss)tr.forceContextLoss();if(view)view.sig=''};
  if(pri.length)batch(pri,()=>true);if(!rest.length)return end();
  // masadayken (açılış pencereleri, okuma) hızlı ilerler; haritadayken yalnızca boşta ya da en geç 2 sn'de bir tek resim
  const idle=window.requestIdleCallback?f=>requestIdleCallback(f,{timeout:mode==='desk'?300:2000}):f=>setTimeout(()=>f(null),mode==='desk'?30:500);
  // kamera uçuşu ya da panel açılış/kapanış animasyonu sürerken (dokunma sonrası geçişler takılmasın) ya da oyun döngüsü (tick, 500 ms)
  // gecikmişken (ana iş parçacığı meşgul) beklenir: önce oyunun kendi işi yapılır
  const step=dl=>{if(fly||sheetAnim||performance.now()-tickAt>700)return setTimeout(()=>idle(step),150);try{const t0=performance.now();batch(rest,()=>dl&&!dl.didTimeout?dl.timeRemaining()>8:performance.now()-t0<12)}catch(e){console.warn(e);rest.length=0}
    if(rest.length)idle(step);else end()};
  idle(step)}
