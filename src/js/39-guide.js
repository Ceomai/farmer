// ================= REHBER (KILAVUZ) =================
// Masa ve harita ekranında soldaki "📖 Rehber" düğmesiyle her zaman açılır.
// Ürün / bina / bölge bilgileri doğrudan oyun verisinden (ITEMS, CROPS, B, LOC, REG...) üretilir; oyun değişince rehber de kendiliğinden güncel kalır.
const GTABS=[['start','🧭 Başla'],['res','💰 Kaynak'],['items','🧺 Ürün'],['places','🏗️ Bina'],['events','🎪 Etkinlik'],['tips','💡 İpucu']];
const gEsc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
const gIn=r=>Object.entries(r.in||{}).map(([k,n])=>`${ITEMS[k].e}${n} ${ITEMS[k].n}`).join(' + ')||'girdi yok';
const gOut=r=>Object.entries(r.out).map(([k,n])=>`${ITEMS[k].e}${n} ${ITEMS[k].n}`).join(', ');
const gLv=l=>`<span class="gtag${S.lv>=l?' ok':''}">Sv ${l}</span>`;
// Bir girdi kartı: başlık + içerik; arama bu metin üstünde yapılır
function gEntry(title,body,open){const q=(title+' '+body).replace(/<[^>]+>/g,' ').toLocaleLowerCase('tr');
  return `<details class="gd" data-q="${gEsc(q)}"${open?' open':''}><summary>${title}</summary><div class="gd-b">${body}</div></details>`}
function gSources(k){const out=[];
  CROPS.forEach(c=>{if(c.out[k])out.push(`🌾 <b>Tarlada ek</b>: tohum ₺${c.cost}, ${secs(c.t)} sürer, ${c.out[k]} adet çıkar ${gLv(c.lvl)}${c.col?` · koleksiyondan <b>${COL.find(x=>x.id===c.col).n}</b> bulunmalı`:''}`)});
  for(const u in B){const d=B[u];if(!d.recipes)continue;d.recipes.forEach(r=>{if(!r.out[k])return;if(u==='sera'&&CROPS.some(c=>c.id===r.id))return;
    out.push(`${d.e} <b>${d.n}</b> → ${r.n}: ${gIn(r)}${r.cost?` + ₺${r.cost}`:''}, ${secs(r.t)} ${gLv(r.lvl)}`)})}
  if(B.sera&&CROPS.some(c=>c.out[k]))out.push(`🏕️ <b>Serada</b> iki kat hızlı yetişir ${gLv(B.sera.lvl)}`);
  if(ITEMS[k].buy)out.push(`🏪 <b>Pazardan satın al</b>: tanesi ₺${ITEMS[k].buy}`);
  return out}
function gUses(k){const out=[];for(const u in B){const d=B[u];(d.recipes||[]).forEach(r=>{if(r.in&&r.in[k])out.push(`${d.e} ${d.n} → <b>${r.n}</b> (${r.in[k]} adet) → ${gOut(r)}`)})}
  CONTESTS.forEach(c=>{if(c.need[k])out.push(`🎪 Panayır: <b>${c.n}</b> yarışması (${c.need[k]} adet)`)});
  if(k==='yem')out.push('🐎 At antrenmanı (4 yem)');if(k==='at')out.push('🏇 Yarış alanında ahıra al, ligde yarıştır');
  return out}
function gItems(){const first=k=>{let l=99;CROPS.forEach(c=>{if(c.out[k])l=Math.min(l,c.lvl+(c.col?50:0))});for(const u in B)(B[u].recipes||[]).forEach(r=>{if(r.out[k])l=Math.min(l,Math.max(r.lvl,B[u].lvl))});return l};
  return Object.keys(ITEMS).sort((a,b)=>first(a)-first(b)).map(k=>{const it=ITEMS[k],src=gSources(k),use=gUses(k);
    return gEntry(`<em>${it.e}</em> ${it.n}<small>~₺${it.p}${has(k)?` · ambarda ${has(k)}`:''}</small>`,
      `<p><b>Nereden elde edilir?</b></p><ul>${src.map(s=>`<li>${s}</li>`).join('')||'<li>Özel ödüllerle</li>'}</ul>`+
      (use.length?`<p><b>Nerede kullanılır?</b></p><ul>${use.map(s=>`<li>${s}</li>`).join('')}</ul>`:'')+
      `<p class="note">Pazar fiyatı ~₺${it.p}; her 3 dakikada %80–125 arasında değişir (Borsa'dan takip et). Siparişlerde ve sözleşmelerde de istenebilir.</p>`)}).join('')}
