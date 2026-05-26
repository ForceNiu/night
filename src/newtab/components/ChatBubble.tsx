import { type ReactNode } from 'react'

interface ChatBubbleProps {
  type: 'ai' | 'user'
  children: ReactNode
  className?: string
}

function ChatBubble({ type, children, className = '' }: ChatBubbleProps) {
  return (
    <div className={`chat-bubble-wrapper ${type} ${className}`}>
      <div className="chat-bubble">
        {children}
      </div>
    </div>
  )
}

export default ChatBubble
