// ================= KOLEKSİYON =================
const COL=[
  {id:'altin_yumurta',n:'Altın Yumurta',e:'🥇',src:'kumes',p:.03,bonus:'Kümes her toplamada +1 yumurta',hint:'Kümeste'},
  {id:'simental',n:'Simental İnek',e:'🐮',src:'ahir',p:.04,bonus:'Ahır her toplamada +1 süt',hint:'Ahırda'},
  {id:'ankara',n:'Ankara Keçisi',e:'🐐',src:'agil',p:.04,bonus:'Ağıl her toplamada +1 yün',hint:'Ağılda'},
  {id:'kralice_ari',n:'Kraliçe Arı',e:'👑',src:'kovan',p:.06,bonus:'Arılık her toplamada +1 bal',hint:'Arılıkta'},
  {id:'bakir_kazan',n:'Bakır Kazan',e:'🫕',src:'mandira',p:.05,bonus:'Mandıra %10 daha hızlı',hint:'Mandırada'},
  {id:'arap',n:'Arap Atı Soyağacı',e:'📜',src:'hara',p:.2,bonus:'Atların yarışta daha güçlü',hint:'Harada'},
  {id:'altin_bugday',n:'Altın Buğday Tohumu',e:'🌟',src:'field',p:.02,bonus:'Altın Buğday ekilebilir',hint:'Tarlalarda'},
  {id:'mor_havuc',n:'Mor Havuç Tohumu',e:'🥕',src:'field',p:.015,bonus:'Mor Havuç ekilebilir',hint:'Tarlalarda'},
  {id:'kangal',n:'Kangal Yavrusu',e:'🐕',src:'any',p:.02,bonus:'Sipariş ödülleri +%5',hint:'Her yerde'},
  {id:'eski_tapu',n:'Eski Tapu',e:'🗺️',src:'any',p:.015,bonus:'Arazi fiyatları -%10',hint:'Her yerde'},
  {id:'nazar',n:'Nazar Boncuğu',e:'🧿',src:'any',p:.02,bonus:'Mini oyun ödülleri artar',hint:'Her yerde'},
  {id:'kupa',n:'Panayır Kupası',e:'🏆',src:'fair',p:0,bonus:'İtibar +5',hint:'Panayırda birinci ol'}];
const COL_BONUS={kumes:'altin_yumurta',ahir:'simental',agil:'ankara',kovan:'kralice_ari'};
const has1=id=>!!(S.album&&S.album[id]);
const cropLocked=c=>c.lvl>S.lv||(c.col&&!has1(c.col))||!cropSeasonOk(c);
const regCost=r=>Math.round(REG[r].cost*(has1('eski_tapu')?.9:1));
function showFind(c){sfx('win');const d=document.createElement('div');d.className='modal login';d.innerHTML=`<div><div class="badge">${c.e}</div><h2>Nadir buluntu!</h2><p><b>${c.n}</b><br>${c.bonus}<br>+1 🍀</p><button class="btn big gold">Koleksiyona ekle</button></div>`;d.querySelector('button').onclick=()=>d.remove();document.body.appendChild(d)}
function tryDrop(src){for(const c of COL){if(c.src!==src&&c.src!=='any')continue;if(Math.random()<c.p*(c.src==='any'?.3:1)){const first=!S.album[c.id];S.album[c.id]=(S.album[c.id]||0)+1;if(first){S.gems+=1;setTimeout(()=>showFind(c),500)}return c}}return null}
function sheetAlbum(){const n=COL.filter(c=>S.album[c.id]).length;return head('📖','Koleksiyon',`${n} / ${COL.length}`)+`<div class="sh-body"><div class="places">${COL.map(c=>{const got=S.album[c.id];
  return `<div class="place ${got?'':'locked'}" title="${got?c.bonus:'Henüz bulunmadı · '+c.hint}"><span class="thumb sm">${got?c.e:'❓'}</span>${got?c.n:'???'}<small class="tm" style="white-space:normal">${got?c.bonus:c.hint}</small></div>`}).join('')}</div>
  ${n===COL.length&&!S.stats.albumDone?`<button class="btn big gold" data-act="albumDone">Albüm tamam! +🍀50</button>`:''}<p class="note">Nadir buluntular üretim ve hasat sırasında rastgele çıkar. Her yeni buluntu +1 🍀 verir.</p></div>`}
