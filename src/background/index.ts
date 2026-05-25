// Background Service Worker

const GUARD_START_HOUR = 0
const GUARD_END_HOUR = 6
const REMINDER_DELAY_MINUTES = 30

function isGuardHour(): boolean {
  const hour = new Date().getHours()
  return hour >= GUARD_START_HOUR && hour < GUARD_END_HOUR
}

// ── 守护时段检测 ──────────────────────────────────────────────

chrome.alarms.create('check-guard-hour', { periodInMinutes: 1 })

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'check-guard-hour') {
    updateGuardState()
  }
  if (alarm.name === 'gentle-reminder') {
    showGentleReminder()
  }
})

let wasGuardHour = false

function updateGuardState() {
  const nowGuard = isGuardHour()

  // 刚进入守护时段
  if (nowGuard && !wasGuardHour) {
    chrome.action.setBadgeText({ text: ' ' })
    chrome.action.setBadgeBackgroundColor({ color: '#ef4444' })
    chrome.notifications.create('guard-enter', {
      type: 'basic',
      iconUrl: chrome.runtime.getURL('src/assets/icons/icon128.png'),
      title: '深夜树洞',
      message: '夜深了，如果心里有事，我在这里。',
      priority: 0,
    })
  }

  // 刚退出守护时段
  if (!nowGuard && wasGuardHour) {
    chrome.action.setBadgeText({ text: '' })
    chrome.alarms.clear('gentle-reminder')
  }

  wasGuardHour = nowGuard
}

// 启动时立即检查一次
updateGuardState()

// ── 30 分钟二次提醒 ─────────────────────────────────────────

function showGentleReminder() {
  if (!isGuardHour()) return

  chrome.notifications.create('gentle-reminder', {
    type: 'basic',
    iconUrl: chrome.runtime.getURL('src/assets/icons/icon128.png'),
    title: '深夜树洞',
    message: '已经过去一会儿了，感觉好一点了吗？',
    priority: 0,
  })
}

// ── 点击图标行为 ─────────────────────────────────────────────

chrome.action.onClicked.addListener(() => {
  if (isGuardHour()) {
    chrome.tabs.create({ url: 'src/newtab/index.html' })
    // 用户打开了干预页，启动 30 分钟提醒
    chrome.alarms.create('gentle-reminder', { delayInMinutes: REMINDER_DELAY_MINUTES })
  }
})

// ── 通知点击 ─────────────────────────────────────────────────

chrome.notifications.onClicked.addListener((notificationId) => {
  if (notificationId === 'guard-enter' || notificationId === 'gentle-reminder') {
    chrome.tabs.create({ url: 'src/newtab/index.html' })
    chrome.notifications.clear(notificationId)
  }
})

// ── 消息处理 ─────────────────────────────────────────────────

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
    handleAIRequest(message.payload)
      .then(result => sendResponse({ success: true, data: result }))
      .catch(error => sendResponse({ success: false, error: error.message }))
    return true
  }

  if (message.type === 'START_REMINDER') {
    // 前端通知：用户进入干预流程，启动 30 分钟提醒
    chrome.alarms.create('gentle-reminder', { delayInMinutes: REMINDER_DELAY_MINUTES })
    sendResponse({ success: true })
    return true
  }

  if (message.type === 'CANCEL_REMINDER') {
    // 前端通知：用户完成流程，取消提醒
    chrome.alarms.clear('gentle-reminder')
    sendResponse({ success: true })
    return true
  }
})

// ── AI 请求代理 ──────────────────────────────────────────────

async function getAIConfig() {
  // 1. Try user-saved config
  const saved = await new Promise<any>((resolve) => {
    chrome.storage.local.get(['aiConfig'], (result) => {
      resolve(result.aiConfig)
    })
  })
  if (saved?.apiKey) return saved

  // 2. Try dev env config (development only)
  try {
    const { getDevConfig } = await import('../shared/ai/dev-config')
    const devConfig = getDevConfig()
    if (devConfig?.apiKey) return devConfig
  } catch {}

  return null
}

async function handleAIRequest(payload: { prompt: string; content: string }) {
  const config = await getAIConfig()

  if (!config?.apiKey) {
    throw new Error('API Key 未配置，请在设置中配置或添加 .env 文件')
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
