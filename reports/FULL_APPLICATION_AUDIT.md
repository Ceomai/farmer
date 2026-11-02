# Çiftlik İmparatorluğu · Tam uygulama denetimi

Tarih: 2026-11-02 · Sürüm: `main` · Ayrıntılar: [Test kapsamı](TEST_COVERAGE.md) · [Hatalar ve düzeltmeler](BUGS_AND_FIXES.md) · [Performans](PERFORMANCE_REPORT.md) · [Güvenlik](SECURITY_REPORT.md) · [Kontrol listesi](CHECKLIST.md)

## Özet

**Genel sağlık puanı: 84 / 100.** Test edilen kapsamda bilinen kritik ya da yüksek önemde açık hata kalmadı. Web sürümü yayına hazır. Android sürümü **kapalı test** için hazır; üretim yayınından önce gerçek cihaz testi ve mağaza yapılandırması gerekiyor.

- Denetimde **54 hata** bulundu ve düzeltildi: 2 kritik, 13 yüksek, 26 orta, 13 düşük.
- **Kritik:** çoklu cihazda ilerleme kaybı; bozuk kayıtla oyunun hiç açılmaması.
- **Yüksek:** kötü niyetli kayıtla XSS, 4 bellek sızıntısı ve bir sayfa çökmesi, birkaç çökme.
- Son regresyon turunda **195 denetimin hepsi geçti**. Ayrıca yerleşim taraması, 12 rastgele simülasyon koşusu ve 6 oyun tarzıyla bot simülasyonu çalıştırıldı.
- Puanı düşüren başlıca etkenler, düzeltilmemiş hatalar değil, **test edilemeyen alanlar**:
  - gerçek cihaz ve GPU yok
  - reklam ve satın alma gerçek ortamda denenemedi
  - geliştirme araçlarında bilinen açıklar var
  - ekonomi istemci tarafında tutuluyor

## Puanın dağılımı

| Alan | Puan | Gerekçe |
|---|---|---|
| İşlevsellik | 92 | 22 persona ve 195 denetim geçiyor; 33 bağımsız inceleme bulgusundan 32'si düzeltildi |
| Veri bütünlüğü | 90 | Kayıt onarımı her alanı doğruluyor; çoklu cihaz çakışması çözüldü; düşük olasılıklı bir yarış penceresi kalıyor (iki cihaz aynı milisaniyede eşitlerse) |
| Güvenlik | 82 | Kurallar sağlam, XSS kapatıldı; ekonomi istemci tarafında, hız sınırı yok, geliştirme araçlarında açıklar var |
| Performans | 80 | Sızıntı yok, çizim çağrısı 3,3 kat azaldı; gerçek GPU'da ölçülemedi |
| Arayüz ve erişilebilirlik | 85 | 4 ekran boyutunda tarama; büyük yazı ve sol el modu; gerçek cihazda görsel kontrol yapılmadı |
| Cihaz uyumluluğu | 72 | Eski WebView koruması eklendi ama gerçek Android cihazda denenmedi |

## Yapılanlar (aşamalar)

1. **Keşif:** Envanter oyunun kendisinden çıkarıldı: 45 ürün, 18 bina, 49 tarif, 15 bölüm, 14 panel türü, 68 eylem işleyicisi, 5 arka plan zamanlayıcısı, 4 Firestore koleksiyonu.
2. **İşlevsel test:** Duman testi her değişiklikten sonra çalıştırıldı. Persona testleri gerçek tıklamalarla yapıldı.
3. **Persona yolculukları:** 22 oyuncu tipi, 68 denetim. Örnekler:
   - yeni oyuncu
   - dönen oyuncu
   - 30 gün yokluk
   - çift tıklayan
   - çevrimdışı ve gizli sekme
   - saat değiştiren
   - yeni nesle devreden
   - erişilebilirlik kullanıcısı
4. **Uç durumlar:** 32 denetim:
   - 7 saat dilimi ve 7 yerel ayar
   - yaz/kış saati geçişi
   - 10^21'e kadar sayılar, NaN ve negatif değerler
   - geçersiz tarihler
   - 20.000 kayıtlık veri
   - Unicode
5. **Arayüz:** 4 ekran boyutunda 43 ekranlık otomatik yerleşim taraması ve bağımsız arayüz incelemesi (12 bulgu, hepsi düzeltildi).
6. **Arka uç:** Firebase emülatöründe 24 kural ve 19 entegrasyon testi. **Kritik çoklu cihaz veri kaybı** burada yeniden üretildi ve düzeltildi.
7. **Performans ve stres:**
   - 100 ve 320 turluk gezinme sızıntı testi
   - masada uzun bekleme
   - büyük veri
   - 6 tarzlı bot ile 30 sanal gün
   - 4 sızıntı ve 1 bellek tükenmesi bulundu, hepsi düzeltildi
