import { useState, useEffect } from 'react'

function App() {
  const [lastRecord, setLastRecord] = useState<string | null>(null)

  useEffect(() => {
    // TODO: 从 IndexedDB 获取最近记录
    setLastRecord(null)
  }, [])

  return (
    <div className="popup-container">
      <h1>深夜树洞</h1>
      {lastRecord ? (
        <div className="last-record">
          <p>{lastRecord}</p>
        </div>
      ) : (
        <p className="warm-message">今晚还没有记录</p>
      )}
      <button className="history-link">查看历史</button>
    </div>
  )
}

export default App
