export type EmotionTag = '后悔' | '焦虑' | '孤独' | '愤怒' | '其他'

export interface Record {
  id: string
  timestamp: number
  content: string
  decompose: string[]
  selectedDecompose: string
  emotionTags: EmotionTag[]
  aiSummary: string
  skipped: boolean
  triggerType: 'auto' | 'manual'
}

export interface AIConfig {
  baseUrl: string
  apiKey: string
  model: string
}
