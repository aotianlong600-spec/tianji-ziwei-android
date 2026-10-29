package com.tianji.ziwei;

import android.app.Activity;
import android.os.Bundle;
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
        web.setBackgroundColor(0xfff6f2eb);
        web.getSettings().setJavaScriptEnabled(true);
        web.getSettings().setDomStorageEnabled(true);
        web.getSettings().setCacheMode(android.webkit.WebSettings.LOAD_NO_CACHE);
        web.getSettings().setAllowFileAccess(false);
        web.getSettings().setAllowContentAccess(false);
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
    @Override public void onBackPressed() {
        if (web.canGoBack()) { web.goBack(); return; }
        web.evaluateJavascript("window.appBack ? window.appBack() : false", result -> { if (!"true".equals(result)) finish(); });
    }
    @Override protected void onDestroy() { web.destroy(); super.onDestroy(); }
}