function gPlaces(){let h='';
  h+=gEntry(`<em>🌾</em> Tarlalar`,`<p>Ürün yetiştirdiğin parseller. Boş parsele dokun ya da parmağını parseller üstünde sürükle: ekilir. Olgunlaşınca aynı şekilde topla.</p>
    <ul><li>Başta 2 parsel var, en fazla 9 olur. Yeni parsel fiyatları: ${PLOT_COST.slice(2).map((c,i)=>`₺${fmt(c)} (Sv ${PLOT_LV[i+2]})`).join(', ')}</li>
    <li>Tarla seviyesi (⬆): +%50 ürün ve daha hızlı büyüme. Fiyatlar: ${FIELD_UP.slice(1).map((c,i)=>`Sv ${i+2}: ₺${fmt(c)}`).join(', ')}</li>
    <li>Ekilebilir ürünler: ${CROPS.map(c=>`${ITEMS[c.id].e} ${c.n} (${secs(c.t)}, Sv ${c.lvl})`).join(' · ')}</li>
    <li>Yağmurda ekinler daha hızlı büyür.</li></ul>`);
  for(const u in B){const d=B[u],k=locOf(u),L=k&&LOC[k],R0=L&&REG[L.reg];
    h+=gEntry(`<em>${d.e}</em> ${d.n}<small>₺${fmt(d.cost)} · Sv ${d.lvl}</small>`,`<p>${d.d}</p><ul>
      <li>Yeri: <b>${L?L.n:'-'}</b>${R0&&R0.cost?` (${R0.n} arazisi: ₺${fmt(R0.cost)}, Sv ${R0.lvl})`:''}</li>
      ${d.storage?`<li>Her seviyede ambara +${d.storage} yer.</li>`:''}
      ${(d.recipes||[]).filter(r=>!(u==='sera'&&CROPS.some(c=>c.id===r.id))).map(r=>`<li><b>${r.n}</b>: ${gIn(r)}${r.cost?` + ₺${r.cost}`:''} → ${gOut(r)} · ${secs(r.t)} ${gLv(r.lvl)}</li>`).join('')}
      ${u==='sera'?'<li>Tarladaki bütün ürünler burada yarı sürede yetişir.</li>':''}
      <li>Yükseltme (⬆): her seviye +%50 ürün, daha kısa süre. En fazla Sv ${MAXL}. Sv 4–5 için ev ve oyuncu seviyesi gerekir.</li>
      ${INSIDE_UNITS[u]?'<li>🚪 İçeri girip hayvanları sev: mutluluk 70 üstündeyse her toplamada +1 ürün.</li>':''}</ul>`)}
  h+=gEntry(`<em>🏡</em> Çiftlik Evi`,`<p>Evin büyüdükçe ambar büyür ve binaların üst seviyelerinin kilidi açılır.</p><ul>${HOUSE.map((x,i)=>`<li>${x.e} <b>${x.n}</b>${x.cost?` · ₺${fmt(x.cost)} · Sv ${x.lvl}`:' (başlangıç)'} · ambar ${[80,160,260,400][i]}</li>`).join('')}</ul><p>Kumbaradan aldığın süsleri evin içine ve bahçeye yerleştirebilirsin.</p>`);
  h+=gEntry(`<em>🗺️</em> Araziler`,`<p>Haritadaki bulutlu alanlar satın alınabilir araziler. Alt şeritteki 🔒 kartlara ya da bulutlara dokun.</p><ul>${Object.values(REG).filter(r=>r.rect&&r.cost).map(r=>`<li><b>${r.n}</b>: ₺${fmt(r.cost)} · Sv ${r.lvl} · ${Object.values(LOC).filter(L=>REG[L.reg]===r).map(L=>L.e+' '+L.n).join(', ')}</li>`).join('')}</ul>`);
  return h}
