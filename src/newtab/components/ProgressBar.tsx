interface ProgressBarProps {
  currentStep: number
  totalSteps: number
}

function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  const progress = (currentStep / totalSteps) * 100

  return (
    <div className="progress-bar-container">
      <div className="progress-bar">
        <div
          className="progress-bar-fill"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="progress-steps">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div
            key={i}
            className={`progress-step ${i < currentStep ? 'completed' : i === currentStep ? 'active' : ''}`}
          />
        ))}
      </div>
    </div>
  )
}

export default ProgressBar
