import type { Message } from '@/types'

interface SendMessageParams {
  messages: Message[]
  onToken?: (token: string) => void
  onDone?: (fullText: string) => void
  onError?: (err: Error) => void
}

/**
 * 通过 Vite proxy 调用阿里 DashScope 流式 API（OpenAI 兼容模式）
 */
export async function sendAiMessage(params: SendMessageParams): Promise<void> {
  const { messages, onToken, onDone, onError } = params

  // 拼装消息列表：前置系统提示词，强制中文回复
  const systemMsg = {
    role: 'system' as const,
    content: '你是一个有帮助的AI助手。请始终使用中文回答用户的问题，保持回答简洁准确。即使用户用其他语言提问，你也应该用中文回复。',
  }
  const bodyMessages = [
    systemMsg,
    ...messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  ]

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'qwen3-max',
        messages: bodyMessages,
        stream: true,
      }),
    })

    if (!response.ok) {
      const errText = await response.text().catch(() => '')
      throw new Error(`API 请求失败 (${response.status}): ${errText}`)
    }

    const reader = response.body!.getReader()
    const decoder = new TextDecoder()
    let fullText = ''
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })

      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || !trimmed.startsWith('data:')) continue

        const data = trimmed.slice(5).trim()
        if (data === '[DONE]') continue

        try {
          const parsed = JSON.parse(data)
          const token = parsed.choices?.[0]?.delta?.content
          if (token) {
            fullText += token
            onToken?.(token)
          }
        } catch {
          // 丢弃解析失败的残片
        }
      }
    }

    onDone?.(fullText)
  } catch (err) {
    onError?.(err instanceof Error ? err : new Error(String(err)))
  }
}
