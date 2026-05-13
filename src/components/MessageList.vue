<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import type { Message } from '@/types'
import MessageItem from './MessageItem.vue'

const props = defineProps<{
  messages: Message[]
}>()

// 滚动容器引用（后续用于虚拟滚动的入口）
const listRef = ref<HTMLElement | null>(null)

// 新消息到达时自动滚动到底部
watch(
  () => props.messages.length,
  async () => {
    await nextTick()
    if (listRef.value) {
      listRef.value.scrollTop = listRef.value.scrollHeight
    }
  },
)
</script>

<template>
  <div
    ref="listRef"
    class="flex-1 overflow-y-auto px-4 py-6 space-y-0"
  >
    <!-- 空状态 -->
    <div
      v-if="messages.length === 0"
      class="flex flex-col items-center justify-center h-full text-gray-400"
    >
      <svg
        class="w-16 h-16 mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>
      <p class="text-lg">开始新的对话</p>
      <p class="text-sm mt-1">输入你的问题，AI 将为你解答</p>
    </div>

    <MessageItem
      v-for="msg in messages"
      :key="msg.id"
      :message="msg"
    />
  </div>
</template>
