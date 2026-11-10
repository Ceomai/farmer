// ================= OLAYLAR =================
document.addEventListener('click',e=>{
  const dk=e.target.closest('[data-desk]');if(dk){sfx('click');deskAction(dk.dataset.desk);return}
  const qk=e.target.closest('[data-quick]');if(qk){quickFeedback(quickLoc(qk.dataset.quick),qk);return}
  const qa=e.target.closest('[data-quickall]');if(qa){quickAll(qa);return}
  const ln=e.target.closest('[data-locstep]');if(ln){stepLoc(+ln.dataset.locstep);return}
  const go=e.target.closest('[data-go]');if(go){PLATFORM.hap();closeQpop();goLocation(go.dataset.go);return}
  const rg=e.target.closest('[data-region]');if(rg){openRegion(rg.dataset.region);return}
  const op=e.target.closest('[data-open]');if(op){openView(op.dataset.open);return}
  const a=e.target.closest('[data-act]');if(!a||a.tagName==='INPUT')return;const d=a.dataset,rc=a.getBoundingClientRect(),cx=rc.left+rc.width/2,cy=rc.top,c0=S.coins,g0=S.gems;sfx('click');PLATFORM.hap();
  switch(d.act){
    case'close':closeSheet();break;case'back':mode==='interior'?leaveInterior():mode==='focus'?toHub():toDesk();break;case'home':toDesk();break;case'proj':doProj(d.id);break;case'gen':askGen();break;case'quest':doQuest(d.n,d.i!=null?+d.i:null);break;case'ach':claimAch(d.id);break;case'fs':S.ui=Object.assign(S.ui||{},{fs:d.k});applyUI();renderSheet();save();break;case'qpclose':closeQpop();break;case'qpplant':plantAll();refreshQpop();break;case'keepN':S.keepN=+d.n;renderSheet();save();break;case'sellEx':sellExcess(S.keepN??10);break;case'renew':renewWorker(d.k);break;case'guide':openView('guide');break;
    case'enterIn':enterInterior(d.k);break;
    case'build':buildUnit(d.u);break;case'upU':upgradeUnit(d.u);break;case'upHouse':upgradeHouse();break;case'upFields':upgradeFields();break;
    case'start':startUnit(d.u,d.r);break;case'queue':queueAdd(d.u,d.r);break;case'qdel':queueDel(d.u,+d.i);break;case'collect':collectUnit(d.u,cx,cy);break;
    case'collectU':collectUnit(d.id,cx,cy-20);break;case'harvestP':harvestPlot(+d.id,cx,cy-20);commit();break;
    case'seed':S.lastCrop=d.r;renderSheet();refreshQpop();save();break;case'plantAll':plantAll();break;case'harvestAll':harvestAll();break;
    case'plot':if(panelSwipeUsed){panelSwipeUsed=false;break}{const i=+d.i,f=S.fields[i];if(f&&!f.job){if(plantPlot(i,S.lastCrop))commit()}else if(f&&now()>=f.job.e){harvestPlot(i,cx,cy);commit()}break}
    case'buyPlot':buyPlot();break;case'region':buyRegion(d.r);break;
    case'sell':sell(d.k,+d.n);break;case'feed':buyFeed(+d.n);break;
    case'order':fillOrder(+d.i);break;case'reorder':S.orders.splice(+d.i,1,genOrder());commit();break;case'goal':claimGoal();break;
    case'reset':view.confirm=true;renderSheet();break;case'reset0':view.confirm=false;renderSheet();break;
    case'reset2':S=fresh();refreshMarket(true);ensureOrders();save();regSig='';view=null;toHub();syncWorld(true);renderHUD();toast('Yeni bir başlangıç');break;
    case'iap':PLATFORM.buy(d.id);break;case'restore':restoreAccount(($('#rcode')||{}).value);break;
    case'copyCode':{const c=recoveryCode();(navigator.clipboard?navigator.clipboard.writeText(c):Promise.reject()).then(()=>toast('Kod kopyalandı')).catch(()=>toast('Kodu seçip kopyala'));break}
    case'gfx':if(d.k!==GFX.mode){save();setGfx(d.k)}break;
    case'photo':photoMode(true);break;case'photoOff':photoMode(false);break;case'shoot':shoot();break;
    case'rotL':rotateCam(Math.PI/4);break;case'rotR':rotateCam(-Math.PI/4);break;case'zin':zoomCam(.75);break;case'zout':zoomCam(1.33);break;
    case'adU':speedUnit(d.u,'ad');break;case'gemU':speedUnit(d.u,'gem');break;case'adF':speedFields('ad');break;case'gemF':speedFields('gem');break;
    case'mg':d.k==='milk'?mgMilk(d.u):d.k==='eggs'?mgEggs():mgHaggle();break;
    case'hire':hire(d.k);break;case'vtab':view.tab=d.t;renderSheet();break;
    case'contract':deliverContract(+d.i);break;case'contest':enterContest(d.id);break;
    case'stable':stableHorse();break;case'htrain':trainHorse(+d.i);break;case'lrace':leagueRace(+d.i);break;case'rnew':race=null;renderSheet();break;
    case'decor':buyDecor(d.id);break;case'adGem':watchAd(()=>{S.gems++;toast('+1 🍀');sfx('coin');commit()});break;
    case'dclaim':{const t=S.daily&&S.daily.tasks[+d.i];if(t&&t.p>=t.n&&!t.c){t.c=true;gain(t.r,'Ödül');addXP(15);sfx('coin');flyCoins(4);commit()}break}
    case'dbonus':if(S.daily&&S.daily.tasks.every(t=>t.c)&&!S.daily.bonus){S.daily.bonus=true;S.gems+=2;sfx('win');commit()}break;
    case'albumDone':if(!S.stats.albumDone){S.stats.albumDone=1;S.gems+=50;sfx('win');commit()}break;
  }
  if(HAP_BUY.has(d.act)&&S.coins<c0||HAP_GIFT.has(d.act)&&(S.coins>c0||S.gems>g0))PLATFORM.hap('medium')});
