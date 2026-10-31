# Aion 2 Rift Timer

电影感 V3 界面、按服务本地时钟调度的静态工具站。Node.js 20+，构建与运行无需第三方依赖。

```sh
npm run dev      # 构建并启动 http://127.0.0.1:4320/
npm run check    # 单元测试 + 构建
npm run build    # 生成可部署的 dist/
npm start        # 预览已生成的 dist/
```

`python server.py` 仍可调用同一套 Node 构建与服务。修改源文件后重新构建。

## 当前能力

- 七个服务：NA East / West、Europe、LATAM、Global Asia、Korea、Taiwan。
- 十三类活动（把日/周重置分开计数），不支持或没有公开规则的服务明确显示缺少时刻表。
- Rift 三阶段：开启、入场窗口、活动估计边界。台服入口按官方指南为 15 分钟，其他服务按其来源配置；不是玩家个人停留计时。
- 三种 Global 时间解释可比较：Shugo 本服时钟、MetaBot 统一 UTC+9、Atlas Rift 固定 UTC。来源不一致时明确 Disputed，不伪称游戏内实测。
- 日/周重置有独立证据等级，Global 为固定 07:00 UTC，韩台为各自 05:00。
- 匹配组选择器显示实际起始时间，KR Artifact 为 21:20 / 21:50 / 22:20；其他活动/服务使用独立偏移。
- 本地/服务时钟/UTC、前 4/8 场、提醒、音效、ICS、个人清单和浮动倒计时。
- 10 个区域、50 个候选位置的来源目录，14 个任务奖励事实表，Lower Reshanta 首领地点。
- 当前仅英文，共 19 个页面，含独立 Korea / Taiwan Rift 落地页；客户端物品名与原始来源标题可保留英文以便查找。
- 真实 service worker、192/512 图标、离线提示、安装说明、缓存更新提示。离线支持已保存页面；未保存的页显示明确离线提示。
- canonical、sitemap、OG/Twitter、BreadcrumbList、首页 WebApplication、互返 hreflang 与来源页。

不承诺：关掉浏览器后的 Web Push、自动更新的日历订阅、实时游戏状态或所有浏览器自动弹出安装框。浏览器提醒需要分页面打开，后台可能延迟。

## 数据：本服小时数组 + IANA 时区

唯一调度配置：`src/data/schedules.json`（version 2）。

```json
{
  "zone": "Asia/Seoul",
  "hours": [2, 5, 8, 11, 14, 17, 20, 23],
  "minute": 0,
  "weekdays": [0, 1, 2, 3, 4, 5, 6],
  "durationMinutes": 60,
  "entryMinutes": 10,
  "confidence": "official",
  "sourceIds": ["nc-cycle", "nc-kr", "shugo"],
  "checkedAt": "2026-10-31T00:00:00Z",
  "validUntil": null,
  "fold": "first"
}
```

此例的 Official 只对应官方周期依据；入口/活动时长的社区依据在 `note` 中另外说明。

字段位于 `regions.<服务>.events.<活动>`。`confidence` 为 official / community-agreed / community-reported / disputed / pending，单来源不会冒充“多源一致”。每个活动独立，不再将整区的 provisional 状态套到 Reset。

`variants` 保存不同来源的解释；`groupOffsets` 为匹配组的分钟偏移；`durationByHour` 用于战场上午/晚上不同窗口。`null` 表示没有可发布规则，绝不借用别服。

时区转换对每个当地日期单独计算。DST 缺失时刻跳过，重复时刻默认只使用第一次；这是明确的产品策略，不冒充未观察到的游戏服务器行为。所有到期数据均停用。开着的会话每五分钟尝试刷新数据，校验失败则保留上次有效版本。

区域/任务事实数据在 `src/data/content.json`；翻译字典在 `src/data/locales.json`。`scripts/create-*.py` 是整理数据的维护工具，普通构建不需要 Python，也不会自动重置配置。

## 域名与 SEO

当前用户确认的临时 origin：

`https://aion2-rift-timer.bikai9289.workers.dev`

在 `src/data/site.json` 配置，或在托管平台设置 `SITE_URL` 覆盖它。所有 canonical / sitemap / 分享 URL 使用同一 origin。不要把尚未绑定的域名提前写成正式站址。

当前 sitemap 聚焦 17 个英文内容页，不列繁中/韩文及 credits/privacy；非英文路由暂不生成，语言入口、hreflang 和非英文预缓存均停用；翻译源文件保留。`indexing=false` 和 `publication.enabled=false` 保留预发布 noindex（follow），不是空白 sitemap。

所有工具页在 HTML 中直接输出对应服务的已公佈时刻表，关闭 JavaScript 仍能读到数字和活动入口。脚本成功启动后再接管未来场次及实时倒计时。共享工具目录使用原生链接，不依赖按钮事件。

正式域名绑定、时间资料与图片使用条件确认后：

1. 将 `SITE_URL` 改为 `https://aion2-rift-timer.com`。
2. 确认图片公开使用权或换成有权使用的图片，设置 `publication.artworkCleared=true`。
3. 设置 `publication.enabled=true`、`site.indexing=true`，重新构建。
4. 提交新域名的 sitemap，并将临时 origin 重定向到正式域名。

本次代码不自动登录 Cloudflare、绑定 DNS 或改动域名。

## Cloudflare Pages / Workers 静态资源

- Build command：`npm run build`
- Output directory：`dist`
- Node：20+
- `SITE_URL`：当前实际公开 origin

输出含安全响应头、`sw.js` 的 no-cache 配置和 `/rift-timer/eu/` → `/rift-timer/europe/` 的 301。Workers Static Assets 请按实际项目配置 `dist` 为静态资产目录；不要把源码目录当成输出目录。

## 测试

`npm test` 使用 Node 内置测试。浏览器测试使用 Playwright：

```sh
npm run test:browser
```

可以通过 `PLAYWRIGHT_MODULE` 指向已有 Playwright 运行时；`PLAYWRIGHT_EXECUTABLE` 指定浏览器，`TEST_URL` 指定测试 origin。结果与截图写入忽略的 `test-results/`。

数据层核对与边界：[docs/REVIEW-AND-FIXES.md](docs/REVIEW-AND-FIXES.md)。最近的模板修复见 [docs/FINAL-TEMPLATE-AUDIT.md](docs/FINAL-TEMPLATE-AUDIT.md)。第二轮表现层历史验收：[docs/PRESENTATION-AUDIT.md](docs/PRESENTATION-AUDIT.md)。

## 署名

原作：[TimeLord by dburr](https://github.com/dburr/TimeLord)，CC BY-SA 4.0；保留原 README 于 `docs/UPSTREAM-README.md`，旧代码于 `docs/legacy/`。参见 [LICENSE.md](LICENSE.md)。

第三方 Aion 2 宣传图 © NC Corporation / NCSOFT，不受代码许可证授权；来源在 `public/art-sources.json`。公开发布权限尚未确认，未据此自动放开收录。工具独立于 NCSOFT。
