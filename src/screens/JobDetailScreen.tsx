import {
  ArrowLeft,
  FileText,
  MessageCircle,
  ReceiptText,
  ScanLine,
  StickyNote,
} from 'lucide-react'
import { useState } from 'react'
import { StatusBadge } from '../components/StatusBadge'
import { sendChatMessage } from '../services/aiService'
import type { Job, Profile, TimelineEntry } from '../types'
import { formatRelativeTime } from '../utils/storage'

interface JobDetailScreenProps {
  job: Job
  profile: Profile
  onBack: () => void
  onEdit: () => void
  onNudge: () => void
  onSnap: () => void
  onQuote: () => void
  onAddNote: (content: string) => void
  onUpdateEntry: (entryId: string, updates: Partial<TimelineEntry>) => void
  onOpenDoc: (entry: TimelineEntry) => void
}

export function JobDetailScreen({
  job,
  profile,
  onBack,
  onEdit,
  onNudge,
  onSnap,
  onQuote,
  onAddNote,
  onUpdateEntry,
  onOpenDoc,
}: JobDetailScreenProps) {
  const [noteOpen, setNoteOpen] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [polishId, setPolishId] = useState<string | null>(null)
  const [polishPreview, setPolishPreview] = useState<{ original: string; polished: string } | null>(null)
  const [polishLoading, setPolishLoading] = useState(false)

  const handleSaveNote = () => {
    if (!noteText.trim()) return
    onAddNote(noteText.trim())
    setNoteText('')
    setNoteOpen(false)
  }

  const handlePolish = async (entry: TimelineEntry) => {
    setPolishId(entry.id)
    setPolishLoading(true)
    try {
      const polished = await sendChatMessage({
        message: `Rewrite this site note professionally for a client-facing record. Keep it concise. Original: ${entry.content}`,
        trade: profile.trade,
      })
      setPolishPreview({ original: entry.content, polished })
    } catch {
      setPolishPreview(null)
    } finally {
      setPolishLoading(false)
    }
  }

  const actions = [
    { icon: MessageCircle, label: 'Ask Nudge', onClick: onNudge },
    { icon: StickyNote, label: 'Add note', onClick: () => setNoteOpen(true) },
    { icon: ScanLine, label: 'Snap', onClick: onSnap },
    { icon: ReceiptText, label: 'Quote', onClick: onQuote },
  ]

  return (
    <div className="px-4 pb-24 pt-6">
      <header className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <button type="button" onClick={onBack} className="min-h-[48px] min-w-[48px]">
            <ArrowLeft size={22} className="text-white" />
          </button>
          <div>
            <h1 className="font-display text-xl font-bold text-white">{job.name}</h1>
            <StatusBadge status={job.status} />
          </div>
        </div>
        <button type="button" onClick={onEdit} className="font-body text-sm text-[var(--color-text-secondary)]">
          Edit
        </button>
      </header>

      <div className="mt-4 grid grid-cols-4 gap-2">
        {actions.map(({ icon: Icon, label, onClick }) => (
          <button
            key={label}
            type="button"
            onClick={onClick}
            className="flex min-h-[72px] flex-col items-center justify-center gap-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)]"
          >
            <Icon size={20} className="text-white" />
            <span className="font-body text-[11px] text-[var(--color-text-secondary)]">{label}</span>
          </button>
        ))}
      </div>

      {noteOpen && (
        <div className="mt-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            rows={3}
            placeholder="Site note..."
            className="w-full bg-transparent font-body text-white outline-none"
          />
          <button
            type="button"
            onClick={handleSaveNote}
            className="mt-2 min-h-[48px] w-full rounded-xl bg-white font-body font-medium text-black"
          >
            Save note
          </button>
        </div>
      )}

      {polishPreview && polishId && (
        <div className="mt-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <p className="font-body text-xs text-[var(--color-text-tertiary)]">Original</p>
          <p className="font-body text-sm text-white/60">{polishPreview.original}</p>
          <p className="mt-3 font-body text-xs text-[var(--color-text-tertiary)]">Polished</p>
          <p className="font-body text-sm text-white">{polishPreview.polished}</p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => {
                onUpdateEntry(polishId, { content: polishPreview.polished, polishedContent: polishPreview.polished })
                setPolishPreview(null)
                setPolishId(null)
              }}
              className="flex-1 min-h-[40px] rounded-lg bg-white font-body text-sm text-black"
            >
              Accept
            </button>
            <button
              type="button"
              onClick={() => {
                setPolishPreview(null)
                setPolishId(null)
              }}
              className="flex-1 min-h-[40px] rounded-lg border border-[var(--color-border)] font-body text-sm text-white"
            >
              Discard
            </button>
          </div>
        </div>
      )}

      <div className="mt-6">
        {job.timeline.length === 0 ? (
          <div className="py-12 text-center">
            <p className="font-body text-[var(--color-text-tertiary)]">No entries yet.</p>
            <button
              type="button"
              onClick={() => setNoteOpen(true)}
              className="mt-2 font-body text-[var(--color-text-secondary)] underline"
            >
              Add your first note →
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {job.timeline.map((entry) => (
              <TimelineItem
                key={entry.id}
                entry={entry}
                polishLoading={polishLoading && polishId === entry.id}
                onPolish={() => void handlePolish(entry)}
                onOpenDoc={() => onOpenDoc(entry)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function TimelineItem({
  entry,
  polishLoading,
  onPolish,
  onOpenDoc,
}: {
  entry: TimelineEntry
  polishLoading: boolean
  onPolish: () => void
  onOpenDoc: () => void
}) {
  const Icon = entry.type === 'quote' ? ReceiptText : entry.type === 'invoice' ? FileText : StickyNote

  if (entry.type === 'photo' && entry.imageUrl) {
    return (
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <img src={entry.imageUrl} alt="" className="w-full rounded-xl object-cover" />
        {entry.content && <p className="mt-2 font-body text-[15px] text-white">{entry.content}</p>}
        <p className="mt-1 font-body text-xs text-[var(--color-text-tertiary)]">
          {formatRelativeTime(entry.timestamp)}
        </p>
      </div>
    )
  }

  if (entry.type === 'quote' || entry.type === 'invoice') {
    return (
      <button
        type="button"
        onClick={onOpenDoc}
        className="flex w-full items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-left"
      >
        <Icon size={18} className="text-[var(--color-text-tertiary)]" />
        <div>
          <p className="font-body text-white capitalize">
            {entry.type} — ${entry.amount?.toLocaleString() ?? '0'}
          </p>
          <p className="font-body text-xs text-[var(--color-text-tertiary)]">
            {formatRelativeTime(entry.timestamp)}
          </p>
        </div>
      </button>
    )
  }

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <StickyNote size={16} className="text-[var(--color-text-tertiary)]" />
      <p className="mt-2 font-body text-[15px] text-white">{entry.content}</p>
      <p className="mt-1 font-body text-xs text-[var(--color-text-tertiary)]">
        {formatRelativeTime(entry.timestamp)}
      </p>
      {entry.type === 'note' && (
        <button
          type="button"
          onClick={onPolish}
          disabled={polishLoading}
          className="mt-2 font-body text-sm text-[var(--color-text-secondary)]"
        >
          {polishLoading ? 'Polishing...' : 'Polish with Nudge'}
        </button>
      )}
    </div>
  )
}
