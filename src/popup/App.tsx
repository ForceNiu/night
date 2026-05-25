import { useState, useEffect } from 'react'
import { getRecentRecord, getRecordCount } from '../shared/storage/records'
import type { AIConfig } from '../shared/types'

const WARM_MESSAGES = [
  '夜深了，照顾好自己。',
  '如果心里有事，可以跟我说。',
  '今天辛苦了。',
  '不用急，慢慢来。',
  '你的感受是真实的。',
]

function getRandomWarm(): string {
  return WARM_MESSAGES[Math.floor(Math.random() * WARM_MESSAGES.length)]
}

function formatTime(ts: number): string {
  const d = new Date(ts)
  const month = d.getMonth() + 1
  const day = d.getDate()
  const hour = d.getHours().toString().padStart(2, '0')
  const min = d.getMinutes().toString().padStart(2, '0')
  return `${month}月${day}日 ${hour}:${min}`
}

function App() {
  const [recentContent, setRecentContent] = useState<string | null>(null)
  const [recentTime, setRecentTime] = useState<string | null>(null)
  const [recordCount, setRecordCount] = useState(0)
  const [warm] = useState(getRandomWarm)
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [baseUrl, setBaseUrl] = useState('https://api.deepseek.com')
  const [model, setModel] = useState('deepseek-chat')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getRecentRecord().then(record => {
      if (record) {
        setRecentContent(record.aiSummary || record.content.slice(0, 60))
        setRecentTime(formatTime(record.timestamp))
      }
    })
    getRecordCount().then(setRecordCount)

    chrome.runtime.sendMessage({ type: 'GET_AI_CONFIG' }, (config: AIConfig | null) => {
      if (config?.apiKey) {
        setHasApiKey(true)
        setBaseUrl(config.baseUrl)
        setModel(config.model)
      } else {
        setHasApiKey(false)
        setShowSettings(true)
      }
    })
  }, [])

  const handleSave = () => {
    if (!apiKey.trim()) return
    setSaving(true)
    chrome.runtime.sendMessage(
      {
        type: 'SAVE_AI_CONFIG',
        config: { baseUrl, apiKey: apiKey.trim(), model },
      },
      () => {
        setSaving(false)
        setHasApiKey(true)
        setShowSettings(false)
      }
    )
  }

  const handleOpenTree = () => {
    chrome.tabs.create({ url: 'src/newtab/index.html' })
  }

  const handleOpenHistory = () => {
    chrome.tabs.create({ url: 'src/history/index.html' })
  }

  // 首次使用引导
  if (showSettings && !hasApiKey) {
    return (
      <div className="popup-container">
        <h1>深夜树洞</h1>
        <p className="warm-message">欢迎。先做一点小配置。</p>

        <div className="setup-card">
          <p className="setup-privacy">
            你的所有数据都保存在本地浏览器中，不会上传到任何服务器。
            AI 调用通过你自己的 API Key 直连服务商。
          </p>

          <div className="form-group">
            <label>API Key</label>
            <input
              type="password"
              placeholder="sk-..."
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>API 地址</label>
            <input
              type="text"
              value={baseUrl}
              onChange={e => setBaseUrl(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>模型</label>
            <input
              type="text"
              value={model}
              onChange={e => setModel(e.target.value)}
            />
          </div>

          <button
            className="primary-action"
            onClick={handleSave}
            disabled={!apiKey.trim() || saving}
          >
            {saving ? '保存中...' : '开始使用'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="popup-container">
      <h1>深夜树洞</h1>
      <p className="warm-message">{warm}</p>

      {recentContent ? (
        <div className="last-record">
          <p className="record-time">{recentTime}</p>
          <p className="record-text">{recentContent}</p>
        </div>
      ) : (
        <p className="no-record">还没有记录</p>
      )}

      <div className="popup-actions">
        <button className="primary-action" onClick={handleOpenTree}>
          打开树洞
        </button>
        {recordCount > 0 && (
          <button className="history-link" onClick={handleOpenHistory}>
            查看历史 ({recordCount})
          </button>
        )}
        <button className="settings-btn" onClick={() => setShowSettings(!showSettings)}>
          设置
        </button>
      </div>

      {showSettings && (
        <div className="settings-section">
          <div className="form-group">
            <label>API Key</label>
            <input
              type="password"
              placeholder="sk-..."
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>API 地址</label>
            <input
              type="text"
              value={baseUrl}
              onChange={e => setBaseUrl(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>模型</label>
            <input
              type="text"
              value={model}
              onChange={e => setModel(e.target.value)}
            />
          </div>
          <button
            className="primary-action"
            onClick={handleSave}
            disabled={!apiKey.trim() || saving}
          >
            {saving ? '保存中...' : '保存'}
          </button>
        </div>
      )}
    </div>
  )
}

export default App
