const { BrowserWindow, protocol, session, screen } = require('electron');
const fs = require('node:fs/promises');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { ASSETS, assetForRequest } = require('./policy.cjs');

const HOME = 'app://tianji/index.html';
protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: {
  standard: true, secure: true, supportFetchAPI: true,
} }]);

async function configure() {
  const assets = path.join(__dirname, 'build/web');
  const html = await fs.readFile(path.join(assets, 'index.html'), 'utf8');
  const hashes = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)]
    .map(match => `'sha256-${createHash('sha256').update(match[1]).digest('base64')}'`).join(' ');
  const csp = `default-src 'self'; script-src 'self' ${hashes}; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; object-src 'none'; frame-src 'none'; base-uri 'none'; form-action 'none'`;
  protocol.handle('app', async request => {
    const name = assetForRequest(request.url, request.method);
    if (!name) return new Response('Not found', { status: 404 });
    try {
      return new Response(await fs.readFile(path.join(assets, name)), { headers: {
        'Content-Type': ASSETS[name], 'Content-Security-Policy': csp,
        'X-Content-Type-Options': 'nosniff',
      } });
    } catch { return new Response('Asset unavailable', { status: 500 }); }
  });
  session.defaultSession.setPermissionRequestHandler((_contents, _permission, callback) => callback(false));
  session.defaultSession.setPermissionCheckHandler(() => false);
  session.defaultSession.setDevicePermissionHandler(() => false);
}

async function createWindow(show = true, page = HOME) {
  const win = new BrowserWindow({
    width: 1440, height: 900, minWidth: 960, minHeight: 600,
    useContentSize: true, show: false, autoHideMenuBar: true,
    title: '天纪紫微', backgroundColor: '#f8f6f1',
    webPreferences: {
      nodeIntegration: false, contextIsolation: true, sandbox: true,
      webSecurity: true, webviewTag: false, spellcheck: false,
    },
  });
  const bounds = win.getBounds(), area = screen.getDisplayMatching(win.getBounds()).workArea;
  const width = Math.min(bounds.width, area.width), height = Math.min(bounds.height, area.height);
  if (area.width < 960 || area.height < 600) {
    win.setMinimumSize(Math.min(960, area.width), Math.min(600, area.height));
  }
  win.setBounds({
    x: area.x + Math.floor((area.width - width) / 2),
    y: area.y + Math.floor((area.height - height) / 2), width, height,
  });
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  win.webContents.on('will-navigate', (event, url) => {
    event.preventDefault();
    if (assetForRequest(url, 'GET') === 'THIRD_PARTY_NOTICES.txt') {
      createWindow(show, 'app://tianji/THIRD_PARTY_NOTICES.txt').catch(console.error);
    }
  });
  win.webContents.on('will-redirect', event => event.preventDefault());
  await win.loadURL(page);
  if (show) win.show();
  return win;
}

module.exports = { configure, createWindow };
