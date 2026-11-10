// ================= DÖNGÜ =================
const clock=new THREE.Clock();
const vo={x:0,y:0};
// Panelin ekrandaki kutusu her karede ölçülmez: boyut değişince (ResizeObserver), pencere boyutunda ve yeniden çizimde sıfırlanır; yalnızca panelin açılış animasyonu sürerken her karede ölçülür
let sheetAnim=false;if(window.ResizeObserver)new ResizeObserver(()=>{sheetRect=null}).observe(sheet);addEventListener('resize',()=>{sheetRect=null});
sheet.addEventListener('animationstart',e=>{if(e.target===sheet)sheetAnim=true});for(const ev of['animationend','animationcancel'])sheet.addEventListener(ev,e=>{if(e.target===sheet){sheetAnim=false;sheetRect=null}});
function viewOffset(c){const W=innerWidth,H=innerHeight;let tx=0,ty=0;if(!sheet.hidden&&mode!=='hub'||(!sheet.hidden&&view&&view.k==='region')){const r=sheetAnim||!sheetRect?(sheetRect=sheet.getBoundingClientRect()):sheetRect;if(W>700)tx=Math.max(0,(W-r.left))/2;else ty=Math.max(0,(H-r.top))/2}
  vo.x+=(tx-vo.x)*.12;vo.y+=(ty-vo.y)*.12;if(!tx&&!ty&&Math.abs(vo.x)<.5&&Math.abs(vo.y)<.5){vo.x=vo.y=0;if(c.view&&c.view.enabled)c.clearViewOffset();return}c.setViewOffset(W,H,vo.x,vo.y,W,H)}
function resize(){const w=innerWidth,h=innerHeight;R.setSize(w,h,false);dcam.aspect=w/h;dcam.fov=w<700?50:42;dcam.updateProjectionMatrix();if(typeof S!=='undefined'&&S&&(dcam.aspect<.85)!==deskPortrait&&DESKP.length)buildDesk();cam.aspect=w/h;cam.fov=w<700?50:36;cam.updateProjectionMatrix();icam.aspect=w/h;icam.fov=w<700?60:42;icam.updateProjectionMatrix()}
// Boyut değişimi seyreltilir: ilk olay hemen işlenir, sonrakiler 100 ms'lik pencerelerde birleştirilir; son olay her zaman işlenir
let _rzT=null,_rzMore=false;addEventListener('resize',()=>{if(_rzT){_rzMore=true;return}resize();_rzT=setTimeout(function rz(){if(_rzMore){_rzMore=false;resize();_rzT=setTimeout(rz,100)}else _rzT=null},100)});
// Grafik bağlamı kaybolursa (Android'de arka plana atınca sık olur) çizimi durdur, geri gelince kaldığı yerden devam et
let glLost=false;R.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();glLost=true},false);
R.domElement.addEventListener('webglcontextrestored',()=>{glLost=false;try{R.shadowMap.needsUpdate=true;deskWinT=0}catch(e){}},false);
function frame(ts){requestAnimationFrame(frame);if(glLost||R.getContext().isContextLost())return;if(GFX.fpsCap&&ts&&ts-_lastFrame<1000/GFX.fpsCap-2)return;if(ts){gfxAdapt(ts-(_lastFrame||ts));_lastFrame=ts}const dt=Math.min(.05,clock.getDelta()),t=clock.elapsedTime;
  if(mode==='desk'){deskWinT-=dt;const fresh=deskWinT<=0;R.shadowMap.autoUpdate=false;if(fresh){deskWinT=3;worldTick(.016,t);R.shadowMap.needsUpdate=true;renderWindow()}if(fresh||++deskShN%8===0)R.shadowMap.needsUpdate=true;viewOffset(dcam);deskFrame(dt,t);placeMarks();R.render(deskScene,dcam)}
  else if(mode!=='interior'){R.shadowMap.autoUpdate=true;viewOffset(cam);stepFly();ctl.update();worldTick(dt,t);placeMarks();R.render(world,cam)}
  else if(interior){R.shadowMap.autoUpdate=true;viewOffset(icam);ictl.update();interior.fx.forEach(f=>f(dt,t));for(const o of interior.scene.children){const u=o.userData;if(u.hop){u.hop=Math.max(0,u.hop-dt*2.5);o.position.y=Math.sin((1-u.hop)*Math.PI)*.5}}R.render(interior.scene,icam)}
  if(!sayB.hidden)placeBubble()}
