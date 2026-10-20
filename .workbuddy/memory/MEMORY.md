# 项目长期记忆（figma-export 静态网站）

## 项目概况
- Figma 导出的 7 页个人网站（desktop-1~7.html + 共享 styles.css + script.js + fonts/ + audio/ + images/），设计稿 1440x1024。
- 本地预览：项目目录起 `python -m http.server 8777`（必须 run_in_background，否则进程被杀）。

## 必须遵守的约定
1. **CSS 缓存戳**：每次改完 styles.css，必须把 7 个 HTML 里的 `styles.css?v=版本号` 提升版本（如 ?v=20261020b）。python http.server 不发缓存头，浏览器会启发式缓存，用户普通刷新会看到旧样式（本项目已因此产生过一次全量误诊）。当前版本：?v=20261020b。
2. **改 styles.css 只能末尾追加分段（A/B/.../H 段）**，用注释写明病因/治法；不重排既有规则。
3. **绝不改 `<a>` 导航的 href**；不随意改已锁定的绝对定位元素（d3 的 text-35/36、ic-right-2-37、node-55；d5 唱片；d7 照片；全站底部导航）。
4. 权重意识：全局规则 `[class^="desktop-"] ...` 是 (0,2,1)，压过它需 ≥(0,2,2)；`!important` 之间才比权重。

## 关键坑（复发过）
- `a,p,span,div { background:none !important }`（约 1992 行）会清空所有面板背景；恢复面板背景必须用 `[class^="desktop-"] div[class*="rectangle-"]`（0,2,1+!important）压过。
- 导出样式 `.desktop-N-XX { min-height:100vh }`：视口高 >1024 时撑高画板，G 段已用 min-height:0 !important + max-height:1024px !important 锁死。
- scale() 不接受长度（scale(calc(100vh/1024)) 整个声明无效），缩放系数必须由 JS 算好后经 CSS 变量传入。
- 全局给 p/img 设 position:relative !important 会误伤 d1 按钮文字(.text-4)、d7 照片、d5 唱片等已有绝对定位——提层级只在新容器（.info-panel/.info-left）内做。

## 浏览器实测方法（agent-browser）
- `agent-browser set viewport W H` 与 `open URL` 必须在同一条 Bash 命令里（daemon 不跨命令保留视口/页面）。
- 怀疑样式异常时先 `agent-browser close --all` 冷重启再测，排除缓存旧 CSS。
- 后台任务偶报 failed 但 stdout 完整（网络拦截告警所致），以输出内容为准。

## 当前架构状态（2026-10-20）
- G 段：画板 absolute + translate(-50%,-50%) scale(var(--fit-scale)) 全屏等比缩放；head 内联脚本算 min(vw/1440, vh/1024)。
- H 段：矩形底板恢复 rgba(20,20,20,0.6)+30px 圆角+z1；新容器内文字/图标 z10；d3 左右两列（.info-columns flex row space-between，左卡 460px + 右栏 500px），d4/d5/d6 左侧 .info-panel 文字列，d7 照片背板。
- 缩放与布局均已实测通过（1600x1024 基准 + 1280x800/1920x1080/1000x1400 多视口）。
