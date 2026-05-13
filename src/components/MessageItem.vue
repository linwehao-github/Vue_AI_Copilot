<script setup lang="ts">
import { computed } from 'vue'
import { Marked } from 'marked'
import { markedHighlight } from 'marked-highlight'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'
import type { Message } from '@/types'

const props = defineProps<{
  message: Message
}>()

const isUser = computed(() => props.message.role === 'user')

const marked = new Marked(
  markedHighlight({
    langPrefix: 'hljs language-',
    highlight(code: string, lang: string) {
      if (lang && hljs.getLanguage(lang)) {
        return hljs.highlight(code, { language: lang }).value
      }
      return hljs.highlightAuto(code).value
    },
  }),
)

const renderedContent = computed(() => {
  return marked.parse(props.message.content) as string
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
      class="max-w-[80%] rounded-2xl px-4 py-3"
      :class="
        isUser
          ? 'bg-blue-500 text-white'
          : 'bg-white border border-gray-200 shadow-sm'
      "
    >
      <!-- 用户消息：纯文本 -->
      <p v-if="isUser" class="whitespace-pre-wrap text-sm leading-relaxed">
        {{ message.content }}
      </p>

      <!-- AI 消息：Markdown 渲染 -->
      <div
        v-else
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
/* 覆盖 highlight.js 与 prose 的冲突 */
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
