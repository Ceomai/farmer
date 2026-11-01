if(!window.THREE||!THREE.OrbitControls){document.getElementById('boot').textContent='3D motoru yüklenemedi. Sayfayı yenileyip tekrar dene.';throw new Error('three missing')}

// ================= GRAFİK KALİTESİ =================
// 'auto' : cihaz gücüne göre başlar, kare hızına göre çözünürlüğü kendisi ayarlar
// 'high' : en yüksek kalite ; 'low' : pil tasarrufu (gölge yok, 30 FPS, düşük çözünürlük)
const GFX=(()=>{let m='auto';try{m=localStorage.getItem('ci-gfx')||'auto'}catch(e){}
  const weak=(navigator.deviceMemory&&navigator.deviceMemory<=3)||(navigator.hardwareConcurrency&&navigator.hardwareConcurrency<=4);
  const dpr=devicePixelRatio||1,low=m==='low'||(m==='auto'&&weak);
  return{mode:m,low,shadows:!low,maxPR:m==='high'?Math.min(dpr,3):low?Math.min(dpr,1.25):Math.min(dpr,2),pr:0,fpsCap:low?30:0,shadowSize:m==='high'?4096:low?1024:2048,winEvery:low?6:3,rtScale:low?.45:m==='high'?.75:.6}})();
GFX.pr=GFX.maxPR;
function setGfx(m){try{localStorage.setItem('ci-gfx',m)}catch(e){}location.reload()}
let _fpsN=0,_fpsT=0,_lastFrame=0;
function gfxAdapt(ms){if(GFX.mode!=='auto')return;_fpsN++;_fpsT+=ms;if(_fpsT<3000)return;const fps=_fpsN*1000/_fpsT;_fpsN=0;_fpsT=0;
  let pr=GFX.pr;if(fps<42&&pr>1)pr=Math.max(1,pr-.25);else if(fps>57&&pr<GFX.maxPR)pr=Math.min(GFX.maxPR,pr+.25);if(pr!==GFX.pr){GFX.pr=pr;R.setPixelRatio(pr);resize()}}
