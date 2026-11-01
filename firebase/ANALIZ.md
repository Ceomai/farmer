# Firebase verilerini okumak

Olaylar `events`, hatalar `errors` koleksiyonuna düşer. İstemci bunları okuyamaz; Firebase konsolundan ya da sunucu tarafında okunur.

**Konsoldan:** Firestore Database → Veriler → `events` / `errors`.

**BigQuery ile analiz (önerilen):** Firebase konsolu → Uzantılar → "Stream Firestore to BigQuery" uzantısını `events` için kur. Sonra örneğin:

```sql
-- Günlük aktif oyuncu
SELECT DATE(JSON_VALUE(data,'$.at')) gun, COUNT(DISTINCT JSON_VALUE(data,'$.player')) oyuncu
FROM `PROJE.firestore_export.events_raw_latest`
WHERE JSON_VALUE(data,'$.name')='session_start' GROUP BY gun ORDER BY gun;

-- İlk hedef hunisi
SELECT JSON_VALUE(JSON_VALUE(data,'$.props'),'$.i') hedef, COUNT(DISTINCT JSON_VALUE(data,'$.player')) oyuncu
FROM `PROJE.firestore_export.events_raw_latest`
WHERE JSON_VALUE(data,'$.name')='goal' GROUP BY hedef ORDER BY CAST(hedef AS INT64);
```

**Maliyet:** Kayıt 60 saniyede bir ve uygulamadan çıkışta, olaylar 30 saniyede bir toplu yazılır. Ücretsiz Spark planı günde 20.000 yazma verir; yaklaşık 300–500 günlük aktif oyuncuya kadar yeter. Daha fazlası için Blaze (kullandıkça öde) planına geçilmelidir.
