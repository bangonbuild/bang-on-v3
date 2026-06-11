import {
  FileText,
  ImageIcon,
  Loader2,
  ReceiptText,
  StickyNote,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import type { Job, JobStatus, TimelineEntry } from '../types'
import { formatDate, formatRelativeTime } from '../utils/storage'

interface PortalData {
  job: Job
  message: string
  sentAt: number
}

const statusStyles: Record<JobStatus, { bg: string; text: string; label: string }> = {
  active: { bg: 'rgba(52,199,89,0.15)', text: '#34C759', label: 'Active' },
  'on-hold': { bg: 'rgba(255,149,0,0.15)', text: '#FF9500', label: 'On hold' },
  complete: { bg: '#f0f0f0', text: '#666666', label: 'Complete' },
}

function PortalStatusBadge({ status }: { status: JobStatus }) {
  const s = statusStyles[status]
  return (
    <span
      className="inline-block rounded-full px-3 py-1 text-xs font-medium capitalize"
      style={{ background: s.bg, color: s.text }}
    >
      {s.label}
    </span>
  )
}

function PortalTimelineEntry({ entry }: { entry: TimelineEntry }) {
  const iconClass = 'text-[#666666]'

  if (entry.type === 'photo' && entry.imageUrl) {
    return (
      <div className="rounded-xl border border-[#EEEEEE] p-4">
        <ImageIcon size={18} strokeWidth={1.5} className={iconClass} />
        <img src={entry.imageUrl} alt="" className="mt-3 w-full rounded-lg object-cover" />
        {entry.content && <p className="mt-2 text-[15px] text-[#111111]">{entry.content}</p>}
        <p className="mt-1 text-xs text-[#666666]">{formatRelativeTime(entry.timestamp)}</p>
      </div>
    )
  }

  if (entry.type === 'quote' || entry.type === 'invoice') {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-[#EEEEEE] p-4">
        {entry.type === 'quote' ? (
          <ReceiptText size={18} strokeWidth={1.5} className={iconClass} />
        ) : (
          <FileText size={18} strokeWidth={1.5} className={iconClass} />
        )}
        <div>
          <p className="capitalize text-[#111111]">
            {entry.type} — ${entry.amount?.toLocaleString() ?? '0'}
          </p>
          <p className="mt-1 text-xs text-[#666666]">{formatRelativeTime(entry.timestamp)}</p>
        </div>
      </div>
    )
  }

  if (entry.type === 'photo-report') {
    return (
      <div className="rounded-xl border border-[#EEEEEE] p-4">
        <ImageIcon size={18} strokeWidth={1.5} className={iconClass} />
        <p className="mt-2 text-[15px] text-[#111111]">Photo report</p>
        <p className="mt-1 text-xs text-[#666666]">{formatRelativeTime(entry.timestamp)}</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-[#EEEEEE] p-4">
      <StickyNote size={18} strokeWidth={1.5} className={iconClass} />
      <p className="mt-2 text-[15px] leading-relaxed text-[#333333]">{entry.content}</p>
      <p className="mt-1 text-xs text-[#666666]">{formatRelativeTime(entry.timestamp)}</p>
    </div>
  )
}

export function PortalScreen() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [data, setData] = useState<PortalData | null>(null)

  useEffect(() => {
    const jobId = window.location.pathname.split('/portal/')[1]?.split('/')[0]
    if (!jobId) {
      setError(true)
      setLoading(false)
      return
    }

    fetch(`/api/portal/${jobId}`)
      .then((r) => {
        if (!r.ok) throw new Error('Not found')
        return r.json()
      })
      .then((portalData: PortalData) => {
        setData(portalData)
        setLoading(false)
      })
      .catch(() => {
        setError(true)
        setLoading(false)
      })
  }, [])

  const visibleTimeline = data?.job.timeline.filter((e) => e.clientVisible === true) ?? []

  return (
    <div className="min-h-screen bg-white text-[#111111]">
      <div className="mx-auto max-w-lg px-4 py-8">
        <p className="font-display text-[18px] font-bold text-[#14120a]">datum.ai</p>

        {loading && (
          <div className="mt-24 flex flex-col items-center gap-4">
            <Loader2 size={28} className="animate-spin text-[#666666]" />
          </div>
        )}

        {error && !loading && (
          <div className="mt-12">
            <p className="mt-4 text-[16px] leading-relaxed text-[#333333]">
              This link has expired or is no longer available.
            </p>
            <p className="mt-2 text-[15px] text-[#666666]">Contact your tradie for a new update.</p>
          </div>
        )}

        {data && !loading && (
          <>
            <h1 className="mt-8 text-[24px] font-semibold text-[#111111]">{data.job.name}</h1>
            <div className="mt-3">
              <PortalStatusBadge status={data.job.status} />
            </div>
            <p className="mt-2 text-[13px] text-[#666666]">Sent: {formatDate(data.sentAt)}</p>

            <hr className="my-6 border-[#EEEEEE]" />

            <p className="text-[16px] leading-[28px] text-[#333333]">{data.message}</p>

            {visibleTimeline.length > 0 && (
              <>
                <hr className="my-6 border-[#EEEEEE]" />
                <div className="flex flex-col gap-3">
                  {visibleTimeline.map((entry) => (
                    <PortalTimelineEntry key={entry.id} entry={entry} />
                  ))}
                </div>
              </>
            )}

            <p className="mt-12 text-center text-[12px] text-[#666666]">
              Powered by{' '}
              <a href="https://datum-app.vercel.app" className="underline">
                datum.ai
              </a>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
