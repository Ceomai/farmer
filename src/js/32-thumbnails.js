// ================= KÜÇÜK RESİMLER =================
function makeThumbs(){let tr;try{tr=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true})}catch(e){return}
  tr.setSize(220,220);tr.setPixelRatio(1);tr.outputEncoding=THREE.sRGBEncoding;tr.toneMapping=THREE.ACESFilmicToneMapping;tr.toneMappingExposure=1.1;OUT.uniforms.thick.value=.0022;
  const sc=new THREE.Scene();sc.add(new THREE.HemisphereLight(0xf3ead2,0x7d6a3a,.9));const dl=new THREE.DirectionalLight(0xffe6c0,1.3);dl.position.set(-4,8,6);sc.add(dl);
  const c=new THREE.PerspectiveCamera(30,1,.1,200);
  const doOne=(key,fn,base=2.6)=>{const g=G(sc);P(g,'cyl',0x86bc4f,[base,.3,base],[0,-.15,0]);const inner=G(g);fn(inner);const box=new THREE.Box3().setFromObject(inner),sz=box.getSize(new V3()),ct=box.getCenter(new V3());
    const d=Math.max(sz.x,sz.y*1.2,sz.z)*2.55+1.2;c.position.set(ct.x+d*.62,ct.y+d*.5,ct.z+d*.75);c.lookAt(ct.x,ct.y*.85,ct.z);tr.render(sc,c);THUMB[key]=tr.domElement.toDataURL('image/png');sc.remove(g)};
  for(const k in MODELS)doOne(k,g=>MODELS[k](g,{b:k,l:1,job:k==='sera'?{r:'domates',s:0,e:1}:k==='bahce'?{r:'elma',s:0,e:1}:null}));
  for(let l=1;l<=4;l++)doOne('kulube'+l,g=>g.add(house(l)));
  doOne('tarla',g=>fieldBed(g,{job:{r:'bugday',s:0,e:1}}));doOne('pazar',g=>marketModel(g),5);doOne('han',g=>hanModel(g),4);
  doOne('panayir',g=>fairModel(g),5);
  doOne('hipo',g=>{const h=horse(0x8a5530,0x2e1d12,0xc4492e);g.add(h)},1.6);
  tr.dispose();if(tr.forceContextLoss)tr.forceContextLoss();OUT.uniforms.thick.value=.0024}
