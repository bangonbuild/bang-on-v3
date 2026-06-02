import { Briefcase, Filter, Plus } from 'lucide-react'
import { Icon } from '../components/Icon'
import { ScreenTitle } from '../components/ScreenTitle'
import { JobCard } from '../components/JobCard'
import type { Job, JobFilter } from '../types'
import { NAV_PB } from '../utils/layout'
import { formatRelativeTime } from '../utils/storage'

interface JobsScreenProps {
  jobs: Job[]
  filter: JobFilter
  onFilterChange: (f: JobFilter) => void
  onJob: (id: string) => void
  onNewJob: () => void
}

const filters: { id: JobFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'on-hold', label: 'On hold' },
  { id: 'complete', label: 'Complete' },
]

export function JobsScreen({
  jobs,
  filter,
  onFilterChange,
  onJob,
  onNewJob,
}: JobsScreenProps) {
  const filtered = filter === 'all' ? jobs : jobs.filter((j) => j.status === filter)
  const showCreateEmpty = filter === 'all' && jobs.length === 0
  const showFilterEmpty = filtered.length === 0 && !showCreateEmpty

  return (
    <div className={`relative min-h-full px-4 pt-6 ${NAV_PB}`}>
      <ScreenTitle>Jobs</ScreenTitle>
      <div className="mt-4 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => onFilterChange(f.id)}
            className={`min-h-[36px] rounded-full px-4 font-body text-sm ${
              filter === f.id
                ? 'bg-white text-black'
                : 'border border-[var(--color-border)] bg-[var(--color-surface-2)] text-white'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {showCreateEmpty && (
        <div className="mt-20 flex flex-col items-center text-center">
          <Icon icon={Briefcase} size={40} muted />
          <p className="mt-4 font-body text-white">No jobs yet</p>
          <button
            type="button"
            onClick={onNewJob}
            className="mt-2 font-body text-[var(--color-text-secondary)] underline"
          >
            Create your first job →
          </button>
        </div>
      )}

      {showFilterEmpty && (
        <div className="mt-20 flex flex-col items-center text-center">
          <Icon icon={Filter} size={32} muted />
          <p className="mt-4 font-body text-[15px] text-[var(--color-text-secondary)]">No jobs here</p>
          <p className="mt-1 font-body text-[13px] text-[var(--color-text-tertiary)]">
            Try a different filter
          </p>
        </div>
      )}

      {filtered.length > 0 && (
        <div className="mt-4 flex flex-col gap-2">
          {filtered.map((job) => (
            <div key={job.id} className="relative">
              <JobCard job={job} compact={false} onClick={() => onJob(job.id)} />
              <p className="absolute bottom-4 right-4 font-body text-xs text-[var(--color-text-tertiary)]">
                {formatRelativeTime(job.updatedAt)}
              </p>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={onNewJob}
        className="fixed bottom-[calc(3.5rem+env(safe-area-inset-bottom)+1rem)] right-4 flex h-14 w-14 items-center justify-center rounded-full bg-white"
        aria-label="New job"
      >
        <Plus size={28} strokeWidth={2} className="text-black" style={{ shapeRendering: 'geometricPrecision' }} />
      </button>
    </div>
  )
}
