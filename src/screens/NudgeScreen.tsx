import { ArrowLeft, ArrowUp, Mic } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ChatBubble } from '../components/ChatBubble'
import { Icon } from '../components/Icon'
import { sendChatMessage, mapFetchError } from '../services/aiService'
import type { ChatMessage, Job, PendingChat, Profile } from '../types'
import { buildJobContext } from '../utils/jobHelpers'
import { STORAGE_KEYS } from '../utils/storage'

interface NudgeScreenProps {
  job?: Job
  profile: Profile
  onBack: () => void
  onSaveChat: (messages: ChatMessage[], jobId?: string) => void
  showToast: (msg: string) => void
}

function firstName(fullName: string): string {
  const trimmed = fullName.trim()
  if (!trimmed) return ''
  return trimmed.split(/\s+/)[0]
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
  const [inputBottom, setInputBottom] = useState(0)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const pendingHandled = useRef(false)
  const snapContextRef = useRef<string | null>(null)

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || loading) return

      let messageToSend = trimmed
      if (snapContextRef.current) {
        messageToSend = `[Site photo context from Snap]\n${snapContextRef.current}\n\nUser question: ${trimmed}`
        snapContextRef.current = null
      }

      const userMsg: ChatMessage = { role: 'user', content: trimmed, timestamp: Date.now() }
      setMessages((prev) => [...prev, userMsg])
      setInput('')
      setLoading(true)
      setError(null)

      try {
        const reply = await sendChatMessage({
          message: messageToSend,
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
        const data = JSON.parse(pending) as PendingChat
        setMessages([{ role: 'assistant', content: data.analysis, timestamp: Date.now() }])
        if (data.imageBase64) {
          snapContextRef.current = data.analysis
        }
        if (data.freeText) {
          window.setTimeout(() => inputRef.current?.focus(), 300)
        } else if (data.suggestion) {
          void sendMessage(data.suggestion)
        }
      } catch {
        /* ignore */
      }
    }
  }, [sendMessage])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return
    const update = () => {
      const offset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop)
      setInputBottom(offset)
    }
    update()
    vv.addEventListener('resize', update)
    vv.addEventListener('scroll', update)
    return () => {
      vv.removeEventListener('resize', update)
      vv.removeEventListener('scroll', update)
    }
  }, [])

  const handleBack = () => {
    if (messages.length > 0) onSaveChat(messages, job?.id)
    onBack()
  }

  const name = firstName(profile.name)
  const welcomeLine = name ? `G'day ${name}. How can I help?` : "G'day. How can I help?"

  return (
    <div className="flex h-full min-h-0 flex-col pb-16">
      <header className="shrink-0 flex items-center gap-3 px-4 pb-2 pt-6">
        <button type="button" onClick={handleBack} className="min-h-[48px] min-w-[48px]">
          <Icon icon={ArrowLeft} size={22} className="text-white" />
        </button>
        <div>
          <h1 className="font-display text-xl font-bold text-white">Ask Nudge</h1>
          {job && (
            <p className="font-body text-[13px] text-[var(--color-text-secondary)]">{job.name}</p>
          )}
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
        {messages.length === 0 && !loading && (
          <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
            <div className="pulse-dot mb-4" />
            <p className="font-display text-xl text-white">Bangon</p>
            <p className="mt-2 font-body text-[15px] text-[var(--color-text-secondary)]">
              {welcomeLine}
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

      <div
        className="shrink-0 border-t border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3"
        style={{ marginBottom: inputBottom }}
      >
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && void sendMessage(input)}
            placeholder="Ask Nudge..."
            className="min-h-[48px] flex-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 font-body text-white placeholder:text-[var(--color-text-tertiary)]"
          />
          <button
            type="button"
            onClick={() => showToast('Voice input coming soon.')}
            className="flex min-h-[48px] min-w-[48px] items-center justify-center"
          >
            <Icon icon={Mic} size={22} muted />
          </button>
          <button
            type="button"
            disabled={!input.trim() || loading}
            onClick={() => void sendMessage(input)}
            className="flex min-h-[48px] min-w-[48px] items-center justify-center disabled:opacity-30"
          >
            <Icon icon={ArrowUp} size={22} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  )
}
