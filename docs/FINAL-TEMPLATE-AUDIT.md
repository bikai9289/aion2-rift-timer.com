# 后续模板审查修复

2026-10-31。

- 停用非英文构建：输出现在是 19 页（17 内容页 + credits/privacy），没有 language-links、hreflang 或 zh-Hant/ko 预缓存。旧语言 URL 返回 404；新 SW 激活时删除旧版本缓存，避免旧页继续作为当前界面推广。翻译源文件保留，日后完成可重新启用。缺少 sitemap 条目本身不是 SEO 错误，但此处按用户决定暂停半成品语言页。
- 普通活动页与首页/Reset 一样读取保存的服务偏好。Europe/Asia/Korea/Taiwan 地区落地页显式使用其服务；专服活动只允许支持服务，不把该限定服务写回全站偏好。不是“所有页面被首页污染”，而是之前偏好适用范围不一致。
- KR/TW 副标题已替换为对应服务，且更新 metadata 和可见文案两处，不只替换第一个匹配。
- 裂缝周期和入口窗口分项：KR Cycle Official / Entry Community-reported；TW Cycle Official / Entry Official。活动时长仍按社区来源说明，未冒充官方。
- Siege Bosses 静态表直接分为 Executor Tamasa / Argo / Kaira 三行，地点卡片一致。Artifact 的来源移除 Wikily boss 页，保留直接支持 Artifact 的 Shugo/MetaBot。
- Outland 保留来源报告的 150 分钟数值供估算，但静态表、阶段主值标“≈150 min window · ≈30 min per match”，活动中倒计时标题标 Estimated window。没有把这个源内矛盾升级为确切结束时间。
- credits 改为公开网站实际展示 NC 素材、发布权限未确立、署名不构成授权。继续保留 artworkCleared=false 和 noindex；本次不擅自批准授权，不声称 noindex 能消除版权问题。公开素材仍待用户提供授权依据或有权使用的替换图。
- privacy 不再绝对声称 No analytics，说明应用不上传计时偏好、托管层启用 Cloudflare Web Analytics 时可能收集访问及性能信息。本地无法证明托管控制台的采集设置，因此不虚构具体开关或保留期限。

验证：18 组单元/构建检查通过；Playwright 英文页面、服务偏好跨页、限定页不污染偏好、PWA 真离线、提醒/日历和移动端回归通过。两个 PNG 图标已验证真实尺寸，分享图仍为本地生成的 1200×630 JPG。
