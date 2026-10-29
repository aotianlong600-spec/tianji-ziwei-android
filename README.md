# 天纪紫微 Android

离线紫微斗数与四柱命卦工具，Android 8.0 及以上。原生 Java Activity 加本地 WebView；无需账号，不请求联网、定位或存储权限，档案仅保存在本机。当前版本 **1.4.0**。

[下载安装包](https://github.com/aotianlong600-spec/tianji-ziwei-android/releases/latest) · [算法口径与局限](ziwei-android/MINGGUA-SOURCES.md) · [MIT 许可证](LICENSE)

## 功能

- 公历、农历、闰月输入；十二宫、主辅杂曜、生年四化、身宫、三方四正。
- 宫名统一固定在各宫右下方；每宫紧凑显示大限年龄段与 **1–60虚岁流年列表**。可用开关隐藏流年岁数，自动记住选择；60岁以后仍可查询，太岁另标。
- 主星与小星显示所选表中收录的庙旺等亮度；未收录或留白项不推测补值。提供天纪盘例对照、中州与斗数全书三种亮度表。
- 宫位时辰用“子、丑、寅……”单字标记；四柱竖列、公历农历、先后天卦放在命盘中央。
- 独立命卦页显示先后天卦、元堂、逐爻年龄段、可点击的流年、十二流月与按日期时分查询的流日卦。
- 本机档案保存与删除。卸载或清除应用数据会删除档案。

## 排盘约定

紫微闰月整月作下月论，保留实际农历出生日；辛年天魁午、天钺寅。小限按生年支起一岁，男顺女逆，虚岁由农历出生年起算；太岁按目标年支定位。

四柱命卦以立春换年、十二节换月，立春前归上一干支年，并从该年起算命卦年序。天数取5按4归巽为本项目约定，地数5按三元与性别寄宫。早晚子时日柱同日，晚子时时柱用次日日干。

交节按北京时间，未填写准确时分则用所选时辰中点估算。未自动校正真太阳时、出生地时区或历史夏令时。流日以交节时刻起连续24小时为一日，六日一卦；每组六日卦从原月卦独立变爻，图中分别说明生成卦变爻与当日值爻。节月超过30日的接续规则未定，第31日起显示待核，不编造结果。阴元堂流月尚缺主参考书的独立完整例案核验。请阅读[规则说明](ziwei-android/MINGGUA-SOURCES.md)，不要混用不同体系的岁数。

## 本地编译

需要 Node.js 18+、JDK 17、Android SDK Platform 34 与 Build-tools 34.0.0；APK 构建脚本使用 Windows PowerShell，无需 Gradle。

```powershell
cd ziwei-doushu
npm ci
npm test
npm run typecheck
npm run build:web
cd ../ziwei-android
./build.ps1 -Sdk "你的 Android SDK 目录"
```

也可设置 `ANDROID_HOME` 后省略 `-Sdk`。APK 输出到 `ziwei-android/build/tianji-ziwei.apk`。浏览器预览可使用任意静态服务器打开 `ziwei-android/build/assets/`。

脚本首次构建会生成本地开发签名，密钥不会进入 Git。Release APK 也使用开发签名供试用；自行编译产生的签名不同，不能直接覆盖安装此 APK。保留自己的签名密钥，避免升级时丢失覆盖安装能力；卸载会删除档案。

## 来源与许可

紫微引擎选自 [Renhuai123/ziwei-doushu](https://github.com/Renhuai123/ziwei-doushu) 的 MIT 开源代码（基准提交 `ff9a1470ebe652e57b9d690f5d01db9a04f47aae`），并按本项目口径修订。日历与基础安星使用 [iztro](https://github.com/SylarLong/iztro) 和 [lunar-javascript](https://github.com/6tail/lunar-javascript)。保留上游署名与许可证，APK 内可查看第三方许可。

四柱命卦独立编写，参考《天纪·天机道》的规则及例案。仓库只包含程序、规则说明和合成测试，不包含参考书全文、私人档案、原始盘例文档、签名密钥或个人截图。传统术数工具用于研究，未验证其预测效力。

本项目源码采用 MIT。上游及依赖许可见 [ATTRIBUTION.md](ATTRIBUTION.md)。已执行算法回归、类型检查及 APK 签名验证；文档复核范围与已知冲突见 [VERIFICATION.md](ziwei-android/VERIFICATION.md)。尚未完成安卓真机兼容性测试。
