import { decomposePrompt, summaryPrompt } from './prompts'

interface AIResponse {
  success: boolean
  data?: string
  error?: string
}

function sendAIRequest(prompt: string, content: string): Promise<AIResponse> {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      { type: 'AI_REQUEST', payload: { prompt, content } },
      (response) => {
        if (chrome.runtime.lastError) {
          resolve({ success: false, error: chrome.runtime.lastError.message })
          return
        }
        resolve(response)
      }
    )
  })
}

export async function decomposeThoughts(content: string): Promise<string[]> {
  const response = await sendAIRequest(decomposePrompt, content)
  if (!response.success || !response.data) {
    throw new Error(response.error || '拆解失败')
  }
  return response.data
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
}

export async function generateSummary(
  content: string,
  decompose: string[],
  selectedDecompose: string,
  emotionTags: string[]
): Promise<string> {
  const context = [
    `原始想法：${content}`,
    `拆解结果：${decompose.join('；')}`,
    `选择面对：${selectedDecompose}`,
    `情绪标签：${emotionTags.join('、')}`,
  ].join('\n')

  const response = await sendAIRequest(summaryPrompt, context)
  if (!response.success || !response.data) {
    throw new Error(response.error || '生成总结失败')
  }
  return response.data
}
