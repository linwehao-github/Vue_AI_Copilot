<script setup lang="ts">
import type { AttachedData } from '@/types'

defineProps<{
  data: AttachedData
}>()

const MAX_PREVIEW = 100
</script>

<template>
  <div class="mt-2 border border-gray-200 rounded-lg overflow-hidden">
    <div class="bg-gray-50 px-3 py-2 text-xs text-gray-500 flex items-center justify-between">
      <span>表格预览: <strong>{{ data.fileName }}</strong></span>
      <span>{{ data.rowCount }} 行 × {{ data.columns.length }} 列
        <span v-if="data.rowCount > MAX_PREVIEW" class="text-gray-400">
          （仅显示前 {{ MAX_PREVIEW }} 行）
        </span>
      </span>
    </div>
    <div class="overflow-auto max-h-64">
      <table class="w-full text-xs border-collapse">
        <thead class="bg-gray-100 sticky top-0">
          <tr>
            <th class="px-2 py-1.5 text-left text-gray-400 font-normal border-b border-gray-200 w-8">#</th>
            <th
              v-for="col in data.columns"
              :key="col"
              class="px-3 py-1.5 text-left font-medium text-gray-600 border-b border-gray-200 whitespace-nowrap"
            >
              {{ col }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, ri) in data.rows.slice(0, MAX_PREVIEW)"
            :key="ri"
            class="hover:bg-gray-50"
          >
            <td class="px-2 py-1 text-gray-300 border-b border-gray-100">{{ ri + 1 }}</td>
            <td
              v-for="(cell, ci) in row.slice(0, data.columns.length)"
              :key="ci"
              class="px-3 py-1 text-gray-700 border-b border-gray-100 whitespace-nowrap max-w-48 truncate"
            >
              {{ cell }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
