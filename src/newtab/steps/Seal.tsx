import { useState, useEffect } from 'react'
import { generateSummary } from '../../shared/ai/client'
import { addRecord } from '../../shared/storage/records'
import type { EmotionTag } from '../../shared/types'

interface SealProps {
  content: string
  decompose: string[]
  selectedDecompose: string
  emotionTags: EmotionTag[]
  onDone: () => void
}

function Seal({ content, decompose, selectedDecompose, emotionTags, onDone }: SealProps) {
  const [summary, setSummary] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    generateSummary(content, decompose, selectedDecompose, emotionTags)
      .then(result => {
        setSummary(result)
        setLoading(false)
      })
      .catch(() => {
        setSummary('你今晚勇敢地面对了自己的情绪。')
        setLoading(false)
      })
  }, [content, decompose, selectedDecompose, emotionTags])

  const handleSeal = async () => {
    await addRecord({
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      content,
      decompose,
      selectedDecompose,
      emotionTags,
      aiSummary: summary || '',
      skipped: false,
      triggerType: 'manual',
    })
    setSaved(true)
    // 通知 background 取消 30 分钟提醒
    chrome.runtime.sendMessage({ type: 'CANCEL_REMINDER' })
  }

  if (saved) {
    return (
      <div className="step-container">
        <h2>已封存</h2>
        <p className="warm-text">
          今晚的事，留在这里就好。<br />
          好好休息。
        </p>
        <div className="button-group">
          <button className="primary-btn" onClick={onDone}>
            关闭
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="step-container">
      <h2>封存今晚</h2>
      {loading ? (
        <p className="warm-text">正在为你写下总结……</p>
      ) : (
        <div className="summary-card">
          <p>{summary}</p>
        </div>
      )}
      <div className="button-group">
        <button className="primary-btn" onClick={handleSeal} disabled={loading}>
          封存
        </button>
        <button className="secondary-btn" onClick={onDone}>
          不保存，直接离开
        </button>
      </div>
    </div>
  )
}

export default Seal
