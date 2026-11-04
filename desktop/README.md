# 天纪紫微桌面版

桌面端直接使用 `ziwei-android/build/assets` 的离线页面、排盘算法和界面，默认内容区域 1440×900，最小窗口 960×600。支持系统深浅色及原页面主题切换。

## 本地构建

需要 Node.js 24 和 npm，先在仓库根目录运行：

```sh
npm ci --prefix ziwei-doushu
npm ci --prefix desktop
npm test --prefix desktop
npm run prepare:web --prefix desktop
npm run test:smoke --prefix desktop
```

Windows：`npm run dist:win --prefix desktop`，生成 `desktop/build/dist/tianji-ziwei-1.9.0-win-x64.exe`，无需安装即可运行。

macOS：在对应机器运行 `npm run dist:mac --prefix desktop -- --x64`（Intel）或 `--arm64`（Apple Silicon），生成相应 `tianji-ziwei-1.9.0-mac-*.zip`，解压后将“天纪紫微.app”移入“应用程序”。

GitHub Actions 工作流 `Desktop release` 分别使用 Windows、Intel Mac 和 Apple Silicon Mac 构建，执行隐藏窗口的离线渲染、安全设置及存储自检，并验证 Mac 包签名与架构。手动运行 main 仅上传工作流产物；版本标签运行在所有构建成功后向**已存在**的相应 Release 附加文件，不会创建 Release。

## 数据与分发限制

用户数据保存在固定目录，升级替换程序文件不会主动删除命盘与主题：

- Windows：`%APPDATA%\tianji-ziwei`
- macOS：`~/Library/Application Support/tianji-ziwei`

Windows 便携版的命盘仍保存在当前电脑用户目录，搬走 exe 不会带走数据。Windows 与 Mac、Android 的命盘各自保存，当前没有同步或导入导出功能。

渲染页面使用固定的 `app://tianji` 本地来源及严格文件白名单；Node.js 关闭、开启上下文隔离和进程沙盒；拒绝弹窗、外部导航及设备权限。包中仅含构建后的页面、包装代码和许可证，原始 PDF/Word、私人盘例及本机数据不会进入包。

目前没有 Windows 发布者证书、Apple Developer ID 或公证凭据。Windows 可能提示未知发布者；Mac 采用 ad-hoc 签名，首次打开可能需要在“系统设置 → 隐私与安全性”允许。此签名不能替代 Apple Developer ID 与公证。CI 的原生运行自检加载与发布包相同的代码和资源；发布包另查签名与架构，尚未执行最终压缩包解压后的人工启动检查，也未覆盖所有用户系统版本。

Electron 与所含 Chromium 组件的许可证和引擎依赖署名合并到包内 `build/web/THIRD_PARTY_NOTICES.txt`。构建依赖固定于 `package-lock.json`。依据：[Electron 安全指南](https://www.electronjs.org/docs/latest/tutorial/security/)、[自定义协议与存储](https://www.electronjs.org/docs/latest/api/protocol/)、[electron-builder 26 Mac 签名说明](https://www.electron.build/v26/docs/features/code-signing/code-signing-mac/)、[GitHub 原生 runner 架构](https://docs.github.com/en/actions/reference/runners/github-hosted-runners)。
