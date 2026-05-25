import { useState, useEffect } from 'react'

interface GentleReminderProps {
  onNext: () => void
}

function GentleReminder({ onNext }: GentleReminderProps) {
  const [showContinue, setShowContinue] = useState(false)
  const [countdown, setCountdown] = useState(10)

  const handleContinueAnyway = () => {
    setShowContinue(true)
  }

  useEffect(() => {
    if (!showContinue) return
    if (countdown <= 0) return

    const timer = setInterval(() => {
      setCountdown(prev => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [showContinue, countdown])

  if (showContinue) {
    return (
      <div className="step-container">
        <p className="warm-text">深呼吸，慢慢来</p>
        {countdown > 0 ? (
          <p className="countdown">{countdown}</p>
        ) : (
          <button className="continue-btn" onClick={onNext}>
            继续浏览
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="step-container">
      <h2>夜深了</h2>
      <p className="warm-text">
        你现在的情绪可能在放大很多事。<br />
        深呼吸，先停一下。
      </p>
      <div className="button-group">
        <button className="primary-btn" onClick={onNext}>
          我想说说
        </button>
        <button className="secondary-btn" onClick={handleContinueAnyway}>
          我还是要继续
        </button>
      </div>
    </div>
  )
}

export default GentleReminder
