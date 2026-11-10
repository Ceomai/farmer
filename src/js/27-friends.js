// ================= KASABALILARLA DOSTLUK =================
const FR_LV=[0,3,8,15],FR_N=['Yabancı','Tanıdık','Dost','Can dostu'];
const FR_PERK={'Kasap Rıza':'Et ve süt siparişleri','Fırıncı Nuri':'Un ve ekmek siparişleri','Lokantacı Sevim':'Sebze siparişleri','Manav Hilmi':'Meyve-sebze','Otelci Gülten':'Lüks ürünler','Kooperatif':'Toplu alım','Bakkal Ahmet':'Günlük ihtiyaç','Konakçı Halit Bey':'Pahalı siparişler','Pazarcı Zehra':'Pazar tezgâhı'};
const frOf=n=>{if(!S.friends)S.friends={};return S.friends[n]||(S.friends[n]={d:0,gift:''})};
const frLv=n=>{const d=frOf(n).d;let l=0;FR_LV.forEach((v,i)=>{if(d>=v)l=i});return l};
const frMult=n=>1+frLv(n)*.06;
const hearts=n=>{const l=frLv(n);return '❤️'.repeat(l)+'🤍'.repeat(3-l)};
function befriend(n,amt){const before=frLv(n);frOf(n).d+=amt;const after=frLv(n);if(after>before){S.gems+=after;setTimeout(()=>{
  makeModal('login',`<div><div class="badge">${face(n)}</div><h2 class="h-md">${n}</h2><p>Artık <b>${FR_N[after]}</b>sunuz! ${hearts(n)}<br>Siparişleri %${after*6} daha fazla ödüyor.${after>=2?'<br>Her gün sana küçük bir hediye bırakacak.':''}<br>+${after} 🍀</p><button class="btn big gold">Sağ ol!</button></div>`,{close:1});sfx('win')},600)}}
function friendGifts(){const t=todayStr();const out=[];for(const n of NAMES){const f=frOf(n);if(frLv(n)>=2&&f.gift!==t){f.gift=t;const pool=producible();const k=pool[Math.floor(Math.random()*pool.length)]||'yem',q=2+frLv(n);out.push(`${face(n)} ${n}: ${giveItems({[k]:q})}`)}}
  if(out.length){makeModal('login',`<div><div class="badge">🎁</div><h2 class="h-md">Kasabadan hediye!</h2><p>${out.join('<br>')}</p><button class="btn big gold">Teşekkürler</button></div>`,{close:1})}}
function friendsBody(){return `<p class="note">Bir kişinin siparişini teslim ettikçe dostluğunuz büyür. Dostlar daha çok öder, can dostlar her gün hediye bırakır. Tanıdık olduğun kasabalıların küçük hikâyeleri burada açılır.</p>`+NAMES.map(n=>{const f=frOf(n),l=frLv(n),nx=FR_LV[l+1];
  return `<div class="job" style="padding:7px 12px"><span class="big">${face(n)}</span><span class="pw"><b>${n}</b><small>${FR_N[l]} · ${hearts(n)} · ödül +%${l*6}</small>${nx?`<span class="pbar"><i style="width:${Math.min(100,(f.d-FR_LV[l])/(nx-FR_LV[l])*100)}%" class="still love-solid"></i></span><small>${f.d}/${nx} teslimat · ${FR_PERK[n]||''}</small>`:'<small>En yüksek dostluk!</small>'}</span></div>${typeof questHTML==='function'?questHTML(n):''}`}).join('')}
