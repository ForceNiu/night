import { useState } from 'react'

interface WriteThoughtsProps {
  onNext: (content: string) => void
}

function WriteThoughts({ onNext }: WriteThoughtsProps) {
  const [content, setContent] = useState('')

  const handleSubmit = () => {
    if (content.trim()) {
      onNext(content.trim())
    }
  }

  return (
    <div className="step-container">
      <h2>写下此刻的想法</h2>
      <p className="warm-text">
        不用整理，不用逻辑，想到什么写什么。
      </p>
      <textarea
        className="thought-input"
        placeholder="此刻让你难受的是什么……"
        value={content}
        onChange={e => setContent(e.target.value)}
        autoFocus
      />
      <div className="button-group">
        <button
          className="primary-btn ripple"
          onClick={handleSubmit}
          disabled={!content.trim()}
        >
          写好了
        </button>
      </div>
    </div>
  )
}

export default WriteThoughts
