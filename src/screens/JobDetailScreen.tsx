import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowLeft,
  FileText,
  ImageIcon,
  MapPin,
  MessageCircle,
  ReceiptText,
  StickyNote,
  X,
} from 'lucide-react'
import { useRef, useState } from 'react'
import { JobActionDrawer, type JobAction } from '../components/JobActionDrawer'
import { sortInvoices } from '../utils/invoiceSort'
import { StatusBadge } from '../components/StatusBadge'
import { streamChatMessage } from '../services/aiService'
import type { Job, MoneyRecord, Profile, TimelineEntry } from '../types'
import type { ShowToastFn } from '../hooks/useToast'
import { NAV_PB } from '../utils/layout'
import { formatDate, formatRelativeTime } from '../utils/storage'

type JobTab = 'timeline' | 'invoices' | 'quotes'
type PhotoStep = 'idle' | 'capture' | 'preview'

interface JobDetailScreenProps {
  job: Job
  profile: Profile
  jobInvoices: MoneyRecord[]
  jobQuotes: MoneyRecord[]
  onBack: () => void
  onEdit: () => void
  onNudge: () => void
  onOpenMoneyRecord: (record: MoneyRecord) => void
  onQuote: () => void
  onInvoice: () => void
  onPhotoReport: () => void
  onAddNote: (content: string) => void
  onAddPhoto: (content: string, imageUrl: string) => void
  onUpdateEntry: (entryId: string, updates: Partial<TimelineEntry>) => void
  onOpenDoc: (entry: TimelineEntry) => void
  showToast: ShowToastFn
}

const invoiceStatusStyle: Record<string, { bg: string; text: string }> = {
  draft: { bg: 'rgba(255,255,255,0.1)', text: 'rgba(255,255,255,0.5)' },
  sent: { bg: 'rgba(255,149,0,0.15)', text: '#FF9500' },
  paid: { bg: 'rgba(52,199,89,0.15)', text: '#34C759' },
  overdue: { bg: 'rgba(255,59,48,0.15)', text: '#FF3B30' },
}

