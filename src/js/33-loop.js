// ================= DÖNGÜ =================
const clock=new THREE.Clock();
const vo={x:0,y:0};
function viewOffset(c){const W=innerWidth,H=innerHeight;let tx=0,ty=0;if(!sheet.hidden&&mode!=='hub'||(!sheet.hidden&&view&&view.k==='region')){const r=sheet.getBoundingClientRect();if(W>700)tx=Math.max(0,(W-r.left))/2;else ty=Math.max(0,(H-r.top))/2}
  vo.x+=(tx-vo.x)*.12;vo.y+=(ty-vo.y)*.12;if(!tx&&!ty&&Math.abs(vo.x)<.5&&Math.abs(vo.y)<.5){vo.x=vo.y=0;if(c.view&&c.view.enabled)c.clearViewOffset();return}c.setViewOffset(W,H,vo.x,vo.y,W,H)}
function resize(){const w=innerWidth,h=innerHeight;R.setSize(w,h,false);dcam.aspect=w/h;dcam.fov=w<700?50:42;dcam.updateProjectionMatrix();if(typeof S!=='undefined'&&S&&(dcam.aspect<.85)!==deskPortrait&&DESKP.length)buildDesk();cam.aspect=w/h;cam.fov=w<700?50:36;cam.updateProjectionMatrix();icam.aspect=w/h;icam.fov=w<700?60:42;icam.updateProjectionMatrix()}
addEventListener('resize',resize);
function frame(ts){requestAnimationFrame(frame);if(GFX.fpsCap&&ts&&ts-_lastFrame<1000/GFX.fpsCap-2)return;if(ts){gfxAdapt(ts-(_lastFrame||ts));_lastFrame=ts}const dt=Math.min(.05,clock.getDelta()),t=clock.elapsedTime;OUT.uniforms.jit.value=mode==='desk'?0:Math.floor(t*8)*1.37;
  if(mode==='desk'){worldTick(dt,t);renderWindow(dt);viewOffset(dcam);deskFrame(dt,t);placeMarks();R.render(deskScene,dcam)}
  else if(mode!=='interior'){viewOffset(cam);stepFly();ctl.update();worldTick(dt,t);placeMarks();R.render(world,cam)}
  if(!sayB.hidden)placeBubble();
  else if(interior){viewOffset(icam);ictl.update();interior.fx.forEach(f=>f(dt,t));for(const o of interior.scene.children){const u=o.userData;if(u.hop){u.hop=Math.max(0,u.hop-dt*2.5);o.position.y=Math.sin((1-u.hop)*Math.PI)*.5}}R.render(interior.scene,icam)}}
function tick(){
  document.querySelectorAll('[data-e]').forEach(el=>{el.style.width=Math.min(100,(now()-el.dataset.s)/(el.dataset.e-el.dataset.s)*100)+'%'});
  document.querySelectorAll('[data-left]').forEach(el=>{el.textContent=el.dataset.pre+' '+secs(Math.max(0,Math.ceil((+el.dataset.left-now())/1000)))});
  renderStrip();if(S.consent){tutStart();tutTick()}updateWeather();applySeason();if(checkDaily())showLogin();ensureContests();if(ensureContracts()&&view&&view.loc==='han')renderSheet();
  if(S.weather.k==='rain'||S.weather.k==='storm'){for(const f of S.fields)if(f.job&&now()<f.job.e)f.job.e-=150;const se=S.units.sera;if(se&&se.job&&now()<se.job.e)se.job.e-=150}
  if(++autoTick%4===0&&automate()){save();if(view)view.sig='';}
  notifyReady();if(deskSigNow()!==deskSig)buildDesk();if(!document.body.classList.contains('photo'))farmerSay();else sayB.hidden=true;
  syncWorld();
  if(view&&sheetSig()!==view.sig&&!(race&&race.running))renderSheet();
  if(view&&view.k==='loc'&&view.loc==='pazar'&&now()-S.market.at>=180000){refreshMarket();renderSheet()}
  if(interior&&intSig(interior.key)!==interior.sig)interior.refresh();
  renderHUD()}
function boot(data){
  S=migrate((data&&data.house!=null)?data:(load()||fresh()));const away=S.lastSeen?Date.now()-S.lastSeen:0;refreshMarket();ensureOrders();updateWeather();applySeason();checkDaily();ensureContests();ensureContracts();automate();
  try{makeThumbs()}catch(e){console.warn(e)}
  ctl.enabled=false;buildDesk();resize();syncWorld(true);renderHUD();setModeUI();frame();setInterval(tick,500);setInterval(save,5000);
  const bt=$('#boot');bt.style.transition='opacity .5s';bt.style.opacity='0';setTimeout(()=>bt.remove(),550);
  booted=true;awaySummary(away);if(S.consent)showLogin();else askConsent();setTimeout(friendGifts,1500);syncCloud(true);track('session_start',{gfx:GFX.mode,pr:GFX.pr});
  if(!S.stats.welcomed){S.stats.welcomed=1;setTimeout(()=>{if(tutStep()<0&&S.tut)toast('Masadaki haritaya dokun, çiftliğe çık!')},900)}save()
}
const startGame=data=>Promise.race([document.fonts?Promise.all([document.fonts.load('20px "Alfa Slab One"'),document.fonts.load('800 14px Nunito')]).then(()=>document.fonts.ready):Promise.resolve(),new Promise(r=>setTimeout(r,2500))]).then(()=>PLATFORM.init()).catch(()=>{}).then(()=>boot(data));
window.claude?.hot?.snapshot?.(()=>S);
window.claude?.hot?.ready?window.claude.hot.ready(startGame):startGame(window.claude?.hot?.data??null);
