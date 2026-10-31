# 用户审查核对与修复报告

核对日期：2026-10-31。下列结论来自本轮实际读取的代码、原始发布者页面和调度测试，不把竞品标签当作本网站的实测证据。

## 文档判断：哪些成立，哪些需要纠正

| 用户判断 | 核对结果 |
| --- | --- |
| KR 锚点导致整体 +9h | **不成立**。每 3 小时无限重复时，+9h 正好三个周期，生成的每日时刻集合相同；测试证明旧 UTC 02:00 规则与本服 02/05/08…等价。列出集合的起始顺序不能当成下一场偏移。 |
| TW 整体 +6h | **不成立**。UTC 00:00 + 3h 与台北本地 02/05/08…同相位，+6h 是两个完整周期。 |
| 即使按 MetaBot 口径，旧 Global 也对不上 | **不成立**。UTC+9 的 00:00 是前日 UTC 15:00；每 3h 重复后的集合恰好就是 UTC 00/03/06…，与旧 Global 固定 UTC 规则等价。MetaBot 与 Atlas 是不同来源表述，但 Rift 瞬时集合相同。 |
| NA East 的 20:00 / 23:00 证明算错 | **不成立**。20/23 本来就在 02/05/08/11/14/17/20/23 集合里。EDT 时 UTC 偏移 -4，旧周期与 Shugo 同相位；2026-11-01 转 EST 后才分叉。NA West 同理在 DST 改变后需要重新按本地时钟计算。 |
| UTC 锚点不适合表达 Global 本服 DST 规则 | **成立**。但 Global 规则本身存在来源分歧，不能把 Shugo 的解释直接称为多源一致的“真值”。 |
| Reset Global 07:00 UTC、韩台各自 05:00 | **社区资料支持**。Global 是 Community-agreed；韩台是 Community-reported，不能因为竞品写 Confirmed 就升级成官方或本网站实测。 |
| 所有 Rift 统一 10 分钟入口 | **不成立**。台湾官方指南写 15 分钟。10 分钟是韩服历史/社区口径，配置按服务区分。60 分钟活动边界不是某个玩家的个人剩余停留时间。 |
| Battlefield 两次都是 120 分钟 | **不成立**。Shugo 表格写 120，但同页正文与 MetaBot 都写上午 11:00–14:00。采用 180/120 分钟并显式 Disputed，不能宣称无分歧。 |
| 所有 Global 活动统一 UTC | **未定**。Shugo 按地区本地时钟；MetaBot 主张共享 UTC+9；Atlas 的 Rift 又使用固定 UTC。界面可比较三种，保留分歧。整点/半点的小时活动在这些整小时偏移时区下恰好同相位，不因时区名字不同就一律标有争议。 |
| Boss 时间与地点可查 | **成立**。已接入对应时刻与 Lower Reshanta 地点；不混淆 Watcher Kaira 与 Executor Kaira，也不将所有世界首领视作一种刷新。 |
| Rift 有 10 个随机位置 | **需要区分单位**。10 个候选区域，地图资料列出每区 5 个候选坐标位置，共 50 个；不是每场同时生成 50 个入口，也不是本站亲自测绘。 |
| 14 个任务奖励可以整理 | **成立**。逐条读取 7 天族/7 魔族任务页，存为带来源与客户端版本的事实表，不复制任务对白。 |
| PWA 缺 sw / icons | **成立**。此前是应用清单预留而非离线 PWA，本轮补齐。安装提示还取决于浏览器策略，不保证所有 Android 自动弹窗。 |
| sitemap 空 / 域名不一致 / 缺分享元数据 | **成立**。空 sitemap 与 noindex 原本是未核实数据的预发布策略；本轮补全 sitemap 与正确 workers.dev origin，补元数据。去 noindex 仍按用户“最后绑定正式域名后”执行。 |
| 应从来源中移除竞品比较页 | **成立**。不再依赖 aion2-rifttimer.com/sources/；改为直引 NC、Shugo、MetaBot、Wikily 和实际采用的 Atlas 解释。 |
| 三家来源等于独立证实所有时间 | **不能据此推出**。部分页面来自同一客户端/数据生态；“多源”不是游戏内实测，来源间也确有钟表和时长矛盾。 |

