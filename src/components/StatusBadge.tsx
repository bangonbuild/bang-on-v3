import type { JobStatus } from '../types'

const statusStyles: Record<JobStatus, { bg: string; text: string; label: string }> = {
  active: { bg: 'rgba(52,199,89,0.15)', text: '#34C759', label: 'Active' },
  'on-hold': { bg: 'rgba(255,149,0,0.15)', text: '#FF9500', label: 'On hold' },
  complete: { bg: 'rgba(255,255,255,0.1)', text: 'rgba(255,255,255,0.5)', label: 'Complete' },
}

export function StatusBadge({ status }: { status: JobStatus }) {
  const s = statusStyles[status]
  return (
    <span
      className="inline-block rounded-full px-2 py-0.5 text-[11px] font-medium"
      style={{ background: s.bg, color: s.text }}
    >
      {s.label}
    </span>
  )
}
