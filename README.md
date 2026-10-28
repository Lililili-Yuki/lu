# 🦌 鹿间记录

一款以小鹿和森林为主题的轻量记录工具。用计时、打卡和日历，把每一次时长与日常变化留在自己的设备里。

[打开网页版](https://lililili-yuki.github.io/lu/) · [下载 Android APK](https://github.com/Lililili-Yuki/lu/releases/download/android-v0.1.0-preview/deer-days-0.1.0-preview.apk) · [发布记录](https://github.com/Lililili-Yuki/lu/releases) · [APK 构建进度](https://github.com/Lililili-Yuki/lu/actions/workflows/android-apk.yml)

## 功能

- **时长记录**：开始、暂停、继续和结束计时，保存每次的开始时间及有效时长；刷新页面、切换功能标签后可恢复计时。
- **每日打卡**：每天打卡一次，查看连续天数、累计天数及最近七天的打卡情况。
- **日历与历史**：按日期回看记录、当天次数和累计时长，支持删除单条历史。
- **统计汇总**：查看记录次数、总时长、平均时长、活跃天数和月度数据。
- **双人匹配**：匿名配对在线鹿友，同时开始计时，双方结束后比较本场时长；支持取消、退出、刷新恢复及离线结算。
- **清新界面**：奶油白与森林绿配色、扁平小鹿插画、手机自适应布局，首页大标语每次打开随机展示。
- **本地保存**：个人历史与打卡保存在当前设备，不上传到匹配服务器。

## Android 预览版

Android 0.1.0 预览版已发布，APK 与 SHA-256 校验文件可在 [发布页](https://github.com/Lililili-Yuki/lu/releases/tag/android-v0.1.0-preview) 下载。已通过编译、Android Lint 和 APK 签名校验。Android 工程和自动构建流程位于本仓库。

支持 Android 6.0 及以上。应用内置网页资源，离线可使用计时、打卡和记录查看；真人匹配需要联网。手机应用与浏览器中的数据各自保存，不会自动同步。

下载 APK 后，按系统提示允许本次安装来源并安装。首版采用调试签名，作为体验预览，不属于应用商店正式版本；后续更换签名可能需要卸载重装，卸载会清除本地数据。当前尚未完成 Android 真机验收。

## 匹配说明

匹配需要另一位真实用户同时加入，不提供模拟对手。时长由后端统一计算，单场最长一小时；超过 45 秒未收到心跳会在后续请求时结束本场。比拼仅供娱乐，请按自己的节奏结束。

后端已经部署并接入前端。本地配对、并发和结算测试通过，但当前测试网络访问后端遇到 Cloudflare 403，尚未完成云端双人验收。连接失败时请稍后重试，部署状态见 [匹配部署说明](MATCH_DEPLOYMENT.md)。

## 数据保存

清除浏览器站点数据、清除应用数据或卸载应用都会删除对应设备上的记录。当前没有账号同步、云备份或跨设备迁移。

## 开发

前端使用 React、TypeScript 和 Vite；Android 使用原生 WebView 加载内置资源。

安装依赖后运行：

```sh
npm ci
npm run dev
npm run build
```

开发入口为 `dev.html`。构建会生成 `dist/` 并更新供 GitHub Pages 发布的根目录 `index.html`。Android 构建使用仓库中的 `dist/` 资源，更新资源后可手动运行 Android APK 工作流。更多说明见 [开发与发布](DEVELOPMENT.md)。