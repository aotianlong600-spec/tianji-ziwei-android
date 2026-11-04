'use strict';
const { version, files } = __PWA_CONFIG__;
const scope = new URL(self.registration.scope);
const prefix = `tianji-ziwei-pwa:${encodeURIComponent(scope.href)}:`;
const cacheName = prefix + version;
const urls = files.map(file => new URL(file, scope).href);
const assets = new Set(urls);
const index = new URL('index.html', scope).href;

self.addEventListener('install', event => {
  // A new version waits for existing windows to close, preserving unsaved inputs.
  event.waitUntil((async () => {
    try {
      const cache = await caches.open(cacheName);
      await cache.addAll(urls.map(url => new Request(url, { cache: 'reload' })));
    } catch (error) {
      await caches.delete(cacheName);
      throw error;
    }
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) {
      if (key.startsWith(prefix) && key !== cacheName) await caches.delete(key);
    }
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== scope.origin || !url.pathname.startsWith(scope.pathname)) return;
  url.search = '';
  url.hash = '';
  if (request.mode === 'navigate' && !assets.has(url.href) && url.pathname !== scope.pathname) {
    // Canonicalize unknown routes so the shell's relative URLs stay inside scope.
    event.respondWith(Response.redirect(scope.href));
    return;
  }
  // Fingerprinted paths identify this exact version even with a query string.
  const key = assets.has(url.href) ? url.href : request.mode === 'navigate' ? index : url.href;
  if (!assets.has(key)) return;
  event.respondWith((async () => {
    const cache = await caches.open(cacheName);
    return (await cache.match(key)) || fetch(request);
  })());
});
