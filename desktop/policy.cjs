const ASSETS = Object.freeze({
  'index.html': 'text/html; charset=utf-8',
  'app.js': 'text/javascript; charset=utf-8',
  'style.css': 'text/css; charset=utf-8',
  'THIRD_PARTY_NOTICES.txt': 'text/plain; charset=utf-8',
});

function assetForRequest(value, method) {
  try {
    const url = new URL(value);
    const name = url.pathname.slice(1);
    return method === 'GET' && url.protocol === 'app:' && url.host === 'tianji'
      && !url.username && !url.password && Object.hasOwn(ASSETS, name) ? name : null;
  } catch { return null; }
}

module.exports = { ASSETS, assetForRequest };
