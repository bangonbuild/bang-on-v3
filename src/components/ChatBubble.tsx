import ReactMarkdown from 'react-markdown'
import type { ChatMessage } from '../types'
import { nudgeMarkdownComponents } from '../utils/markdownComponents'

interface ChatBubbleProps {
  message: ChatMessage
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === 'user'

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-xl bg-[var(--color-surface-2)] px-4 py-3">
          {message.imageUrl && (
            <img
              src={message.imageUrl}
              alt=""
              className="mb-2 w-full max-h-[200px] rounded-lg object-cover"
            />
          )}
          {message.content && !message.content.match(/^\[Image attached\]$/i) && (
            <p className="font-body text-[15px] leading-relaxed text-[var(--color-text-primary)]">
              {message.content}
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-[90%] border-l-2 border-[var(--color-border-2)] pl-4">
        <div className="nudge-markdown font-body">
          <ReactMarkdown components={nudgeMarkdownComponents}>{message.content}</ReactMarkdown>
        </div>
      </div>
    </div>
  )
}
