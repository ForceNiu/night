import { useState, useEffect } from 'react'
import { getRecords } from '../shared/storage/records'
import type { Record as NightRecord, EmotionTag } from '../shared/types'

const EMOTION_ICONS: Record<EmotionTag, string> = {
  '后悔': '😔',
  '焦虑': '😰',
  '孤独': '🫥',
  '愤怒': '😤',
  '其他': '😶',
}

function formatDate(ts: number): string {
  const d = new Date(ts)
  const y = d.getFullYear()
  const m = d.getMonth() + 1
  const day = d.getDate()
  const hour = d.getHours().toString().padStart(2, '0')
  const min = d.getMinutes().toString().padStart(2, '0')
  return `${y}年${m}月${day}日 ${hour}:${min}`
}

function getEmotionCounts(records: NightRecord[]): Map<EmotionTag, number> {
  const counts = new Map<EmotionTag, number>()
  for (const r of records) {
    for (const tag of r.emotionTags) {
      counts.set(tag, (counts.get(tag) || 0) + 1)
    }
  }
  return counts
}

function App() {
  const [records, setRecords] = useState<NightRecord[]>([])

  useEffect(() => {
    getRecords(100).then(setRecords)
  }, [])

  const emotionCounts = getEmotionCounts(records)
  const sortedEmotions = [...emotionCounts.entries()].sort((a, b) => b[1] - a[1])

  return (
    <div className="history-page">
      <button className="back-btn ripple" onClick={() => window.close()}>
        返回
      </button>

      <div className="history-header">
        <h1>历史记录</h1>
        <p>你在这里留下过 {records.length} 个夜晚</p>
      </div>

      {records.length === 0 ? (
        <div className="empty-state">
          <p>还没有记录</p>
        </div>
      ) : (
        <>
          <div className="stats-bar">
            <div className="stat-item">
              <div className="stat-number">{records.length}</div>
              <div className="stat-label">总记录</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{emotionCounts.size}</div>
              <div className="stat-label">情绪类型</div>
            </div>
          </div>

          {sortedEmotions.length > 0 && (
            <div className="emotion-cloud">
              {sortedEmotions.map(([tag, count]) => (
                <span
                  key={tag}
                  className={`emotion-chip ${count >= 3 ? 'count-3' : count >= 2 ? 'count-2' : ''}`}
                >
                  <span className="emotion-icon">{EMOTION_ICONS[tag]}</span>
                  {tag} ×{count}
                </span>
              ))}
            </div>
          )}

          <div className="timeline">
            {records.map(record => (
              <div key={record.id} className="timeline-item">
                <div className="timeline-time">{formatDate(record.timestamp)}</div>
                <div className="timeline-content">
                  {record.content.length > 100
                    ? record.content.slice(0, 100) + '……'
                    : record.content}
                </div>
                {record.aiSummary && (
                  <div className="timeline-summary">{record.aiSummary}</div>
                )}
                {record.emotionTags.length > 0 && (
                  <div className="timeline-tags">
                    {record.emotionTags.map(tag => (
                      <span key={tag} className="timeline-tag">
                        <span className="tag-icon">{EMOTION_ICONS[tag]}</span>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default App
