# 开发与发布

前端：React / Vite。已有历史保存在 deer-records；打卡保存在 deer-checkins，独立于计时。计时状态保存在 deer-timer，暂停不累计，刷新与切换标签可恢复。日期按设备本地日期，以结束当天归档。

## 本地启动

安装 Node.js 22+，运行 npm ci（也可使用 pnpm install --frozen-lockfile，本次通过 pnpm 安装并验证）。在两个终端分别执行 npm run server 和 npm run dev。打开 Vite 地址下的 /dev.html，使用两个浏览器或独立会话测试双人匹配。npm test 验证匹配流程，npm run build 构建前端。

## 上线

GitHub Pages 无法运行 Node 后端。后端需部署到可常驻运行 Node 的服务器，启动命令 node server/index.mjs，端口由 PORT 指定，默认 3001。推荐 HTTPS 反向代理，将 /api 转发到后端，其他路径提供 dist 静态文件。

如果前后端分域，构建前设置 VITE_MATCH_API_URL=https://你的后端域名，并在后端设置 ALLOWED_ORIGIN 为前端的精确来源（协议加域名，不含路径）。不要将任何密钥放入 VITE 环境变量。dev.html 是源码入口；npm run build 会构建 dist，并更新根目录 index.html 供现有 GitHub Pages 发布。

匹配匿名，不上传本地历史。服务端内存保存队列，单进程部署；重启会清空匹配。成绩由服务端时间计算，双方停止后结算，最长一小时；超过 30 秒无心跳会在下次请求时结束。正式公开规模运营前需加入账号、限流与共享存储；目前没有跨进程匹配或持久比赛历史。

设备历史和打卡只存当前浏览器，清理站点数据会丢失。建议用户勿同时在多个标签页进行计时。
