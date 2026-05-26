import { useState } from 'react'
import type { EmotionTag as EmotionTagType } from '../../shared/types'

const TAGS: { label: EmotionTagType; icon: string }[] = [
  { label: '后悔', icon: '😔' },
  { label: '焦虑', icon: '😰' },
  { label: '孤独', icon: '🫥' },
  { label: '愤怒', icon: '😤' },
  { label: '其他', icon: '😶' },
]

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
        {TAGS.map(({ label, icon }) => (
          <button
            key={label}
            className={`tag-item ripple ${selected.includes(label) ? 'selected' : ''}`}
            onClick={() => toggle(label)}
          >
            <span className="tag-icon">{icon}</span>
            <span className="tag-label">{label}</span>
          </button>
        ))}
      </div>
      <div className="button-group">
        <button
          className="primary-btn ripple"
          onClick={() => selected.length > 0 && onNext(selected)}
          disabled={selected.length === 0}
        >
          继续
        </button>
        <button className="secondary-btn ripple" onClick={() => onNext(['其他'])}>
          跳过
        </button>
      </div>
    </div>
  )
}

export default EmotionTag
