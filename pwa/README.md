# iPhone 和 iPad 网页 App

网址：https://aotianlong600-spec.github.io/tianji-ziwei-android/

用 Safari 打开，点“分享”→“添加到主屏幕”；若有“作为网页 App 打开”，请开启。添加后从主屏幕图标联网打开一次，看到“离线已就绪”后即可断网使用。iPhone 使用单栏，符合横屏尺寸的 iPad 使用左命盘、右命卦。

Safari 和主屏幕网页 App 的本地存储分别保存，建议先添加到主屏幕再保存命盘；不同设备、浏览器及原生版不会自动同步。档案和计算均留在本机，没有生辰上传接口。删除网站资料、清理浏览器或系统回收存储可能丢失档案；安装模式中会在平台支持时尝试申请持久存储，但不能保证获批。

新版本先下载完整离线资源，再等待此站点旧窗口全部关闭后启用，不自动刷新正在填写的表单。更新只清理本应用、同一作用域的旧资源缓存，不清除命盘和偏好。

## 构建和验证

```sh
npm ci --prefix ziwei-doushu
npm test --prefix ziwei-doushu
npm run typecheck --prefix ziwei-doushu
node ziwei-android/build-web.cjs
node pwa/build.cjs
node --test pwa/build.test.cjs pwa/client.test.cjs pwa/sw.test.cjs
```

仅 `pwa/build` 可作为静态站点发布；不要将整个仓库或上层工作目录作为网站根目录。构建只发布编译后的页面、脚本、样式、应用图标、manifest、离线 worker 和许可文件。图标复用 Android 版本的罗盘星形图案；SVG 为可编辑来源，PNG 已随源码提供，构建不依赖图形工具。

`.github/workflows/web-app.yml` 在相关源码变动后测试并发布到本仓库 GitHub Pages，全部资源地址、manifest 及 worker 作用域均兼容仓库子路径。网页按内容指纹更新，不要求重新构建 Android 或桌面包。

验证以单元测试和浏览器模拟为主，尚未完成 iPhone/iPad 真机 Safari 的主屏幕安装测试。

参考：[Apple 主屏幕安装说明](https://support.apple.com/guide/iphone/iphea86e5236/ios)、[WebKit 主屏幕存储隔离](https://webkit.org/blog/14787/webkit-features-in-safari-17-2/)、[WebKit 存储策略](https://webkit.org/blog/14403/updates-to-storage-policy/)、[GitHub Pages 自定义部署](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)。
