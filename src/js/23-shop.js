// ================= GELİR MODELİ: yonca, ödüllü reklam, dükkân =================
const AD_MAX=8;
function adsLeft(){const t=todayStr();if(S.ads.day!==t){S.ads.day=t;S.ads.n=0}return AD_MAX-S.ads.n}
function watchAd(cb){if(adsLeft()<=0)return toast('Bugünlük reklam hakkın bitti');if(PLATFORM.showAd(cb))return;const d=document.createElement('div');d.className='modal mg';let n=5;
  d.innerHTML=`<div><div class="mgface">📺</div><h2 style="font-size:22px">Ödüllü reklam</h2><p class="note">Mağaza sürümünde burada kısa bir reklam oynar. Bu sürümde örnek olarak 5 saniye bekliyoruz.</p><div class="mgscore" id="adc">${n}</div></div>`;document.body.appendChild(d);
  const iv=setInterval(()=>{n--;const c=d.querySelector('#adc');if(c)c.textContent=n;if(n<=0){clearInterval(iv);d.remove();S.ads.n++;cb();save()}},1000)}
const speedCost=ms=>Math.max(1,Math.ceil(ms/600000));
function finishJob(j){j.e=now()}
function speedUnit(u,how){const s=S.units[u];if(!s||!s.job||now()>=s.job.e)return;if(how==='ad')watchAd(()=>{finishJob(s.job);sfx('pop');toast('⚡ Üretim tamamlandı!');commit()});
  else{const c=speedCost(s.job.e-now());if(S.gems<c)return toast('Yeterli yoncan yok');S.gems-=c;finishJob(s.job);sfx('pop');commit()}}
function speedFields(how){const run=S.fields.filter(f=>f.job&&now()<f.job.e);if(!run.length)return;const ms=Math.max(...run.map(f=>f.job.e-now()));
  if(how==='ad')watchAd(()=>{run.forEach(f=>finishJob(f.job));sfx('pop');toast('⚡ Bütün ekinler olgunlaştı!');commit()});else{const c=speedCost(ms);if(S.gems<c)return toast('Yeterli yoncan yok');S.gems-=c;run.forEach(f=>finishJob(f.job));sfx('pop');commit()}}
function speedBtns(kind,ms,u){const c=speedCost(ms);return `<button class="pill-btn" data-act="ad${kind}" ${u?`data-u="${u}"`:''} ${adsLeft()>0?'':'disabled'} title="Ödüllü reklam izle, hemen bitir">📺 Bitir</button><button class="pill-btn" data-act="gem${kind}" ${u?`data-u="${u}"`:''} ${S.gems>=c?'':'disabled'} title="Yonca ile hemen bitir">🍀${c} Bitir</button>`}
function extraRow(u){const s=S.units[u];let h='';if(s.job&&now()<s.job.e){h+=speedBtns('U',s.job.e-now(),u);
    if(!s.job.mg&&u==='ahir')h+=`<button class="pill-btn gold" data-act="mg" data-k="milk" data-u="ahir">🎮 Sağım oyunu</button>`;if(!s.job.mg&&u==='kumes')h+=`<button class="pill-btn gold" data-act="mg" data-k="eggs">🎮 Yumurta yakala</button>`}
  if(B[u].recipes)h+=workerBtn(u);return h}
const DECOR=[
  {id:'tablo_koy',slot:'duvar',n:'Köy manzarası',e:'🖼️',c:400},{id:'tablo_at',slot:'duvar',n:'At portresi',e:'🐎',g:4},{id:'nal',slot:'duvar',n:'Uğurlu nal',e:'🧲',c:250},
  {id:'saksi',slot:'kose',n:'Saksı ağacı',e:'🪴',c:300},{id:'sandik',slot:'kose',n:'Çeyiz sandığı',e:'🧰',c:600},{id:'gramofon',slot:'kose',n:'Gramofon',e:'📯',g:6},
  {id:'semaver',slot:'masa',n:'Semaver',e:'🫖',c:500},{id:'vazo',slot:'masa',n:'Çiçekli vazo',e:'💐',c:200},{id:'meyve',slot:'masa',n:'Meyve sepeti',e:'🧺',c:150},
  {id:'fener',slot:'tavan',n:'Gaz lambası',e:'🏮',c:350},{id:'avize',slot:'tavan',n:'Bakır avize',e:'🔆',g:8},
  {id:'kilim_mavi',slot:'kilim',n:'Mavi kilim',e:'🟦',c:400},{id:'kilim_yesil',slot:'kilim',n:'Yeşil kilim',e:'🟩',c:400},{id:'kilim_altin',slot:'kilim',n:'Altın kilim',e:'🟨',g:5},
  {id:'heykel',slot:'bahce1',n:'Ördek heykeli',e:'🦆',c:800,farm:1},{id:'cicek',slot:'bahce1',n:'Çiçek tarhı',e:'🌷',c:300,farm:1},
  {id:'kusevi',slot:'bahce2',n:'Kuş evi',e:'🐦',c:350,farm:1},{id:'cesme',slot:'bahce2',n:'Taş çeşme',e:'⛲',g:6,farm:1},
  {id:'bayrak',slot:'giris',n:'Bayrak süsü',e:'🎏',c:250,farm:1},{id:'kemer',slot:'giris',n:'Çiçekli kemer',e:'🌸',g:5,farm:1}];
