import { ArrowLeft, FileText, MapPin, ReceiptText, StickyNote } from 'lucide-react'
import { useRef, useState } from 'react'
import { Icon } from '../components/Icon'
import { JobActionDrawer, type JobAction } from '../components/JobActionDrawer'
import { StatusBadge } from '../components/StatusBadge'
import { sendChatMessage } from '../services/aiService'
import type { Job, Profile, TimelineEntry } from '../types'
import type { ShowToastFn } from '../hooks/useToast'
import { NAV_PB } from '../utils/layout'
import { formatRelativeTime } from '../utils/storage'

interface JobDetailScreenProps {
  job: Job
  profile: Profile
  onBack: () => void
  onEdit: () => void
  onNudge: () => void
  onQuote: () => void
  onInvoice: () => void
  onPhotoReport: () => void
  onAddNote: (content: string) => void
  onAddPhoto: (content: string, imageUrl: string) => void
  onUpdateEntry: (entryId: string, updates: Partial<TimelineEntry>) => void
  onOpenDoc: (entry: TimelineEntry) => void
  showToast: ShowToastFn
}

type PhotoStep = 'idle' | 'capture' | 'preview'

export function JobDetailScreen({
  job,
  profile,
  onBack,
  onEdit,
  onNudge,
  onQuote,
  onInvoice,
  onPhotoReport,
  onAddNote,
  onAddPhoto,
  onUpdateEntry,
  onOpenDoc,
  showToast,
}: JobDetailScreenProps) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [noteOpen, setNoteOpen] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [photoStep, setPhotoStep] = useState<PhotoStep>('idle')
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [photoCaption, setPhotoCaption] = useState('')
  const [polishId, setPolishId] = useState<string | null>(null)
  const [polishPreview, setPolishPreview] = useState<{ original: string; polished: string } | null>(null)
  const [polishLoading, setPolishLoading] = useState(false)
  const cameraRef = useRef<HTMLInputElement>(null)
  const libraryRef = useRef<HTMLInputElement>(null)

  const inPhotoFlow = photoStep !== 'idle'

  const handleAction = (action: JobAction) => {
    switch (action) {
      case 'nudge':
        onNudge()
        break
      case 'note':
        setNoteOpen(true)
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

  return (
    <div className={`flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pt-6 ${NAV_PB}`}>
      <div className="flex items-center justify-between">
        <button type="button" onClick={onBack} className="min-h-[48px] min-w-[48px] shrink-0">
          <Icon icon={ArrowLeft} size={22} className="text-[var(--color-text-primary)]" />
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
          {/* TODO: wire Google Maps or Mapbox with address from job data */}
          <Icon icon={MapPin} size={20} muted />
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
            className="min-h-[48px] w-full rounded-xl bg-white font-body font-medium text-black"
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
            Cancel
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
            className="mt-2 min-h-[48px] w-full rounded-xl bg-white font-body font-medium text-black"
          >
            Save to timeline
          </button>
          <button type="button" onClick={cancelPhoto} className="mt-2 w-full font-body text-sm text-[var(--color-text-secondary)]">
            Cancel
          </button>
        </div>
      )}

      {noteOpen && (
        <div className="mt-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            rows={3}
            placeholder="Site note..."
            className="w-full bg-transparent font-body text-[var(--color-text-primary)] outline-none"
          />
          <button
            type="button"
            onClick={handleSaveNote}
            className="mt-2 min-h-[48px] w-full rounded-xl bg-white font-body font-medium text-black"
          >
            Save note
          </button>
          <button
            type="button"
            onClick={() => {
              setNoteOpen(false)
              setNoteText('')
            }}
            className="mt-2 w-full font-body text-sm text-[var(--color-text-secondary)]"
          >
            Cancel
          </button>
        </div>
      )}

      {polishPreview && polishId && (
        <div className="mt-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <p className="font-body text-xs text-[var(--color-text-tertiary)]">Original</p>
          <p className="font-body text-sm text-[var(--color-text-secondary)]">{polishPreview.original}</p>
          <p className="mt-3 font-body text-xs text-[var(--color-text-tertiary)]">Polished</p>
          <p className="font-body text-sm text-[var(--color-text-primary)]">{polishPreview.polished}</p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => {
                onUpdateEntry(polishId, {
                  content: polishPreview.polished,
                  polishedContent: polishPreview.polished,
                })
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
              className="flex-1 min-h-[40px] rounded-lg border border-[var(--color-border)] font-body text-sm text-[var(--color-text-primary)]"
            >
              Discard
            </button>
          </div>
        </div>
      )}

      {!inPhotoFlow && (
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="mt-6 min-h-[48px] w-full rounded-xl bg-white font-body font-medium text-black"
        >
          + Add to job
        </button>
      )}

      <div className="mt-6">
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

      <JobActionDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} onSelect={handleAction} />
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
  const DocIcon = entry.type === 'quote' ? ReceiptText : FileText

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
        <Icon icon={DocIcon} size={18} muted />
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

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <Icon icon={StickyNote} size={16} muted />
      <p className="mt-2 font-body text-[15px] text-[var(--color-text-primary)]">{entry.content}</p>
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
