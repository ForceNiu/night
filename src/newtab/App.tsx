import { useState } from 'react'
import GentleReminder from './steps/GentleReminder'
import WriteThoughts from './steps/WriteThoughts'
import Decompose from './steps/Decompose'
import EmotionTag from './steps/EmotionTag'
import Seal from './steps/Seal'
import ProgressBar from './components/ProgressBar'
import type { EmotionTag as EmotionTagType } from '../shared/types'

type Step = 'reminder' | 'write' | 'decompose' | 'emotion' | 'seal' | 'done'

const STEP_ORDER: Step[] = ['reminder', 'write', 'decompose', 'emotion', 'seal']

interface FlowState {
  content: string
  decompose: string[]
  selectedDecompose: string
  emotionTags: EmotionTagType[]
}

function App() {
  const [flow, setFlow] = useState<FlowState>({
    content: '',
    decompose: [],
    selectedDecompose: '',
    emotionTags: [],
  })
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [displayStep, setDisplayStep] = useState<Step>('reminder')

  const currentStepIndex = STEP_ORDER.indexOf(displayStep)
  const showProgress = displayStep !== 'done'

  const transitionToStep = (nextStep: Step) => {
    setIsTransitioning(true)
    setTimeout(() => {
      setDisplayStep(nextStep)
      setIsTransitioning(false)
    }, 300)
  }

  const handleWriteDone = (content: string) => {
    setFlow(prev => ({ ...prev, content }))
    transitionToStep('decompose')
    chrome.runtime.sendMessage({ type: 'START_REMINDER' })
  }

  const handleDecomposeDone = (decompose: string[], selected: string) => {
    setFlow(prev => ({ ...prev, decompose, selectedDecompose: selected }))
    transitionToStep('emotion')
  }

  const handleEmotionDone = (tags: EmotionTagType[]) => {
    setFlow(prev => ({ ...prev, emotionTags: tags }))
    transitionToStep('seal')
  }

  const handleDone = () => {
    transitionToStep('done')
  }

  const renderStep = () => {
    switch (displayStep) {
      case 'reminder':
        return <GentleReminder onNext={() => transitionToStep('write')} />
      case 'write':
        return <WriteThoughts onNext={handleWriteDone} />
      case 'decompose':
        return <Decompose content={flow.content} onNext={handleDecomposeDone} />
      case 'emotion':
        return <EmotionTag onNext={handleEmotionDone} />
      case 'seal':
        return (
          <Seal
            content={flow.content}
            decompose={flow.decompose}
            selectedDecompose={flow.selectedDecompose}
            emotionTags={flow.emotionTags}
            onDone={handleDone}
          />
        )
      case 'done':
        return (
          <div className="step-container">
            <p className="warm-text">晚安。</p>
          </div>
        )
    }
  }

  return (
    <div className="newtab-container">
      {showProgress && (
        <ProgressBar currentStep={currentStepIndex} totalSteps={STEP_ORDER.length} />
      )}
      <div className={isTransitioning ? 'step-exit' : 'step-enter'}>
        {renderStep()}
      </div>
    </div>
  )
}

export default App
