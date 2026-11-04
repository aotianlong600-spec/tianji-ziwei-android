const { app, BrowserWindow, dialog } = require('electron');
const path = require('node:path');
const { configure, createWindow } = require('./runtime.cjs');

// Keep both the data directory and app:// origin stable across application upgrades.
app.setPath('userData', path.join(app.getPath('appData'), 'tianji-ziwei'));
app.whenReady().then(async () => {
  await configure();
  await createWindow();
  app.on('activate', () => {
    if (!BrowserWindow.getAllWindows().length) createWindow().catch(fail);
  });
}).catch(fail);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });

function fail(error) {
  dialog.showErrorBox('天纪紫微启动失败', String(error));
  app.exit(1);
}
