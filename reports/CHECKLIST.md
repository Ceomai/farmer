# Denetim kontrol listesi (devam edilebilir kayıt)

Son güncelleme: 2026-11-02. Bu dosya, denetim yarıda kalırsa kaldığı yerden sürdürülebilsin diye tutulur.

## Aşamalar

| # | Aşama | Durum | Kanıt / araç |
|---|---|---|---|
| 1 | Keşif ve envanter | Tamam | `reports/TEST_COVERAGE.md` (özellik envanteri) |
| 2 | İşlevsel testler | Tamam | `scripts/smoke-test.mjs`, `scripts/personas.mjs` |
| 3 | Persona yolculukları (22) | Tamam: 68/68 | `scripts/personas.mjs` |
| 4 | Uç durumlar | Tamam: 32/32 | `scripts/edge-test.mjs` |
| 5 | Arayüz ve görsel | Tamam (4 ekran boyutu, 43 ekran; 12 inceleme bulgusu düzeltildi) | `scripts/layout-check.mjs` |
| 6 | Arka uç, veritabanı, veri bütünlüğü | Tamam: 43/43 | `scripts/backend-test.mjs` (Firebase emülatörü) |
| 7 | Performans ve stres | Tamam: 15/15 | `scripts/perf-test.mjs`, `scripts/bot-sim.mjs` |
| 8 | Güvenlik | Tamam: 9/9 + kural testleri | `scripts/security-test.mjs`, `scripts/backend-test.mjs` |
| 9 | Otomatik test altyapısı | Tamam | `package.json` betikleri |
| 10 | Hata düzeltme + regresyon | Tamam: 54 hata düzeltildi | `reports/BUGS_AND_FIXES.md` |
| 11 | Sürekli test döngüleri | Tamam | 2 tam regresyon turu, ~105 simülasyon koşusu, 4 bot turu |
| 12 | Son rapor | Tamam | `reports/FULL_APPLICATION_AUDIT.md` |

## İşler

- [x] Arayüz kod incelemesi (bağımsız ajan) bulgularını düzelt
- [x] Çizim, döngü ve platform kod incelemesi (bağımsız ajan) bulgularını düzelt
- [x] Büyük fuzz turunun sonuçlarını işle
- [x] Bot simülasyonunu yeni denge ve özelliklerle koştur (6 tarz)
- [x] Tüm test setlerini son kez regresyon olarak koştur
- [x] Raporları yaz: denetim, kapsam, hatalar, performans, güvenlik

## Testleri yeniden çalıştırma

```
npm run build
npm test                 # duman testi
npm run test:security    # istemci güvenliği
npm run personas         # 22 persona
npm run edge             # uç durumlar
npm run perf             # performans ve stres (65 sn ağ ölçümü dahil)
npm run layout           # yerleşim taraması (çıktı: out/layout)
npm run fuzz -- 24 200   # rastgele simülasyon (koşu sayısı, adım)
npm run bot -- 60        # bot oyuncu, 60 sanal gün
npm run test:backend     # Firebase emülatörü (Java 11+ gerekir)
```

## Sonraki oturum için

- [ ] Gerçek cihazda test (Play Console yayın öncesi raporu)
- [ ] Capacitor 7'ye geçiş (geliştirme aracı açıkları)
- [ ] Firebase App Check ve API anahtarı kısıtlaması
- [ ] `validatePurchase` yayını ve `CONFIG.iapValidatorUrl`
