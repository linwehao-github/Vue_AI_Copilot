<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  loading: boolean
  disabled: boolean
}>()

const emit = defineEmits<{
  send: [content: string]
  attachFile: [file: File]
}>()

const input = ref('')
const fileInput = ref<HTMLInputElement | null>(null)

function handleSend() {
  const text = input.value.trim()
  if (!text) return
  emit('send', text)
  input.value = ''
}

function handleFileSelect(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    emit('attachFile', file)
  }
  target.value = ''
}
</script>

<template>
  <div class="border-t border-gray-200 bg-white px-4 py-4">
    <div class="max-w-3xl mx-auto flex items-end gap-3">
      <!-- 附件按钮 -->
      <input
        ref="fileInput"
        type="file"
        accept=".csv,.xlsx,.xls"
        class="hidden"
        @change="handleFileSelect"
      />
      <button
        class="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl
               text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors
               disabled:cursor-not-allowed disabled:opacity-40"
        :disabled="disabled"
        @click="fileInput?.click()"
        title="上传 CSV/Excel 文件"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
        </svg>
      </button>

      <textarea
        v-model="input"
        :disabled="disabled"
        class="flex-1 resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm
               focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent
               disabled:bg-gray-100 disabled:cursor-not-allowed
               placeholder-gray-400"
        :class="loading ? 'opacity-60' : ''"
        rows="1"
        placeholder="输入你的消息... (Shift+Enter 换行)"
        @keydown.enter.exact.prevent="handleSend"
      />

      <button
        class="flex-shrink-0 px-5 py-3 rounded-xl text-sm font-medium
               transition-colors duration-200 flex items-center gap-2"
        :class="
          loading || !input.trim()
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700'
        "
        :disabled="loading || !input.trim()"
        @click="handleSend"
      >
        <svg
          v-if="loading"
          class="animate-spin w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          />
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
        <span>{{ loading ? '思考中' : '发送' }}</span>
      </button>
    </div>
  </div>
</template>
