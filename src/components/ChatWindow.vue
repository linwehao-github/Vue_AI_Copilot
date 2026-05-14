<script setup lang="ts">
import { ref } from 'vue'
import { useChatStore } from '@/stores/chat'
import ConversationSidebar from './ConversationSidebar.vue'
import FileDropZone from './FileDropZone.vue'
import MessageList from './MessageList.vue'
import InputBox from './InputBox.vue'

defineEmits<{
  navigateOutfit: []
}>()

const store = useChatStore()
const sidebarOpen = ref(true)

function handleSend(content: string) {
  store.sendMessage(content)
}

function handleAttach(columns: string[], rows: string[][], fileName: string) {
  store.attachData(columns, rows, fileName)
}

async function handleAttachFile(file: File) {
  const ext = file.name.split('.').pop()?.toLowerCase()
  if (!ext || !['csv', 'xlsx', 'xls'].includes(ext)) return

  try {
    if (ext === 'csv') {
      const Papa = (await import('papaparse')).default
      const text = await file.text()
      Papa.parse(text, {
        header: false,
        skipEmptyLines: true,
        complete(results) {
          const data = results.data as string[][]
          if (data.length > 0) {
            const cols = data[0].map((c) => String(c))
            store.attachData(cols, data.slice(1), file.name)
          }
        },
      })
    } else {
      const XLSX = await import('xlsx')
      const buffer = await file.arrayBuffer()
      const workbook = XLSX.read(buffer, { type: 'array' })
      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      const data = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1, defval: '' })
      if (data.length > 0) {
        const cols = data[0].map((c) => String(c))
        store.attachData(cols, data.slice(1), file.name)
      }
    }
  } catch {
    // 解析失败静默处理
  }
}
</script>

<template>
  <div class="flex h-screen bg-gray-50">
    <!-- 侧边栏 -->
    <ConversationSidebar
      v-show="sidebarOpen"
      :conversations="store.sortedConversations"
      :active-id="store.activeId"
      @create="store.createConversation()"
      @switch="store.switchConversation($event)"
      @delete="store.deleteConversation($event)"
    />

    <!-- 主聊天区 -->
    <div class="flex flex-col flex-1 min-w-0">
      <!-- 顶栏 -->
      <header
        class="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200"
      >
        <div class="flex items-center gap-3">
          <button
            class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
            @click="sidebarOpen = !sidebarOpen"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div
            class="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"
          >
            <span class="text-white font-bold text-sm">AI</span>
          </div>
          <div>
            <h1 class="text-lg font-semibold text-gray-800">
              {{ store.activeConversation?.title ?? 'Vue AI Copilot' }}
            </h1>
            <p class="text-xs text-gray-400">在线</p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button
            class="px-3 py-1.5 text-sm font-medium rounded-lg bg-gradient-to-r from-pink-400 to-rose-500 text-white
                   hover:from-pink-500 hover:to-rose-600 active:scale-95 transition-all shadow-sm"
            @click="$emit('navigateOutfit')"
          >
            穿搭推荐
          </button>
          <button
            class="text-sm text-gray-400 hover:text-gray-600 transition-colors"
            :disabled="store.activeMessages.length === 0 && !store.loading && !store.pendingAttachment"
            @click="store.clearMessages"
          >
            清空对话
          </button>
        </div>
      </header>

      <!-- 文件拖拽上传区 -->
      <div class="px-4 pt-4 bg-gray-50">
        <div class="max-w-3xl mx-auto">
          <FileDropZone
            @attach="handleAttach"
            @clear="store.clearAttachment()"
          />
        </div>
      </div>

      <!-- 消息列表 -->
      <MessageList :messages="store.activeMessages" />

      <!-- 错误提示 -->
      <div
        v-if="store.error"
        class="px-6 py-2 bg-red-50 border-t border-red-100 text-sm text-red-600"
      >
        {{ store.error }}
        <button
          class="ml-2 underline hover:no-underline"
          @click="store.error = null"
        >
          关闭
        </button>
      </div>

      <!-- 输入框 -->
      <InputBox
        :loading="store.loading"
        :disabled="store.loading"
        @send="handleSend"
        @attach-file="handleAttachFile"
      />
    </div>
  </div>
</template>
