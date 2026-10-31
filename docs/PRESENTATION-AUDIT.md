# 第二轮审查：内链、静态内容与活动页默认服务

2026-10-31。本轮范围是修复表现层和构建模板，保留已认可的 V3 视觉与调度模型。

## 核对结论

- P0-1 成立：此前活动入口依赖 data-tool 按钮及 JS 动态板；现在源模板已用真实 a 标签，所有工具页都有共享的八活动入口与地区入口，删除 Planned 对话框和 future-tools 提示。
- P0-2 成立：/sources/ 静态可读，工具页却缺少首轮数字内容。现工具页 #openings 初始输出本页服务/活动的已公佈时刻表。Reset 输出每日/每周表，Boss 输出 Kaira/Nahma/Siege 三表。HTML 中的阶段区与事件板也不再为空。
- 初始表明确是“本服公佈时刻”，不把构建日期烘成实时倒计时。JS 加载后再换成当地时间、未来场次与阶段计时。关闭 JS 的浏览器已实际验证可读、可点。
- P0-3 成立：可见 H1 改为 Aion 2 Rift Timer / Reset Timer / Europe / Asia 等；首页增加约 250 词解释，拆四张短卡，中间穿插场景图。
- P1-4 不能将 Disputed 全部消除。首页 NA East 的 Global 来源确有分歧，所以保留；韩台独立页的初始徽章按其规则显示 Official，Reset 按其活动规则显示 Community-agreed。
- sitemap 调整为 17 个英文内容页；繁中/韩文、credits/privacy 不列入 sitemap，但保持三语路由和互返 hreflang，未删除用户可见页面。删除首页单项 BreadcrumbList，保留 WebApplication。
- N1 成立：八活动页复制的 EU eyebrow 和 screen-label 已替换为活动/对应服务标识。
- N2 成立：Outland/Argo 默认并限制为 Korea；争夺战默认并限制为已公佈规则的 Taiwan，并说明本站未公佈韩国规则。这不是声称该内容全世界只有台服有。
- N3 原来已有 global → na-east 的 fallback；当前数据还保留 global 兼容别名。现在构建显式写 na-east 及 use-stored-region 标记，不依赖隐含别名。
- N4 保留未授权状态。没有擅自把 artworkCleared 改为 true，也未绑域/去 noindex。本轮不新增素材。仍需用户提供有权使用的替换图或授权依据，才能公开放开索引。
- 台湾 Battlefield 本轮复查 Shugo 仍无台服配置，保留缺失，不按韩国时间推测。
- 每页现在只有一个 favicon 链接。

## 新页面

- /rift-timer/korea/：韩服时刻、来源和真实链接。
- /rift-timer/taiwan/：台服时刻、15 分钟入口说明和真实链接。
- 三语均生成，共 57 页；sitemap 17 页。

## 验证

- 17 组 Node 测试通过：包含新增构建 HTML 回归检查（数字静态表、所有八入口、无 Planned 残留、专服默认值、H1、唯一 favicon、sitemap 筛选）。
- Playwright：原交互、PWA 离线等回归通过；新增禁用 JS 的八种工具页可读/可点与移动端检查、已保存其他服务偏好时专服页面仍选对服务。
- 修正测试发现的 Taiwan 长标题 320px 横向溢出；电脑/手机截图检查保持 V3 风格。

域名仍使用已确认的 workers.dev。代码推送不等于确认 Cloudflare 自动发布完成。
