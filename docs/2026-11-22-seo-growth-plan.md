# Aion 2 Rift Timer — SEO 增长与收录执行手册（2026-11-22）

基于哥飞 SEO 工具箱实时排查结果整理的落地清单，聚焦 **拉收录、破 DR 0、站内细节修复、长尾词切入** 四个环节。

---

## 一、优先拉收录（GSC 检查清单）

截至 2026-11-22，谷歌 `site:aion2-rift-timer.com` 仅收录 3 页（`/`、`/rift-timer/asia/`、`/maintenance/`）。

> **部署前特别提醒（`/maintenance/` 差异）**
> 线上实测 `https://aion2-rift-timer.com/maintenance/` 返回 `200 OK`（Title: *Aion 2 Maintenance Today & Server Status*），已被谷歌收录；但当前本地仓库与 `website/main` 均不含此页。**推送或覆盖部署前，请确认该页来源并决定保留或 301 合并，避免直接覆盖导致已收录页面 404。**

### 待在 GSC「网址检查 → 请求编入索引」提交的 14 个未收录核心页

1. `https://aion2-rift-timer.com/rift-timer/europe/`（优先，抢 `aion 2 rift timer eu`）
2. `https://aion2-rift-timer.com/rift-timer/quests/`（优先，抢 `aion 2 spacetime rift quest`）
3. `https://aion2-rift-timer.com/rift-timer/location/`（优先，抢 `aion 2 rift location`）
4. `https://aion2-rift-timer.com/world-boss-timer/`（优先，抢 `aion 2 world boss timer`）
5. `https://aion2-rift-timer.com/reset-timer/`
6. `https://aion2-rift-timer.com/dimensional-invasion/`（10 月搜索量暴涨至 2,900）
7. `https://aion2-rift-timer.com/shugo-festival/`
8. `https://aion2-rift-timer.com/rift-timer/korea/`
9. `https://aion2-rift-timer.com/rift-timer/taiwan/`
10. `https://aion2-rift-timer.com/battlefield/`
11. `https://aion2-rift-timer.com/artifact-siege/`
12. `https://aion2-rift-timer.com/abyss-outland/`
13. `https://aion2-rift-timer.com/argo-spirit-king/`
14. `https://aion2-rift-timer.com/rift-domination/`
15. `https://aion2-rift-timer.com/sources/`

*(另：确认 GSC 站点地图中已提交 `https://aion2-rift-timer.com/sitemap.xml` 且状态为「成功」。)*

---

## 二、破 DR 0：外链铺设方案（目标 DR 20–25）

`aion 2 rift timer` 盘面实测前十最低门槛为 `aion2.online`（DR 25，约 42 个引用域）。建议采用「免费社区/目录冷启动 + 低价高性价比 Guest Post 抬权重 + YouTube 蹭视频位」组合。

### 1. 外链实测复核结论（`backlink_value` 实时验货）

已对前 5 个高性价比候选站完成 `backlink_value` 实测（核查实时 DR、流量走势与垃圾站排雷），**前 3 个无负面标记、合计仅约 \$24.15 即可拿下 3 条 DR 39–50 的老站外链**：

| 优先级 | 域名 | 实时 DR | 实时月访（趋势） | 域龄 | 自然搜索占比 | 质量分 | 挂牌价 / 市场中位数 | 结论 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ⭐⭐⭐⭐⭐ 首选 | `radiofueguina.com` | 45 | 65,774（+100.5%） | 19.3 年 | 66.7% | 69 | \$7.20 / \$168 | **极值，优先买**（无雷点，含美/英流量） |
| ⭐⭐⭐⭐ 推荐 | `aztekium.pl` | 39 | 56,969（+35.8%） | 20.7 年 | 36.4% | 66 | \$5.20 / \$124 | **很值，拿下**（20 年老站，上升期） |
| ⭐⭐⭐⭐ 推荐 | `101livros.com` | 50 | 13,075（+2.6%） | 4.7 年 | 68.5% | 59 | \$11.75 / \$150 | **很值，拿下**（DR 50，自然搜索高） |
| ⚠️ 备选谨慎 | `goloskarpat.info` | 49 | 48,563（-43.9%） | 15.7 年 | 56.5% | 59 | \$13.87 / \$134 | 流量从 100k 跌至 48.6k（-51%），防算法惩罚，靠后考虑 |
| ❌ 跳过 | `2fight.info` | 30 | 22,156 | 15 年 | 29.6% | 46 | \$5.04 / \$124 | 跳出率 86.9% / 停留 4 秒 / 99.3% 俄区，建议直接放弃 |

