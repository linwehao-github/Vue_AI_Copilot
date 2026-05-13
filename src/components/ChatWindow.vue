<script setup lang="ts">
import { ref } from 'vue'
import { useChatStore } from '@/stores/chat'
import ConversationSidebar from './ConversationSidebar.vue'
import MessageList from './MessageList.vue'
import InputBox from './InputBox.vue'

const store = useChatStore()
const sidebarOpen = ref(true)

function handleSend(content: string) {
  store.sendMessage(content)
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
          <!-- 侧边栏切换按钮 -->
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

        <button
          class="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          :disabled="store.activeMessages.length === 0 && !store.loading"
          @click="store.clearMessages"
        >
          清空对话
        </button>
      </header>

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
      />
    </div>
  </div>
</template>