export function JobDetailScreen({
  job,
  profile,
  jobInvoices,
  jobQuotes,
  onBack,
  onEdit,
  onNudge,
  onOpenMoneyRecord,
  onQuote,
  onInvoice,
  onPhotoReport,
  onAddNote,
  onAddPhoto,
  onUpdateEntry: _onUpdateEntry,
  onOpenDoc,
  showToast,
}: JobDetailScreenProps) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [noteModalOpen, setNoteModalOpen] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [activeTab, setActiveTab] = useState<JobTab>('timeline')
  const [photoStep, setPhotoStep] = useState<PhotoStep>('idle')
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [photoCaption, setPhotoCaption] = useState('')
  const [polishLoading, setPolishLoading] = useState(false)
  const cameraRef = useRef<HTMLInputElement>(null)
  const libraryRef = useRef<HTMLInputElement>(null)

  const inPhotoFlow = photoStep !== 'idle'

  const sortedInvoices = sortInvoices(jobInvoices)

  const sortedQuotes = [...jobQuotes].sort((a, b) => b.createdAt - a.createdAt)

  const handleAction = (action: JobAction) => {
    switch (action) {
      case 'note':
        setNoteModalOpen(true)
        break
      case 'photo':
        setPhotoStep('capture')
        break
      case 'quote':
        onQuote()
        break
      case 'invoice':
        onInvoice()
        break
      case 'photo-report':
        onPhotoReport()
        break
    }
  }

  const handlePhotoFile = (file: File | undefined) => {
    if (!file) return
    setPhotoUrl(URL.createObjectURL(file))
    setPhotoStep('preview')
  }

  const handleSavePhoto = () => {
    if (!photoUrl) return
    onAddPhoto(photoCaption.trim() || 'Site photo', photoUrl)
    setPhotoStep('idle')
    setPhotoUrl(null)
    setPhotoCaption('')
  }

  const cancelPhoto = () => {
    setPhotoStep('idle')
    setPhotoUrl(null)
    setPhotoCaption('')
  }

  const handleSaveNote = () => {
    if (!noteText.trim()) return
    onAddNote(noteText.trim())
    showToast('Note added.', 'success')
    setNoteText('')
    setNoteModalOpen(false)
  }

  const handlePolishNote = async () => {
    if (!noteText.trim()) return
    setPolishLoading(true)
    try {
      let polished = ''
      await streamChatMessage({
        messages: [
          {
            role: 'user',
            content: `Rewrite this site note professionally for a client-facing record. Keep it concise. Original: ${noteText.trim()}`,
          },
        ],
        trade: profile.trade,
        onToken: (t) => {
          polished += t
        },
      })
      if (polished) setNoteText(polished)
    } finally {
      setPolishLoading(false)
    }
  }

  const tabClass = (tab: JobTab) =>
    `min-h-[36px] flex-1 rounded-full px-3 font-body text-sm capitalize ${
      activeTab === tab ? 'chip-active' : 'chip-inactive'
    }`

  return (
    <div className={`flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pt-6 ${NAV_PB}`}>
      <div className="flex items-center justify-between">
        <button type="button" onClick={onBack} className="flex h-12 w-12 shrink-0 items-center justify-center">
          <ArrowLeft size={22} strokeWidth={1.5} className="text-[var(--color-text-primary)]" />
        </button>
        <button
          type="button"
          onClick={onEdit}
          className="font-display text-[13px] text-[var(--color-text-secondary)]"
        >
          Edit
        </button>
      </div>

      <div className="mt-4 flex gap-3">
        <div className="flex min-w-0 flex-[0.55] flex-col">
          <h1 className="font-display text-xl font-bold text-[var(--color-text-primary)]">{job.name}</h1>
          <p className="mt-2 font-body text-sm text-[var(--color-text-secondary)]">{job.client}</p>
          {job.phone && (
            <p className="font-body text-sm text-[var(--color-text-secondary)]">{job.phone}</p>
          )}
          {job.email && (
            <p className="font-body text-sm text-[var(--color-text-secondary)]">{job.email}</p>
          )}
          {job.address && (
            <p className="font-body text-[13px] text-[var(--color-text-tertiary)]">{job.address}</p>
          )}
          <div className="mt-3">
            <StatusBadge status={job.status} />
          </div>
          <p className="mt-2 font-body text-xs text-[var(--color-text-tertiary)]">
            Last updated: {formatRelativeTime(job.updatedAt)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => showToast('Map view coming soon.', 'info')}
          className="flex min-h-[100px] min-w-0 flex-[0.45] flex-col items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3"
        >
          <span style={{ display: 'block' }}>
            <MapPin size={20} strokeWidth={1.5} className="text-[var(--color-text-tertiary)]" />
          </span>
          <span className="mt-2 font-body text-[11px] text-[var(--color-text-tertiary)]">Map view</span>
        </button>
      </div>

      {photoStep === 'capture' && (
        <div className="mt-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => handlePhotoFile(e.target.files?.[0])}
          />
          <input
            ref={libraryRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handlePhotoFile(e.target.files?.[0])}
          />
          <button
            type="button"
            onClick={() => cameraRef.current?.click()}
            className="min-h-[48px] w-full rounded-xl btn-primary font-body font-medium"
          >
            Take photo
          </button>
          <button
            type="button"
            onClick={() => libraryRef.current?.click()}
            className="mt-2 min-h-[48px] w-full rounded-xl border border-[var(--color-border)] font-body text-[var(--color-text-primary)]"
          >
            Choose from library
          </button>
          <button type="button" onClick={cancelPhoto} className="mt-2 w-full font-body text-sm text-[var(--color-text-secondary)]">
            Dismiss
          </button>
        </div>
      )}

      {photoStep === 'preview' && photoUrl && (
        <div className="mt-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <img src={photoUrl} alt="" className="max-h-[200px] w-full rounded-xl object-cover" />
          <textarea
            value={photoCaption}
            onChange={(e) => setPhotoCaption(e.target.value)}
            placeholder="Add a note to this photo..."
            rows={3}
            className="mt-3 w-full bg-transparent font-body text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-tertiary)]"
          />
          <button
            type="button"
            onClick={handleSavePhoto}
            className="mt-2 min-h-[48px] w-full rounded-xl btn-primary font-body font-medium"
          >
            Save to timeline
          </button>
          <button type="button" onClick={cancelPhoto} className="mt-2 w-full font-body text-sm text-[var(--color-text-secondary)]">
            Dismiss
          </button>
        </div>
      )}

      {!inPhotoFlow && (
        <div className="mt-6 flex items-stretch gap-2">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="flex h-12 flex-1 items-center justify-center rounded-xl bg-white font-body font-medium text-black"
          >
            + Add to job
          </button>
          <button
            type="button"
            onClick={onNudge}
            className="flex h-12 shrink-0 items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] px-4 font-body text-[var(--color-text-primary)]"
          >
            <MessageCircle size={18} strokeWidth={1.5} style={{ display: 'block' }} />
            Ask Nudge
          </button>
        </div>
      )}

      {!inPhotoFlow && (
        <div className="mt-4 flex gap-2">
          <button type="button" onClick={() => setActiveTab('timeline')} className={tabClass('timeline')}>
            Timeline
          </button>
          <button type="button" onClick={() => setActiveTab('invoices')} className={tabClass('invoices')}>
            Invoices
          </button>
          <button type="button" onClick={() => setActiveTab('quotes')} className={tabClass('quotes')}>
            Quotes
          </button>
        </div>
      )}

      <div className="mt-6">
        {activeTab === 'timeline' && (
          <>
            {job.timeline.length === 0 ? (
              <div className="py-12 text-center">
                <p className="font-body text-[var(--color-text-tertiary)]">No entries yet.</p>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(true)}
                  className="mt-2 font-body text-[var(--color-text-secondary)] underline"
                >
                  Add your first note →
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {job.timeline.map((entry) => (
                  <TimelineItem key={entry.id} entry={entry} onOpenDoc={() => onOpenDoc(entry)} />
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'invoices' && (
          <>
            {sortedInvoices.length === 0 ? (
              <p className="py-8 text-center font-body text-[13px] text-[var(--color-text-tertiary)]">
                No invoices for this job yet.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {sortedInvoices.map((inv) => {
                  const st = invoiceStatusStyle[inv.status] ?? invoiceStatusStyle.draft
                  return (
                    <button
                      key={inv.id}
                      type="button"
                      onClick={() => onOpenMoneyRecord(inv)}
                      className="flex w-full items-center justify-between rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-left"
                    >
                      <div>
                        <p className="font-body text-[15px] text-[var(--color-text-primary)]">
                          {inv.invoiceNumber ?? 'Invoice'}
                        </p>
                        <p className="font-display text-[15px] text-[var(--color-text-primary)]">
                          ${inv.total.toLocaleString()}
                        </p>
                        {inv.dueDate && (
                          <p className="font-body text-[12px] text-[var(--color-text-tertiary)]">
                            Due {inv.dueDate}
                          </p>
                        )}
                      </div>
                      <span
                        className="rounded-full px-2 py-0.5 text-[11px] font-medium capitalize"
                        style={{ background: st.bg, color: st.text }}
                      >
                        {inv.status}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </>
        )}

        {activeTab === 'quotes' && (
          <>
            {sortedQuotes.length === 0 ? (
              <p className="py-8 text-center font-body text-[13px] text-[var(--color-text-tertiary)]">
                No quotes for this job yet.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {sortedQuotes.map((q) => {
                  const st = invoiceStatusStyle[q.status] ?? invoiceStatusStyle.draft
                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => onOpenMoneyRecord(q)}
                      className="flex w-full items-center justify-between rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-left"
                    >
                      <div>
                        <p className="font-body text-[15px] text-[var(--color-text-primary)]">
                          {q.invoiceNumber ?? 'Quote'}
                        </p>
                        <p className="font-display text-[15px] text-[var(--color-text-primary)]">
                          ${q.total.toLocaleString()}
                        </p>
                        <p className="font-body text-[12px] text-[var(--color-text-tertiary)]">
                          {formatDate(q.createdAt)}
                        </p>
                      </div>
                      <span
                        className="rounded-full px-2 py-0.5 text-[11px] font-medium capitalize"
                        style={{ background: st.bg, color: st.text }}
                      >
                        {q.status}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>

      <JobActionDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} onSelect={handleAction} />

      <AnimatePresence>
        {noteModalOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[80] bg-[rgba(0,0,0,0.75)]"
              onClick={() => setNoteModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="fixed left-4 right-4 top-1/2 z-[81] max-w-lg -translate-y-1/2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6"
            >
              <div className="flex items-start justify-between">
                <h2 className="font-display text-lg font-bold text-[var(--color-text-primary)]">Add note</h2>
                <button
                  type="button"
                  onClick={() => setNoteModalOpen(false)}
                  className="flex h-10 w-10 items-center justify-center"
                  aria-label="Close"
                >
                  <X size={22} strokeWidth={1.5} className="text-[var(--color-text-primary)]" />
                </button>
              </div>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                rows={6}
                placeholder="Site note..."
                className="mt-4 min-h-[140px] w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] p-4 font-body text-[15px] text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-tertiary)]"
              />
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => void handlePolishNote()}
                  disabled={!noteText.trim() || polishLoading}
                  className="flex h-12 flex-1 items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] font-body text-[var(--color-text-primary)] disabled:opacity-50"
                >
                  {polishLoading ? 'Polishing...' : 'Polish with Nudge'}
                </button>
                <button
                  type="button"
                  onClick={handleSaveNote}
                  disabled={!noteText.trim()}
                  className="flex h-12 flex-1 items-center justify-center rounded-xl bg-white font-body font-medium text-black disabled:opacity-50"
                >
                  Save note
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

function TimelineItem({
  entry,
  onOpenDoc,
}: {
  entry: TimelineEntry
  onOpenDoc: () => void
}) {
  const iconProps = {
    size: 18 as const,
    strokeWidth: 1.5 as const,
    className: 'text-[var(--color-text-secondary)]',
    style: { display: 'block' as const },
  }

  if (entry.type === 'photo' && entry.imageUrl) {
    return (
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <img src={entry.imageUrl} alt="" className="w-full rounded-xl object-cover" />
        {entry.content && (
          <p className="mt-2 font-body text-[15px] text-[var(--color-text-primary)]">{entry.content}</p>
        )}
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
        <span style={{ display: 'block' }}>
          {entry.type === 'quote' ? (
            <ReceiptText {...iconProps} />
          ) : (
            <FileText {...iconProps} />
          )}
        </span>
        <div>
          <p className="font-body capitalize text-[var(--color-text-primary)]">
            {entry.type} — ${entry.amount?.toLocaleString() ?? '0'}
          </p>
          <p className="font-body text-xs text-[var(--color-text-tertiary)]">
            {formatRelativeTime(entry.timestamp)}
          </p>
        </div>
      </button>
    )
  }

  if (entry.type === 'photo-report') {
    return (
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <span style={{ display: 'block' }}>
          <ImageIcon {...iconProps} />
        </span>
        <p className="mt-2 font-body text-[15px] text-[var(--color-text-primary)]">Photo report</p>
        <p className="mt-1 font-body text-xs text-[var(--color-text-tertiary)]">
          {formatRelativeTime(entry.timestamp)}
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <span style={{ display: 'block' }}>
        <StickyNote {...iconProps} />
      </span>
      <p className="mt-2 font-body text-[15px] text-[var(--color-text-primary)]">{entry.content}</p>
      <p className="mt-1 font-body text-xs text-[var(--color-text-tertiary)]">
        {formatRelativeTime(entry.timestamp)}
      </p>
    </div>
  )
}