const SLOTN={duvar:'Duvar',kose:'Köşe',masa:'Sofra',tavan:'Tavan',kilim:'Kilim',bahce1:'Bahçe solu',bahce2:'Bahçe sağı',giris:'Giriş'};
function buyDecor(id){const d=DECOR.find(x=>x.id===id);if(!d)return;if(!S.decor.owned[id]){if(d.c&&S.coins<d.c)return toast('Yeterli paran yok');if(d.g&&S.gems<d.g)return toast('Yeterli yoncan yok');if(d.c)pay(d.c,'Süs');if(d.g)S.gems-=d.g;S.decor.owned[id]=1;sfx('coin')}
  const grp=d.farm?S.decor.farm:S.decor.house;grp[d.slot]=grp[d.slot]===id?null:id;toast(grp[d.slot]?`${d.e} ${d.n} yerleştirildi`:`${d.n} kaldırıldı`);if(d.farm)popLoc='ev';commit();if(interior&&interior.key==='kulube')buildInterior('kulube')}
function sheetShop(){const tb=view.tab||'ev';let b=`<div class="tabs"><button aria-selected="${tb==='ev'}" data-act="vtab" data-t="ev">🏠 Ev</button><button aria-selected="${tb==='ciftlik'}" data-act="vtab" data-t="ciftlik">🌷 Bahçe</button><button aria-selected="${tb==='yonca'}" data-act="vtab" data-t="yonca">🍀 Yonca</button></div>`;
  if(tb==='yonca')b+=`<div class="job"><span class="big">🍀</span><span class="pw"><b>${S.gems} yonca</b><small>Hızlandırma ve özel süsler için</small></span></div>
    <button class="btn big gold" data-act="adGem" ${adsLeft()>0?'':'disabled'}>📺 Reklam izle · +1 🍀 (${adsLeft()} hak)</button>
    <div class="tiles">${CONFIG.iapProducts.map((p,i)=>{const pr=PLATFORM.prices[p.id];return PLATFORM.iap?`<button class="tile" data-act="iap" data-id="${p.id}"><span class="big">🍀<i>×${p.gems}</i></span><span class="tm">${['Avuç','Sepet','Çuval'][i]||''}</span><span class="ins"><b>${pr||'…'}</b></span></button>`:`<div class="tile" style="opacity:.6"><span class="big">🍀<i>×${p.gems}</i></span><span class="tm">${['Avuç','Sepet','Çuval'][i]||''}</span><span class="tm">${NATIVE?'Yükleniyor':'Uygulamada'}</span></div>`}).join('')}</div>
    <p class="note">${NATIVE?'Satın alımlar Google Play / App Store hesabın üzerinden yapılır. Yonca oyun içinde de kazanılabilir.':'Yonca paketleri mobil uygulamada satın alınabilir. Tarayıcı sürümünde ödeme alınmaz; yonca oyun içinde kazanılır.'}</p>`;
  else{const list=DECOR.filter(d=>tb==='ev'?!d.farm:d.farm),grp=tb==='ev'?S.decor.house:S.decor.farm;
    b+=[...new Set(list.map(d=>d.slot))].map(sl=>`<div class="uhead"><span>${SLOTN[sl]}</span></div><div class="tiles">${list.filter(d=>d.slot===sl).map(d=>{const own=S.decor.owned[d.id],on=grp[sl]===d.id;
      return `<button class="tile ${on?'on':''}" data-act="decor" data-id="${d.id}" ${!own&&((d.c&&S.coins<d.c)||(d.g&&S.gems<d.g))?'disabled':''}><span class="big">${d.e}</span><span class="tm" style="white-space:normal;text-align:center">${d.n}</span><span class="ins"><b>${on?'✓ Yerinde':own?'Yerleştir':d.c?'₺'+fmt(d.c):'🍀'+d.g}</b></span></button>`}).join('')}</div>`).join('');
    b+=`<p class="note">${tb==='ev'?'Ev eşyaları evin içinde görünür. Eve girip bak!':'Bahçe süsleri çiftlik evinin önünde görünür.'}</p>`}
  return head('🛍️','Dükkân','Süsle, hızlandır')+`<div class="sh-body">${b}</div>`}
