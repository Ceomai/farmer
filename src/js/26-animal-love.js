// ================= HAYVAN İSİMLERİ VE SEVGİ =================
const ANAMES={kumes:['Pamuk','Gıdık','Kınalı','Benekli','Ponçik','Tüylü','Sarı','Minnoş','Cücük'],ahir:['Sarıkız','Menekşe','Karakız','Benekli'],agil:['Kıvırcık','Bulut','Yumak','Topak','Dolly','Pofuduk','Kar','Lokum'],besi:['Tosun','Karaoğlan','Paşa','Boncuk'],hara:['Yıldız','Rüzgar','Asil']};
const LOVE_U=['kumes','ahir','agil','besi','hara'];
function loveOf(u){if(!S.love)S.love={};const L=S.love[u]||(S.love[u]={v:50,t:now(),pet:{}});const DM=projOn('cesme')?1200000:600000,decay=Math.floor((now()-L.t)/DM);if(decay>0){L.v=Math.max(20,L.v-decay);L.t+=decay*DM}return L}
const loveBonus=u=>LOVE_U.includes(u)&&S.units[u]&&loveOf(u).v>=70;
function petAnimal(u,idx,x,y){const L=loveOf(u),nm=(ANAMES[u]||[])[idx%((ANAMES[u]||['']).length)]||'';const last=L.pet[idx]||0;
  if(now()-last<60000){floatXY(x,y,`${nm} ♥`);return}L.pet[idx]=now();const was=L.v;L.v=Math.min(100,L.v+6);stat('pet');
  floatXY(x,y,`${nm} ♥ ${L.v}`);if(was<70&&L.v>=70){toast(`💗 ${B[u].n} hayvanları çok mutlu! Her toplamada +1 ürün`);sfx('win')}save();if(view)renderSheet()}
function loveRow(u){if(!LOVE_U.includes(u)||!S.units[u])return'';const L=loveOf(u),names=ANAMES[u].slice(0,Math.min(ANAMES[u].length,{kumes:3+2*S.units[u].l,ahir:Math.min(4,S.units[u].l+1),agil:2+2*S.units[u].l,besi:Math.min(4,S.units[u].l+1),hara:Math.min(3,S.units[u].l)}[u]));
  return `<div class="job" style="padding:7px 12px"><span class="big ic-md">${L.v>=70?'💗':L.v>=40?'💛':'🤍'}</span><span class="pw"><b>Mutluluk ${L.v}/100${L.v>=70?' · +1 ürün':''}</b><span class="pbar"><i style="width:${L.v}%" class="still love"></i></span><small>${names.join(', ')} · içeri girip sev</small></span></div>`}
