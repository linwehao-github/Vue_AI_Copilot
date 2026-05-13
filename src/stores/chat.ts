import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Message, Conversation } from '@/types'
import { sendAiMessage } from '@/services/ai'

const STORAGE_KEY = 'vue-ai-copilot-conversations'

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

export const useChatStore = defineStore('chat', () => {
  // --- 状态 ---
  const conversations = ref<Conversation[]>(loadFromStorage())
  const activeId = ref<string | null>(conversations.value[0]?.id ?? null)
  const loading = ref(false)
  const error = ref<string | null>(null)

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
      // 删的是当前对话：切换到第一个，无则新建
      if (conversations.value.length > 0) {
        activeId.value = conversations.value[0].id
      } else {
        createConversation()
        return // createConversation 已保存
      }
    }

    saveToStorage(conversations.value)
  }

  function sendMessage(content: string) {
    const conv = activeConversation.value
    if (!conv || !content.trim() || loading.value) return

    error.value = null

    const userMsg: Message = {
      id: genId(),
      role: 'user',
      content: content.trim(),
      createdAt: Date.now(),
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
    saveToStorage(conversations.value)
  }

  return {
    conversations,
    activeId,
    loading,
    error,
    activeConversation,
    activeMessages,
    sortedConversations,
    createConversation,
    switchConversation,
    deleteConversation,
    sendMessage,
    clearMessages,
  }
})