function guideBody(tab){switch(tab){
  case'start':return gEntry('🔁 Temel döngü',`<ol><li><b>Ek</b> → tarlaya tohum ek, hayvanları besle.</li><li><b>Bekle</b> → süre dolunca kartta yeşil ✓ ve <b>🧺 Topla</b> çıkar.</li><li><b>Topla</b> → ürünler ambara gelir, deneyim (XP) kazanırsın.</li><li><b>İşle ya da sat</b> → buğdayı una, unu ekmeğe çevir; ya da pazarda sat.</li><li><b>Büyü</b> → yeni bina, parsel, arazi al; seviye atla, yeni ürünler açılsın.</li></ol>`,1)
      +gEntry('🪑 Masa (ana ekran)',`<p>Masadaki her eşya bir menü açar:</p><ul>${Object.entries({map:'Çiftliğe (haritaya) çık',window:'Pencere de haritaya çıkarır',ledger:'Tüccar siparişleri: istenen ürünleri teslim et, para + itibar kazan',mail:'Sözleşmeler: büyük toplu teslimatlar, yonca ödüllü',calendar:'Günlük ödül, günlük görevler ve ana hedefler',borsa:'Ürünlerin güncel fiyatları ve son değişimleri',butce:'Bugünkü gelir ve giderlerin',gazete:'İstatistiklerin ve rekorların',piggy:'Kumbara: süs dükkânı, yonca, ödüllü reklam',trophy:'Koleksiyon: nadir buluntular ve bonusları',basket:'Ambar: elindeki ürünler ve kapasite',radio:'Müziği aç / kapat',clock:'Ayarlar: ses, grafik, hesap ve yedek kodu'}).map(([k,t])=>`<li>${(DNAMES[k]||['🪟','Pencere'])[0]} <b>${(DNAMES[k]||['','Pencere'])[1]}</b>: ${t}</li>`).join('')}</ul>`)
      +gEntry('🗺️ Harita',`<ul><li><b>Alttaki kartlar</b>: her bölüm bir kart. Karta dokun, oraya git.</li><li>Karttaki <b>🧺 Topla</b> / <b>▶ Başlat</b> düğmeleri hiç gitmeden işi yapar.</li><li><b>Hepsini topla</b>: bütün çiftliği tek dokunuşla toplar ve yeniden başlatır.</li><li>Bölüm panelinde <b>‹ ›</b> okları ya da başlığı sağa-sola kaydırmak bir sonraki bölüme geçirir.</li><li>Haritayı parmakla döndür, iki parmakla yakınlaştır. Sağdaki düğmeler de aynı işi yapar; 📷 fotoğraf modudur.</li><li>Rozetler: ✓ hazır, 🔨 kurulabilir, 💤 boşta, 🔒 kilitli.</li></ul>`)
      +gEntry('🚪 İç mekân',`<p>Kümes, ahır, ağıl, besi ahırı ve harada panelden <b>🚪 İçeri</b> ile girebilirsin. Hayvanlara dokunup sev, ürünleri yerden topla. Mutlu hayvanlar daha çok ürün verir.</p>`);
  case'res':return gEntry('₺ Para',`<p><b>Kazan</b>: pazarda satış, siparişler, sözleşmeler, panayır ve at yarışları.<br><b>Harca</b>: tohum, bina, yükseltme, parsel, arazi, işçi, süs.</p>`,1)
      +gEntry('🍀 Yonca',`<p>Özel para birimi.</p><ul><li><b>Kazan</b>: seviye atlayınca (+2), günlük giriş ödülü, sözleşmeler, dostluk seviyesi, panayır birinciliği, at ligi, koleksiyon buluntusu, mini oyunlar, ödüllü reklam.</li><li><b>Harca</b>: üretimi anında bitir (kalan her 10 dakika için 1 yonca), özel süsler.</li></ul>`)
      +gEntry('⭐ Seviye ve XP',`<p>Her toplama XP verir. Seviye atlayınca yeni ürünler, binalar ve araziler açılır. Sıradaki seviye için ${xpNeed(S.lv)} XP gerekiyor (şu an ${S.xp}).</p>`)
      +gEntry('★ İtibar',`<p>0–100 arası. Sipariş ve sözleşme ödemelerini etkiler (itibar 0'da %70, 100'de %130).<br><b>Artırmak için</b>: sipariş teslim et (+1), sözleşme tamamla (+2), panayırda derece yap (+3 / +5).</p>`)
      +gEntry('📦 Ambar',`<p>Elinde aynı anda tutabileceğin ürün sınırı (şu an ${stored()} / ${cap()}). Ev büyüdükçe artar (80 → 160 → 260 → 400), her silo seviyesi +150 ekler. Ambar dolunca toplama yapılamaz; pazarda sat.</p>`)
      +gEntry('🌦️ Mevsim ve hava',`<p>Mevsimler değiştikçe hava değişir. 🌧️ Yağmur ve ⛈️ fırtınada ekinler ve sera daha hızlı büyür; ilkbahar ve sonbahar daha yağışlıdır, kışın kar yağar.</p>`);
  case'items':return `<p class="note">Bir ürüne dokun: nereden çıktığını ve nerede kullanıldığını gör. Yeşil "Sv" etiketi açık, gri olan henüz kilitli demek.</p>`+gItems();
  case'places':return gPlaces();
  case'events':return gEntry('📜 Tüccar Hanı (siparişler)',`<p>Kasabalılar ürün ister. Hepsini teslim edince para, XP ve itibar kazanırsın. Teslim ettikçe o kişiyle dostluğun artar.</p>`,1)
      +gEntry('✉️ Sözleşmeler',`<p>Postadan gelir. Tek bir üründen çok sayıda, birkaç saat içinde teslim edilir. Parça parça teslim edebilirsin. Ödülü yüksektir, ayrıca 🍀 ve itibar verir.</p>`)
      +gEntry('🎪 Panayır',`<p>Her gün 3 yarışma çıkar (${CONTESTS.map(c=>c.e+' '+c.n).join(', ')}). İstenen ürünleri ver ve katıl. İlgili binan ya da tarlan ne kadar yüksek seviyedeyse şansın o kadar artar. Birinciye para, 🍀 ve itibar, şanslıysan 🏆 Panayır Kupası.</p>`)
      +gEntry('🏇 At ligi',`<p>Harada tay yetiştir, Yarış Alanı'nda ahıra al (en fazla 4 at). Antrenman (4 yem) hız ya da dayanıklılığı artırır. Ligler: ${TIERS.map(t=>`${t.n} (giriş ₺${fmt(t.fee)}, ödül ₺${fmt(t.prize)})`).join(', ')}.</p>`)
      +gEntry('🏆 Koleksiyon',`<p>Toplama yaparken nadiren özel buluntular çıkar. Her biri kalıcı bir bonus verir:</p><ul>${COL.map(c=>`<li>${c.e} <b>${c.n}</b> (${c.hint}): ${c.bonus}</li>`).join('')}</ul>`)
      +gEntry('👷 İşçiler',`<p>Seviye ${WORKER_LV}'ten itibaren her bina ve tarla için işçi tutabilirsin. İşçi hazır ürünü toplar ve aynı üretimi yeniden başlatır; sen oyunda yokken de çalışır.</p>`)
      +gEntry('🤝 Dostluk',`<p>Kasabalılara sipariş ve sözleşme teslim ettikçe dostluğun artar: ${FR_N.join(' → ')}. Her kademe ödemeleri %6 artırır ve 🍀 verir; dostların her gün küçük hediyeler bırakır.</p>`)
      +gEntry('🎮 Mini oyunlar',`<ul><li>🥚 <b>Yumurta yakala</b>: kümes çalışırken panelden.</li><li>🥛 <b>Sağım ritmi</b>: ahır çalışırken panelden.</li><li>🤝 <b>Pazarlık</b>: pazarda tüccarla.</li></ul><p>Ödül olarak üretimi hızlandırır, ekstra ürün ya da 🍀 verir.</p>`)
      +gEntry('📅 Günlük ödül ve görevler',`<p>Her gün giriş yap: 7 günlük seri ödülleri (para, yem, 🍀). Takvimde her gün 3 küçük görev çıkar; bitirince ödülünü al.</p>`);
  case'tips':return gEntry('💡 Hızlı ilerleme',`<ul><li>Uzun süreli ürünleri (kabak, kaşar, kestane balı, büyük hasat) oyundan çıkmadan önce başlat.</li><li>Ham ürün yerine işlenmiş ürün sat: un → ekmek, süt → peynir çok daha kârlı.</li><li>Borsa'da ▲ olan ürünleri sat, ▼ olanları bekle.</li><li>Yemi yem değirmeninde üret, pazardan almaktan ucuz.</li><li>Ambar dolmasın: siloyu yükselt, evi büyüt.</li><li>İşçiler zamanını en çok kazandıran yatırımdır.</li><li>Ayarlar → <b>Hızlı gezinme</b> açıkken kamera uçmadan anında geçer.</li></ul>`,1)
      +gEntry('🔐 Hesap ve yedek',`<p>İlerlemen cihazda ve buluta kaydedilir. Ayarlar'daki <b>kurtarma kodunu</b> bir yere not et: yeni bir cihazda bu kodla çiftliğine geri dönebilirsin.</p>`)
      +gEntry('🔋 Pil ve akıcılık',`<p>Ayarlar → Grafik: <b>Pil tasarrufu</b> gölgeleri kapatır ve kare hızını sınırlar. Eski telefonlarda daha akıcı oynar.</p>`)}}
