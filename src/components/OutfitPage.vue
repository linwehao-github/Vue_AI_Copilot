<script setup lang="ts">
import { ref } from 'vue'
import type { OutfitFormData, GeneratedImage } from '@/types'
import { getOutfitRecommendations } from '@/services/outfit'
import { submitTask, pollTask } from '@/services/image'
import OutfitForm from './OutfitForm.vue'
import OutfitResult from './OutfitResult.vue'

defineEmits<{
  close: []
}>()

const loading = ref(false)
const error = ref<string | null>(null)
const results = ref<GeneratedImage[]>([])
const showResult = ref(false)

async function handleSubmit(formData: OutfitFormData) {
  loading.value = true
  error.value = null
  results.value = []
  showResult.value = true

  try {
    // Step 1: AI 生成穿搭推荐
    const recommendations = await getOutfitRecommendations(formData)

    // Step 2: 初始化结果卡片（全部 pending）
    results.value = recommendations.map((rec) => ({
      style_tag: rec.style_tag,
      description: rec.description,
      items: rec.items,
      image_prompt: rec.image_prompt,
      status: 'pending' as const,
    }))

    // Step 3: 逐个提交任务（间隔 2s 避免 429），然后并行轮询
    const taskIds: string[] = []
    for (const img of results.value) {
      img.status = 'generating'
      try {
        const taskId = await submitTask(img.image_prompt)
        taskIds.push(taskId)
      } catch (e) {
        img.status = 'error'
        img.error = e instanceof Error ? e.message : '提交失败'
      }
      if (taskIds.length < results.value.length) {
        await new Promise((r) => setTimeout(r, 2000))
      }
    }

    const polls = results.value.map(async (img, idx) => {
      const taskId = taskIds[idx]
      if (!taskId || img.status === 'error') return
      try {
        const url = await pollTask(taskId)
        img.image_url = url
        img.status = 'done'
      } catch (e) {
        img.status = 'error'
        img.error = e instanceof Error ? e.message : '图片生成失败'
      }
    })

    await Promise.allSettled(polls)
  } catch (e) {
    error.value = e instanceof Error ? e.message : '推荐生成失败，请重试'
  } finally {
    loading.value = false
  }
}

function handleRetry() {
  showResult.value = false
  results.value = []
  error.value = null
}

function handleBack() {
  showResult.value = false
  results.value = []
  error.value = null
}
</script>

<template>
  <div class="h-screen flex flex-col bg-gray-50">
    <!-- 顶栏 -->
    <header class="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 flex-shrink-0">
      <div class="flex items-center gap-3">
        <button
          class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
          @click="$emit('close')"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div class="w-9 h-9 rounded-lg bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </div>
        <div>
          <h1 class="text-lg font-semibold text-gray-800">AI 穿搭推荐</h1>
          <p class="text-xs text-gray-400">智能搭配 · AI 生图</p>
        </div>
      </div>
    </header>

    <!-- 内容区域 -->
    <main class="flex-1 overflow-y-auto py-8 px-4">
      <!-- 表单模式 -->
      <div v-if="!showResult">
        <div class="text-center mb-8">
          <h2 class="text-xl font-bold text-gray-800">打造你的专属穿搭</h2>
          <p class="text-sm text-gray-400 mt-1">填写信息，AI 为你智能推荐搭配并生成效果图</p>
        </div>
        <OutfitForm @submit="handleSubmit" />
      </div>

      <!-- 结果模式 -->
      <OutfitResult
        v-else
        :results="results"
        :loading="loading"
        :error="error"
        @retry="handleRetry"
        @back="handleBack"
      />
    </main>
  </div>
</template>
