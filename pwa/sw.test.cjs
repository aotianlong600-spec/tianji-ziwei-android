const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');

function worker({ scope = 'https://example.test/tianji-ziwei-android/', version = 'one', fail = false, stores = new Map() } = {}) {
  assert.ok(fs.existsSync(path.join(__dirname, 'sw-template.js')), 'service worker implementation is required');
  const handlers = new Map();
  let online = true;
  let claims = 0;
  const network = [];
  const cacheStorage = {
    keys: async () => [...stores.keys()],
    delete: async key => stores.delete(key),
    open: async key => {
      if (!stores.has(key)) stores.set(key, new Map());
      const items = stores.get(key);
      return {
        addAll: async requests => {
          if (fail) throw new Error('precache failed');
          for (const request of requests) {
            const url = typeof request === 'string' ? request : request.url;
            items.set(url, new Response(`cached:${url}`));
          }
        },
        match: async request => items.get(typeof request === 'string' ? request : request.url)?.clone(),
      };
    },
  };
  const self = {
    registration: { scope }, location: new URL('sw.js', scope),
    clients: { claim: async () => { claims++; } },
    skipWaiting: () => assert.fail('updates must wait until old windows close'),
    addEventListener: (name, fn) => handlers.set(name, fn),
  };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, 'sw-template.js'), 'utf8').replace('__PWA_CONFIG__', JSON.stringify({ version, files: ['index.html', 'app.abc123.js', 'style.abc123.css', 'manifest.webmanifest', 'THIRD_PARTY_NOTICES.txt'] })), {
    self, caches: cacheStorage, URL, Request, Response,
    fetch: async request => {
      const url = typeof request === 'string' ? request : request.url;
      network.push(url);
      if (!online) throw new Error('offline');
      return new Response(`network:${url}`);
    },
  });
  return {
    stores, network, setOffline: () => { online = false; }, claims: () => claims,
    lifecycle: name => {
      let pending;
      handlers.get(name)({ waitUntil: promise => { pending = promise; } });
      return pending;
    },
    request: async (url, mode = 'cors', method = 'GET', raw = false) => {
      let response;
      handlers.get('fetch')({ request: { url, mode, method }, respondWith: promise => { response = promise; } });
      return response ? raw ? await response : (await response).text() : undefined;
    },
  };
}

test('first successful install makes root, index, query assets and in-scope navigation work offline', async () => {
  const w = worker();
  await w.lifecycle('install');
  await w.lifecycle('activate');
  assert.equal(w.claims(), 1);
  w.setOffline();
  for (const route of ['', 'index.html', '?source=homescreen']) {
    assert.equal(await w.request(`https://example.test/tianji-ziwei-android/${route}`, 'navigate'), 'cached:https://example.test/tianji-ziwei-android/index.html');
  }
  assert.equal(await w.request('https://example.test/tianji-ziwei-android/app.abc123.js?v=1.8.0'), 'cached:https://example.test/tianji-ziwei-android/app.abc123.js');
  assert.equal(w.network.length, 0);
});

test('unknown in-scope navigation redirects to the canonical root so relative assets still resolve offline', async () => {
  const w = worker();
  await w.lifecycle('install');
  w.setOffline();
  const response = await w.request('https://example.test/tianji-ziwei-android/chart/123', 'navigate', 'GET', true);
  assert.equal(response.status, 302);
  assert.equal(response.headers.get('Location'), 'https://example.test/tianji-ziwei-android/');
  assert.equal(await w.request(response.headers.get('Location'), 'navigate'), 'cached:https://example.test/tianji-ziwei-android/index.html');
});

test('an evicted asset falls back to its original network request without substituting HTML', async () => {
  const w = worker();
  await w.lifecycle('install');
  for (const cache of w.stores.values()) cache.delete('https://example.test/tianji-ziwei-android/app.abc123.js');
  const url = 'https://example.test/tianji-ziwei-android/app.abc123.js?v=1.8.0';
  assert.equal(await w.request(url), `network:${url}`);
  assert.deepEqual(w.network, [url]);
});

test('unlisted assets, POST, other projects and external URLs are never intercepted or cached', async () => {
  const w = worker();
  await w.lifecycle('install');
  for (const [url, mode, method] of [
    ['https://example.test/other-project/', 'navigate', 'GET'],
    ['https://example.test/tianji-ziwei-android-sibling/', 'navigate', 'GET'],
    ['https://external.test/tianji-ziwei-android/', 'navigate', 'GET'],
    ['https://example.test/tianji-ziwei-android/app.old123.js', 'cors', 'GET'],
    ['https://example.test/tianji-ziwei-android/private.json', 'cors', 'GET'],
    ['https://example.test/tianji-ziwei-android/', 'navigate', 'POST'],
  ]) assert.equal(await w.request(url, mode, method), undefined, url);
  assert.equal(w.network.length, 0);
});

test('navigating to license notices serves the cached text rather than the app shell', async () => {
  const w = worker();
  await w.lifecycle('install');
  w.setOffline();
  assert.equal(await w.request('https://example.test/tianji-ziwei-android/THIRD_PARTY_NOTICES.txt', 'navigate'), 'cached:https://example.test/tianji-ziwei-android/THIRD_PARTY_NOTICES.txt');
});

test('a failed precache rejects installation without disturbing an active version', async () => {
  const old = worker();
  await old.lifecycle('install');
  const previous = [...old.stores.keys()];
  const next = worker({ version: 'two', fail: true, stores: old.stores });
  await assert.rejects(next.lifecycle('install'), /precache failed/);
  assert.deepEqual([...old.stores.keys()], previous);
  old.setOffline();
  assert.equal(await old.request('https://example.test/tianji-ziwei-android/', 'navigate'), 'cached:https://example.test/tianji-ziwei-android/index.html');
});

test('updates wait, then activation deletes only obsolete caches of the exact current scope', async () => {
  const old = worker();
  await old.lifecycle('install');
  const other = worker({ scope: 'https://example.test/other-project/', stores: old.stores });
  await other.lifecycle('install');
  const otherKey = [...old.stores.keys()].find(key => !key.includes(encodeURIComponent('https://example.test/tianji-ziwei-android/')));
  old.stores.set('unrelated-cache', new Map());
  const next = worker({ version: 'two', stores: old.stores });
  await next.lifecycle('install');
  assert.equal(old.stores.size, 4, 'install must retain the active cache');
  await next.lifecycle('activate');
  assert.equal(old.stores.size, 3);
  assert.ok(old.stores.has('unrelated-cache') && old.stores.has(otherKey));
});

test('same worker supports origin-root hosting and does not substitute HTML for a missing script', async () => {
  const w = worker({ scope: 'https://example.test/' });
  await w.lifecycle('install');
  w.setOffline();
  assert.equal(await w.request('https://example.test/', 'navigate'), 'cached:https://example.test/index.html');
  assert.equal(await w.request('https://example.test/missing.js'), undefined);
});
