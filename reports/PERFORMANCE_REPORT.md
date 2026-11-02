# Performans ve stres raporu

Tarih: 2026-11-02 · Araç: `scripts/perf-test.mjs`, `scripts/bot-sim.mjs`, `scripts/fuzz.mjs`

**Sonuç:** Son ölçümde sızıntı yok (320 tur gezinmede GPU kaynakları ve bellek sabit), kayıt ve oyun döngüsü milisaniyenin altında, bulut trafiği dakikada yaklaşık 2 istek. Denetimde 4 bellek sızıntısı ve 1 bellek tükenmesi (sayfa çökmesi) bulunup düzeltildi.

> **Ölçüm ortamı:** Bulut kapsayıcısında Chromium + **yazılımsal GPU (SwiftShader)**, 4 çekirdek. Gerçek telefon GPU'su yok. Bu yüzden mutlak süreler (açılış, kare süresi) telefondakinden farklıdır. Anlamlı olanlar eğilimler (sızıntı, büyüme), sayımlar (çizim çağrısı, istek) ve CPU tarafı süreler (kayıt, döngü).

## 1. Ölçümler (son regresyon turu)

| Ölçüm | Değer | Sınır / yorum |
|---|---|---|
| Açılış (yazılımsal GPU, 3 ölçüm) | 3,99 / 4,34 / 6,08 sn | Gerçek GPU'da daha kısa beklenir; ölçülemedi |
| Çizim çağrısı: masa | 194 | |
| Çizim çağrısı: harita | 564 | Birleştirme öncesi 1.837 (3,3 kat azaldı) |
| Çizim çağrısı: bölüm / iç mekân | 137 / 256 | |
| 100 tur gezinme (80 tur ısınmadan sonra): geometri | 490 → 490 | Sızıntı yok |
| 100 tur gezinme: doku | 22 → 22 | Düzeltme öncesi 26 → 69 |
| 100 tur gezinme: JS belleği / sayfa öğesi | 32 → 32 MB / 208 → 208 | |
| 300 üretim döngüsü: geometri / JS belleği | 490 → 460 / 32 → 34 MB | |
| Masada 200 yeniden kurulum: birleştirme kuyruğu | 15 (sınır 18) | Düzeltme öncesi sınırsız büyüyüp sayfayı çökertiyordu |
| Kayıt boyutu (geç oyun) | 4,5 KB | Bulut sınırı 900 KB |
| `save()` orta / en kötü | 0,2 / 2,9 ms | |
| `tick()` orta / en kötü | 0,2 / 59,7 ms | En kötü değer tekil bir dış değer |
| Bölüm yeniden kurulumu: tümü / tek bölüm / "Hepsini topla" | 38 / 4–7 / 8,5 ms | |
| Ağ: 65 sn'de istek (bulut açık) | 2 (1 kayıt yazma, 1 olay paketi) | Ayrıca dakikada 1 okuma (eşitleme önce okur) |
| Büyük veri: 20.000 istatistik + 2.000 sözleşme | kayıt 13 ms, panel 331 ms, 602 KB | Onarım artık sipariş ve sözleşmeyi sınırlıyor |

## 2. Uzun oturum (bot oyuncu, 6 tarz)

Bütün tarzlar hatasız tamamlandı; kilitlenme ya da tutarsız değer (eksi para, NaN) görülmedi.

| Tarz | Süre | Sonuç |
|---|---|---|
| 5 dakikada bir giren | 30 gün, 8.640 tur | Seviye 102 |
| Savurgan | 30 gün, 4.320 tur | Seviye 75 |
| Günde 3 kez giren | 30 gün, 90 tur | Seviye 16, 14 bina |
| Sürekli tıklayan | 5 gün, 14.395 tur | Seviye 73 |
| Yeni nesle devreden | 30 gün, 2.880 tur | 7 nesil, 18 hikâye adımı |
| Sıfırdan hevesli | 10 gün, 14.392 tur | Seviye 82 |

## 3. Bulunan ve düzeltilen performans sorunları

| Sorun | Etki | Düzeltme |
|---|---|---|
| İç mekândan her çıkışta 2048² gölge haritası + dokular serbest bırakılmıyordu | GPU belleği her girişte büyüyor; telefonda birkaç düzine girişte çökme riski | İç mekân bırakılırken temizleniyor |
| Masa yeniden kurulurken 12 doku + gölge haritası sızıyordu | Her oyun günü ve borsa yenilemesinde | Önce temizleniyor |
| Bölge yeniden kurulurken 14 geometri sızıyordu | Her arazi alımında | Temizleniyor |
| Masada beklerken birleştirme kuyruğu sınırsız büyüyordu | Uzun oturumda sayfa çöküyordu (bot simülasyonunda yeniden üretildi) | Kaldırılan grupların kaydı atılıyor |
| Birleştirme yan etkileri: donan hayvan/insan, kaybolmayan iskele | Görsel bozulma | Hareketli parçalar işaretli; çizim çağrısı 762'den 564'e geri kazanıldı |

## 4. Darboğazlar ve öneriler

- **Kare süresi:** Yazılımsal GPU'da harita karesinin %90'lık değeri yaklaşık 480 ms. Bu, gerçek GPU'nun yokluğundan kaynaklanıyor. Gerçek cihazda Play Console'un yayın öncesi raporu ya da Android Studio profil aracı ile ölçülmeli.
- **Gölgeler:** En pahalı kalem. Düşük grafik modunda zaten kapalı; orta seviye cihazlarda otomatik moda bırakılması öneriliyor.
- **`viewOffset` her karede düzen ölçüyor** (panel açıkken `getBoundingClientRect`). Ölçülebilir bir sorun görülmedi; düşük öncelik.
- **Açılış:** Dosya 1,66 MB tek parça. Gömülü yazı tipleri ve emoji yazı tipi alt kümesi çıkarılırsa açılış kısalır; çevrimdışı çalışma için bilerek gömülü tutuluyor.