let tickAt=0; // son tick zamanı: küçük resim üretimi oyun döngüsü gecikirken bekler (32-thumbnails.js)
function tick(){tickAt=performance.now();
  document.querySelectorAll('.pbar [data-e]').forEach(el=>{const p=Math.max(0,Math.min(100,(now()-el.dataset.s)/(el.dataset.e-el.dataset.s)*100));el.style.transform=`translateX(${(p-100).toFixed(2)}%)`});
  document.querySelectorAll('[data-left]').forEach(el=>{const sec=Math.max(0,Math.ceil((+el.dataset.left-now())/1000));el.textContent=el.dataset.pre+' '+(el.dataset.short?secShort(sec):secs(sec))});
  renderStrip();if(S.consent){tutStart();tutTick()}updateWeather();applySeason();if(checkDaily())showLogin();ensureContests();if(ensureContracts()&&view&&view.loc==='han')renderSheet();
  if(S.weather.k==='rain'||S.weather.k==='storm'){for(const f of S.fields)if(f.job&&now()<f.job.e)f.job.e-=150;const se=S.units.sera;if(se&&se.job&&now()<se.job.e)se.job.e-=150}
  if(++autoTick%4===0&&automate()){save();if(view)view.sig='';}
  notifyReady();if(deskSigNow()!==deskSig)buildDesk();if(!document.body.classList.contains('photo'))farmerSay();else sayB.hidden=true;
  syncWorld();
  if(view&&sheetSig()!==view.sig&&!(race&&race.running))renderSheet();
  if(view&&(view.k==='borsa'||view.k==='loc'&&view.loc==='pazar')&&now()-S.market.at>=180000){refreshMarket();renderSheet()}
  if(interior&&intSig(interior.key)!==interior.sig)interior.refresh();
  if(queueAll())commit();rescue();funTick();autoSellTick();batchCheck();renderHUD()}
function boot(data){
  S=migrate((data&&data.house!=null)?data:(load()||fresh()));const away=S.lastSeen?Date.now()-S.lastSeen:0;refreshMarket();ensureOrders();updateWeather();applySeason();checkDaily();ensureContests();ensureContracts();automate();
  try{makeThumbs()}catch(e){console.warn(e)}
  ctl.enabled=false;buildDesk();resize();syncWorld(true);batchWatch(world,c=>c===farmer||c===dog||c===lampPost||c===regG||c===roadG||c.userData.loc!=null,3000);renderHUD();setModeUI();frame();setInterval(tick,500);setInterval(save,5000);
  clearTimeout(window.__bootT);const bt=$('#boot');bt.dataset.done=1;bt.style.transition='opacity .5s';bt.style.opacity='0';setTimeout(()=>bt.remove(),550);
  booted=true;
  // Açılış pencereleri sırayla: izin → dönüş özeti → günlük giriş; hediye penceresi açık pencere kalmayınca
  const afterConsent=()=>awaySummary(away,showLogin);if(S.consent)afterConsent();else askConsent(afterConsent);
  setTimeout(function fg(){if(document.querySelector('.modal'))return setTimeout(fg,1500);friendGifts()},1500);syncCloud(true);track('session_start',{gfx:GFX.mode,pr:GFX.pr});
  if(!S.stats.welcomed){S.stats.welcomed=1;setTimeout(()=>{if(tutStep()<0&&S.tut)toast('Masadaki haritaya dokun, çiftliğe çık!')},900)}save()
}
const startGame=data=>Promise.race([document.fonts?Promise.all([document.fonts.load('20px "Alfa Slab One"'),document.fonts.load('800 14px Nunito')]).then(()=>document.fonts.ready):Promise.resolve(),new Promise(r=>setTimeout(r,2500))]).then(()=>PLATFORM.init()).catch(()=>{}).then(()=>boot(data));
window.claude?.hot?.snapshot?.(()=>S);
window.claude?.hot?.ready?window.claude.hot.ready(startGame):startGame(window.claude?.hot?.data??null);
