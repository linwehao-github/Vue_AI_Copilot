export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: number
  data?: AttachedData
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: number
  updatedAt: number
}

export interface AttachedData {
  columns: string[]
  rows: string[][]
  fileName: string
  rowCount: number
}

export interface PendingAttachment {
  columns: string[]
  rows: string[][]
  fileName: string
  rowCount: number
}
