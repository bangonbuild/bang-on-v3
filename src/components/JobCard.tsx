import type { Job } from '../types'

interface JobCardProps {
  job: Job
  onClick: () => void
  compact?: boolean
}

const statusStyles: Record<Job['status'], { bg: string; text: string; label: string }> = {
  active: { bg: 'rgba(52,199,89,0.15)', text: '#34C759', label: 'Active' },
  'on-hold': { bg: 'rgba(255,149,0,0.15)', text: '#FF9500', label: 'On hold' },
  complete: { bg: 'rgba(255,255,255,0.1)', text: 'rgba(255,255,255,0.5)', label: 'Complete' },
}

export function JobCard({ job, onClick, compact = true }: JobCardProps) {
  const status = statusStyles[job.status]

  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-left ${
        compact ? 'w-[220px]' : 'w-full'
      } ${job.attention ? 'border-l-[3px] border-l-[var(--color-border-2)]' : ''}`}
    >
      <p className="font-body text-[15px] font-medium text-white">{job.name}</p>
      {!compact && (
        <>
          <p className="mt-1 font-body text-[13px] text-[var(--color-text-secondary)]">
            {job.client}
          </p>
          {job.address && (
            <p className="font-body text-[13px] text-[var(--color-text-secondary)]">
              {job.address}
            </p>
          )}
        </>
      )}
      {job.attention && (
        <p className="mt-2 font-body text-xs text-white">{job.attention}</p>
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