// Satın alma ve ödül düğmeleri işlem gerçekten olduysa orta titreşim verir (hafif dokunuş titreşiminin yerine)
const HAP_BUY=new Set(['build','upU','upHouse','upFields','buyPlot','region','decor','proj','hire']),HAP_GIFT=new Set(['dclaim','dbonus','goal','ach','albumDone','quest','order','contract','contest']);
document.addEventListener('change',e=>{const id=e.target.id;if(id==='optMusic'){S.sound.music=e.target.checked;audioInit();applySound();save()}if(id==='optSfx'){S.sound.sfx=e.target.checked;save()}if(id==='optFast'){S.fastNav=e.target.checked;save()}if(id==='optLeft'){S.ui=Object.assign(S.ui||{},{left:e.target.checked});applyUI();save()}if(id==='optRM'){S.ui=Object.assign(S.ui||{},{rm:e.target.checked});applyUI();save()}if(id==='optHap'){S.ui=Object.assign(S.ui||{},{hap:e.target.checked});save();PLATFORM.hap('medium')}if(id==='optAutoSell'){S.autoSell=e.target.checked;save();if(S.autoSell)autoSellTick()}
  if(id==='optAn'){S.consent={analytics:e.target.checked,at:Date.now()};save();toast(e.target.checked?'Anonim veri paylaşımı açık':'Anonim veri paylaşımı kapalı')}
  if(id==='optNotif'&&NATIVE){if(e.target.checked)PLATFORM.askNotif().then(g=>{S.sound.notif=!!g;if(!g)toast('Bildirim izni verilmedi');save();renderSheet()});else{S.sound.notif=false;save()}return}
  if(id==='optNotif'){if(e.target.checked){try{Notification.requestPermission().then(pm=>{S.sound.notif=pm==='granted';if(!S.sound.notif)toast('Tarayıcı bildirim izni vermedi');save();renderSheet()}).catch(()=>{toast('Bildirimler bu ortamda desteklenmiyor');renderSheet()})}catch(err){toast('Bildirimler bu ortamda desteklenmiyor');e.target.checked=false}}else{S.sound.notif=false;save()}}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(backOverlay())return;if(mode==='interior')leaveInterior();else if(mode==='focus')toHub();else if(view){view=null;renderSheet()}else if(mode==='hub')toDesk()}
  if(mode==='hub'&&!(e.target.closest&&e.target.closest('input'))){if(e.key==='q')rotateCam(Math.PI/4);if(e.key==='e')rotateCam(-Math.PI/4)}});

