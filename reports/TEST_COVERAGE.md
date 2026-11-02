# Test kapsamı

Tarih: 2026-11-02 · Sürüm: `main` (bu rapordaki sayılar son regresyon turunda gerçekten çalıştırılan testlerden alınmıştır; tablo sonuna bakınız).

## 1. Mimari ve teknoloji

| Katman | Teknoloji | Not |
|---|---|---|
| İstemci | Tek sayfa HTML; 44 sınıfsal betik (`src/js/*`, `ORDER` sırasıyla birleştirilir) + three.js r147 (3D) | Çerçeve yok; derleme `scripts/build.mjs` |
| Mobil | Capacitor 6 (Android; `com.ceomai.ciftlik`), AdMob, Play Billing (cordova-plugin-purchase), yerel bildirim, titreşim | APK GitHub Actions'ta üretilir |
| Web | GitHub Pages + PWA (servis çalışanı, manifest) | Çevrimdışı açılır |
| Arka uç | Firebase: anonim kimlik doğrulama, Firestore (REST), Cloud Function `validatePurchase` (Google Play doğrulaması) | SDK yok, REST |
| Veri | `saves/{sha256(kurtarma kodu)}`, `events`, `errors`, `purchases` koleksiyonları | Kurallar: `firebase/firestore.rules` |
| Yerel depo | `localStorage`: kayıt, hesap kimliği, oturum belirteci, olay kuyruğu, grafik ayarı | Capacitor'da ek yedek (Preferences) |

## 2. Özellik envanteri (oyunun kendisinden sayıldı)

| Öğe | Sayı | Öğe | Sayı |
|---|---|---|---|
| Ürün | 45 | Kasabalı | 9 |
| Tarla ürünü (4 mevsimlik) | 12 | Kasabalı hikâye adımı | 27 |
| Bina | 18 | Rastgele olay | 5 |
| Tarif | 49 | Kasaba projesi | 6 |
| Harita bölümü | 15 | Süs | 20 |
| Arazi bölgesi | 7 | At ligi kademesi | 4 |
| Ev kademesi | 4 | İç mekân | 6 |
| Ana hedef | 44 | Masa eşyası | 12 |
| Panayır yarışması | 11 | Öğretici adımı (2 tur) | 7 + 6 |
| Koleksiyon buluntusu | 12 | Günlük ödül günü / görev tipi | 7 / 8 |
| Başarım | 24 | Rehber sekmesi | 6 |

**Ekranlar ve paneller:** masa, harita, bölüm (odak), iç mekân, fotoğraf modu; 14 panel türü (ambar, hedefler, ayarlar, dükkân, koleksiyon/başarımlar, sipariş defteri, posta, borsa, bütçe, istatistik, rehber, konumlar, bölge, bölüm). Bölüm panellerinde sekmeler: sipariş / sözleşme / dostlar / kasaba. Alt kart şeridi (tek dokunuş, uzun basma menüsü), mini oyunlar (sağım, yumurta, pazarlık, tilki, kuzu), pencereler (izin, seviye, günlük, dönüş, dostluk, koleksiyon, tüccar, yeni nesil).

**Etkileşimler:** 68 eylem işleyicisi (`data-act`), 12 masa eylemi, 3D dokunma (bölüm, birim, parsel, hayvan), sürükleyerek ekim/hasat, kart kaydırma, başlık kaydırma, uzun basma, iki parmakla yakınlaştırma, Escape / Android geri tuşu.

**Arka plan işleri:** 500 ms oyun döngüsü (`tick`), 5 sn kayıt, 30 sn olay gönderimi, 60 sn bulut eşitleme, işçi otomasyonu, rastgele olay zamanlayıcısı, yerel bildirim planlama.

## 3. Test setleri ve kapsadıkları

| Set | Komut | Kapsam |
|---|---|---|
| Duman | `npm test` | Açılış (çevrimdışı), Türkçe karakter, masa → harita, ekim, hasat, satış, tek dokunuşla topla, iç mekân, rehber sekmeleri, 9 parselde tohumlar, kayıt; telefon ve masaüstü |
| Persona (22) | `npm run personas` | Yeni oyuncu (gerçek tıklamalarla öğretici), öğreticiyi geçen, dönen oyuncu, 30 gün yok, kısa oturum, hızlı gezinme, hata yapıp düzelten, çift tıklayan, çevrimdışı, gizli sekme, geç oyun (16 panel + 14 bölüm × 3 sekme), ekleyip silen, pazar spekülatörü, yeni nesil, başarım avcısı, olaylar, erişilebilirlik, saat değiştiren, tablet, yanlış kod deneyen, uç rehber araması, ambarı dolu |
| Uç durumlar | `npm run edge` | 7 saat dilimi × 7 yerel ayar, yaz/kış saati geçişi, gece yarısı, uç sayılar (0, ondalık, 10^15, 10^21, negatif, metin, NaN), geçersiz tarihler, bozuk ilişkiler, 20.000 istatistik + 2.000 sözleşme, emoji/Arapça/uzun metin |
| Arka uç | `npm run test:backend` | Firestore kuralları (24) + oyunun bulut modülü gerçek tarayıcıda emülatöre karşı (kayıt, geri yükleme, çoklu cihaz çakışması, çevrimdışı, sunucu 500, bozuk yanıt, oturum süresi, geçersiz belirteç, izin) |
| Güvenlik | `npm run test:security` | Kötü niyetli kayıtla XSS, enjekte öğe, yerel depo anahtarları, kaynakta gizli anahtar/debugger/eval, kaynak haritası |
| Performans | `npm run perf` | Açılış süresi, çizim çağrısı (4 ekran), 100 tur gezinmede sızıntı, 300 üretim döngüsü, masada uzun bekleme, kayıt/döngü süresi, kare süresi, 65 sn ağ isteği |
| Yerleşim | `npm run layout` | 4 ekran boyutunda masa panelleri, rehber sekmeleri, harita, bölge, 15 bölüm, 6 iç mekân: ezilme, taşma, kesik yazı, çakışma, yana kayma |
| Rastgele simülasyon | `npm run fuzz` | 11 kayıt tipi × 10 ortam × 9 ekran; dokunma, sürükleme, kaydırma, ekran değişimi, yeniden başlatma, grafik bağlamı kaybı, hızlı/çift dokunuş, 90+ oyun fonksiyonuna geçerli/geçersiz çağrı, saat ileri/geri; her 3 adımda 15+ tutarlılık kuralı |
| Bot oyuncu | `npm run bot` | 6 oyun tarzı, 5–30 sanal gün: hata, kilitlenme, ilerleme durması, ekonomi tutarlılığı |
| CI | GitHub Actions | Her gönderimde derleme, duman testi, 8 senaryoluk simülasyon (uyarı), APK ve web yayını |

