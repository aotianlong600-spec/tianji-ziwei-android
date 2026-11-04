const fs = require('node:fs');
const path = require('node:path');
const { ASSETS } = require('./policy.cjs');

const target = path.join(__dirname, 'build/web');
fs.mkdirSync(target, { recursive: true });
for (const name of Object.keys(ASSETS)) {
  fs.copyFileSync(path.join(__dirname, '../ziwei-android/build/assets', name), path.join(target, name));
}
fs.copyFileSync(path.join(__dirname, '../LICENSE'), path.join(__dirname, 'LICENSE'));
const notice = path.join(target, 'THIRD_PARTY_NOTICES.txt');
for (const [name, license] of [
  ['Electron', 'node_modules/electron/dist/LICENSE'],
  ['Electron bundled components', 'node_modules/electron/dist/LICENSES.chromium.html'],
  ['electron-builder (build tool)', 'node_modules/electron-builder/LICENSE'],
]) fs.appendFileSync(notice, `\n\n--- ${name} ---\n${fs.readFileSync(path.join(__dirname, license), 'utf8')}`);
console.log('Desktop assets and license notices prepared (explicit file allowlist)');
