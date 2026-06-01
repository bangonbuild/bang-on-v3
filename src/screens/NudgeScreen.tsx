import { ArrowLeft, ArrowUp, Mic } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ChatBubble } from '../components/ChatBubble'
import { sendChatMessage, mapFetchError } from '../services/aiService'
import type { ChatMessage, Job, Profile } from '../types'
import { buildJobContext } from '../utils/jobHelpers'
import { STORAGE_KEYS } from '../utils/storage'

interface NudgeScreenProps {
  job?: Job
  profile: Profile
  onBack: () => void
  onSaveChat: (messages: ChatMessage[], jobId?: string) => void
  showToast: (msg: string) => void
}

export function NudgeScreen({
  job,
  profile,
  onBack,
  onSaveChat,
  showToast,
}: NudgeScreenProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const pendingHandled = useRef(false)

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || loading) return

      const userMsg: ChatMessage = { role: 'user', content: trimmed, timestamp: Date.now() }
      setMessages((prev) => [...prev, userMsg])
      setInput('')
      setLoading(true)
      setError(null)

      try {
        const reply = await sendChatMessage({
          message: trimmed,
          trade: profile.trade,
          jobContext: job ? buildJobContext(job) : undefined,
        })
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: reply, timestamp: Date.now() },
        ])
      } catch (err) {
        setError(mapFetchError(err))
      } finally {
        setLoading(false)
      }
    },
    [job, loading, profile.trade],
  )

  useEffect(() => {
    if (pendingHandled.current) return
    pendingHandled.current = true
    const pending = localStorage.getItem(STORAGE_KEYS.pendingChat)
    if (pending) {
      localStorage.removeItem(STORAGE_KEYS.pendingChat)
      try {
        const { analysis, suggestion } = JSON.parse(pending) as {
          analysis: string
          suggestion: string
        }
        setMessages([{ role: 'assistant', content: analysis, timestamp: Date.now() }])
        void sendMessage(suggestion)
      } catch {
        /* ignore */
      }
    }
  }, [sendMessage])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleBack = () => {
    if (messages.length > 0) onSaveChat(messages, job?.id)
    onBack()
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-3 px-4 pb-2 pt-6">
        <button type="button" onClick={handleBack} className="min-h-[48px] min-w-[48px]">
          <ArrowLeft size={22} className="text-white" />
        </button>
        <div>
          <h1 className="font-display text-xl font-bold text-white">Ask Nudge</h1>
          {job && (
            <p className="font-body text-[13px] text-[var(--color-text-secondary)]">
              {job.name}
            </p>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {messages.length === 0 && !loading && (
          <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
            <div className="pulse-dot mb-4" />
            <p className="font-display text-xl text-white">Bang On</p>
            <p className="mt-2 font-body text-[15px] text-[var(--color-text-secondary)]">
              G&apos;day. What&apos;s the job?
            </p>
          </div>
        )}
        <div className="flex flex-col gap-4">
          {messages.map((m, i) => (
            <ChatBubble key={`${m.timestamp}-${i}`} message={m} />
          ))}
          {loading && (
            <div className="flex gap-1 pl-4">
              <span className="typing-dot h-1.5 w-1.5 rounded-full bg-[var(--color-text-tertiary)]" />
              <span className="typing-dot h-1.5 w-1.5 rounded-full bg-[var(--color-text-tertiary)]" />
              <span className="typing-dot h-1.5 w-1.5 rounded-full bg-[var(--color-text-tertiary)]" />
            </div>
          )}
        </div>
        {error && <p className="mt-2 font-body text-sm text-[var(--color-danger)]">{error}</p>}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3">
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && void sendMessage(input)}
            placeholder="Ask Nudge..."
            className="min-h-[48px] flex-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 font-body text-white placeholder:text-[var(--color-text-tertiary)]"
          />
          <button
            type="button"
            onClick={() => showToast('Voice input coming soon.')}
            className="min-h-[48px] min-w-[48px]"
          >
            <Mic size={22} className="text-[var(--color-text-tertiary)]" />
          </button>
          <button
            type="button"
            disabled={!input.trim() || loading}
            onClick={() => void sendMessage(input)}
            className="min-h-[48px] min-w-[48px] disabled:opacity-30"
          >
            <ArrowUp size={22} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  )
}
