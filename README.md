# Çiftlik İmparatorluğu

50'lerin el çizimi çizgi filmlerinden ilham alan, mobil öncelikli 3D çiftlik simülasyonu. Kulübe, tarla ve kümesle başla; ek, biç, hayvan besle, kasabayla ticaret yap ve çiftliğini konaklı bir tarım imparatorluğuna büyüt.

**Hemen oyna:** `dist/index.html` dosyasını tarayıcıda aç. İnternet gerekmez; 3D motoru, yazı tipleri ve emoji fontu dosyanın içindedir.

## Proje yapısı

```
src/
  index.template.html   HTML iskeleti (HUD, dok, panel kapları)
  styles/game.css       Tüm stiller
  js/ORDER              Modüllerin yüklenme sırası
  js/000-config.js      Yayın öncesi doldurulacak ayarlar (bulut, reklam, satın alma, yasal bağlantılar)
  js/00-boot.js … 35-cloud.js   Oyun modülleri (veri, ekonomi, 3D motor, masa, paneller, ses, platform, bulut…)
scripts/
  build.mjs             Tek dosyalık çevrimdışı derleme → dist/index.html ve www/index.html (Capacitor)
  smoke-test.mjs        İnternet kapalıyken telefon ve masaüstü boyutunda otomatik akış testi
  store-screenshots.mjs Uygulama simgesi, açılış görseli, özellik grafiği ve 1080×1920 mağaza ekran görüntüleri
android/                Capacitor Android projesi
supabase/schema.sql     Bulut kaydı, analitik ve hata raporu şeması
docs/                   Gizlilik politikası, kullanım koşulları, mağaza metinleri ve görselleri
assets/                 Simge ve açılış görselinin kaynakları
```

Modüller birlikte tek bir betik olarak birleştirilir; aynı küresel kapsamı paylaşırlar. Yeni dosya eklerken `src/js/ORDER` listesine eklemeyi unutma.

## Geliştirme

```bash
npm install
npm run build        # dist/index.html + www/index.html
npm test             # duman testi (Playwright gerekir: npm i -D playwright && npx playwright install chromium)
npm run screenshots  # mağaza görsellerini yeniden üret
```

`npm run build:fast` yazı tiplerini gömmeden (Google Fonts bağlantısıyla) derler.

## Android uygulaması

```bash
npm run build
npx cap sync android
npx cap open android      # Android Studio açılır → Run
```

Her `main` gönderiminde GitHub Actions oyunu derler, duman testini çalıştırır ve indirilebilir bir **debug APK** üretir (Actions → son çalışma → Artifacts).

iOS için bir Mac'te: `npx cap add ios && npx cap sync ios && npx cap open ios`.

### Yayından önce doldurulacaklar (`src/js/000-config.js`)

| Ayar | Ne yapılmalı |
|---|---|
| `cloudUrl`, `cloudKey` | Supabase projesi aç, `supabase/schema.sql`'i çalıştır, Project URL ve anon key'i yaz. Boşsa bulut kaydı, analitik ve hata raporu kapalıdır. |
| `admobRewarded…`, `admobTesting` | AdMob'da ödüllü reklam birimi oluştur, kimlikleri yaz, `admobTesting:false` yap. `android/app/src/main/AndroidManifest.xml` ve `capacitor.config.json`'daki AdMob **uygulama kimliğini** de değiştir (şu an Google test kimliği). |
| `iapProducts` | Play Console / App Store Connect'te aynı kimliklerle tüketilebilir ürünler oluştur. |
| `privacyUrl`, `termsUrl`, `supportEmail` | `docs/` altındaki taslakları hukuki kontrolden geçirip yayınla, bağlantıları güncelle. |

## Özellikler

- **Ana menü:** Çiftçinin masası; penceredeki çiftlik canlı akar. Borsa panosu, bütçe, istatistik, takvim, sipariş defteri, posta, kumbara.
- **Çiftlik:** 14 konum, 5 satın alınabilir arazi, 16 bina, 9 tarla parseli, iç mekânlar, gün-gece, 4 mevsim, hava olayları.
- **Oynanış:** üretim zincirleri, siparişler ve sözleşmeler, kasabalılarla dostluk, işçiler, panayır, at ligi, 12 parçalık koleksiyon, mini oyunlar, hayvan isimleri ve sevgi, ev dekorasyonu, fotoğraf modu.
- **Geri dönüş:** günlük giriş ödülü ve görevler, "sen yokken" özeti, hazır bildirimleri (uygulamada yerel bildirim).
- **Gelir:** yonca para birimi, AdMob ödüllü reklam, uygulama içi yonca paketleri (uygulamada).
- **Altyapı:** çevrimdışı tek dosya, grafik kalitesi (Otomatik / Yüksek / Pil tasarrufu, otomatik çözünürlük ayarı), bulut kaydı ve kurtarma kodu, sunucu saatiyle saat hilesi koruması, izne bağlı anonim analitik ve hata raporu, KVKK onay ekranı, Android geri tuşu, titreşim, kalıcı yedek kayıt.
