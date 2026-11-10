package com.ceomai.ciftlik;

import android.os.Bundle;
import android.view.View;
import android.webkit.WebView;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import com.getcapacitor.Bridge;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.WebViewListener;
import java.util.Locale;

/**
 * Güvenli alan: Android 15 kenardan kenara çizimde ve StatusBar.overlaysWebView=true iken oyun
 * sistem çubuklarının altına uzanır. Eski WebView'lar env(safe-area-inset-*) için 0 döndürebildiğinden
 * çubukların web görünümüyle gerçekten örtüşen ölçüsü CSS değişkeni olarak (--sat/--sab/--sal/--sar, CSS px)
 * sayfanın köküne yazılır; CSS bu değerle env() değerinin büyüğünü kullanır.
 */
public class MainActivity extends BridgeActivity {

    private Insets bars = Insets.NONE;
    private String lastJs = null;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        final Bridge b = getBridge();
        if (b == null || b.getWebView() == null) return;
        final WebView webView = b.getWebView();
        View content = findViewById(android.R.id.content);
        if (content == null) content = webView;
        ViewCompat.setOnApplyWindowInsetsListener(content, (v, insets) -> {
            bars = insets.getInsets(WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout());
            webView.post(() -> pushInsets(webView, false));
            return ViewCompat.onApplyWindowInsets(v, insets);
        });
        webView.addOnLayoutChangeListener((v, l, t, r, bt, ol, ot, or, ob) -> pushInsets(webView, false));
        b.addWebViewListener(new WebViewListener() {
            @Override
            public void onPageLoaded(WebView view) {
                pushInsets(webView, true);
            }
        });
        ViewCompat.requestApplyInsets(content);
    }

    /** Çubukların web görünümüyle örtüşen kısmını hesaplar ve değiştiyse (ya da sayfa yeniden yüklendiyse) sayfaya yazar. */
    private void pushInsets(WebView webView, boolean force) {
        View root = getWindow().getDecorView();
        if (webView.getWidth() == 0 || webView.getHeight() == 0 || root.getWidth() == 0 || root.getHeight() == 0) return;
        int[] loc = new int[2];
        webView.getLocationInWindow(loc);
        int top = Math.max(0, bars.top - loc[1]);
        int left = Math.max(0, bars.left - loc[0]);
        int right = Math.max(0, bars.right - (root.getWidth() - (loc[0] + webView.getWidth())));
        int bottom = Math.max(0, bars.bottom - (root.getHeight() - (loc[1] + webView.getHeight())));
        float d = getResources().getDisplayMetrics().density;
        if (d <= 0) d = 1;
        String js = String.format(
            Locale.US,
            "(function(s){s.setProperty('--sat','%.1fpx');s.setProperty('--sab','%.1fpx');s.setProperty('--sal','%.1fpx');s.setProperty('--sar','%.1fpx')})(document.documentElement.style)",
            top / d,
            bottom / d,
            left / d,
            right / d
        );
        if (!force && js.equals(lastJs)) return;
        lastJs = js;
        webView.evaluateJavascript(js, null);
    }
}
