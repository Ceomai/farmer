// ================= YAPILANDIRMA =================
// Yayından önce doldurulacak değerler. Boş bırakılan özellikler sessizce kapalı kalır.
const CONFIG={
  // Firebase (bulut kaydı, sunucu saati, analitik, hata raporu). Kurallar: firebase/firestore.rules
  // Firebase konsolu → Proje ayarları → Genel → "Web API Key" ve "Project ID". Bu değerler herkese açıktır, güvenliği kurallar sağlar.
  firebaseApiKey:'AIzaSyBOb93Y51J5R_8MMQH-lblgghYtMkQCouI',
  firebaseProjectId:'ciftlik-empire',
  // AdMob ödüllü reklam birimleri. Şu anki değerler Google'ın TEST kimlikleri.
  admobRewardedAndroid:'ca-app-pub-3940256099942544/5224354917',
  admobRewardedIos:'ca-app-pub-3940256099942544/1712485313',
  admobTesting:true,
  // Uygulama içi satın alma ürünleri (Play Console / App Store Connect'te aynı kimliklerle oluşturulmalı)
  // Satın alma doğrulama servisi (firebase/functions). Boşsa doğrulama telefonda yapılır: YAYINDA BOŞ BIRAKMA.
  iapValidatorUrl:'',     // örn. https://europe-west3-ciftlik-empire.cloudfunctions.net/validatePurchase
  iapProducts:[{id:'yonca_30',gems:30},{id:'yonca_90',gems:90},{id:'yonca_250',gems:250}],
  // Yasal metinler
  privacyUrl:'https://github.com/Ceomai/farmer/blob/main/docs/gizlilik-politikasi.md',
  termsUrl:'https://github.com/Ceomai/farmer/blob/main/docs/kullanim-kosullari.md',
  supportEmail:'destek@ornek.com',
  version:'1.0.0'
};
