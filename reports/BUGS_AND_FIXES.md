# Hatalar ve düzeltmeler

Tarih: 2026-11-02 · Kapsam: bu denetim döngüsünde bulunan ve düzeltilen hatalar. Her satırdaki hata ya oyun çalıştırılarak yeniden üretildi ya da kod okunarak bulundu ("Doğrulama" sütunu). Düzeltmeler ilgili test yeniden çalıştırılarak doğrulandı.

**Özet:** 54 hata düzeltildi (2 kritik, 13 yüksek, 26 orta, 13 düşük). Bilerek değiştirilmeyen 1 tasarım kararı ve kalan riskler en altta.

Önem dereceleri: **Kritik** = veri kaybı ya da oyunun hiç açılmaması · **Yüksek** = çökme, kalıcı bozulma, güvenlik açığı, ciddi bellek sızıntısı · **Orta** = yanlış iş kuralı, takılma, istismar · **Düşük** = görsel ya da nadir durum.

## Kritik

| # | Hata | Kök neden | Düzeltme | Doğrulama |
|---|---|---|---|---|
| K1 | Çoklu cihazda ilerleme kaybı: tabletteki eski durum, telefondaki yeni ilerlemenin üzerine buluttan yazıyordu (₺9.999 → ₺1.234) | Her açık cihaz dakikada bir koşulsuz yazıyordu; "son kaydedilme" her cihazda 5 sn'de bir güncellendiği için ilerlemeyi göstermiyordu | Eşitleme önce bulutu okuyor; hiç azalmayan istatistik toplamıyla daha çok oynanmış kayıt korunuyor; eşitlemeler sıraya alınıyor (`35-cloud.js`) | Emülatörde yeniden üretildi; 4 çoklu cihaz testi geçiyor |
| K2 | Bozuk, eski ya da tanınmayan değer içeren kayıtla oyun hiç açılmıyordu | `migrate()` yalnızca eksik alanları dolduruyordu | Kayıt onarımı her alanı doğruluyor: türler, sınırlar, bilinmeyen bina/ürün/tarif, ileri tarihli işler (`24-daily.js`) | Simülasyonda 11 bozuk kayıt tipiyle |

## Yüksek

