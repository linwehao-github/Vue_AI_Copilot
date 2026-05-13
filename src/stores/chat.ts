import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Message, Conversation, PendingAttachment, AttachedData } from '@/types'
import { sendAiMessage } from '@/services/ai'

const STORAGE_KEY = 'vue-ai-copilot-conversations'
const MAX_DATA_ROWS = 50 // 发送给 AI 的最大行数
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_ROW_COUNT = 10_000 // 预览最大行数

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

function loadFromStorage(): Conversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const data = JSON.parse(raw)
    if (!Array.isArray(data)) return []
    return data
  } catch {
    return []
  }
}

function saveToStorage(conversations: Conversation[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations))
  } catch {
    // localStorage 满或不可用时静默忽略
  }
}

/** 将表格数据格式化为 Markdown 表格文本 */
function formatDataToMarkdown(columns: string[], rows: string[][]): string {
  const header = '| ' + columns.join(' | ') + ' |'
  const sep = '| ' + columns.map(() => '---').join(' | ') + ' |'
  const body = rows.slice(0, MAX_DATA_ROWS).map((row) => {
    const cells = row.map((cell) => String(cell).replace(/\|/g, '\\|').replace(/\n/g, ' '))
    while (cells.length < columns.length) cells.push('')
    return '| ' + cells.slice(0, columns.length).join(' | ') + ' |'
  })
  return [header, sep, ...body].join('\n')
}

export const useChatStore = defineStore('chat', () => {
  // --- 状态 ---
  const conversations = ref<Conversation[]>(loadFromStorage())
  const activeId = ref<string | null>(conversations.value[0]?.id ?? null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const pendingAttachment = ref<PendingAttachment | null>(null)

  // 初始化：无对话时创建一条默认空对话
  if (conversations.value.length === 0) {
    const c: Conversation = {
      id: genId(),
      title: '新对话',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    conversations.value.push(c)
    activeId.value = c.id
    saveToStorage(conversations.value)
  }

  // --- 计算属性 ---
  const activeConversation = computed(() =>
    conversations.value.find((c) => c.id === activeId.value),
  )

  const activeMessages = computed(() => activeConversation.value?.messages ?? [])

  const sortedConversations = computed(() =>
    [...conversations.value].sort((a, b) => b.updatedAt - a.updatedAt),
  )

  // --- 操作 ---
  function createConversation() {
    const c: Conversation = {
      id: genId(),
      title: '新对话',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    conversations.value.push(c)
    activeId.value = c.id
    pendingAttachment.value = null
    saveToStorage(conversations.value)
  }

  function switchConversation(id: string) {
    if (conversations.value.some((c) => c.id === id)) {
      activeId.value = id
    }
  }

  function deleteConversation(id: string) {
    const idx = conversations.value.findIndex((c) => c.id === id)
    if (idx === -1) return

    conversations.value.splice(idx, 1)

    if (activeId.value === id) {
      if (conversations.value.length > 0) {
        activeId.value = conversations.value[0].id
      } else {
        createConversation()
        return
      }
    }

    saveToStorage(conversations.value)
  }

  function sendMessage(content: string) {
    const conv = activeConversation.value
    if (!conv || !content.trim() || loading.value) return

    error.value = null

    // 组装完整消息内容（有附件时前置 Markdown 表格）
    let fullContent = content.trim()
    const attachment = pendingAttachment.value
    let msgData: AttachedData | undefined

    if (attachment) {
      const table = formatDataToMarkdown(attachment.columns, attachment.rows)
      fullContent = `以下是我上传的表格数据 "${attachment.fileName}"（共 ${attachment.rowCount} 行）：\n\n${table}\n\n---\n\n${fullContent}`
      msgData = {
        columns: attachment.columns,
        rows: attachment.rows.slice(0, MAX_ROW_COUNT),
        fileName: attachment.fileName,
        rowCount: attachment.rowCount,
      }
      pendingAttachment.value = null
    }

    const userMsg: Message = {
      id: genId(),
      role: 'user',
      content: fullContent,
      createdAt: Date.now(),
      data: msgData,
    }
    conv.messages.push(userMsg)

    // 首条用户消息作为对话标题
    if (conv.messages.filter((m) => m.role === 'user').length === 1) {
      conv.title = content.trim().slice(0, 30) + (content.trim().length > 30 ? '...' : '')
    }

    const aiMsg: Message = {
      id: genId(),
      role: 'assistant',
      content: '',
      createdAt: Date.now(),
    }
    conv.messages.push(aiMsg)
    conv.updatedAt = Date.now()
    const aiIdx = conv.messages.length - 1
    loading.value = true
    saveToStorage(conversations.value)

    sendAiMessage({
      messages: conv.messages,
      onToken(token: string) {
        conv.messages[aiIdx].content += token
      },
      onDone() {
        conv.updatedAt = Date.now()
        loading.value = false
        saveToStorage(conversations.value)
      },
      onError(err: Error) {
        error.value = err.message
        loading.value = false
        saveToStorage(conversations.value)
      },
    })
  }

  function clearMessages() {
    const conv = activeConversation.value
    if (!conv) return
    conv.messages = []
    conv.title = '新对话'
    conv.updatedAt = Date.now()
    error.value = null
    pendingAttachment.value = null
    saveToStorage(conversations.value)
  }

  function attachData(columns: string[], rows: string[][], fileName: string, totalRowCount?: number) {
    const rowCount = totalRowCount ?? rows.length
    if (rows.length > MAX_ROW_COUNT) {
      rows = rows.slice(0, MAX_ROW_COUNT)
    }
    pendingAttachment.value = { columns, rows, fileName, rowCount }
  }

  function clearAttachment() {
    pendingAttachment.value = null
  }

  return {
    conversations,
    activeId,
    loading,
    error,
    pendingAttachment,
    activeConversation,
    activeMessages,
    sortedConversations,
    createConversation,
    switchConversation,
    deleteConversation,
    sendMessage,
    clearMessages,
    attachData,
    clearAttachment,
    MAX_FILE_SIZE,
  }
})
