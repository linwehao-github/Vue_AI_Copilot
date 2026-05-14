<script setup lang="ts">
import type { GeneratedImage } from '@/types'

defineProps<{
  results: GeneratedImage[]
  loading: boolean
  error: string | null
}>()

defineEmits<{
  retry: []
  back: []
}>()

function statusText(status: string): string {
  switch (status) {
    case 'pending': return '排队中...'
    case 'generating': return '正在生成效果图...'
    case 'done': return ''
    case 'error': return '生成失败'
    default: return ''
  }
}
</script>

<template>
  <div class="max-w-5xl mx-auto">
    <!-- 整体加载：等待 AI 分析 -->
    <div v-if="loading && results.length === 0" class="text-center py-16">
      <div class="inline-flex items-center gap-3 text-gray-500">
        <svg class="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span class="text-base">AI 正在分析您的需求，生成穿搭方案...</span>
      </div>
    </div>

    <!-- 错误状态 -->
    <div v-if="error" class="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
      <p class="text-red-600 text-sm mb-3">{{ error }}</p>
      <div class="flex gap-3 justify-center">
        <button
          class="px-4 py-2 rounded-lg bg-red-500 text-white text-sm hover:bg-red-600 transition-colors"
          @click="$emit('retry')"
        >
          重试
        </button>
        <button
          class="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm hover:bg-gray-50 transition-colors"
          @click="$emit('back')"
        >
          返回修改
        </button>
      </div>
    </div>

    <!-- 推荐结果卡片 -->
    <div
      v-if="results.length > 0"
      class="grid grid-cols-1 lg:grid-cols-2 gap-6"
    >
      <div
        v-for="(item, idx) in results"
        :key="idx"
        class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
      >
        <!-- 风格标签 -->
        <div class="px-5 py-3 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-100 flex items-center gap-2">
          <span class="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-500 text-white">
            {{ idx === 0 ? '主推' : `备选 ${idx}` }}
          </span>
          <span class="text-sm font-semibold text-gray-700">{{ item.style_tag }}</span>
        </div>

        <!-- 搭配解读 -->
        <div class="px-5 py-3 border-b border-gray-100">
          <p class="text-sm text-gray-600 leading-relaxed">{{ item.description }}</p>
        </div>

        <!-- 搭配明细表 -->
        <div class="px-5 py-3 border-b border-gray-100">
          <table class="w-full text-xs">
            <thead>
              <tr class="text-gray-400 border-b border-gray-100">
                <th class="text-left py-1.5 font-medium">类别</th>
                <th class="text-left py-1.5 font-medium">单品</th>
                <th class="text-left py-1.5 font-medium">理由</th>
                <th class="text-right py-1.5 font-medium">来源</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(it, i) in item.items" :key="i" class="border-b border-gray-50 last:border-0">
                <td class="py-1.5 text-gray-500">{{ it.category }}</td>
                <td class="py-1.5 text-gray-800 font-medium">{{ it.name }}</td>
                <td class="py-1.5 text-gray-400">{{ it.reason }}</td>
                <td class="py-1.5 text-right">
                  <span
                    class="text-xs px-1.5 py-0.5 rounded"
                    :class="it.source === '衣橱'
                      ? 'bg-green-50 text-green-600'
                      : 'bg-orange-50 text-orange-600'"
                  >
                    {{ it.source === '衣橱' ? '已有' : '购买' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 效果图区域 -->
        <div class="p-5">
          <div class="aspect-square rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden relative">
            <!-- 生成中 -->
            <div
              v-if="item.status === 'pending' || item.status === 'generating'"
              class="flex flex-col items-center gap-2 text-gray-400"
            >
              <svg class="w-8 h-8 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span class="text-sm">{{ statusText(item.status) }}</span>
            </div>

            <!-- 生成完成 -->
            <img
              v-else-if="item.status === 'done' && item.image_url"
              :src="item.image_url"
              :alt="item.style_tag"
              class="w-full h-full object-cover"
            />

            <!-- 生成失败 -->
            <div v-else-if="item.status === 'error'" class="text-center text-gray-400">
              <svg class="w-8 h-8 mx-auto mb-1 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span class="text-xs text-red-500">{{ item.error ?? '生成失败' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部操作 -->
    <div v-if="results.length > 0 && !loading" class="flex justify-center gap-3 mt-8">
      <button
        class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium
               hover:from-blue-600 hover:to-purple-700 active:scale-[0.99] transition-all shadow-md"
        @click="$emit('retry')"
      >
        🔄 换一批推荐
      </button>
      <button
        class="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-600 text-sm font-medium
               hover:bg-gray-50 active:scale-[0.99] transition-all"
        @click="$emit('back')"
      >
        返回修改
      </button>
    </div>
  </div>
</template>
