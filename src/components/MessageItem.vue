<script setup lang="ts">
import { computed, ref, watch, nextTick, onBeforeUnmount } from 'vue'
import { Marked } from 'marked'
import { markedHighlight } from 'marked-highlight'
import hljs from 'highlight.js'
import * as echarts from 'echarts'
import 'highlight.js/styles/github-dark.css'
import type { Message } from '@/types'
import DataTablePreview from './DataTablePreview.vue'

const props = defineProps<{
  message: Message
}>()

const isUser = computed(() => props.message.role === 'user')

// 用户消息带数据时，提取纯问题文本（去掉表格部分）
const userDisplayContent = computed(() => {
  if (isUser.value && props.message.data) {
    const parts = props.message.content.split('\n\n---\n\n')
    return parts[parts.length - 1] || props.message.content
  }
  return props.message.content
})

// -- marked 实例，echarts 语言走自定义 renderer --
const marked = new Marked(
  markedHighlight({
    langPrefix: 'hljs language-',
    highlight(code: string, lang: string) {
      if (lang === 'echarts') return code
      if (lang && hljs.getLanguage(lang)) {
        return hljs.highlight(code, { language: lang }).value
      }
      return hljs.highlightAuto(code).value
    },
  }),
  {
    renderer: {
      code(token) {
        if (token.lang === 'echarts') {
          const encoded = encodeURIComponent(token.text)
          return `<div class="echart-placeholder my-4" data-option="${encoded}" style="width:100%;height:360px;background:#f9fafb;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#9ca3af;font-size:13px;border:1px solid #e5e7eb">图表渲染中...</div>`
        }
        return false
      },
    },
  },
)

const renderedContent = computed(() => {
  return marked.parse(props.message.content) as string
})

// -- ECharts 实例管理 --
const contentRef = ref<HTMLElement | null>(null)
const chartInstances = new Map<HTMLElement, echarts.ECharts>()

function initEcharts() {
  if (!contentRef.value) return
  const placeholders = contentRef.value.querySelectorAll<HTMLElement>(
    '.echart-placeholder:not([data-initialized])',
  )
  placeholders.forEach((el) => {
    const raw = el.getAttribute('data-option')
    if (!raw) return
    try {
      const option = JSON.parse(decodeURIComponent(raw))
      el.setAttribute('data-initialized', 'true')
      el.style.cssText = 'width:100%;height:360px;'
      const instance = echarts.init(el)
      instance.setOption(option, true)
      chartInstances.set(el, instance)
    } catch {
      // JSON 不完整（流式输出中），等待下次渲染重试
    }
  })

  // 响应式调整图表大小
  chartInstances.forEach((inst) => inst.resize())
}

watch(renderedContent, async () => {
  await nextTick()
  initEcharts()
})

// 监听窗口大小变化
function handleResize() {
  chartInstances.forEach((inst) => inst.resize())
}
import { onMounted } from 'vue'
onMounted(async () => {
  await nextTick()
  initEcharts()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  chartInstances.forEach((inst) => inst.dispose())
  chartInstances.clear()
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <div
    class="flex w-full mb-4"
    :class="isUser ? 'justify-end' : 'justify-start'"
  >
    <!-- AI 头像 -->
    <div v-if="!isUser" class="flex-shrink-0 mr-3">
      <div
        class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold"
      >
        AI
      </div>
    </div>

    <div
      class="max-w-[85%] rounded-2xl px-4 py-3"
      :class="
        isUser
          ? 'bg-blue-500 text-white'
          : 'bg-white border border-gray-200 shadow-sm'
      "
    >
      <!-- 用户消息：数据预览卡片 + 纯文本 -->
      <template v-if="isUser">
        <DataTablePreview v-if="message.data" :data="message.data" class="mb-2" />
        <p class="whitespace-pre-wrap text-sm leading-relaxed">
          {{ userDisplayContent }}
        </p>
      </template>

      <!-- AI 消息：Markdown 渲染 + ECharts -->
      <div
        v-else
        ref="contentRef"
        class="prose prose-sm max-w-none prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-code:text-pink-500"
        v-html="renderedContent"
      />
    </div>

    <!-- 用户头像 -->
    <div v-if="isUser" class="flex-shrink-0 ml-3">
      <div
        class="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs font-bold"
      >
        U
      </div>
    </div>
  </div>
</template>

<style scoped>
:deep(.prose pre) {
  background-color: #1e1e1e;
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  overflow-x: auto;
}
:deep(.prose pre code) {
  background: none;
  padding: 0;
  color: #d4d4d4;
}
:deep(.prose table) {
  width: 100%;
  border-collapse: collapse;
}
:deep(.prose th),
:deep(.prose td) {
  border: 1px solid #d1d5db;
  padding: 0.5rem 0.75rem;
  text-align: left;
}
:deep(.prose th) {
  background: #f3f4f6;
}
:deep(.prose blockquote) {
  border-left: 3px solid #93c5fd;
  padding-left: 1rem;
  color: #6b7280;
}
</style>
