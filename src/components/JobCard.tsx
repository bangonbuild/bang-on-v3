import type { Job } from '../types'
import { formatRelativeTime } from '../utils/storage'

interface JobCardProps {
  job: Job
  onClick: () => void
  compact?: boolean
}

const statusStyles: Record<Job['status'], { bg: string; text: string; label: string }> = {
  active: { bg: 'rgba(52,199,89,0.15)', text: '#34C759', label: 'Active' },
  'on-hold': { bg: 'rgba(255,149,0,0.15)', text: '#FF9500', label: 'On hold' },
  complete: {
    bg: 'color-mix(in srgb, var(--color-text-primary) 10%, transparent)',
    text: 'var(--color-text-tertiary)',
    label: 'Complete',
  },
}

export function JobCard({ job, onClick, compact = true }: JobCardProps) {
  const status = statusStyles[job.status]

  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-left ${
        compact ? 'w-[220px]' : 'w-full'
      }`}
    >
      <p className="font-body text-[15px] font-medium text-[var(--color-text-primary)]">{job.name}</p>
      <p className="mt-1 font-body text-[13px] text-[var(--color-text-secondary)]">{job.client}</p>
      <p className="mt-0.5 font-body text-[12px] text-[var(--color-text-tertiary)]">
        Updated {formatRelativeTime(job.updatedAt)}
      </p>
      {!compact && job.address && (
        <p className="mt-1 font-body text-[13px] text-[var(--color-text-secondary)]">{job.address}</p>
      )}
      {job.attention && (
        <p className="mt-2 font-body text-xs text-[var(--color-text-primary)]">{job.attention}</p>
      )}
      <span
        className="mt-3 inline-block rounded-full px-2 py-0.5 text-[11px] font-medium"
        style={{ background: status.bg, color: status.text }}
      >
        {status.label}
      </span>
    </button>
  )
}
