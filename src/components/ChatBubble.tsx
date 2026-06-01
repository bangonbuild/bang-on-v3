import type { ChatMessage } from '../types'

interface ChatBubbleProps {
  message: ChatMessage
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === 'user'

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-xl bg-[var(--color-surface-2)] px-4 py-3">
          <p className="font-body text-[15px] leading-relaxed text-white">{message.content}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-[90%] border-l-2 border-[var(--color-border-2)] pl-4">
        <p className="font-body text-[15px] leading-relaxed text-white">{message.content}</p>
      </div>
    </div>
  )
}
