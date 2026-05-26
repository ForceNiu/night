import { useState, useEffect } from 'react'
import { generateSummary } from '../../shared/ai/client'
import { addRecord } from '../../shared/storage/records'
import type { EmotionTag } from '../../shared/types'
import ChatBubble from '../components/ChatBubble'

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
    chrome.runtime.sendMessage({ type: 'CANCEL_REMINDER' })
  }

  if (saved) {
    return (
      <div className="step-container">
        <h2>已封存</h2>
        <ChatBubble type="ai">
          今晚的事，留在这里就好。好好休息。
        </ChatBubble>
        <div className="button-group">
          <button className="primary-btn ripple" onClick={onDone}>
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
        <>
          <ChatBubble type="ai">
            正在为你写下总结……
          </ChatBubble>
          <div className="loading-pulse">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
        </>
      ) : (
        <ChatBubble type="ai">
          {summary}
        </ChatBubble>
      )}
      <div className="button-group">
        <button className="primary-btn ripple" onClick={handleSeal} disabled={loading}>
          封存
        </button>
        <button className="secondary-btn ripple" onClick={onDone}>
          不保存，直接离开
        </button>
      </div>
    </div>
  )
}

export default Seal
