import { ArrowUp, Mic, Paperclip } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ChatBubble } from '../components/ChatBubble'
import { streamChatMessage, analyseImage, mapFetchError } from '../services/aiService'
import type { ChatMessage, Job, PendingChat, Profile } from '../types'
import type { ShowToastFn } from '../hooks/useToast'
import { buildJobContext } from '../utils/jobHelpers'
import { STORAGE_KEYS } from '../utils/storage'

interface NudgeScreenProps {
  job?: Job
  profile: Profile
  onSaveChat: (messages: ChatMessage[], jobId?: string) => void
  showToast: ShowToastFn
  embedded?: boolean
  onBack?: () => void
}

function firstName(fullName: string): string {
  const trimmed = fullName.trim()
  if (!trimmed) return ''
  return trimmed.split(/\s+/)[0]
}

export function NudgeScreen({
  job,
  profile,
  onSaveChat,
  showToast,
  embedded = false,
  onBack,
}: NudgeScreenProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageMime, setImageMime] = useState('image/jpeg')
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const pendingHandled = useRef(false)
  const snapContextRef = useRef<string | null>(null)
  const messagesRef = useRef(messages)
  messagesRef.current = messages

  const historyForApi = useCallback(
    (extraUser?: string) => {
      const base = messagesRef.current.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }))
      if (extraUser) base.push({ role: 'user' as const, content: extraUser })
      return base
    },
    [],
  )

  const sendMessage = useCallback(
    async (text: string, imageBase64?: string) => {
      const trimmed = text.trim()
      if ((!trimmed && !imageBase64) || loading) return

      let messageToSend = trimmed
      if (snapContextRef.current) {
        messageToSend = `[Site photo context from Snap]\n${snapContextRef.current}\n\nUser question: ${trimmed || 'What can you tell me about this image?'}`
        snapContextRef.current = null
      }

      const displayContent = trimmed || (imageBase64 ? '[Image attached]' : '')
      const userMsg: ChatMessage = { role: 'user', content: displayContent, timestamp: Date.now() }
      setMessages((prev) => [...prev, userMsg])
      setInput('')
      setImagePreview(null)
      setLoading(true)
      setStreamingText('')
      setError(null)

      try {
        if (imageBase64) {
          // TODO: integrate with /api/analyse for full vision support
          const { analysis } = await analyseImage({
            image: imageBase64,
            mimeType: imageMime,
            mode: 'identify',
            trade: profile.trade,
          })
          setMessages((prev) => [
            ...prev,
            { role: 'assistant', content: analysis, timestamp: Date.now() },
          ])
        } else {
          const reply = await streamChatMessage({
            messages: historyForApi(messageToSend),
            trade: profile.trade,
            jobContext: job ? buildJobContext(job) : undefined,
            onToken: (token) => setStreamingText((prev) => prev + token),
          })
          setStreamingText('')
          setMessages((prev) => [
            ...prev,
            { role: 'assistant', content: reply, timestamp: Date.now() },
          ])
        }
      } catch (err) {
        const msg = mapFetchError(err)
        setError(msg)
        setStreamingText('')
        showToast(msg, 'error')
      } finally {
        setLoading(false)
      }
    },
    [historyForApi, imageMime, job, loading, profile.trade, showToast],
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
  }, [messages, loading, streamingText])

  useEffect(() => {
    return () => {
      if (messagesRef.current.length > 0) {
        onSaveChat(messagesRef.current, job?.id)
      }
    }
  }, [job?.id, onSaveChat])

  const handleImageSelect = (file: File | undefined) => {
    if (!file) return
    setImageMime(file.type || 'image/jpeg')
    const reader = new FileReader()
    reader.onload = () => setImagePreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleSend = () => {
    const base64 = imagePreview?.includes(',') ? imagePreview.split(',')[1] : undefined
    void sendMessage(input, base64)
  }

  const name = firstName(profile.name)
  const welcomeLine = name ? `G'day ${name}.` : "G'day."

  return (
    <div className="relative flex h-full min-h-0 flex-col">
      {!embedded && onBack && (
        <header className="flex shrink-0 items-center gap-3 px-4 pb-2 pt-4">
          <h1 className="font-display text-xl font-bold text-[var(--color-text-primary)]">Ask Nudge</h1>
          {job && (
            <p className="font-body text-[13px] text-[var(--color-text-secondary)]">{job.name}</p>
          )}
        </header>
      )}

      <div
        className="min-h-0 flex-1 overflow-y-auto px-4 pb-4"
        style={{ paddingBottom: embedded ? '7.5rem' : '6rem' }}
      >
        {messages.length === 0 && !loading && !streamingText && (
          <div className="flex min-h-[30vh] flex-col items-center justify-center text-center">
            <div className="pulse-dot mb-4" />
            <p className="font-display text-xl text-[var(--color-text-primary)]">datum.ai</p>
            <p className="mt-2 font-body text-[15px] text-[var(--color-text-secondary)]">
              {welcomeLine} How can I help?
            </p>
          </div>
        )}
        <div className="flex flex-col gap-4">
          {messages.map((m, i) => (
            <ChatBubble key={`${m.timestamp}-${i}`} message={m} />
          ))}
          {(loading || streamingText) && (
            <div className="flex justify-start">
              <div className="max-w-[90%] border-l-2 border-[var(--color-border-2)] pl-4">
                {streamingText ? (
                  <div className="nudge-markdown">
                    <ReactMarkdown>{streamingText}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="flex gap-1">
                    <span className="typing-dot h-1.5 w-1.5 rounded-full bg-[var(--color-text-tertiary)]" />
                    <span className="typing-dot h-1.5 w-1.5 rounded-full bg-[var(--color-text-tertiary)]" />
                    <span className="typing-dot h-1.5 w-1.5 rounded-full bg-[var(--color-text-tertiary)]" />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        {error && <p className="mt-2 font-body text-sm text-[var(--color-danger)]">{error}</p>}
        <div ref={bottomRef} />
      </div>

      <div className="absolute bottom-[26px] left-4 right-4 z-10">
        {imagePreview && (
          <div className="mb-2 flex items-center gap-2">
            <img src={imagePreview} alt="" className="h-12 w-12 rounded-lg object-cover" />
            <button
              type="button"
              onClick={() => setImagePreview(null)}
              className="font-body text-xs text-[var(--color-text-tertiary)]"
            >
              Remove
            </button>
          </div>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleImageSelect(e.target.files?.[0])}
        />
        <div
          className="flex items-center gap-2 rounded-[24px] border border-[var(--color-border-2)] bg-[var(--color-surface-2)] px-4 py-3 shadow-[0_4px_24px_rgba(0,0,0,0.4)]"
        >
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex shrink-0 items-center justify-center"
            aria-label="Attach image"
          >
            <Paperclip size={22} strokeWidth={1.5} className="text-[var(--color-text-tertiary)]" />
          </button>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask Nudge..."
            className="min-h-[32px] flex-1 bg-transparent font-body text-[15px] text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-tertiary)]"
          />
          <button
            type="button"
            onClick={() => showToast('Voice input coming soon.', 'info')}
            className="flex shrink-0 items-center justify-center"
            aria-label="Voice input"
          >
            <Mic size={22} strokeWidth={1.5} className="text-[var(--color-text-tertiary)]" />
          </button>
          <button
            type="button"
            disabled={(!input.trim() && !imagePreview) || loading}
            onClick={handleSend}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white disabled:opacity-30"
            aria-label="Send"
          >
            <ArrowUp size={18} strokeWidth={2} className="text-black" />
          </button>
        </div>
      </div>
    </div>
  )
}
