# Aion 2 Rift Timer

基于已确认的 **V3 电影感界面**开发的静态网站。无需数据库、账号或第三方构建依赖，Node.js 20+ 即可运行。

## 本地启动

```sh
npm run dev
```

打开 http://127.0.0.1:4320/ 。修改 `src/` 后重新构建。原 `python server.py` 也可启动同一套 Node 构建与服务。

```sh
npm test         # 时间边界、DST、配置与未确认/过期状态
npm run build    # 生成 dist/
npm start        # 预览已生成的 dist/
```

可选浏览器验收：安装 Playwright（或用 `PLAYWRIGHT_MODULE` 指向已有运行时），启动网站后运行 `npm run test:browser`。`PLAYWRIGHT_EXECUTABLE` 可指定浏览器路径，`TEST_URL` 可指定测试地址。截图与结果写入不入 Git 的 `test-results/`。

## 功能

- V3 长首页：三场景切换、大号倒计时、浮动计时器、活动画廊与地区时钟。
- Europe、Asia、每日/每周 Reset 三个独立页面。
- 区服、本地时间/区域时钟/UTC、未来 4/8 场、浏览器标题倒计时。
- 提前 5/10/15 分钟提醒、音效测试、通知拒绝时的页内提醒；刷新后不会擅自重新开启通知。
- ICS 导出：Rift 最多 56 场；Reset 最多 7 个日重置和下次周重置，含提醒。单次导入，不是自动订阅。
- 个人清单按参考日/周边界清空；偏好仅存本机。
- 配置校验、过期处理、待核实状态、加载失败与重试。
- 来源、版权署名、隐私、404；canonical、robots、sitemap、托管响应头和 CI。
- 无第三方运行时 CDN、分析脚本、登录或支付。

## 改时间只改一个文件

编辑 [`src/data/schedules.json`](src/data/schedules.json)，然后重新构建。

| 配置 | 含义 |
| --- | --- |
| `zone` | 区域显示时区（IANA）；不代表已确认的服务器时钟 |
| `rift.anchorUtc` | 某次开放的绝对 UTC 时间 |
| `rift.intervalMinutes` | 重复周期（分钟） |
| `reset.dailyHourUTC` | 每日重置的 UTC 小时 |
| `reset.weeklyDayUTC` | 周重置的 UTC 星期，0=周日 |
| `status` | `provisional` 演示、`pending` 无数据、`verified` 已核实 |
| `reviewedAt` | 真实核对日期（UTC）；未核实为 null |
| `validUntil` | 数据有效期；不会生成超出有效期的场次 |
| `sourceIds` | 对应文件上方的来源 ID |

Asia 当前为 pending：计时显示 `--`，禁用提醒和日历，不套用其他服务。KR/TW 仍是演示配置，不得把社区资料审阅冒充游戏内实测。

## 当前发布状态

开发版已可构建和部署，**尚未公开发布**。

1. 时刻表含 provisional 数据，尤其 Global / DST 存在分歧，需要真实核实。
2. 官方宣传图用于设计预览，公开发布权限尚未确认；可替换为你有权使用的图片。
3. `publication.enabled=false` 时生成 noindex，sitemap 不提交演示页面。
4. 核对时刻、补 `reviewedAt` 与来源、处理图片权限后，再启用 `publication.artworkCleared` 和 `publication.enabled`。构建会拒绝仍有 provisional 数据的公开发布配置。

## Cloudflare Pages 部署

连接仓库，设置：

- Framework preset：None
- Build command：`npm run build`
- Build output directory：`dist`
- Node version：20 或以上

输出含 `_headers` 和 `/rift-timer/eu` → `/rift-timer/europe/` 的 301 配置。添加自定义域名 `aion2-rift-timer.com` 后，按 Cloudflare 返回的要求配置 DNS。本次开发不自动修改域名或发布线上站点。

## 目录

```text
src/pages/              页面源文件
src/styles/             V3 样式
src/scripts/            共享时间计算和交互
src/data/schedules.json 唯一时刻表数据源
public/                 图片、应用清单、图片出处
scripts/                构建和本地服务
tests/                  Node 内置测试
dist/                   可部署输出（自动生成，不入 Git）
designs/                保留的设计版本
docs/legacy/            原版 TimeLord 文件
```

`scripts/prepare-source.py` 为一次性迁移工具，正常开发不运行（会覆盖源文件）。

## 署名和许可证

原作：[TimeLord by dburr](https://github.com/dburr/TimeLord)，声明 CC BY-SA 4.0；原说明在 `docs/UPSTREAM-README.md`。本项目保留署名与许可证通知，详见 [LICENSE.md](LICENSE.md)。第三方游戏图像不在该许可证授权范围内。

Aion 2 artwork © NC Corporation / NCSOFT，出处见 `public/art-sources.json`。本工具独立于 NCSOFT，无官方背书。