### 1b. 其余 Guest Post 候选快照（下单前同样建议 `backlink_value` 复核）

数据来源：`find_link_prospects`（ADSY / Collaborator / GuestPostLinks 挂牌快照；**下单前建议用 `backlink_value` 复核实时 DR 与流量**）：

| 域名 | DR | 月访问量 | 自然搜索占比 | 挂牌价（USD） | 渠道 |
| --- | --- | --- | --- | --- | --- |
| `101livros.com` | 52 | 50,000 | 74.2% | \$11.75 | Collaborator |
| `moviezwaps.com.in` | 51 | 10,800 | 54.1% | \$14.40–\$41.90 | Collaborator, GuestPostLinks |
| `goloskarpat.info` | 48 | 189,000 | 63.6% | \$13.87 | Collaborator |
| `radiofueguina.com` | 48 | 36,000 | 69.2% | \$7.20–\$28.90 | ADSY, Collaborator, GuestPostLinks |
| `tipdoma.com` | 45 | 14,500 | 41.8% | \$11.08 | Collaborator |
| `management.com.ua` | 41 | 23,600 | 42.0% | \$13.22 | Collaborator |
| `aztekium.pl` | 40 | 57,600 | 62.2% | \$5.20 | Collaborator |
| `eduindex.org` | 38 | 52,100 | 84.7% | \$14.40 | Collaborator |
| `dnaop.com` | 38 | 70,700 | 72.1% | \$7.06 | Collaborator |
| `101kniga.com.ua` | 36 | 21,700 | 60.6% | \$8.33 | Collaborator |
| `easybook.in.ua` | 36 | 13,300 | 60.2% | \$6.65 | Collaborator |
| `2fight.info` | 34 | 37,100 | 86.7% | \$5.04 | Collaborator |
| `beausoleil.co` | 34 | 13,300 | 75.0% | \$13.87 | Collaborator |
| `zv.zp.ua` | 34 | 9,900 | 61.9% | \$10.07 | Collaborator |
| `studzona.com` | 31 | 31,000 | 66.4% | \$9.07 | Collaborator |

**锚文本配比建议**：
- 50% 品牌/裸链：`aion2-rift-timer.com`、`Aion 2 Rift Timer`
- 30% 核心长尾：`Aion 2 Spacetime Rift timer`、`Aion 2 Rift Timer EU`、`Aion 2 World Boss timer`
- 20% 泛锚文本：`live rift schedule`、`check upcoming rifts here`

### 2. 免费冷启动渠道（首周即做）

- **工具/游戏导航目录**：AlternativeTo、SaaSHub、Product Hunt（或 Indie Hackers）、GitHub README 互链（`bikai9289/TimeLord-aion2rifttimer` 主页填 `https://aion2-rift-timer.com`）。
- **Reddit 社区（自然分享，切忌硬广）**：`r/Aion2`、`r/MMORPG`（在已有讨论 Rift 时间的帖子里顺手回复，或发一篇开源免费工具分享贴）。
- **Discord 社区**：Aion 2 官方/社区 Discord 的 `#guides` / `#resources` 频道。

#### Reddit / Discord 英文分享文案（可直接微调发布）

