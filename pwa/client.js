(() => {
  const status = (state, message) => window.dispatchEvent(new CustomEvent('pwa-status', { detail: { state, message } }));
  const secure = location.protocol === 'https:' || (location.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname));
  if (!secure || !('serviceWorker' in navigator)) {
    status('unavailable', '当前环境无法准备离线资源，请在 Safari 中通过 HTTPS 打开。');
    return;
  }
  status('preparing', '正在准备离线资源，首次打开请保持联网。');
  navigator.serviceWorker.register('./sw.js', { scope: './', updateViaCache: 'none' }).then(registration => {
    let persistenceRequested = false;
    const ready = () => {
      if (!registration.active) return;
      if (registration.waiting) status('update-ready', '新版本已下载；保存资料后，关闭此站点的所有窗口并重新打开即可更新。');
      else status('ready', '离线已就绪，可断网使用；系统清理网站数据后需联网重新准备。');
      const installed = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || navigator.standalone;
      if (!persistenceRequested && installed && navigator.storage && navigator.storage.persisted && navigator.storage.persist) {
        persistenceRequested = true;
        Promise.resolve().then(() => navigator.storage.persisted()).then(saved => saved || navigator.storage.persist()).catch(() => {});
      }
    };
    const observe = worker => {
      if (!worker) return;
      worker.addEventListener('statechange', () => {
        if (worker.state === 'installed' && registration.active) status('update-ready', '新版本已下载；保存资料后，关闭此站点的所有窗口并重新打开即可更新。');
        if (worker.state === 'redundant' && !registration.active) status('error', '离线资源准备失败，请保持联网并稍后重新打开。');
      });
    };
    observe(registration.installing);
    registration.addEventListener('updatefound', () => observe(registration.installing));
    navigator.serviceWorker.ready.then(ready);
    navigator.serviceWorker.addEventListener('controllerchange', ready);
  }).catch(() => status('error', '离线资源准备失败，请保持联网并稍后重新打开。'));
})();
