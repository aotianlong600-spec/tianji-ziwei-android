const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { test } = require('node:test');

function fixture(t) {
  const temporaryRoot = fs.realpathSync(os.tmpdir());
  const root = fs.mkdtempSync(path.join(temporaryRoot, 'tianji-pwa-'));
  t.after(() => {
    const target = path.resolve(root);
    assert.equal(path.dirname(target), temporaryRoot);
    assert.ok(path.basename(target).startsWith('tianji-pwa-'));
    assert.equal(fs.lstatSync(target).isSymbolicLink(), false);
    fs.rmSync(target, { recursive: true, force: true });
  });
  const pwa = path.join(root, 'pwa');
  const assets = path.join(root, 'ziwei-android/build/assets');
  fs.mkdirSync(path.join(pwa, 'icons'), { recursive: true });
  fs.mkdirSync(assets, { recursive: true });
  for (const name of ['build.cjs', 'sw-template.js', 'client.js']) {
    assert.ok(fs.existsSync(path.join(__dirname, name)), `${name} implementation is required`);
    fs.copyFileSync(path.join(__dirname, name), path.join(pwa, name));
  }
  fs.writeFileSync(path.join(assets, 'index.html'), '<!doctype html><html><head><title>天纪紫微</title><link rel="stylesheet" href="style.css?v=1.8.0"></head><body><div id="app"></div><script src="app.js?v=1.8.0"></script></body></html>');
  fs.writeFileSync(path.join(assets, 'app.js'), 'globalThis.chartEngine = "same renderer";');
  fs.writeFileSync(path.join(assets, 'style.css'), 'body{margin:0}');
  fs.writeFileSync(path.join(assets, 'THIRD_PARTY_NOTICES.txt'), 'upstream licenses');
  fs.writeFileSync(path.join(assets, 'private-records.json'), '{"birth":"private"}');
  fs.writeFileSync(path.join(assets, 'app.js.map'), 'private source map');
  for (const [name, size] of [['icon-192.png', 192], ['icon-512.png', 512], ['apple-touch-icon.png', 180]]) {
    const header = Buffer.alloc(24);
    Buffer.from('89504e470d0a1a0a0000000d49484452', 'hex').copy(header);
    header.writeUInt32BE(size, 16);
    header.writeUInt32BE(size, 20);
    fs.writeFileSync(path.join(pwa, 'icons', name), header);
  }
  return { root, pwa, assets, out: path.join(pwa, 'build'), run: () => spawnSync(process.execPath, [path.join(pwa, 'build.cjs')], { encoding: 'utf8' }) };
}

test('build publishes only public shell files, with relative URLs and identical renderer bytes', t => {
  const f = fixture(t);
  fs.mkdirSync(f.out);
  fs.writeFileSync(path.join(f.out, 'old-private.json'), 'do not publish');
  const run = f.run();
  assert.equal(run.status, 0, run.stderr);
  const names = fs.readdirSync(f.out).sort();
  const app = names.find(name => /^app\.[a-f0-9]+\.js$/.test(name));
  const style = names.find(name => /^style\.[a-f0-9]+\.css$/.test(name));
  const client = names.find(name => /^pwa-client\.[a-f0-9]+\.js$/.test(name));
  assert.ok(app && style && client, names.join(', '));
  assert.deepEqual(names, [app, style, client, 'index.html', 'manifest.webmanifest', 'sw.js', 'THIRD_PARTY_NOTICES.txt', 'icons', '.nojekyll'].sort());
  assert.deepEqual(fs.readFileSync(path.join(f.out, app)), fs.readFileSync(path.join(f.assets, 'app.js')));
  const html = fs.readFileSync(path.join(f.out, 'index.html'), 'utf8');
  assert.ok(html.includes(`src="${app}"`) && html.includes(`href="${style}"`));
  assert.ok(html.includes('<html data-pwa="true"'));
  assert.ok(html.indexOf(`src="${client}"`) > html.indexOf(`src="${app}"`), 'status client runs after shared renderer');
  assert.ok(html.includes('rel="apple-touch-icon"') && html.includes('name="apple-mobile-web-app-capable"'));
  const manifest = JSON.parse(fs.readFileSync(path.join(f.out, 'manifest.webmanifest'), 'utf8'));
  assert.equal(manifest.id, './');
  assert.equal(manifest.start_url, './');
  assert.equal(manifest.scope, './');
  assert.equal(manifest.display, 'standalone');
  assert.deepEqual(manifest.icons.map(icon => icon.sizes), ['192x192', '512x512']);
  assert.equal(fs.readFileSync(path.join(f.assets, 'index.html'), 'utf8').includes('pwa-status'), false);
});

test('identical input is deterministic and renderer changes create new asset and worker versions', t => {
  const f = fixture(t);
  assert.equal(f.run().status, 0);
  const firstWorker = fs.readFileSync(path.join(f.out, 'sw.js'), 'utf8');
  const firstApp = fs.readdirSync(f.out).find(name => /^app\./.test(name));
  assert.equal(f.run().status, 0);
  assert.equal(fs.readFileSync(path.join(f.out, 'sw.js'), 'utf8'), firstWorker);
  fs.appendFileSync(path.join(f.assets, 'app.js'), '\n// new renderer');
  assert.equal(f.run().status, 0);
  assert.notEqual(fs.readFileSync(path.join(f.out, 'sw.js'), 'utf8'), firstWorker);
  assert.equal(fs.existsSync(path.join(f.out, firstApp)), false);
});

test('missing input or wrong icon dimensions fails before removing the previous build', t => {
  const f = fixture(t);
  fs.mkdirSync(f.out);
  fs.writeFileSync(path.join(f.out, 'previous.txt'), 'previous good build');
  fs.unlinkSync(path.join(f.assets, 'app.js'));
  assert.notEqual(f.run().status, 0);
  assert.equal(fs.readFileSync(path.join(f.out, 'previous.txt'), 'utf8'), 'previous good build');
  fs.writeFileSync(path.join(f.assets, 'app.js'), 'engine');
  fs.writeFileSync(path.join(f.pwa, 'icons/icon-192.png'), 'not PNG');
  assert.notEqual(f.run().status, 0);
  assert.equal(fs.readFileSync(path.join(f.out, 'previous.txt'), 'utf8'), 'previous good build');
  fs.copyFileSync(path.join(f.pwa, 'icons/icon-512.png'), path.join(f.pwa, 'icons/icon-192.png'));
  assert.notEqual(f.run().status, 0, 'a valid PNG header with wrong dimensions must fail');
  assert.equal(fs.readFileSync(path.join(f.out, 'previous.txt'), 'utf8'), 'previous good build');
});

test('an output directory junction is rejected without changing its target', t => {
  const f = fixture(t);
  const outside = path.join(f.root, 'outside');
  fs.mkdirSync(outside);
  fs.writeFileSync(path.join(outside, 'keep.txt'), 'preserve this directory');
  fs.symlinkSync(outside, f.out, 'junction');
  const run = f.run();
  assert.notEqual(run.status, 0, 'a junction must never be used as the public output');
  assert.equal(fs.readFileSync(path.join(outside, 'keep.txt'), 'utf8'), 'preserve this directory');
  assert.equal(fs.lstatSync(f.out).isSymbolicLink(), true);
});
