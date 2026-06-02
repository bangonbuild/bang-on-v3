import { Loader2, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { useRef, useState } from 'react'
import { generateDocument, mapFetchError } from '../services/aiService'
import type { Job, PhotoReportResult, Profile, SavedPhotoReport } from '../types'
import { NAV_PB } from '../utils/layout'
import { encodeImage, formatDate } from '../utils/storage'

const actionBtnClass =
  'flex-1 min-h-[48px] rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] font-body text-sm text-[var(--color-text-primary)]'

interface PhotoReportGeneratorProps {
  job?: Job
  profile: Profile
  savedReport?: SavedPhotoReport
  onClose: () => void
  onSaveToJob?: (reportId: string) => void
  onSaveReport?: (result: PhotoReportResult, photoData: string[]) => SavedPhotoReport
  onDeleteReport?: (id: string) => void
  showToast: (msg: string) => void
}

export function PhotoReportGenerator({
  job,
  profile,
  savedReport,
  onClose,
  onSaveToJob,
  onSaveReport,
  onDeleteReport,
  showToast,
}: PhotoReportGeneratorProps) {
  const [photos, setPhotos] = useState<{ url: string; base64: string; mime: string }[]>([])
  const [context, setContext] = useState('')
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState<PhotoReportResult | null>(() =>
    savedReport
      ? {
          title: 'Site progress report',
          date: formatDate(savedReport.createdAt),
          jobName: savedReport.jobName,
          photos: savedReport.photos.map((url, i) => ({
            imageUrl: url,
            caption: savedReport.captions[i] ?? '',
          })),
          summary: savedReport.reportText,
        }
      : null,
  )
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const viewOnly = Boolean(savedReport)

  const handleFiles = async (files: FileList | null) => {
    if (!files) return
    const items = await Promise.all(
      Array.from(files).slice(0, 6).map(async (f) => {
        const { base64, mimeType } = await encodeImage(f)
        return { url: URL.createObjectURL(f), base64, mime: mimeType }
      }),
    )
    setPhotos((prev) => [...prev, ...items].slice(0, 6))
  }

  const handleGenerate = async () => {
    if (photos.length === 0) return
    setLoading(true)
    setError(null)
    const prompt = `Write a site progress photo report for an Australian builder.
Context: ${context || 'General site progress'}
Describe each photo briefly, then a summary paragraph. Australian English. No emojis.
Photos count: ${photos.length}`

    try {
      const summary = await generateDocument({
        message: prompt,
        trade: profile.trade,
        jobContext: job?.name,
      })
      setReport({
        title: 'Site progress report',
        date: formatDate(),
        jobName: job?.name,
        photos: photos.map((p, i) => ({
          imageUrl: p.url,
          caption: `Photo ${i + 1} — site progress`,
        })),
        summary,
      })
    } catch (err) {
      setError(mapFetchError(err))
    } finally {
      setLoading(false)
    }
  }

  const handleSave = () => {
    if (!report || !onSaveReport) return
    const photoData = photos.length > 0 ? photos.map((p) => p.base64) : report.photos.map((p) => p.imageUrl)
    const saved = onSaveReport(report, photoData)
    if (onSaveToJob) {
      onSaveToJob(saved.id)
    } else {
      showToast('Photo report saved.')
    }
    onClose()
  }

  const handleDelete = () => {
    if (!savedReport || !onDeleteReport) return
    if (!window.confirm("Are you sure? This can't be undone.")) return
    onDeleteReport(savedReport.id)
    onClose()
  }

  if (report) {
    return (
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        className="fixed inset-0 z-[90] flex flex-col bg-white text-black"
      >
        <div className="flex justify-end p-4">
          <button type="button" onClick={onClose} className="min-h-[48px] min-w-[48px]">
            <X size={22} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 pb-32">
          <h1 className="font-display text-2xl font-bold">{report.title}</h1>
          <p className="mt-2 font-body text-sm">{report.date}</p>
          {report.jobName && <p className="font-body text-sm">{report.jobName}</p>}
          <div className="mt-6 flex flex-col gap-4">
            {report.photos.map((p, i) => (
              <div key={i}>
                <img src={p.imageUrl} alt="" className="w-full rounded-xl object-cover" />
                <p className="mt-2 font-body text-sm">{p.caption}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 font-body text-[15px] leading-relaxed">{report.summary}</p>
        </div>
        <div className="fixed bottom-0 left-0 right-0 flex flex-col gap-2 border-t border-black/10 bg-white p-4">
          <div className="flex gap-2">
            <button type="button" onClick={() => showToast('Sharing coming soon.')} className={actionBtnClass}>
              Share with client
            </button>
            <button type="button" onClick={() => showToast('Download coming soon.')} className={actionBtnClass}>
              Download
            </button>
          </div>
          {viewOnly ? (
            <button
              type="button"
              onClick={handleDelete}
              className="min-h-[48px] w-full rounded-xl border border-black/20 font-body text-sm text-red-600"
            >
              Delete
            </button>
          ) : job && onSaveToJob && onSaveReport ? (
            <button
              type="button"
              onClick={handleSave}
              className="min-h-[48px] w-full rounded-xl bg-black font-body text-sm text-white"
            >
              Save to job
            </button>
          ) : onSaveReport ? (
            <button
              type="button"
              onClick={() => {
                handleSave()
              }}
              className="min-h-[48px] w-full rounded-xl bg-black font-body text-sm text-white"
            >
              Save report
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="min-h-[48px] w-full rounded-xl bg-black font-body text-sm text-white"
            >
              Done
            </button>
          )}
        </div>
      </motion.div>
    )
  }

  return (
    <div className={`fixed inset-0 z-[85] flex flex-col overflow-y-auto bg-[var(--color-bg)] px-4 pt-6 ${NAV_PB}`}>
      <button type="button" onClick={onClose} className="self-start font-body text-[var(--color-text-secondary)]">
        Cancel
      </button>
      <h2 className="font-display mt-4 text-xl font-bold text-[var(--color-text-primary)]">Photo report</h2>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => void handleFiles(e.target.files)}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="mt-4 min-h-[48px] rounded-xl border border-[var(--color-border)] font-body text-[var(--color-text-primary)]"
      >
        Select photos
      </button>
      {photos.length > 0 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {photos.map((p, i) => (
            <img key={i} src={p.url} alt="" className="h-16 w-16 shrink-0 rounded-lg object-cover" />
          ))}
        </div>
      )}
      <textarea
        value={context}
        onChange={(e) => setContext(e.target.value)}
        placeholder="Any context to add? (optional)"
        rows={3}
        className="mt-4 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 font-body text-[var(--color-text-primary)]"
      />
      {error && <p className="mt-2 text-sm text-[var(--color-danger)]">{error}</p>}
      <button
        type="button"
        disabled={loading || photos.length === 0}
        onClick={() => void handleGenerate()}
        className="mt-6 flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-white font-body font-medium text-black disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            Nudge is writing your report...
          </>
        ) : (
          'Generate report'
        )}
      </button>
    </div>
  )
}
