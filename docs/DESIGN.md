# V3 — Beyond the Rift

## 这次解决什么

用户明确反馈：缺少游戏氛围、希望更有视觉冲击；首页太短，要参考优秀游戏站。继承此前的要求：不要大片文字，用图像打断信息，保留 Rift 首页聚焦。

因此不再用大空图片位加功能卡片作主视觉，而改成全幅官方宣传图、电影式遮罩、金属金按钮、大号数字、章节式长首页。计时器仍在首屏，工具性没有让位给单独的开场封面。

## 实际参考，2026-10-31

- [Lost Ark 官网](https://www.playlostark.com/en-us)：已打开网页并截取浏览器首屏，看到大画面、居中史诗标题、金色描边操作；页面内容将 News 与 Game Guides 分段。采纳全幅主视觉、金色功能按钮和图文交替节奏；不复制其美术或品牌。
- [Guild Wars 2 官网](https://www.guildwars2.com/en/)：读取官方页面中的新闻、活动推广、社区与新手入口，采纳分层导航和多内容区的长首页组织。本次未完成其浏览器视觉截图，不声称逐像素看过。
- [Aion 2 官方特设页](https://aion2.ncsoft.jp/en/contents)：读取 Wallpaper、Expedition、Tale of Two Worlds 等章节及图片地址。浏览器首屏截图受加载影响呈黑屏，因此没有把黑屏当作视觉参考；实际查看了下载后制作的官方图片联系表。
- [Diablo IV 官网](https://diablo4.blizzard.com/en-us/)：抓取返回 403，未用它支撑任何界面结论。

## 首页结构

1. **全幅场景 + 倒计时**：图片有真实内容，01 / 02 / 03 可换场景；提醒与日历直达。
2. **服务与时区**：区分服务、当地时钟与 UTC。
3. **未来场次**：四场默认、八场展开；无长说明。
4. **活动画廊**：Rift、Boss、Reset 三张图；未完成的 Boss 明确为 Planned。
5. **场景式进入指南**：大场景图叠三条短步骤。
6. **地区时钟**：Europe、NA、Asia，并链接完整地区页。
7. **每日与每周 Reset**：图片横幅、下一次参考重置、工具入口。
8. **折叠 FAQ、来源、完整页脚**：不以长段文字填充页面。

滚出首屏后显示小浮动计时器；所有交互仍使用真实本地状态。

## 美术来源

官方来源：[AION 2 global teaser site / Wallpaper](https://aion2.ncsoft.jp/en/contents)。图片资产来自该页面引用的 st.ncjapan.co.jp 路径，详细文件与 URL 见 `art-sources.json`。

- wallpaperBg13.webp：首屏裂隙氛围场景。
- wallpaperBg15.webp：深渊场景、Rift 卡片、Reset 氛围图。
- wallpaperBg4.webp：火焰 Boss 场景。
- wallpaperBg1.webp：大殿场景、指南、Reset 说明页。
- wallpaperBg7.webp：翼人场景、地区选择。

版权：Aion 2 artwork © NC Corporation / NCSOFT。仅用作本地设计预览；没有声称获得公开发布的授权。宣传画不是游戏地图、重置 UI 或实测证据。页面与页脚已明确标注。

未使用 AI 生图。当前环境没有可调用的原生生图工具，本版直接使用可溯源官方宣传素材，没有调用收费 CLI，也没有假造游戏截图。

## 数据与版本

继承 V2 的演示时刻表、提醒、日历、区服/时区换算、个人清单逻辑。正式时刻尚未实测，仍明确标 DEMO，所有页面 noindex。未部署、未替换项目正式首页。V1 和 V2 保留。

Europe、Asia、Reset 三个配套页面在本版本内可打开，并已补入官方氛围图。实际地图和重置 UI 日后仍应换成用户实测截图。
