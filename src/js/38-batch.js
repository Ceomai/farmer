// ================= STATİK BİRLEŞTİRME (draw call azaltma) =================
// Haritadaki binlerce küçük parça (çit, taş, çatı, çalı...) her karede ayrı ayrı çiziliyordu (~1800 çizim çağrısı).
// Bir kök kaydedilir; birkaç saniye boyunca hiç kıpırdamayan parçalar aynı malzemeye göre tek bir ağ (mesh) olarak birleştirilir.
// Hareket eden her şey (hayvanlar, bulutlar, yel değirmeni, duman...) olduğu gibi kalır. Tıklama için gereken etiketli
// gruplar (loc/unit/plot/region...) korunur: birleşen ağ o grubun içine eklenir.
const BATCH_TAGS=['plot','plotBuy','unit','loc','region','farmer','open','act','noBatch'];
const _bq=[],_bm=new THREE.Matrix4(),_bn=new THREE.Matrix3(),_bv=new THREE.Vector3();
const isTagged=o=>{const u=o.userData;for(const k of BATCH_TAGS)if(u[k]!=null)return true;return false};
function batchCandidates(root,skip){const out=[];
  (function walk(o,anchor){for(const c of o.children){if(skip&&skip(c))continue;if(c.material===OUT)continue;
      if(c.isMesh&&!c.isInstancedMesh&&!c.isSkinnedMesh&&!Array.isArray(c.material)&&!c.material.transparent&&c.material.isMaterial&&c.material!==OUT&&!isTagged(c)
        &&c.geometry&&c.geometry.attributes.position&&c.children.every(x=>x.material===OUT)&&c.visible){out.push({m:c,anchor});continue}
      if(c.visible&&!c.isPoints&&!c.isLine)walk(c,isTagged(c)?c:anchor)}})(root,root);
  return out}
function relMat(m,anchor,target){anchor.updateWorldMatrix(true,false);m.updateWorldMatrix(true,false);return target.copy(anchor.matrixWorld).invert().multiply(m.matrixWorld)}
// Kökü izlemeye al: belirtilen süre sonra kıpırdamamış olanları birleştir
// Her parça için, etiketli gruba kadar tüm üst gruplara göre konumu kaydedilir; birleştirirken parçanın hiç kıpırdamadığı EN ÜST grup seçilir
// (ör. süzülen bir bulut kümesinin parçaları kümenin içinde sabittir → küme başına tek ağ).
function batchWatch(root,skip,delay=2600){const list=batchCandidates(root,skip).map(e=>{const ch=[];for(let o=e.m.parent;o;o=o.parent){ch.push(o);if(o===e.anchor)break}
    return{m:e.m,chain:ch.map(o=>({o,s:relMat(e.m,o,new THREE.Matrix4()).elements.slice()}))}});
  _bq.push({root,list,at:performance.now()+delay})}
function batchCheck(){const t=performance.now();for(let i=_bq.length-1;i>=0;i--){const q=_bq[i];if(t<q.at)continue;_bq.splice(i,1);
    if(q.root!==world&&!q.root.parent)continue;bakeStatic(q)}}
function inTree(o,root){while(o){if(o===root)return true;o=o.parent}return false}
function bakeStatic(q){const by=new Map();
  for(const e of q.list){const m=e.m;if(!inTree(m,q.root))continue;let anchor=null;
    for(let i=e.chain.length-1;i>=0;i--){const c=e.chain[i];if(!inTree(m,c.o))continue;const r=relMat(m,c.o,_bm).elements;let moved=false;for(let k=0;k<16;k++)if(Math.abs(r[k]-c.s[k])>1e-5){moved=true;break}if(!moved){anchor=c.o;break}}
    if(!anchor)continue;let vis=true;for(let o=m;o&&o!==anchor;o=o.parent)if(!o.visible)vis=false;if(!vis)continue;relMat(m,anchor,_bm);e.anchor=anchor;
    let a=by.get(e.anchor);if(!a)by.set(e.anchor,a=new Map());const key=m.material.uuid+(m.castShadow?'s':'')+(m.receiveShadow?'r':'');
    let g=a.get(key);if(!g)a.set(key,g={mat:m.material,cs:m.castShadow,rs:m.receiveShadow,items:[]});g.items.push({m,rel:_bm.clone(),ol:m.children.length>0})}
  let saved=0;
  for(const [anchor,groups] of by){const olItems=[];
    for(const g of groups.values()){if(g.items.length<2&&!g.items[0].ol)continue;
      const mesh=new THREE.Mesh(bakeGeo(g.items,!!g.mat.map,false),g.mat);mesh.castShadow=g.cs;mesh.receiveShadow=g.rs;mesh.userData.baked=1;mesh.matrixAutoUpdate=false;anchor.add(mesh);
      for(const it of g.items){if(it.ol)olItems.push(it);it.m.parent.remove(it.m)}saved+=g.items.length-1}
    if(olItems.length){const o=new THREE.Mesh(bakeGeo(olItems,false,true),OUT);o.userData.baked=1;o.matrixAutoUpdate=false;anchor.add(o);saved+=olItems.length-1}}
  return saved}
function bakeGeo(items,uv,ol){let n=0;for(const it of items){const g=it.m.geometry;n+=g.index?g.index.count:g.attributes.position.count}
  const P3=new Float32Array(n*3),N3=new Float32Array(n*3),U2=uv&&!ol?new Float32Array(n*2):null;let w=0;
  for(const it of items){const g=it.m.geometry,pos=g.attributes.position,nor=ol?(g.attributes.onormal||g.attributes.normal):g.attributes.normal,tuv=g.attributes.uv,idx=g.index,cnt=idx?idx.count:pos.count;
    _bn.getNormalMatrix(it.rel);const flip=it.rel.determinant()<0;
    for(let j=0;j<cnt;j++){const jj=flip?(j-j%3)+[0,2,1][j%3]:j,v=idx?idx.getX(jj):jj;
      _bv.fromBufferAttribute(pos,v).applyMatrix4(it.rel);P3[w*3]=_bv.x;P3[w*3+1]=_bv.y;P3[w*3+2]=_bv.z;
      if(nor){_bv.fromBufferAttribute(nor,v).applyMatrix3(_bn).normalize();N3[w*3]=_bv.x;N3[w*3+1]=_bv.y;N3[w*3+2]=_bv.z}
      if(U2&&tuv){U2[w*2]=tuv.getX(v);U2[w*2+1]=tuv.getY(v)}w++}}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(P3,3));geo.setAttribute(ol?'onormal':'normal',new THREE.BufferAttribute(N3,3));if(U2)geo.setAttribute('uv',new THREE.BufferAttribute(U2,2));
  geo.computeBoundingSphere();geo.computeBoundingBox();return geo}
function disposeBaked(root){root.traverse(o=>{if(o.userData.baked&&o.geometry)o.geometry.dispose()})}