| # | Hata | Düzeltme | Doğrulama |
|---|---|---|---|
| Y1 | Kötü niyetli bir kayıt (ör. "bu kodu gir" tuzağı) sayfada kod çalıştırabiliyordu (XSS: at adı, görev metni, sipariş sahibi HTML olarak basılıyordu) | Onarımda bütün metinlerden `< > " ' \`` temizleniyor; sipariş/sözleşme sahibi listeden doğrulanıyor | Önceki sürümde uyarı penceresi açıldı, yeni sürümde açılmıyor (`security-test.mjs`) |
| Y2 | İç mekândan her çıkışta 2048² gölge haritası ve dokular serbest bırakılmıyordu (100 turda doku 26 → 69) | `disposeScene` / `dropInterior` | 100 tur gezinmede doku 22 → 22 |
| Y3 | Masa her yeniden kurulduğunda 12 doku + gölge haritası sızıyordu | `buildDesk` önce eski masayı temizliyor | 10 yeniden kurulumda doku 20 → 20 |
| Y4 | Masada beklerken birleştirme kuyruğu sınırsız büyüyordu; uzun oturumda sayfa çöküyordu | Kaldırılmış grupların kaydı atılıyor, masada anlık görüntü tutulmuyor | 200 yeniden kurulumda kuyruk 15 (sınır 18) |
| Y5 | Hara 4. seviyede harita çöküyordu (6 at, 5 renk) | At sayısı sınırlandı | Bot simülasyonunda yeniden üretildi |
| Y6 | Android'de arka plana atıp dönünce (grafik bağlamı kaybı) oyun hata veriyordu | Bağlam kayıpken çizim duruyor, gelince devam ediyor | Simülasyonda bağlam kaybı ortamı |
| Y7 | Statik birleştirme durmakta olan hayvan ve insanları donduruyordu (açılışta 12 insandan 6'sı) | Hareketli parçalar işaretli; masada gözlem yapılmıyor | 34 insan, 11 hayvan: 0 donuk |
| Y8 | Birleştirme sonrası ördek animasyonu çöküyordu (`children[1]`) | Kafa doğrudan referansla | Simülasyonda 9 tohum |
| Y9 | Mini oyun sırasında işçi işi toplarsa yumurta/sağım oyunu donuyordu | İş başta yakalanıyor, sonda aynı mı kontrol ediliyor | Ajan testi a3 |
| Y10 | WebGL açılamayan cihazda oyun sonsuza dek açılış ekranında kalıyordu | Açıklayıcı mesaj | `--disable-webgl` ile |
| Y11 | Eski Android WebView'da sessiz çökme (`?.` ve `inset` desteklenmiyor) | `minWebViewVersion: 87`: kullanıcıya WebView güncelleme uyarısı çıkar | Kod okuma; gerçek cihazda doğrulanmadı |
| Y12 | Tarlada tohum düğmeleri küçük ekranda 6 piksele eziliyordu | Panel bölümleri küçülmüyor | 360×640, 9 parselde |
| Y13 | İç mekânda çiftçi balonu açıkken sahne çizilmiyordu | Döngüde dal ayrıldı | Elle |

## Orta

| # | Hata | Düzeltme |
|---|---|---|
| O1 | Yeni nesilde ana hedefler tekrar ödeniyordu (~₺150 bin her nesil) | Hedef ilerlemesi korunuyor |
| O2 | Yeni nesil günlük ödül, reklam hakkı ve panayırı sıfırlıyordu | Korunuyor |
| O3 | Yarış sürerken yeni nesle geçilince ödül yeni çiftliğe yatıyordu | Yarış bitmeden devredilemiyor |
| O4 | İşçi ve "Topla" düğmesi sıradaki işi atlıyordu | Sıra önce |
| O5 | Ambar doluyken Hara toplanamıyordu (taylar ambara sayılmadığı halde) | Taylar sınırdan muaf |
| O6 | Saat geri alınınca pazar fiyatı saatlerce dipte kalıyordu | Doygunluk geçmişe doğru büyümüyor |
| O7 | Bozuk doygunluk verisiyle para NaN olup 300'e dönüyordu | Onarım + fiyat koruması |
| O8 | Hediye ve günlük yem ambar sınırını aşıyordu | Taşan kısım paraya çevriliyor |
| O9 | Bozuk günlük seriyle ödül penceresi çöküyordu | Seri 1–7 arasına çekiliyor |
| O10 | Sipariş/sözleşme bulunmamış koleksiyon tohumu (Altın Buğday) isteyebiliyordu | Yalnızca üretilebilir ürünler |
| O11 | Uzun basma menüsü ekran değişince açık kalıyordu | Mod değişince kapanıyor |
| O12 | 1 saniyeden uzun basınca menü açılıp karta da gidiliyordu | Sonraki tıklama yutuluyor |
| O13 | Öğretici eli ekran dışındaki karta işaret ediyordu | Kart görünür alana kaydırılıyor |
| O14 | "← Harita" adımlarında öğretici eli hiç çıkmıyordu | Görünürlük denetimi düzeltildi |
| O15 | Hikâyede çift dokunuş iki adım teslim ediyordu | Düğme adım numarası taşıyor |
| O16 | Tüccar penceresi 360 piksel ekrana sığmıyordu | Genişlik sınırı, satır kaydırma |
| O17 | Masada paneller kapatılamıyordu, yalnızca küçülüyordu | Kapanıyor |
| O18 | Rehber araması her yeniden çizimde siliniyordu | Arama korunuyor |
| O19 | İki parmakla yakınlaştırma dokunma ya da ekim sayılıyordu | Çoklu parmak izleniyor |
| O20 | Geri tuşu reklam penceresini kapatsa da ödül veriliyordu; izin penceresi geri tuşuyla kapanıyordu | Düzeltildi |
| O21 | Geri tuşu mini oyunu kapatınca döngüsü arka planda sürüyordu | Pencere kapanınca döngü duruyor |
| O22 | Bölge/bölüm yeniden kurulurken geometri sızıyordu (bölge başına 14) | Temizleniyor |
| O23 | Servis çalışanı 404/500 yanıtlarını önbelleğe alabiliyordu | Yalnızca başarılı yanıtlar; yavaş ağda 3,5 sn sonra önbellek |
| O24 | İskeleler inşaattan sonra kaybolmuyordu | Birleştirme dışında |
| O25 | Kilitlenme: parası tohuma yetmeyen, satacak ürünü olmayan oyuncu ertesi güne kadar bir şey yapamıyordu | Komşu saatte en fazla bir kez ₺30 bırakıyor |
| O26 | Reklamla hızlandırma, iş arada toplandıysa yanlış işi bitirebiliyordu | İş kimliği kontrolü |

## Düşük

Kasaba bölgesi açma hatası; boş panel kapatma hatası; tarifsiz binada üretim / geçersiz işçi çağrısı; iç mekândan geçersiz bölüme düşme; büyük yazıda öğretici balonunun paneli örtmesi; fotoğraf modunda alt şeridin görünmesi; Escape'in açık pencereyi yok sayması; kart "Topla" rozetinin yazıya binmesi; birleştirmede benzersiz geometrilerin serbest bırakılmaması (açılışta birkaç tane); sipariş/sözleşme sayısına üst sınır yokluğu (şişirilmiş kayıt 602 KB); kayıtta bilinmeyen proje/işçi/panayır alanları; çok uzun/emoji at adının paneli taşırması; desteklenmeyen hava durumu değeri.

## Bilerek değiştirilmeyen

- **Sera, mevsim ürünlerini her mevsim yetiştiriyor.** Bu bir tasarım kararı ("sera" mantığı); rehberde yazıyor. İnceleme ajanı bunun istenip istenmediğini sordu.

## Kalan riskler (düzeltilmedi)

| Konu | Neden düzeltilmedi | Öneri |
|---|---|---|
| Geliştirme araçlarında bilinen açıklar (tar, sharp: 1 kritik, 3 yüksek) | Capacitor komut satırının yeni ana sürümünü gerektiriyor; Android yapılandırması değişir. Oyuna ve APK'ya girmiyorlar | Ayrı bir çalışmada Capacitor 7'ye geçiş |
| Ekonomi istemci tarafında (para ve yonca cihazda tutuluyor) | Tek oyunculu oyun; sunucu tarafı cüzdan büyük mimari değişiklik | Yonca satışı arttığında sunucu tarafı bakiye |
| Olay ve hata kayıtlarına hız sınırı yok | Firestore kuralları hız sınırlamayı desteklemiyor | Firebase App Check |
| Kurtarma kodunu bilen kaydın üzerine yazabilir | Cihazlar arası kurtarma için bilerek seçilmiş tasarım | Kodu paylaşmama uyarısı (oyunda var) |
