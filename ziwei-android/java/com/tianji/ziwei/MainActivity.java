package com.tianji.ziwei;

import android.app.Activity;
import android.content.res.Configuration;
import android.os.Bundle;
import android.view.View;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import java.io.ByteArrayInputStream;
import java.io.IOException;

public class MainActivity extends Activity {
    private WebView web;
    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        web = new WebView(this);
        applyThemeColors(isSystemDark());
        web.getSettings().setJavaScriptEnabled(true);
        web.getSettings().setDomStorageEnabled(true);
        web.getSettings().setCacheMode(android.webkit.WebSettings.LOAD_NO_CACHE);
        web.getSettings().setAllowFileAccess(false);
        web.getSettings().setAllowContentAccess(false);
        web.addJavascriptInterface(new ThemeBridge(), "AndroidTheme");
        web.setWebChromeClient(new WebChromeClient());
        web.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return !"appassets.androidplatform.net".equals(request.getUrl().getHost());
            }
            @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                String path = request.getUrl().getPath();
                if ("appassets.androidplatform.net".equals(request.getUrl().getHost()) && path != null) {
                    String asset = path.replaceFirst("^/", "");
                    if (asset.equals("index.html") || asset.equals("app.js") || asset.equals("style.css") || asset.equals("THIRD_PARTY_NOTICES.txt")) {
                        String mime = asset.endsWith(".js") ? "application/javascript" : asset.endsWith(".css") ? "text/css" : asset.endsWith(".txt") ? "text/plain" : "text/html";
                        try { return new WebResourceResponse(mime, "UTF-8", getAssets().open(asset)); }
                        catch (IOException ignored) { }
                    }
                }
                return new WebResourceResponse("text/plain", "UTF-8", new ByteArrayInputStream(new byte[0]));
            }
        });
        setContentView(web);
        web.loadUrl("https://appassets.androidplatform.net/index.html");
    }
    private boolean isSystemDark() {
        return (getResources().getConfiguration().uiMode & Configuration.UI_MODE_NIGHT_MASK) == Configuration.UI_MODE_NIGHT_YES;
    }
    private void applyThemeColors(boolean dark) {
        int color = dark ? 0xff18161b : 0xfff6f2eb;
        web.setBackgroundColor(color);
        getWindow().setStatusBarColor(color);
        getWindow().setNavigationBarColor(color);
        View decor = getWindow().getDecorView();
        int lightIcons = View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR | View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
        int flags = decor.getSystemUiVisibility();
        decor.setSystemUiVisibility(dark ? flags & ~lightIcons : flags | lightIcons);
    }
    public final class ThemeBridge {
        @JavascriptInterface public boolean isDark() { return isSystemDark(); }
        @JavascriptInterface public void setDark(final boolean dark) {
            runOnUiThread(() -> { if (web != null && !isFinishing() && !isDestroyed()) applyThemeColors(dark); });
        }
    }
    @Override public void onConfigurationChanged(Configuration config) {
        super.onConfigurationChanged(config);
        if (web == null) return;
        boolean dark = (config.uiMode & Configuration.UI_MODE_NIGHT_MASK) == Configuration.UI_MODE_NIGHT_YES;
        web.evaluateJavascript("window.dispatchEvent(new CustomEvent('systemthemechange',{detail:" + dark + "}));", null);
    }
    @Override public void onBackPressed() {
        if (web == null) { super.onBackPressed(); return; }
        if (web.canGoBack()) { web.goBack(); return; }
        web.evaluateJavascript("window.appBack ? window.appBack() : false", result -> { if (!"true".equals(result)) finish(); });
    }
    @Override protected void onDestroy() {
        if (web != null) { web.removeJavascriptInterface("AndroidTheme"); web.destroy(); web = null; }
        super.onDestroy();
    }
}
