// ================= PLATFORM (Capacitor yerel köprüleri) =================
// Uygulama içinde çalışırken telefonun reklam, satın alma, bildirim, titreşim ve depolama özelliklerini kullanır.
// Tarayıcıda çalışırken hepsi sessizce devre dışıdır.
const CAP=window.Capacitor,NATIVE=!!(CAP&&CAP.isNativePlatform&&CAP.isNativePlatform()),PLAT=NATIVE?CAP.getPlatform():'web';
const PL=n=>NATIVE&&CAP.Plugins?CAP.Plugins[n]:null;
const PLATFORM={ads:false,iap:false,prices:{},
  async init(){if(!NATIVE)return;
    try{PL('StatusBar')&&PL('StatusBar').setOverlaysWebView({overlay:true})}catch(e){}
    try{PL('SplashScreen')&&setTimeout(()=>PL('SplashScreen').hide(),300)}catch(e){}
    // Kalıcı yedek: localStorage boşsa telefonun Preferences deposundan geri yükle
    try{const P=PL('Preferences');if(P&&!localStorage.getItem(SAVE)){const r=await P.get({key:SAVE});if(r&&r.value)localStorage.setItem(SAVE,r.value)}}catch(e){}
    this.initAds();this.initIap();this.initApp()},
  backup(json){const P=PL('Preferences');if(P)P.set({key:SAVE,value:json}).catch(()=>{})},
  // Titreşim: Ayarlar'daki "Titreşim" anahtarına bağlı (S.ui.hap, varsayılan açık; ses efektlerinden bağımsız). light: dokunuş, medium: satın alma/ödül/seviye, err: kısa çift titreşim (hata, yetersiz para).
  // Arka arkaya gelen hafif titreşimler birleştirilir (aynı dokunuşta iki kez titremesin).
  hap(kind='light'){if(!S||(S.ui&&S.ui.hap===false))return;const t=performance.now(),dt=t-(this._hapT||0);if(kind==='light'&&dt<90)return;if(kind!=='light'&&kind===this._hapK&&dt<60)return;this._hapT=t;this._hapK=kind;
    const H=PL('Haptics');if(H){const im=st=>H.impact({style:st}).catch(()=>{});if(kind==='err'){im('LIGHT');setTimeout(()=>im('LIGHT'),90)}else im(kind==='heavy'?'HEAVY':kind==='medium'?'MEDIUM':'LIGHT');return}
    if(navigator.vibrate)try{navigator.vibrate(kind==='err'?[14,70,14]:kind==='heavy'?[30,40,30]:kind==='medium'?22:10)}catch(e){}},
  // ---- AdMob ödüllü reklam ----
  async initAds(){const A=PL('AdMob');if(!A)return;try{await A.initialize({initializeForTesting:CONFIG.admobTesting});
      try{const ci=await A.requestConsentInfo();if(ci&&ci.isConsentFormAvailable&&ci.status==='REQUIRED')await A.showConsentForm()}catch(e){}
      this.ads=true;this.prepAd()}catch(e){track('ads_init_fail',{m:String(e)})}},
  async prepAd(){const A=PL('AdMob');if(!A)return;try{await A.prepareRewardVideoAd({adId:PLAT==='ios'?CONFIG.admobRewardedIos:CONFIG.admobRewardedAndroid,isTesting:CONFIG.admobTesting});this.adReady=true}catch(e){this.adReady=false}},
  showAd(cb){const A=PL('AdMob');if(!A||!this.ads)return false;let got=false;
    const h1=A.addListener('onRewardedVideoAdReward',()=>{got=true});
    const done=()=>{Promise.resolve(h1).then(h=>h&&h.remove&&h.remove());this.adReady=false;this.prepAd();if(got){S.ads.n++;cb();save();track('ad_reward')}else toast('Reklam tamamlanmadı')};
    (this.adReady?Promise.resolve():this.prepAd()).then(()=>A.showRewardVideoAd()).then(done).catch(()=>{toast('Şu an reklam yok, birazdan tekrar dene');done()});return true},
  // ---- Uygulama içi satın alma (cordova-plugin-purchase) ----
  initIap(){const run=()=>{const C=window.CdvPurchase;if(!C)return;const {store,ProductType,Platform}=C;const plat=PLAT==='ios'?Platform.APPLE_APPSTORE:Platform.GOOGLE_PLAY;
      if(CONFIG.iapValidatorUrl){store.validator=CONFIG.iapValidatorUrl;store.applicationUsername=()=>PLAYER||account().id.slice(0,16)}
      store.register(CONFIG.iapProducts.map(p=>({id:p.id,type:ProductType.CONSUMABLE,platform:plat})));
      store.when().productUpdated(p=>{if(p.pricing)this.prices[p.id]=p.pricing.price;if(view&&view.k==='shop')renderSheet()})
        .approved(tx=>tx.verify()).verified(rc=>{rc.finish()}).finished(tx=>{for(const pr of tx.products){const c=CONFIG.iapProducts.find(x=>x.id===pr.id);if(c){S.gems+=c.gems;stat('iap');track('iap',{id:c.id});toast(`+${c.gems} 🍀 Teşekkürler!`);sfx('win');commit()}}});
      store.initialize([plat]).then(()=>{this.iap=true}).catch(e=>track('iap_init_fail',{m:String(e)}))};
    if(window.CdvPurchase)run();else document.addEventListener('deviceready',run,{once:true})},
  buy(id){const C=window.CdvPurchase;if(!C||!this.iap)return toast('Satın alma şu an kullanılamıyor');const pr=C.store.get(id);const off=pr&&pr.getOffer();if(!off)return toast('Ürün bulunamadı');off.order().then(r=>{if(r&&r.isError)toast('Satın alma tamamlanmadı')})},
  // ---- Uygulama yaşam döngüsü, geri tuşu, bildirimler ----
  initApp(){const A=PL('App');if(!A)return;
    A.addListener('appStateChange',({isActive})=>{if(!isActive){save();flushEvents();this.scheduleReady()}else{this.cancelReady();syncCloud(false)}});
    A.addListener('backButton',()=>{if(backOverlay())return;if(document.body.classList.contains('photo')){photoMode(false);return}
      if(mode==='interior'){leaveInterior();return}if(mode==='focus'){toHub();return}if(view){view=null;renderSheet();return}if(mode==='hub'){toDesk();return}A.minimizeApp()})},
  async scheduleReady(){const N=PL('LocalNotifications');if(!N||!S.sound.notif)return;const ends=[];S.fields.forEach(f=>{if(f.job&&f.job.e>now())ends.push([f.job.e,'Ekinlerin hasada hazır 🌾'])});
    for(const u in S.units){const s=S.units[u];if(s.job&&s.job.e>now())ends.push([s.job.e,`${B[u].n} hazır! ${B[u].e}`])}if(!ends.length)return;ends.sort((a,b)=>a[0]-b[0]);
    const list=[ends[0]];const last=ends[ends.length-1];if(last[0]-ends[0][0]>600000)list.push([last[0],'Bütün üretimler tamamlandı, çiftlik seni bekliyor!']);
    try{await N.schedule({notifications:list.map(([at,body],i)=>({id:100+i,title:'Çiftlik İmparatorluğu',body,schedule:{at:new Date(at-TIME_OFF)}}))})}catch(e){}},
  cancelReady(){const N=PL('LocalNotifications');if(N)N.cancel({notifications:[{id:100},{id:101}]}).catch(()=>{})},
  async askNotif(){const N=PL('LocalNotifications');if(!N)return null;try{const r=await N.requestPermissions();return r.display==='granted'}catch(e){return false}}};
