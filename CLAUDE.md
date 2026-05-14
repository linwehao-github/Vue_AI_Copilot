# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 角色
你是一位资深前端工程师，擅长 Vue 3 生态和 AI 应用开发，并且使用中文回答。


## 技术栈
- Framework: Vue 3（`<script setup>` + Composition API）
- Language: TypeScript（strict 模式，`noUnusedLocals` / `noUnusedParameters` 开启）
- State Management: Pinia（单 Store，Composition API 风格）
- Styling: Tailwind CSS v4（`@tailwindcss/vite` 插件，CSS-first 配置）
- Build: Vite 6，`vue-tsc -b` 作为 build 前置类型检查

## 命令
```bash
npm run dev       # 启动开发服务器（含 HMR 和 /api/chat 代理）
npm run build     # vue-tsc 类型检查 + Vite 生产构建
npm run preview   # 预览生产构建
```

开发前必须设置系统环境变量 `OPEN_AI_KEY`（阿里 DashScope API Key）。不设置时 dev server 会打印警告，API 请求会 401。

## 架构

### 数据流
```
InputBox/FileDropZone → ChatWindow → useChatStore.sendMessage()
  → sendAiMessage() (SSE fetch /api/chat)
    → proxy → dashscope.aliyuncs.com/compatible-mode/v1/chat/completions
    → SSE 流式解析 → onToken → messages[aiIdx].content 逐字追加
    → MessageList 自动滚底
    → MessageItem 渲染 Markdown（marked + highlight.js）或 ECharts 图表
```

### 组件树
```
App → ChatWindow                        App → OutfitPage
        ├── ConversationSidebar                  ├── OutfitForm
        ├── FileDropZone                         └── OutfitResult
        ├── MessageList → MessageItem
        └── InputBox
```

### 页面导航
无 vue-router，App.vue 用 `currentPage` ref 在 `'chat'` 和 `'outfit'` 间切换。ChatWindow 顶栏有"穿搭推荐"按钮触发 `navigateOutfit` 事件，OutfitPage 顶栏有返回按钮触发 `close` 事件。

### Store (`src/stores/chat.ts`)
唯一 Pinia Store。核心状态：`conversations`、`activeId`、`loading`、`error`、`pendingAttachment`。
- 所有对话持久化到 `localStorage`（key: `vue-ai-copilot-conversations`），每次变更后自动保存，启动时自动加载
- 首条用户消息自动截取前 30 字作为对话标题
- 上传文件后 `attachData()` 暂存，下次 `sendMessage()` 时将表格格式化为 Markdown 注入消息，发送后清除

### API 代理 (`vite.config.ts`)
Vite dev server 代理了 3 个路由：
- `POST /api/chat` → DashScope Chat Completions（注入 Authorization + Bearer Token）
- `POST /api/image/generate` → DashScope wanx-v1 图片生成（注入 Authorization + X-DashScope-Async: enable）
- `GET /api/image/task/:id` → DashScope 异步任务状态查询

Key 仅存在于 Node 服务端，不暴露给浏览器。

### SSE 流式解析 (`src/services/ai.ts`)
手动解析 `ReadableStream`，用行缓冲区处理跨 chunk 断行。请求体为 OpenAI 兼容格式，模型 `qwen3-max`。系统提示词要求中文回复，并在需要可视化时输出 ` ```echarts {option} ``` ` 块。

### ECharts 图表渲染 (`src/components/MessageItem.vue`)
这是最关键的渲染逻辑：
1. 自定义 `marked` renderer：拦截 `lang === 'echarts'` 的 code block，将其替换为 `<div class="echart-placeholder" data-option="...">`（JSON 经 URI 编码）
2. `watch(renderedContent)` + `nextTick()` 后扫描未初始化的 placeholder，尝试 `JSON.parse` 并 `echarts.init()`
3. 流式输出中 JSON 不完整时 parse 失败 → 静默跳过，下次 token 到达后重试
4. `data-initialized` 属性防止重复初始化
5. `onBeforeUnmount` 中 dispose 所有 ECharts 实例，移除 resize 监听

### 文件解析
CSV（papaparse）和 Excel（xlsx）均通过动态 `import()` 加载，不进入初始 bundle。`FileDropZone.vue` 和 `ChatWindow.vue` 中各有解析逻辑。

### 多对话管理
无 vue-router，对话切换纯靠 Pinia `activeId` 状态驱动。`ConversationSidebar.vue` 列表项外层是 `<div role="button">`（不是 `<button>`，因为内部嵌套了删除 `<button>`）。

### 穿搭推荐 (`src/services/outfit.ts` + `src/services/image.ts`)
独立的穿搭推荐功能，数据流：
```
OutfitForm 表单提交
  → OutfitPage.handleSubmit()
    → getOutfitRecommendations() 非流式请求 /api/chat（专用 system prompt）
      → AI 返回 JSON（2-3 套搭配 + image_prompt）
    → 并行调用 generateImage() for each
      → submitTask() POST /api/image/generate → 获取 task_id
      → pollTask() GET /api/image/task/:id → 轮询至 SUCCEEDED
      → 返回图片 URL
    → OutfitResult 展示结果卡片（搭配明细表 + 效果图）
```
- AI 推荐依赖 qwen3-max 非流式请求，JSON 解析有 3 层 fallback（直接解析 → JSON 块 → 正则匹配）
- 图片生成依赖 wanx-v1 异步任务，轮询间隔 3s，超时 120s
- 图片以并行方式生成（Promise.allSettled），每个卡片独立显示加载/完成/失败状态

## 代码规范
- 组件 PascalCase，Props/Emits 完整 TypeScript 类型，不用 `any`
- Ref 在 template 中自动解包，不需要 `.value`；但在 `<script>` 中修改 ref 必须用 `.value`
- **Vue 响应式陷阱**：push 到 `ref<Array>` 后再通过原始对象引用修改属性不会触发更新，必须通过 `messages.value[idx].content` 访问 Proxy
- 复杂逻辑优先抽离到 `src/composables/`（当前尚未使用）
