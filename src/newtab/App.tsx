import { useState } from 'react'
import GentleReminder from './steps/GentleReminder'
import WriteThoughts from './steps/WriteThoughts'
import Decompose from './steps/Decompose'
import EmotionTag from './steps/EmotionTag'
import Seal from './steps/Seal'
import type { EmotionTag as EmotionTagType } from '../shared/types'

type Step = 'reminder' | 'write' | 'decompose' | 'emotion' | 'seal' | 'done'

interface FlowState {
  content: string
  decompose: string[]
  selectedDecompose: string
  emotionTags: EmotionTagType[]
}

function App() {
  const [currentStep, setCurrentStep] = useState<Step>('reminder')
  const [flow, setFlow] = useState<FlowState>({
    content: '',
    decompose: [],
    selectedDecompose: '',
    emotionTags: [],
  })

  const handleWriteDone = (content: string) => {
    setFlow(prev => ({ ...prev, content }))
    setCurrentStep('decompose')
    // 通知 background 启动 30 分钟提醒
    chrome.runtime.sendMessage({ type: 'START_REMINDER' })
  }

  const handleDecomposeDone = (decompose: string[], selected: string) => {
    setFlow(prev => ({ ...prev, decompose, selectedDecompose: selected }))
    setCurrentStep('emotion')
  }

  const handleEmotionDone = (tags: EmotionTagType[]) => {
    setFlow(prev => ({ ...prev, emotionTags: tags }))
    setCurrentStep('seal')
  }

  const handleDone = () => {
    setCurrentStep('done')
  }

  return (
    <div className="newtab-container">
      {currentStep === 'reminder' && (
        <GentleReminder onNext={() => setCurrentStep('write')} />
      )}
      {currentStep === 'write' && (
        <WriteThoughts onNext={handleWriteDone} />
      )}
      {currentStep === 'decompose' && (
        <Decompose content={flow.content} onNext={handleDecomposeDone} />
      )}
      {currentStep === 'emotion' && (
        <EmotionTag onNext={handleEmotionDone} />
      )}
      {currentStep === 'seal' && (
        <Seal
          content={flow.content}
          decompose={flow.decompose}
          selectedDecompose={flow.selectedDecompose}
          emotionTags={flow.emotionTags}
          onDone={handleDone}
        />
      )}
      {currentStep === 'done' && (
        <div className="step-container">
          <p className="warm-text">晚安。</p>
        </div>
      )}
    </div>
  )
}

export default App