function sheetGuide(){const tab=view.tab||'start';
  return head('📖','Rehber','Ne nedir, nereden çıkar, nasıl yapılır')+`<div class="sh-body guide">
    <input class="gsearch" id="guideQ" type="search" placeholder="Ara: un, kaşar, işçi, yonca..." autocomplete="off">
    <div class="tabs gtabs">${GTABS.map(([k,n])=>`<button aria-selected="${tab===k}" data-act="vtab" data-t="${k}">${n}</button>`).join('')}</div>
    <div class="gbody" data-tab="${tab}">${guideBody(tab)}</div><div class="gall" hidden></div></div>`}
// Arama: bütün sekmelerde arar, eşleşen kartları açık gösterir
document.addEventListener('input',e=>{if(e.target.id!=='guideQ')return;const q=e.target.value.trim().toLocaleLowerCase('tr'),body=sheet.querySelector('.gbody'),all=sheet.querySelector('.gall'),tabs=sheet.querySelector('.gtabs');if(!body)return;
  if(!q){all.hidden=true;body.hidden=false;tabs.hidden=false;return}
  if(!all.dataset.built){all.innerHTML=GTABS.map(([k])=>guideBody(k)).join('');all.dataset.built=1}
  body.hidden=true;tabs.hidden=true;all.hidden=false;let n=0;all.querySelectorAll('.gd').forEach(d=>{const ok=d.dataset.q.includes(q),top=ok&&d.querySelector('summary').textContent.toLocaleLowerCase('tr').includes(q);d.hidden=!ok;d.open=top||(ok&&q.length>2&&n<3);d.style.order=top?-1:0;if(ok)n++});
  let em=all.querySelector('.gempty');if(!em){em=document.createElement('p');em.className='note gempty';all.prepend(em)}em.textContent=n?'':'Sonuç yok. Başka bir kelime dene.'});