> **Title**: Built a fast, no-login Aion 2 Spacetime Rift & World Event Timer (supports NA/EU/Asia/KR/TW + DST)
>
> **Body**:
> Hey everyone — I got tired of guessing whether Global Rifts follow service-local time, UTC+9, or fixed UTC (especially around DST), so I put together a lightweight static timer: https://aion2-rift-timer.com/
>
> What it does:
> - Tracks Spacetime Rifts across NA East/West, EU, LATAM, Global Asia, KR, and TW
> - Lets you compare Shugo (service-local), MetaBot (UTC+9), and Atlas (fixed UTC) interpretations side-by-side instead of hiding source disagreements
> - Separates opening time, entry window (15 min TW / 10 min community-reported), and activity end
> - Includes World Bosses, Daily/Weekly Reset, 50 candidate Rift locations, and all 14 Lv.45 Rift quests
> - No ads, no login, works offline as a PWA, and exports `.ics` alerts
>
> Happy to take schedule corrections or feature requests if anything shifts on your server!

---

## 三、YouTube 1 分钟演示视频脚本（蹭 SERP 第 5–6 位视频位）

`aion 2 rift timer` 谷歌首页第 5、6 位目前均为 YouTube 视频，普通网页抢不到但**发一条精准标题的短视频可直接占位**。

- **视频标题**：`Aion 2 Rift Timer — Live Spacetime Rift Countdown (EU, NA, Asia, KR & TW)`
- **简介首行（必须带完整链接）**：
  `Live Aion 2 Spacetime Rift Timer & Event Schedule: https://aion2-rift-timer.com/`
  `EU Schedule: https://aion2-rift-timer.com/rift-timer/europe/`
  `Asia / KR / TW: https://aion2-rift-timer.com/rift-timer/asia/`
  `Lv.45 Rift Quests & Rewards: https://aion2-rift-timer.com/rift-timer/quests/`
- **分镜脚本（60 秒，录屏即可）**：
  - `0:00–0:10`：展示首页倒计时，口播/字幕：“Stop missing Aion 2 Spacetime Rifts because of timezone confusion.”
  - `0:10–0:25`：切换 Region（NA / EU / Asia / KR / TW）与 Clock interpretation（Shugo / MetaBot / Atlas），展示自动换算本地时间与入场窗口。
  - `0:25–0:40`：切到 World Boss Timer、Daily/Weekly Reset 与个人清单勾选。
  - `0:40–0:52`：打开 Rift Locations（50 候选点）和 Lv.45 Rift Quests 奖励表。
  - `0:52–1:00`：展示“Export ICS / Browser Alert / Install App”，结尾字幕给出网址 `aion2-rift-timer.com`。

---

## 四、长尾词切入矩阵

| 目标长尾词 | 对应落地页 | 当前状态与动作 |
| --- | --- | --- |
| `aion 2 rift timer eu` | `/rift-timer/europe/` | 已优化 Title（53 字符）与 Description，GSC 优先提交收录 |
| `aion 2 rift timer asia` | `/rift-timer/asia/` | 已收录；已优化 Title（54 字符）与 Description 强化 `Asia / KR / TW` |
| `aion 2 spacetime rift quest` | `/rift-timer/quests/` | 原 Title 仅 `Quest rewards`，已升级为 `Aion 2 Spacetime Rift Quests & Rewards (Lv.45)` 并增加工具内链 |
| `aion 2 rift location` | `/rift-timer/location/` | 原 Title 仅 `Rift locations`，已升级为 `Aion 2 Spacetime Rift Locations & Spawn Directory` 并增加工具内链 |
| `aion 2 world boss timer` | `/world-boss-timer/` | Title（57 字符）合规；GSC 优先提交收录 |
| `aion 2 dimensional invasion` | `/dimensional-invasion/` | 10 月搜索量暴涨至 2,900；GSC 优先提交收录 |
| `aion 2 gartua timer` | 待核实后补充 | 当前 `schedules.json` 与 `content.json` 尚未收录 Gartua 规则；建议确认权威来源（Shugo / Wikily / 官方公告）后再在 `/world-boss-timer/` 或独立页补充，保持「不伪称实测」原则 |
