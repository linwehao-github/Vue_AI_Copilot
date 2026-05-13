<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  loading: boolean
  disabled: boolean
}>()

const emit = defineEmits<{
  send: [content: string]
}>()

const input = ref('')

function handleSend() {
  const text = input.value.trim()
  if (!text) return
  emit('send', text)
  input.value = ''
}
</script>

<template>
  <div class="border-t border-gray-200 bg-white px-4 py-4">
    <div class="max-w-3xl mx-auto flex items-end gap-3">
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
        <!-- Loading 旋转图标 -->
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
