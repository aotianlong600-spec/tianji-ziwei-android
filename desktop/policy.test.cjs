const assert = require('node:assert/strict');
const { assetForRequest } = require('./policy.cjs');

assert.equal(assetForRequest('app://tianji/index.html', 'GET'), 'index.html');
assert.equal(assetForRequest('app://tianji/style.css?v=1.8.0', 'GET'), 'style.css');
for (const url of [
  'https://tianji/index.html', 'app://evil/index.html',
  'app://tianji:3000/index.html', 'app://user@tianji/index.html',
  'app://tianji/%2e%2e/private.txt', 'app://tianji/%2findex.html',
  'app://tianji/package.json', 'file:///etc/passwd', 'invalid',
]) assert.equal(assetForRequest(url, 'GET'), null, url);
assert.equal(assetForRequest('app://tianji/index.html', 'POST'), null);
console.log('Desktop local-origin boundary checks passed');
