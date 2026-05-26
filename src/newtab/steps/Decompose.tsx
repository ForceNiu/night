import { useState, useEffect } from 'react'
import { decomposeThoughts } from '../../shared/ai/client'
import ChatBubble from '../components/ChatBubble'

interface DecomposeProps {
  content: string
  onNext: (decompose: string[], selected: string) => void
}

function Decompose({ content, onNext }: DecomposeProps) {
  const [items, setItems] = useState<string[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    decomposeThoughts(content)
      .then(result => {
        setItems(result)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [content])

  if (loading) {
    return (
      <div className="step-container">
        <h2>帮你理一理</h2>
        <ChatBubble type="ai">
          正在拆解你的想法……
        </ChatBubble>
        <div className="loading-pulse">
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="step-container">
        <h2>帮你理一理</h2>
        <ChatBubble type="ai">
          AI 暂时无法响应，但没关系，你可以直接跳过这一步。
        </ChatBubble>
        <div className="button-group">
          <button className="secondary-btn ripple" onClick={() => onNext([], '')}>
            跳过拆解
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="step-container">
      <h2>帮你理一理</h2>
      <ChatBubble type="ai">
        你的想法里可能藏着这几个小问题，选一个你想面对的：
      </ChatBubble>
      <div className="decompose-list">
        {items.map((item, i) => (
          <button
            key={i}
            className={`decompose-item ripple ${selected === item ? 'selected' : ''}`}
            onClick={() => setSelected(item)}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="button-group">
        <button
          className="primary-btn ripple"
          onClick={() => selected && onNext(items, selected)}
          disabled={!selected}
        >
          面对这个
        </button>
        <button className="secondary-btn ripple" onClick={() => onNext(items, items[0] || '')}>
          跳过选择
        </button>
      </div>
    </div>
  )
}

export default Decompose
