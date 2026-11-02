# Güvenlik raporu

Tarih: 2026-11-02 · Yöntem: savunma amaçlı inceleme. Canlı Firebase projesine ve gerçek oyuncu verisine **dokunulmadı**; bütün sunucu testleri yerel Firebase emülatöründe, projenin kendi kurallarıyla yapıldı. Rapor gizli anahtar içermez.

**Sonuç:** 1 yüksek önemde istemci açığı (XSS) yeniden üretildi ve kapatıldı. Sunucu kuralları 24 testin hepsini geçti. Kalan riskler tasarım gereği ya da yalnızca geliştirme araçlarında.

## 1. Kimlik doğrulama ve yetkilendirme

| Konu | Bulgu | Durum |
|---|---|---|
| Oturum | Firebase anonim oturum; belirteç ve yenileme belirteci `localStorage`'da | Kabul edilebilir (anonim, kişisel veri yok) |
| Kayıt erişimi | Belge adı `sha256(kimlik.gizli)`; kurallar listelemeyi ve silmeyi yasaklıyor. Başkasının kaydını bulmak için 128 bit gizli değeri bilmek gerekir | Test edildi: listeleme 403, silme 403 |
| Sahiplik | Belgede sahip alanı yok; kurtarma kodunu bilen herkes kaydın üzerine yazabilir | **Tasarım gereği** (cihazlar arası kurtarma). Oyunda "kodu sakla" uyarısı var |
| Oturumsuz erişim | Okuma ve yazma reddediliyor | Test edildi |
| Sahte belirteç | Reddediliyor | Test edildi |
| Satın alma kayıtları | İstemciden okunamaz ve yazılamaz; yalnızca Cloud Function yazar | Test edildi |
| Tanımsız koleksiyonlar | Varsayılan ret | Test edildi |

## 2. Girdi doğrulama

| Konu | Bulgu | Durum |
|---|---|---|
| Kayıt belgesi | Yalnızca `json`, `level`, `updatedAt`; türler ve 900 KB sınırı kurallarda | 6 test geçti |
| Olay / hata kayıtları | Alan listesi ve uzunluk sınırları kurallarda | 6 test geçti |
| **XSS (yüksek)** | Kayıttaki metinler (at adı, görev metni, sipariş sahibi) ekrana HTML olarak basılıyordu. Kurtarma koduyla yüklenen kötü niyetli bir kayıt sayfada kod çalıştırabiliyordu ("bu kodu gir, bedava yonca" tuzağı) | **Düzeltildi:** kayıt onarımı tüm metinlerden HTML işaretlerini temizliyor. Önceki sürümde uyarı penceresi açıldı, yenide açılmıyor |
| Kurtarma kodu girişi | Sıkı düzenli ifade; boş, çok uzun, emoji ve enjeksiyon denemeleri reddediliyor | Persona testi |
| Bozuk ya da şişirilmiş kayıt | Onarımda türler, sınırlar ve kayıt sayıları denetleniyor | Simülasyon + uç durum testi |

## 3. Hassas bilgi ve yapılandırma

- **Firebase web API anahtarı** istemci kodunda. Bu bir gizli bilgi değildir (Firebase web anahtarları herkese açıktır); erişim kurallarla korunuyor. Öneri: Google Cloud konsolunda anahtarı Android paket adı ve alan adıyla kısıtlamak.
- Kaynakta özel anahtar ya da sunucu gizli anahtarı **yok**. `debugger` ve oyun kodunda `eval` **yok**. Yayın dosyasında kaynak haritası **yok** (test edildi).
- Yerel depoda yalnızca oyunun kendi anahtarları var (test edildi).
- Hata raporları ve analitik **yalnızca izinle** gönderiliyor (emülatörde doğrulandı); kişisel veri (ad, e-posta, konum) toplanmıyor.

## 4. Satın alma (Cloud Function `validatePurchase`)

İnceleme: kod okuma. Gerçek Google Play kimlik bilgisi olmadığı için çalıştırılamadı.

- Google Play Developer API ile doğruluyor; yalnızca tanımlı ürün kimlikleri kabul ediliyor.
- Aynı satın alma belirteci başka bir hesapta tekrar kullanılamıyor (işlem kaydı ile).
- Hata ayrıntısı istemciye sızdırılmıyor; `maxInstances: 10`.
- **Not:** `CONFIG.iapValidatorUrl` şu an boş. Mağazaya çıkmadan önce fonksiyon yayınlanıp adres girilmeli; aksi halde satın almalar sunucuda doğrulanmaz.

## 5. Bağımlılıklar (`npm audit`)

| Paket grubu | Bulgu | Etki | Durum |
|---|---|---|---|
| Oyun (geliştirme araçları: `@capacitor/cli`, `@capacitor/assets`) | 1 kritik (tar), 3 yüksek (sharp, cli), 6 orta | Yalnızca geliştiricinin makinesinde derleme sırasında; oyuna ve APK'ya girmiyor | Bozucu olmayan düzeltme yok; Capacitor 7'ye geçiş gerekiyor (ayrı çalışma) |
| Cloud Function | 10 orta, yüksek ya da kritik yok | Sunucu tarafı | Kilit dosyası eklendi; güncelleme önerilir |

## 6. Kalan riskler ve öneriler

1. **Ekonomi istemci tarafında:** para ve yonca cihazda tutuluyor; bilgili bir kullanıcı kendi kaydını düzenleyebilir. Tek oyunculu oyunda başkalarına zarar vermez; yonca satışı büyürse sunucu tarafı bakiye düşünülmeli.
2. **Olay ve hata kayıtlarında hız sınırı yok:** kötü niyetli biri sınırsız kayıt yazıp maliyet yaratabilir. Öneri: Firebase App Check.
3. **API anahtarı kısıtlaması:** Google Cloud'da Android uygulaması ve alan adıyla kısıtlanmalı.
4. **Geliştirme araçları:** Capacitor 7'ye geçişte giderilir.
