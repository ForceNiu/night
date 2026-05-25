import { useState } from 'react'
import GentleReminder from './steps/GentleReminder'

type Step = 'reminder' | 'write' | 'decompose' | 'emotion' | 'seal'

function App() {
  const [currentStep, setCurrentStep] = useState<Step>('reminder')

  const handleNext = () => {
    const steps: Step[] = ['reminder', 'write', 'decompose', 'emotion', 'seal']
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1])
    }
  }

  return (
    <div className="newtab-container">
      {currentStep === 'reminder' && <GentleReminder onNext={handleNext} />}
      {/* TODO: 其他步骤组件 */}
    </div>
  )
}

export default App