let lastCoins=null,eraH='';
// Para ve yonca değişince ~400 ms sayarak yeni değere gelir (kısa biçimle); hareketi azaltta, sekme arka plandayken ve ilk çizimde anında
const HUDN={};function hudNum(id,v){const el=document.getElementById(id);if(!el)return;const o=HUDN[id];
  if(!o||RM()||document.hidden||!booted||!isFinite(v)){if(o)cancelAnimationFrame(o.raf);HUDN[id]={to:v,cur:v,raf:0};el.textContent=fmtShort(v);return}
  if(o.to===v)return;const from=o.raf?o.cur:o.to;o.to=v;cancelAnimationFrame(o.raf);o.raf=0;if(!isFinite(from)||fmtShort(from)===fmtShort(v)){o.cur=v;el.textContent=fmtShort(v);return}
  const t0=performance.now();o.cur=from;const st=f=>{const k=Math.min(1,Math.max(0,(f-t0)/400)),e=1-Math.pow(1-k,3);o.cur=k>=1?v:from+(v-from)*e;el.textContent=fmtShort(o.cur);o.raf=k<1?requestAnimationFrame(st):0};o.raf=requestAnimationFrame(st)}
function renderHUD(){hudNum('coins',S.coins);if(lastCoins!=null&&S.coins>lastCoins){const pc=$('#pCoin');pc.classList.remove('bump');void pc.offsetWidth;pc.classList.add('bump')}lastCoins=S.coins;
  $('#lv').textContent=S.lv;$('#lvring').style.setProperty('--p',Math.min(100,S.xp/xpNeed(S.lv)*100)+'%');$('#pLv').title=`Seviye ${S.lv} · ${fmt(S.xp)}/${fmt(xpNeed(S.lv))} xp`;
  $('#rep').textContent=fmtShort(S.rep);$('#store').textContent=stored()+'/'+cap();$('#pStore').classList.toggle('full',stored()/cap()>=.9);
  hudNum('gems',S.gems);const se=SEASONS[season()],wx=WEATHER[S.weather.k];const eh=`${se.e}<span class="era-n"> ${se.n} ·</span> ${wx.e} ${clockStr()}`;if(eraH!==eh){eraH=eh;$('#era').innerHTML=eh}$('#goalDot').hidden=!goalReady()&&!(S.daily&&S.daily.tasks.some(t=>t.p>=t.n&&!t.c))}
// Üst çubuğun alt kenarı CSS'e --hudB olarak yazılır: bildirim, rehber ve geri düğmesi, balonlar bunun altına yerleşir (yazı boyutu ve güvenli alanla değişir)
const hudBox=document.querySelector('.hud');function measureHud(){const b=Math.round(hudBox.getBoundingClientRect().bottom);if(b>0)document.documentElement.style.setProperty('--hudB',b+'px')}
if(window.ResizeObserver)new ResizeObserver(measureHud).observe(hudBox);addEventListener('resize',measureHud);
// Geri / Escape: önce açık pencere (mini oyunsa düzgün kapatılır) ve uzun basma menüsü kapanır
function backOverlay(){const m=document.querySelector('.modal');if(m){if(m.dataset.nodismiss)return true;const x=m.querySelector('.mgx');if(x)x.click();else if(m._close)m._close();else m.remove();return true}if(typeof qpop!=='undefined'&&!qpop.hidden){closeQpop();return true}return false}
function commit(skipSheet){save();renderHUD();syncWorld();if(!skipSheet)renderSheet();refreshQpop();if(interior&&intSig(interior.key)!==interior.sig)interior.refresh()}

