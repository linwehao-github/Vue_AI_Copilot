<script setup lang="ts">
import { ref } from 'vue'

type FileStatus = 'idle' | 'drag' | 'parsing' | 'done' | 'error'

const emit = defineEmits<{
  attach: [columns: string[], rows: string[][], fileName: string]
  clear: []
}>()

const status = ref<FileStatus>('idle')
const fileName = ref('')
const rowCount = ref(0)
const colCount = ref(0)
const errorMsg = ref('')
const fileInput = ref<HTMLInputElement | null>(null)

const ACCEPTED_TYPES = '.csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel'

function handleDragOver(e: DragEvent) {
  e.preventDefault()
  status.value = 'drag'
}

function handleDragLeave() {
  status.value = 'idle'
}

async function handleDrop(e: DragEvent) {
  e.preventDefault()
  status.value = 'idle'
  const file = e.dataTransfer?.files?.[0]
  if (file) await parseFile(file)
}

function handleFileSelect(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) parseFile(file)
  target.value = ''
}

function triggerFileInput() {
  fileInput.value?.click()
}

async function parseFile(file: File) {
  const ext = file.name.split('.').pop()?.toLowerCase()
  if (!ext || !['csv', 'xlsx', 'xls'].includes(ext)) {
    errorMsg.value = '不支持的文件格式，请上传 CSV 或 Excel 文件'
    status.value = 'error'
    return
  }

  status.value = 'parsing'

  try {
    if (ext === 'csv') {
      await parseCSV(file)
    } else {
      await parseExcel(file)
    }
  } catch (err) {
    errorMsg.value = `文件解析失败: ${err instanceof Error ? err.message : '未知错误'}`
    status.value = 'error'
  }
}

async function parseCSV(file: File) {
  const Papa = (await import('papaparse')).default
  const text = await file.text()

  Papa.parse(text, {
    header: false,
    skipEmptyLines: true,
    complete(results) {
      const data = results.data as string[][]
      if (data.length === 0) {
        errorMsg.value = 'CSV 文件为空'
        status.value = 'error'
        return
      }
      const columns = data[0].map((c) => String(c))
      const rows = data.slice(1)
      emitAttach(columns, rows, file.name)
    },
    error(err: Error) {
      errorMsg.value = `CSV 解析错误: ${err.message}`
      status.value = 'error'
    },
  })
}

async function parseExcel(file: File) {
  const XLSX = await import('xlsx')
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array' })
  const sheetName = workbook.SheetNames[0]
  if (!sheetName) {
    errorMsg.value = 'Excel 文件没有工作表'
    status.value = 'error'
    return
  }
  const sheet = workbook.Sheets[sheetName]
  const data = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1, defval: '' })
  if (data.length === 0) {
    errorMsg.value = 'Excel 工作表为空'
    status.value = 'error'
    return
  }
  const columns = data[0].map((c) => String(c))
  const rows = data.slice(1)
  emitAttach(columns, rows, file.name)
}

function emitAttach(columns: string[], rows: string[][], name: string) {
  fileName.value = name
  colCount.value = columns.length
  rowCount.value = rows.length
  status.value = 'done'
  errorMsg.value = ''
  emit('attach', columns, rows, name)
}

function handleClear() {
  status.value = 'idle'
  fileName.value = ''
  rowCount.value = 0
  colCount.value = 0
  emit('clear')
}
</script>

<template>
  <div>
    <input
      ref="fileInput"
      type="file"
      :accept="ACCEPTED_TYPES"
      class="hidden"
      @change="handleFileSelect"
    />

    <!-- 已解析状态 -->
    <div
      v-if="status === 'done'"
      class="flex items-center gap-3 px-4 py-2.5 bg-blue-50 border border-blue-200 rounded-xl text-sm"
    >
      <svg class="w-5 h-5 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <span class="text-blue-700 font-medium truncate">{{ fileName }}</span>
      <span class="text-blue-400">{{ colCount }} 列 · {{ rowCount }} 行</span>
      <button
        class="ml-auto text-blue-400 hover:text-red-500 transition-colors flex-shrink-0"
        @click="handleClear"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- 拖拽区域（未上传时） -->
    <div
      v-else
      class="border-2 border-dashed rounded-xl px-4 py-4 text-center text-sm transition-colors cursor-pointer"
      :class="status === 'drag'
        ? 'border-blue-400 bg-blue-50'
        : status === 'parsing'
          ? 'border-gray-300 bg-gray-50 cursor-wait'
          : status === 'error'
            ? 'border-red-300 bg-red-50'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
      @click="triggerFileInput"
    >
      <template v-if="status === 'parsing'">
        <svg class="w-5 h-5 mx-auto mb-1 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span class="text-gray-400">正在解析...</span>
      </template>
      <template v-else-if="status === 'error'">
        <span class="text-red-500">{{ errorMsg }}</span>
        <span class="text-gray-400 ml-2">点击重试</span>
      </template>
      <template v-else>
        <span class="text-gray-500">拖拽 CSV/Excel 文件到此处，或<span class="text-blue-500 mx-0.5">点击上传</span></span>
      </template>
    </div>
  </div>
</template>