## 4. Bu denetimde çalıştırılan testler

Aşağıdaki sayılar gerçekten çalıştırılmış testlerin sonuçlarıdır. "Döngü" sütunu, düzeltmelerden önceki ilk koşuları gösterir.

| Set | Son regresyon turu | Döngü boyunca |
|---|---|---|
| Duman | 28/28 denetim | her değişiklikten sonra (60+ kez) |
| Persona | 68/68 denetim (22 persona) | 1 ilk koşu: 68/68 (2 boş denetim düzeltildi) |
| Uç durumlar | 32/32 | ilk koşu düzenek takıldı, düzeltildi |
| Arka uç | 43/43 (24 kural + 19 entegrasyon) | ilk koşu 38/43: 2 kritik veri kaybı testi + 1 düzenek |
| Güvenlik | 9/9 | XSS önceki sürümde yeniden üretildi |
| Performans | 15/15 (ilk koşuda 14/15: ısınma kısa kalmıştı, sızıntı olmadığı 320 turla doğrulandı) | ilk koşu 12/14: doku sızıntısı bulundu |
| Yerleşim | 4 boyut × 43 ekran; 2 uyarı (bölge paneli açılış animasyonu sırasında ölçüm: görüntüde sorun yok) | 4 boyut × 43 ekran |
| Rastgele simülasyon | 12 koşu × 200 adım, 12/12 temiz | 96 + 80 + düzeltme doğrulama koşuları; ilk 80'lik turda 12 sorunlu → hepsi çözüldü |
| Bot | 6/6 tarz, 5–30 sanal gün, hata ve kilitlenme yok | 4 tur (2'si düzenek sorunu nedeniyle yarıda kaldı) |
| Bağımsız kod incelemesi | 3 alan, 33 bulgu | 32'si düzeltildi, 1'i tasarım |

## 5. Test edilemeyenler (engelli)

| Alan | Neden | Ne yapıldı |
|---|---|---|
| Gerçek Android cihaz, gerçek GPU | Ortamda cihaz/emülatör yok | Yazılımsal GPU ile tarayıcıda; APK CI'da derleniyor; `minWebViewVersion` ile eski WebView koruması |
| AdMob reklamları, Play Billing satın alma | Gerçek mağaza hesabı ve cihaz gerekir | Kod incelemesi; reklam yedeği ve satın alma doğrulama fonksiyonu incelendi |
| Cloud Function `validatePurchase` | Google Play API kimlik bilgisi gerekir | Kod incelemesi (yeniden kullanım koruması, hata sızdırmama) |
| Canlı Firebase projesi | Gerçek oyuncu verisine dokunulmaması kuralı | Bütün arka uç testleri emülatörde |
| Yerel bildirimler, titreşim | Cihaz gerekir | Kod incelemesi |
| iOS | Yapılandırılmadı | — |

## 6. Toplam

Son regresyon turunda **195 denetim** (duman 28, güvenlik 9, persona 68, uç durum 32, performans 15, arka uç 43) çalıştırıldı ve **hepsi geçti**. Ayrıca 4 ekran boyutunda 43 ekranlık yerleşim taraması, 12 rastgele simülasyon koşusu (2.400 hamle) ve 6 oyun tarzıyla bot simülasyonu çalıştırıldı.

Denetim döngüsü boyunca ek olarak yaklaşık 105 rastgele simülasyon koşusu (en büyüğü 80 senaryo × 200 hamle) ve 3 bağımsız kod incelemesi yapıldı. Başarısız olan her koşu tek tek yeniden oynatıldı ve kök nedeni bulundu (bkz. `BUGS_AND_FIXES.md`).

**Engellenen testler:** gerçek cihaz, reklam, satın alma, canlı Firebase, bildirim/titreşim, iOS (bkz. bölüm 5).