// Kart içindeki parsel ızgarasında da sürükleyerek ekme/toplama
let panelSwipeUsed=false;
sheet.addEventListener('pointerdown',e=>{const b=e.target.closest('.plot[data-i]');if(!b)return;const i=+b.dataset.i,k=swipeKind(i);if(!k)return;
  swipe={kind:k,done:new Set(),n:0,panel:1};panelSwipeUsed=true;try{b.releasePointerCapture&&b.releasePointerCapture(e.pointerId)}catch(err){}const r=b.getBoundingClientRect();swipeApply(i,r.left+r.width/2,r.top)});
sheet.addEventListener('pointermove',e=>{if(!swipe||!swipe.panel)return;const el=document.elementFromPoint(e.clientX,e.clientY),b=el&&el.closest('.plot[data-i]');if(b){const i=+b.dataset.i;if(!swipe.done.has(i)){const r=b.getBoundingClientRect();swipeApply(i,r.left+r.width/2,r.top)}}});
// Başlıkta sağa-sola kaydırınca bir sonraki / önceki bölüme geç
// Telefonda panel yüksekliği: başlıktan (üstteki tutamaç) yukarı-aşağı sürükleyince %25 / %45 / %85 noktalarına oturur; en alttan aşağı çekince
// bölümde/içeride küçülür, haritada/masada kapanır. Seçilen yükseklik oturum boyunca hatırlanır (sayfa yenilenince varsayılana döner).
const SHEET_SNAP=[.25,.45,.85];let sheetF=null;
{let hs=null,dr=null;const zoomOf=()=>parseFloat(getComputedStyle(document.body).getPropertyValue('--ui-scale'))||1;
  sheet.addEventListener('pointerdown',e=>{const h=e.target.closest('.sh-head');const onBtn=e.target.closest('button');hs=h&&view&&view.k==='loc'&&!onBtn?{x:e.clientX,y:e.clientY}:null;
    dr=h&&!onBtn&&phoneUI()&&e.isPrimary?{x:e.clientX,y:e.clientY,h:sheet.getBoundingClientRect().height,id:e.pointerId,on:false}:null;if(dr)try{sheet.setPointerCapture(e.pointerId)}catch(err){}});
  sheet.addEventListener('pointermove',e=>{if(!dr||e.pointerId!==dr.id)return;const dy=e.clientY-dr.y,dx=e.clientX-dr.x;
    if(!dr.on){if(Math.abs(dy)<8||Math.abs(dy)<Math.abs(dx))return;dr.on=true;hs=null;sheet.classList.add('dragging');if(view&&view.mini&&dy<0){view.mini=false;renderSheet();dr.h=sheet.getBoundingClientRect().height}}
    const v=Math.max(56,Math.min(innerHeight*.9,dr.h-dy))/zoomOf();sheet.style.height=sheet.style.maxHeight=v+'px'});
  // aşağı çekip kapatınca panel bulunduğu yükseklikten aşağı iner (kapanış kopyası satır içi yüksekliği taşır, sonra asıl panelin yüksekliği temizlenir)
  const end=e=>{if(dr&&dr.on){const dy=e.clientY-dr.y,f=sheet.getBoundingClientRect().height/innerHeight,clr=()=>{sheet.style.height=sheet.style.maxHeight=''};sheet.classList.remove('dragging');dr=null;if(!view)return clr();
      if(dy>0&&f<SHEET_SNAP[0]-.04){if(mode==='focus'||mode==='interior'){clr();view.mini=true;renderSheet()}else{view=null;renderSheet();clr()}return}clr();
      sheetF=SHEET_SNAP.reduce((a,b)=>Math.abs(b-f)<Math.abs(a-f)?b:a);sheet.style.setProperty('--sheetF',sheetF);return}dr=null};
  sheet.addEventListener('pointerup',e=>{end(e);if(!hs)return;const dx=e.clientX-hs.x,dy=e.clientY-hs.y;hs=null;if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)*1.5)stepLoc(dx<0?1:-1)});
  sheet.addEventListener('pointercancel',e=>{end(e);hs=null})}
