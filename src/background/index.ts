// Background Service Worker

// 守护时段：00:00 - 06:00
const GUARD_START_HOUR = 0
const GUARD_END_HOUR = 6

function isGuardHour(): boolean {
  const hour = new Date().getHours()
  return hour >= GUARD_START_HOUR && hour < GUARD_END_HOUR
}

// 检查是否在守护时段
chrome.alarms.create('check-guard-hour', { periodInMinutes: 30 })

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'check-guard-hour') {
    if (isGuardHour()) {
      // 设置图标为活跃状态
      chrome.action.setBadgeText({ text: ' ' })
      chrome.action.setBadgeBackgroundColor({ color: '#ef4444' })
    } else {
      // 清除 badge
      chrome.action.setBadgeText({ text: '' })
    }
  }
})

// 点击图标时的行为
chrome.action.onClicked.addListener(() => {
  if (isGuardHour()) {
    // 在守护时段，打开干预页面
    chrome.tabs.create({ url: 'src/newtab/index.html' })
  }
  // 非守护时段，popup 会自动弹出
})

// 消息处理：来自 popup/newtab 的请求
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'GET_AI_CONFIG') {
    chrome.storage.local.get(['aiConfig'], (result) => {
      sendResponse(result.aiConfig || null)
    })
    return true
  }

  if (message.type === 'SAVE_AI_CONFIG') {
    chrome.storage.local.set({ aiConfig: message.config }, () => {
      sendResponse({ success: true })
    })
    return true
  }

  if (message.type === 'AI_REQUEST') {
    // 代理 AI API 请求
    handleAIRequest(message.payload)
      .then(result => sendResponse({ success: true, data: result }))
      .catch(error => sendResponse({ success: false, error: error.message }))
    return true
  }
})

async function handleAIRequest(payload: { prompt: string; content: string }) {
  const config = await new Promise<any>((resolve) => {
    chrome.storage.local.get(['aiConfig'], (result) => {
      resolve(result.aiConfig)
    })
  })

  if (!config?.apiKey) {
    throw new Error('API Key 未配置')
  }

  const response = await fetch(`${config.baseUrl}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model || 'deepseek-chat',
      messages: [
        { role: 'system', content: payload.prompt },
        { role: 'user', content: payload.content },
      ],
      temperature: 0.7,
      max_tokens: 500,
    }),
  })

  if (!response.ok) {
    throw new Error(`API 请求失败: ${response.status}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}
