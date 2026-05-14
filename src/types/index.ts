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

// --- 穿搭推荐 ---

export interface OutfitProfile {
  gender: string
  age: number | null
  height_cm: number | null
  weight_kg: number | null
  body_type: string
}

export interface OutfitScene {
  occasion: string
  city: string
  weather: string
  temp_high: number | null
  temp_low: number | null
  season: string
}

export interface OutfitWardrobe {
  tops: string
  bottoms: string
  dresses: string
  outerwear: string
  shoes: string
  accessories: string
  favorite_colors: string
  avoid_colors: string
  favorite_styles: string
  budget_level: string
}

export interface OutfitFormData {
  profile: OutfitProfile
  scene: OutfitScene
  wardrobe: OutfitWardrobe
  custom_requirements: string
}

export interface OutfitItem {
  category: string
  name: string
  source: string
  reason: string
}

export interface OutfitRecommendation {
  style_tag: string
  description: string
  items: OutfitItem[]
  image_prompt: string
}

export interface GeneratedImage {
  style_tag: string
  description: string
  items: OutfitItem[]
  image_prompt: string
  status: 'pending' | 'generating' | 'done' | 'error'
  image_url?: string
  error?: string
}
