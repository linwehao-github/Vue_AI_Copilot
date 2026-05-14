# Vue AI Copilot

基于 Vue 3 + TypeScript + Pinia 的 AI 对话应用，支持流式对话、多轮历史、文件上传、ECharts 数据可视化，以及 AI 穿搭推荐与效果图生成。

## 功能

- 流式 AI 对话（SSE），Markdown 渲染 + 代码语法高亮
- 多对话管理，历史记录自动保存到 localStorage，刷新不丢失
- 支持拖拽/点击上传 CSV/Excel 文件，前端解析预览
- AI 数据分析和 ECharts 图表可视化（折线图、柱状图、饼图等）
- **AI 穿搭推荐**：填写个人信息 + 场景天气 + 衣橱偏好，AI 智能搭配并调用 wanx-v1 生成穿搭效果图
- 对话侧边栏：新建、切换、删除对话
- 响应式布局，支持移动端

## 效果展示

![穿搭推荐效果图](outfit_demo.png)

## 技术栈

| 技术 | 用途 |
|------|------|
| Vue 3 + Composition API | UI 框架 |
| TypeScript (strict) | 类型检查 |
| Pinia | 状态管理 |
| Tailwind CSS v4 | 样式 |
| Vite 6 | 构建工具 |
| Alibaba DashScope | AI API（qwen3-max 对话 + wanx-v1 生图） |
| marked + highlight.js | Markdown 渲染 |
| ECharts 6 | 图表渲染 |
| papaparse + xlsx | 文件解析 |

## 快速开始

```bash
# 1. 设置环境变量（阿里云 DashScope API Key）
# Windows PowerShell:
$env:OPEN_AI_KEY = "sk-xxxxxxxxxxxxxxxx"
# macOS / Linux:
export OPEN_AI_KEY=sk-xxxxxxxxxxxxxxxx

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev

# 4. 构建生产版本
npm run build
```

## 项目结构

```
src/
├── main.ts                         # 入口
├── App.vue                         # 根组件（chat/outfit 页面切换）
├── style.css                       # Tailwind + 全局样式
├── types/index.ts                  # 类型定义
├── stores/chat.ts                  # Pinia Store（状态 + localStorage 持久化）
├── services/
│   ├── ai.ts                       # SSE 流式 AI 对话
│   ├── outfit.ts                   # AI 穿搭推荐（非流式，JSON 结构化输出）
│   └── image.ts                    # wanx-v1 异步生图（submit + poll）
└── components/
    ├── ChatWindow.vue              # 主布局（侧边栏 + 聊天区）
    ├── ConversationSidebar.vue     # 对话列表侧边栏
    ├── MessageList.vue             # 消息列表（自动滚底）
    ├── MessageItem.vue             # 消息气泡（Markdown + ECharts 渲染）
    ├── InputBox.vue                # 输入框 + 发送按钮
    ├── FileDropZone.vue            # 文件拖拽上传
    ├── DataTablePreview.vue        # 数据表格预览
    ├── OutfitPage.vue              # 穿搭推荐页（表单 → AI 分析 → 生图）
    ├── OutfitForm.vue              # 穿搭表单（个人信息/场景/衣橱/偏好）
    └── OutfitResult.vue            # 推荐结果（搭配卡片 + 效果图）
```

## 架构

### AI 对话
```
用户输入/上传文件
  → ChatWindow
    → useChatStore.sendMessage()
      → sendAiMessage()  SSE fetch /api/chat
        → Vite proxy → dashscope.aliyuncs.com
          → SSE 流式解析 → onToken → 逐字渲染
```

### 穿搭推荐
```
用户填写表单
  → OutfitForm submit
    → OutfitPage.handleSubmit()
      → getOutfitRecommendations() 非流式 fetch /api/chat
        → qwen3-max 分析表单 → JSON（2-3 套搭配 + image_prompt）
      → submitTask() 逐个提交（间隔 2s 避 429）
        → pollTask() 并行轮询 → 图片 URL
      → OutfitResult 展示卡片
```

API Key 注入在 Vite 代理层（`vite.config.ts`），不会暴露到浏览器。
