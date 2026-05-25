import { useState } from 'react'
import type { EmotionTag as EmotionTagType } from '../../shared/types'

const TAGS: EmotionTagType[] = ['后悔', '焦虑', '孤独', '愤怒', '其他']

interface EmotionTagProps {
  onNext: (tags: EmotionTagType[]) => void
}

function EmotionTag({ onNext }: EmotionTagProps) {
  const [selected, setSelected] = useState<EmotionTagType[]>([])

  const toggle = (tag: EmotionTagType) => {
    setSelected(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  return (
    <div className="step-container">
      <h2>给情绪一个名字</h2>
      <p className="warm-text">选一个或几个最接近的标签：</p>
      <div className="tag-list">
        {TAGS.map(tag => (
          <button
            key={tag}
            className={`tag-item ${selected.includes(tag) ? 'selected' : ''}`}
            onClick={() => toggle(tag)}
          >
            {tag}
          </button>
        ))}
      </div>
      <div className="button-group">
        <button
          className="primary-btn"
          onClick={() => selected.length > 0 && onNext(selected)}
          disabled={selected.length === 0}
        >
          继续
        </button>
        <button className="secondary-btn" onClick={() => onNext(['其他'])}>
          跳过
        </button>
      </div>
    </div>
  )
}

export default EmotionTag
