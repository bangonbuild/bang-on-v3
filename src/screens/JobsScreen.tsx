import { Briefcase, Plus } from 'lucide-react'
import { JobCard } from '../components/JobCard'
import type { Job, JobFilter } from '../types'
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
  const filtered =
    filter === 'all' ? jobs : jobs.filter((j) => j.status === filter)

  return (
    <div className="relative min-h-full px-4 pb-28 pt-6">
      <h1 className="font-display text-2xl font-bold text-white">Jobs</h1>
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

      {filtered.length === 0 ? (
        <div className="mt-20 flex flex-col items-center text-center">
          <Briefcase size={40} className="text-[var(--color-text-tertiary)]" />
          <p className="mt-4 font-body text-white">No jobs yet</p>
          <button
            type="button"
            onClick={onNewJob}
            className="mt-2 font-body text-[var(--color-text-secondary)] underline"
          >
            Create your first job →
          </button>
        </div>
      ) : (
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
        className="fixed bottom-24 right-4 flex h-14 w-14 items-center justify-center rounded-full bg-white"
        aria-label="New job"
      >
        <Plus size={28} className="text-black" />
      </button>
    </div>
  )
}
