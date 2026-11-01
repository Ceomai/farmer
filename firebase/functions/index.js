// Çiftlik İmparatorluğu · Satın alma doğrulama servisi (Firebase Cloud Functions, 2. nesil)
// cordova-plugin-purchase "validator" protokolüyle uyumludur: uygulama her satın almayı buraya gönderir,
// servis Google Play Developer API ile doğrular. Aynı satın alma kodu başka bir oyuncuda tekrar kullanılamaz.
// Kurulum: README → "Satın alma doğrulama".
const {onRequest} = require('firebase-functions/v2/https');
const {initializeApp} = require('firebase-admin/app');
const {getFirestore, FieldValue} = require('firebase-admin/firestore');
const {google} = require('googleapis');

initializeApp();
const db = getFirestore();
const PACKAGE = process.env.ANDROID_PACKAGE || 'com.ceomai.ciftlik';
const PRODUCTS = new Set(['yonca_30', 'yonca_90', 'yonca_250']);
const fail = (res, code, message) => res.status(200).json({ok: false, code, message});

exports.validatePurchase = onRequest({region: 'europe-west3', cors: true, maxInstances: 10}, async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('POST');
  try {
    const body = req.body || {};
    const tx = body.transaction || {};
    const player = String((body.additionalData && body.additionalData.applicationUsername) || '').slice(0, 64);
    if (tx.type !== 'android-playstore') return fail(res, 6778001, 'Desteklenmeyen platform');
    const productId = body.id || tx.productId;
    const token = tx.purchaseToken;
    if (!PRODUCTS.has(productId) || !token) return fail(res, 6778001, 'Geçersiz ürün');

    const auth = new google.auth.GoogleAuth({scopes: ['https://www.googleapis.com/auth/androidpublisher']});
    const play = google.androidpublisher({version: 'v3', auth});
    const {data} = await play.purchases.products.get({packageName: PACKAGE, productId, token});
    // purchaseState: 0 = satın alındı, 1 = iptal, 2 = beklemede
    if (data.purchaseState !== 0) return fail(res, 6778003, 'Satın alma tamamlanmamış');

    const ref = db.collection('purchases').doc(token.slice(0, 400).replace(/\//g, '_'));
    const ok = await db.runTransaction(async t => {
      const cur = await t.get(ref);
      if (cur.exists && cur.data().player && player && cur.data().player !== player) return false;
      if (!cur.exists) t.set(ref, {player, productId, orderId: data.orderId || null, at: FieldValue.serverTimestamp(), test: data.purchaseType === 0});
      return true;
    });
    if (!ok) return fail(res, 6778003, 'Bu satın alma başka bir hesapta kullanılmış');
    return res.json({ok: true, data: {id: productId, latest_receipt: true, transaction: tx}});
  } catch (e) {
    console.error(e);
    // Geçici hata: istemci daha sonra yeniden dener
    return res.status(200).json({ok: false, code: 6778006, message: 'Doğrulama şu an yapılamadı'});
  }
});
