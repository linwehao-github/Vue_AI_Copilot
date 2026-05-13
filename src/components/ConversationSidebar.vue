<script setup lang="ts">
import type { Conversation } from '@/types'

defineProps<{
  conversations: Conversation[]
  activeId: string | null
}>()

const emit = defineEmits<{
  create: []
  switch: [id: string]
  delete: [id: string]
}>()

function formatTime(ts: number): string {
  const now = Date.now()
  const diff = now - ts
  if (diff < 60_000) return '刚刚'
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)} 分钟前`
  if (diff < 86_400_000) return `${Math.floor(diff / 3600_000)} 小时前`
  return new Date(ts).toLocaleDateString('zh-CN')
}
</script>

<template>
  <aside
    class="w-64 flex-shrink-0 h-screen bg-gray-900 text-gray-200 flex flex-col"
  >
    <!-- 新建对话按钮 -->
    <div class="p-4">
      <button
        class="w-full py-2.5 rounded-lg border border-gray-600 text-sm font-medium
               hover:bg-gray-800 active:bg-gray-700 transition-colors flex items-center justify-center gap-2"
        @click="emit('create')"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        新建对话
      </button>
    </div>

    <!-- 对话列表 -->
    <nav class="flex-1 overflow-y-auto px-2 space-y-1">
      <template v-if="conversations.length === 0">
        <p class="text-center text-gray-500 text-sm mt-8">暂无对话</p>
      </template>

      <button
        v-for="conv in conversations"
        :key="conv.id"
        class="w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors group relative"
        :class="conv.id === activeId
          ? 'bg-gray-700 text-white'
          : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'"
        @click="emit('switch', conv.id)"
      >
        <div class="truncate pr-6 font-medium">{{ conv.title }}</div>
        <div class="text-xs mt-0.5 text-gray-500">
          {{ conv.messages.length }} 条消息 · {{ formatTime(conv.updatedAt) }}
        </div>

        <!-- 删除按钮，hover 显示 -->
        <button
          class="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded
                 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 hover:text-red-400
                 transition-all flex items-center justify-center"
          :class="conv.id === activeId ? 'text-gray-300' : 'text-gray-500'"
          @click.stop="emit('delete', conv.id)"
          title="删除对话"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </button>
    </nav>
  </aside>
</template>