## 主要原始来源

- [NC 2025-12-03 公告](https://about.ncsoft.com/news/article/aion2_update_251203)：直接支持 4 小时改为 3 小时。韩服更新详情页为动态加载，本轮浏览器未成功读出完整正文，不据此声称读到了全部现行规则。
- [台湾官方 Rift 指南](https://tw.ncsoft.com/aion2/guidebook/view?title=%E6%99%82%E7%A9%BA%E8%A3%82%E7%B8%AB)：3 小时周期、15 分钟入口、争夺战每周一/四/五 20:00 和 23:00。
- [韩国更新详情](https://aion2.plaync.com/ko-kr/board/update/view?articleId=692f3e3834e7dd2024fd53a4)、[台湾更新详情](https://tw.ncsoft.com/aion2/board/update/view?articleId=692f4c48e81e402e6da16915)：保留官方出处。每项字段的社区补充在 note 中区分。
- [Shugo](https://shugo.gg/timers)：各服务本地时钟、分组、KR/TW 特殊活动和 10-28 Argo 报告。
- [MetaBot events](https://metabot.gg/en/aion-2/events)：统一 UTC+9 解释、Arena 窗口、客户端表。Rift 聚合页触发人机验证，未绕过；使用可公开读取的 events、地图和逐条任务页。
- [Wikily boss table](https://wikily.gg/aion-2/bosses/spawn-times)：首领时刻及地点。
- [Atlas](https://aion2atlas.app/rift-timer/)：作为固定 UTC 的冲突解释列出，不冒充官方依据。

## 已完成修复

- v2 数据结构：每活动独立的 hours、minute、weekdays、IANA zone、duration、entryMinutes、sourceIds、checkedAt、validUntil、DST fold 策略。
- Global 提供 Shugo 地区钟、MetaBot UTC+9、Atlas UTC（Rift）解释；Reset 独立，不跟 Rift 切换。
- 7 服务（含 LATAM、Global Asia）；13 分类（每日与每周重置分开计数）。
- Rift 开启→入口关闭→活动边界三阶段；台湾 15 分钟，其他按对应来源。
- Shugo、入侵、Battlefield、Artifact、Siege Bosses、Nahma、Kaira、韩服 Outland/Argo、台服争夺战；KR 争夺战缺可核实时刻时明确无已公佈排程，不捏造。
- KR 与 TW、Global 各自的 matching groups；MetaBot 未提供分组的解释不会套用 Shugo 的分组偏移。
- 10 区域/50 候选位置、14 任务奖励、Lower Reshanta 首领地点。
- EN / 繁中 / 韩文页面及 UI；事件名/物品名和原始来源标题可保留客户端英文以便查找。
- 真实 SW 离线缓存、缓存版本更新、安装图标与手动安装说明；浏览器关闭后 Web Push 不在承诺范围。
- 51 页 sitemap、canonical、OG/Twitter、BreadcrumbList、首页 WebApplication、三语互返 hreflang。
- origin 使用用户确认的 workers.dev；正式域名未绑定前保留 noindex，不声称已绑域。源码与构建共享该配置。
- 开页会话每 5 分钟检查时刻表更新；校验失败保留上次有效资料，过期规则停用。

## 验证与发布边界

单元测试验证原锚点等价、欧美两次 DST、跳时/重复时刻、周界限、三阶段精确边界、配对组、缺数据与非法字段。浏览器验证时区/方案切换、三语、真实日历、离线 reload、数据重试和移动端布局。

未伪造：本站游戏实测、官方全球时钟、未确认的韩服争夺战开始时间、Battlefield/Outland 无争议时长、官方素材公开发布授权。它们是来源/发布条件，不会被“完整性检测通过”冒充已解决。