8. **Güvenlik:** kurallar, XSS, yerel depo, kaynak taraması, bağımlılık taraması, satın alma fonksiyonu incelemesi.
9. **Otomatik test altyapısı:** 9 test seti `package.json` betikleriyle yeniden çalıştırılabilir. CI her gönderimde duman testi ve kısa simülasyon koşturuyor.
10. **Düzeltme ve regresyon:** Her hata önce yeniden üretildi. Düzeltmeden sonra aynı test tekrarlandı ve tam regresyon turu koşturuldu.
11. **Döngüler:** 3 bağımsız kod incelemesi, yaklaşık 105 rastgele simülasyon koşusu, 4 bot turu ve 2 tam regresyon turu yapıldı. Bunlardan biri yarıda kesildi ve düzeltmelerden sonra baştan koşturuldu.

## Önem derecesine göre bulgular

| Önem | Bulunan | Düzeltilen | Açık |
|---|---|---|---|
| Kritik | 2 | 2 | 0 |
| Yüksek | 13 | 13 | 0 |
| Orta | 26 | 26 | 0 |
| Düşük | 13 | 13 | 0 |
| Tasarım kararı (bilerek bırakıldı) | 1 | — | Sera mevsim ürünlerini her mevsim yetiştiriyor |
| Kalan risk (düzeltilmedi, gerekçeli) | 4 | — | Geliştirme araçları, istemci tarafı ekonomi, hız sınırı, kurtarma kodu tasarımı |

## Veritabanı ve veri bütünlüğü

- Firestore kuralları yalnızca beklenen alanlara ve türlere izin veriyor; listeleme ve silme kapalı.
- İstemci kayıt onarımı her alanı doğruluyor:
  - türler, sınırlar, tanınmayan bina, ürün ve tarifler
  - ileri tarihli işler
  - HTML işaretleri
  - kayıt sayıları
- **Çoklu cihaz:** Eşitleme önce bulutu okuyor ve daha çok oynanmış kaydı koruyor. Emülatörde iki yönlü çakışma test edildi.
- **Yeniden başlatma:** Rastgele simülasyonda her yeniden açılışta seviye, deneyim, bina, arazi ve hedef ilerlemesinin azalmadığı denetlendi.

## Arayüz bulguları

Bağımsız incelemenin 12 bulgusunun hepsi düzeltildi:
- mini oyun donması
- uzun basma menüsü
- öğretici eli
- pencere genişliği
- masa paneli kapatma
- rehber araması
- geri tuşu
- fotoğraf modu

Yerleşim taramasında gerçek bir sorun kalmadı.

## Cihaz uyumluluğu

- **Test edilen:** 9 ekran boyutu (360×640'tan 1920×1080'e), dikey ve yatay, cihaz piksel oranı 1 ve 2, azaltılmış hareket, düşük ve yüksek grafik, depolama engelli ve depolama dolu, grafik bağlamı kaybı.
- **Koruma eklenen:**
  - WebGL olmayan cihazda açıklayıcı mesaj
  - eski Android WebView'da güncelleme uyarısı (`minWebViewVersion` 87)
- **Test edilemeyen:** gerçek Android cihazlar ve iOS.

## Test edilemeyen alanlar

Gerçek Android cihaz ve GPU · AdMob reklamları · Play Billing satın alma · Cloud Function'ın Google Play ile gerçek doğrulaması · canlı Firebase projesi (kural gereği dokunulmadı; emülatörle test edildi) · yerel bildirim ve titreşim · iOS.

## Önerilen sonraki adımlar

1. **Gerçek cihaz testi:** Play Console'da kapalı test kanalı açılıp **yayın öncesi raporu** çalıştırılmalı (gerçek cihazlarda otomatik test). Ayrıca en az bir düşük ve bir orta seviye Android telefonda elle oynanmalı.
2. **Mağaza yapılandırması:**
   - gerçek AdMob uygulama ve birim kimlikleri
   - `validatePurchase` fonksiyonunun yayınlanması ve adresinin `CONFIG.iapValidatorUrl`'e girilmesi
   - imza anahtarı
3. **Firebase:**
   - App Check (olay ve hata kayıtlarına kötüye kullanım koruması)
   - API anahtarının uygulama ve alan adıyla kısıtlanması
4. **Bağımlılıklar:** Capacitor 7'ye geçiş (geliştirme aracı açıklarını kapatır).
5. **Denge:** Çok sık oynayan oyuncu hâlâ hızlı ilerliyor (bot: 30 günde seviye 102). Gerçek oyuncu verisi geldikçe yükseltme maliyeti ve pazar doygunluğu ayarlanmalı.

## Yayına hazırlık değerlendirmesi

| Kanal | Durum |
|---|---|
| Web (GitHub Pages) | **Hazır.** Bilinen açık hata yok; çevrimdışı çalışıyor |
| Android kapalı / iç test | **Hazır.** APK CI'da üretiliyor |
| Google Play üretim | **Henüz değil.** Gerçek cihaz testi, gerçek reklam/satın alma kimlikleri, satın alma doğrulama fonksiyonu ve imza anahtarı gerekiyor |

## Testleri yeniden çalıştırma

```
npm run build && npm test && npm run test:security && npm run personas && npm run edge && npm run perf
npm run test:backend        # Java 11+ gerekir (Firebase emülatörü)
npm run layout && npm run fuzz -- 24 200 && npm run bot -- 30
```
