const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');

const source = path.join(__dirname, '../ziwei-android/build/assets');
const pwaRoot = fs.realpathSync(__dirname);
const output = path.resolve(pwaRoot, 'build');
const files = new Map();
const fingerprint = bytes => createHash('sha256').update(bytes).digest('hex').slice(0, 16);

function addAsset(name, bytes) {
  const ext = path.extname(name);
  const target = `${path.basename(name, ext)}.${fingerprint(bytes)}${ext}`;
  files.set(target, bytes);
  return target;
}

const app = addAsset('app.js', fs.readFileSync(path.join(source, 'app.js')));
const style = addAsset('style.css', fs.readFileSync(path.join(source, 'style.css')));
const client = addAsset('pwa-client.js', fs.readFileSync(path.join(__dirname, 'client.js')));
files.set('THIRD_PARTY_NOTICES.txt', fs.readFileSync(path.join(source, 'THIRD_PARTY_NOTICES.txt')));

for (const [name, size] of [['icon-192.png', 192], ['icon-512.png', 512], ['apple-touch-icon.png', 180]]) {
  const bytes = fs.readFileSync(path.join(__dirname, 'icons', name));
  if (bytes.length < 24 || !bytes.subarray(0, 16).equals(Buffer.from('89504e470d0a1a0a0000000d49484452', 'hex')) || bytes.readUInt32BE(16) !== size || bytes.readUInt32BE(20) !== size) {
    throw new Error(`${name} must be a ${size}×${size} PNG`);
  }
  files.set(`icons/${name}`, bytes);
}

files.set('manifest.webmanifest', JSON.stringify({
  id: './', name: '天纪紫微', short_name: '天纪紫微', lang: 'zh-CN',
  start_url: './', scope: './', display: 'standalone',
  background_color: '#fcfaf7', theme_color: '#382b3c',
  icons: [192, 512].map(size => ({ src: `icons/icon-${size}.png`, sizes: `${size}x${size}`, type: 'image/png' })),
}, null, 2) + '\n');

let html = fs.readFileSync(path.join(source, 'index.html'), 'utf8');
for (const [pattern, replacement] of [
  [/<html\b/, '<html data-pwa="true"'],
  [/href="style\.css(?:\?[^\"]*)?"/, `href="${style}"`],
  [/src="app\.js(?:\?[^\"]*)?"/, `src="${app}"`],
  [/<\/head>/, '<link rel="manifest" href="manifest.webmanifest"><link rel="apple-touch-icon" sizes="180x180" href="icons/apple-touch-icon.png"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-title" content="天纪紫微"><meta name="apple-mobile-web-app-status-bar-style" content="default"></head>'],
  [/<\/body>/, `<script src="${client}"></script></body>`],
]) {
  if (!pattern.test(html)) throw new Error(`Shared renderer HTML is missing ${pattern}`);
  html = html.replace(pattern, replacement);
}
files.set('index.html', html);

const template = fs.readFileSync(path.join(__dirname, 'sw-template.js'), 'utf8');
const hash = createHash('sha256').update(template);
for (const [name, bytes] of [...files].sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0)) hash.update(name).update('\0').update(bytes).update('\0');
const version = hash.digest('hex').slice(0, 20);
files.set('sw.js', template.replace('__PWA_CONFIG__', JSON.stringify({ version, files: [...files.keys()] })));
files.set('.nojekyll', '');

// Validate every input before replacing the previous public build.
if (path.dirname(output) !== pwaRoot || path.basename(output) !== 'build') throw new Error('PWA output must be the project pwa/build directory');
if (fs.lstatSync(output, { throwIfNoEntry: false })?.isSymbolicLink()) throw new Error('PWA output must not be a symbolic link or junction');
fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(path.join(output, 'icons'), { recursive: true });
for (const [name, bytes] of files) fs.writeFileSync(path.join(output, name), bytes);
console.log(`PWA built: ${output} (content version ${version}; public file allowlist)`);
