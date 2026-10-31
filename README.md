# Çiftlik İmparatorluğu

Tarayıcıda çalışan, 1950'lerin el çizimi animasyon filmlerini andıran 3D bir çiftlik simülasyonu. Bir kulübe, bir tarla ve bir kümesle başlıyorsun. Arazi satın alıp yeni binalar kurarak çiftliği konaklı bir tarım imparatorluğuna büyütüyorsun.

## Oynamak

`index.html` dosyasını bir tarayıcıda aç. Kurulum gerekmez. Three.js ve yazı tipleri CDN üzerinden yüklenir.

- **Fare:** Sürükleyerek gez, sağ tıkla döndür, tekerlekle yakınlaş.
- **Dokunmatik:** Tek parmakla gez, iki parmakla döndür ve yakınlaş.
- Ana menü çiftçinin masasıdır. Penceredeki çiftlik canlı akar. Masadaki nesneler menüdür: harita (çiftliğe çık), sipariş defteri, posta (sözleşmeler), takvim (günlük ödül ve hedefler), radyo (müzik), kumbara (dükkân), kupa rafı (koleksiyon), sepet (ambar), duvar saati (ayarlar). Telefonda masa parmakla kaydırılır.
- Haritada etiketlere (Çiftlik Evi, Tarlalar, Kümes, Ahır, Değirmen Sokağı, Köy Pazarı, Tüccar Hanı, Panayır, Yarış Alanı…) dokununca o bölüme gidilir.
- Ev, kümes, ahır, ağıl ve besi ahırında doğrudan binanın içine girilir. Sol üstteki düğme haritaya döndürür.
- Tarlalar'da seçili tohum boş parsele dokununca ekilir, olgun parsele dokununca hasat edilir.
- Kilitli araziler satın alındıkça haritada yeni bölümler açılır.

## İçerik

- **Harita:** 14 konum, 5 satın alınabilir arazi bölgesi, 16 bina türü, 9 tarla parseli. Binalar 3, ev 4 seviyeye kadar büyür.
- **Üretim zincirleri:** mısır → yem → süt → peynir, buğday → un → ekmek ve kek. Kısa ürünlerin yanında 1–8 saatlik uzun ürünler de var (kabak, eski kaşar, kestane balı, büyük elma hasadı).
- **Yaşayan dünya:** 12 dakikalık gün-gece döngüsü, saat başı değişen dört mevsim (karlı kış, turuncu sonbahar, çiçekli ilkbahar), yağmur, fırtına ve kar. Yağmur ekinleri hızlandırır, fırtınada tavuklar kümese kaçar.
- **Karakterler:** dolaşan çiftçi ve köpeği, pazarcılar, handaki tüccar, panayır jürisi ve ziyaretçileri, yolda yürüyen köylüler, ördekli gölet.
- **Ses:** Web Audio ile üretilen 50'ler tarzı çiftlik müziği ve hayvan sesleri. Ayarlar'dan kapatılabilir.
- **Ev dekorasyonu:** Dükkândan alınan eşyalar evin içinde (duvar, köşe, sofra, tavan, kilim) ve bahçede görünür.
- **İşçiler (seviye 5):** Tarlayı ve binaları otomatik toplar, aynı üretimi yeniden başlatır.
- **Tüccar Hanı:** Siparişlerin yanında saatler süren tedarik sözleşmeleri.
- **Koleksiyon:** Üretim ve hasatta rastgele çıkan 12 nadir buluntu. Her biri kalıcı bir bonus verir.
- **Panayır:** Her gün yenilenen üç yarışma (en büyük kabak, peynir, en güzel inek…).
- **Yarış Alanı:** Tay yetiştir, ahıra al, antrenman yaptır, Köy Ligi'nden Ulusal Lig'e yüksel.
- **Günlük döngü:** 7 günlük giriş ödülü takvimi, her gün üç görev, uzun aradan sonra "sen yokken" özeti, hazır bildirimleri.
- **Mini oyunlar:** Sağım ritmi (ahır), yumurta yakala (kümes), tüccarla pazarlık (pazar).
- **Gelir modeli:** Oyun içinde kazanılan yonca (🍀) para birimi. Ödüllü reklamla ya da yoncayla hızlandırma, yonca ile özel süsler. Reklam şu an 5 saniyelik bir yer tutucu. Yonca paketleri mağaza sürümüne bırakıldı, bu sürümde ödeme alınmıyor.
- İlerleme tarayıcının yerel deposuna kaydedilir.
