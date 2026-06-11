import { Briefcase, Filter, Plus } from 'lucide-react'
import { useState } from 'react'
import { Icon } from '../components/Icon'
import { ScreenTitle } from '../components/ScreenTitle'
import { JobCard } from '../components/JobCard'
import { JobDetailScreen } from './JobDetailScreen'
import { JobFormScreen } from './JobFormScreen'
import { useDesktop } from '../hooks/useDesktop'
import type { Job, JobFilter, JobStatus, MoneyRecord, Profile, TimelineEntry } from '../types'
import type { ShowToastFn } from '../hooks/useToast'
import { DESKTOP_PB, NAV_PB } from '../utils/layout'
import { formatRelativeTime } from '../utils/storage'

type JobDetailTab = 'timeline' | 'invoices' | 'quotes'

export interface JobsDesktopHandlers {
  profile: Profile
  getJobInvoices: (jobId: string) => MoneyRecord[]
  getJobQuotes: (jobId: string) => MoneyRecord[]
  onNudge: (jobId: string) => void
  onOpenMoneyRecord: (jobId: string, record: MoneyRecord) => void
  onQuote: (jobId: string) => void
  onInvoice: (jobId: string) => void
  onPhotoReport: (jobId: string) => void
  onAddNote: (jobId: string, content: string) => void
  onAddPhoto: (jobId: string, content: string, imageUrl: string) => void
  onUpdateEntry: (jobId: string, entryId: string, updates: Partial<TimelineEntry>) => void
  onOpenDoc: (jobId: string, entry: TimelineEntry) => void
  onSaveJob: (
    data: {
      name: string
      client: string
      email?: string
      phone: string
      address: string
      status: JobStatus
    },
    existingId?: string,
  ) => string
  onDeleteJob: (jobId: string) => void
  showToast: ShowToastFn
  initialDetailTab?: JobDetailTab
  selectedJobId?: string | null
  onSelectJob?: (id: string | null) => void
}

interface JobsScreenProps {
  jobs: Job[]
  filter: JobFilter
  onFilterChange: (f: JobFilter) => void
  onJob: (id: string) => void
  onNewJob: () => void
  desktopHandlers?: JobsDesktopHandlers
}

const filters: { id: JobFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'on-hold', label: 'On hold' },
  { id: 'complete', label: 'Complete' },
]

function JobsListPanel({
  jobs,
  filter,
  onFilterChange,
  selectedJobId,
  onSelectJob,
  onNewJob,
}: {
  jobs: Job[]
  filter: JobFilter
  onFilterChange: (f: JobFilter) => void
  selectedJobId: string | null
  onSelectJob: (id: string) => void
  onNewJob: () => void
}) {
  const filtered = filter === 'all' ? jobs : jobs.filter((j) => j.status === filter)
  const showCreateEmpty = filter === 'all' && jobs.length === 0
  const showFilterEmpty = filtered.length === 0 && !showCreateEmpty

  return (
    <div className="flex h-full min-h-0 flex-col border-r border-[var(--color-border)]">
      <div className="shrink-0 px-5 pt-8">
        <ScreenTitle>Jobs</ScreenTitle>
        <div className="mt-4 flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => onFilterChange(f.id)}
              className={`min-h-[36px] rounded-full px-4 font-body text-sm ${
                filter === f.id ? 'chip-active' : 'chip-inactive'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 min-h-0 flex-1 overflow-y-auto px-5 pb-4">
        {showCreateEmpty && (
          <div className="mt-12 flex flex-col items-center text-center">
            <Icon icon={Briefcase} size={40} muted />
            <p className="mt-4 font-body text-[var(--color-text-primary)]">No jobs yet</p>
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
          <div className="mt-12 flex flex-col items-center text-center">
            <Icon icon={Filter} size={32} muted />
            <p className="mt-4 font-body text-[15px] text-[var(--color-text-secondary)]">No jobs here</p>
            <p className="mt-1 font-body text-[13px] text-[var(--color-text-tertiary)]">
              Try a different filter
            </p>
          </div>
        )}

        {filtered.length > 0 && (
          <div className="flex flex-col gap-2">
            {filtered.map((job) => (
              <div
                key={job.id}
                className={`relative overflow-hidden rounded-xl ${
                  selectedJobId === job.id ? 'ring-1 ring-inset ring-white' : ''
                }`}
                style={
                  selectedJobId === job.id
                    ? { boxShadow: 'inset 3px 0 0 0 white' }
                    : undefined
                }
              >
                <JobCard job={job} compact={false} onClick={() => onSelectJob(job.id)} />
                <p className="pointer-events-none absolute bottom-4 right-4 font-body text-xs text-[var(--color-text-tertiary)]">
                  {formatRelativeTime(job.updatedAt)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-[var(--color-border)] p-5">
        <button
          type="button"
          onClick={onNewJob}
          className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl btn-primary font-body font-medium"
        >
          <Plus size={20} strokeWidth={2} />
          New job
        </button>
      </div>
    </div>
  )
}

export function JobsScreen({
  jobs,
  filter,
  onFilterChange,
  onJob,
  onNewJob,
  desktopHandlers,
}: JobsScreenProps) {
  const isDesktop = useDesktop()
  const [localSelectedId, setLocalSelectedId] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editJobId, setEditJobId] = useState<string | undefined>()

  const useDesktopLayout = isDesktop && desktopHandlers

  const selectedJobId =
    useDesktopLayout && desktopHandlers?.selectedJobId !== undefined
      ? desktopHandlers.selectedJobId
      : localSelectedId

  const setSelectedJobId = (id: string | null) => {
    if (desktopHandlers?.onSelectJob) desktopHandlers.onSelectJob(id)
    else setLocalSelectedId(id)
  }

  const filtered = filter === 'all' ? jobs : jobs.filter((j) => j.status === filter)
  const showCreateEmpty = filter === 'all' && jobs.length === 0
  const showFilterEmpty = filtered.length === 0 && !showCreateEmpty

  if (useDesktopLayout) {
    const h = desktopHandlers
    const selectedJob = selectedJobId ? jobs.find((j) => j.id === selectedJobId) : undefined
    const editingJob = editJobId ? jobs.find((j) => j.id === editJobId) : undefined

    const handleNewJob = () => {
      setEditJobId(undefined)
      setFormOpen(true)
      setSelectedJobId(null)
    }

    const handleEditJob = (jobId: string) => {
      setEditJobId(jobId)
      setFormOpen(true)
    }

    return (
      <div className={`flex h-full min-h-0 ${DESKTOP_PB}`}>
        <div className="w-[380px] shrink-0">
          <JobsListPanel
            jobs={jobs}
            filter={filter}
            onFilterChange={onFilterChange}
            selectedJobId={selectedJobId}
            onSelectJob={(id) => {
              setFormOpen(false)
              setEditJobId(undefined)
              setSelectedJobId(id)
            }}
            onNewJob={handleNewJob}
          />
        </div>
        <div className="min-w-0 flex-1 overflow-hidden">
          {formOpen ? (
            <JobFormScreen
              embedded
              job={editingJob}
              onBack={() => {
                setFormOpen(false)
                setEditJobId(undefined)
              }}
              onSave={(data) => {
                const id = h.onSaveJob(data, editingJob?.id)
                setFormOpen(false)
                setEditJobId(undefined)
                setSelectedJobId(id)
              }}
              onDelete={
                editingJob
                  ? () => {
                      h.onDeleteJob(editingJob.id)
                      setFormOpen(false)
                      setEditJobId(undefined)
                      setSelectedJobId(null)
                    }
                  : undefined
              }
            />
          ) : selectedJob ? (
            <JobDetailScreen
              embedded
              job={selectedJob}
              profile={h.profile}
              jobInvoices={h.getJobInvoices(selectedJob.id)}
              jobQuotes={h.getJobQuotes(selectedJob.id)}
              onBack={() => setSelectedJobId(null)}
              onEdit={() => handleEditJob(selectedJob.id)}
              onNudge={() => h.onNudge(selectedJob.id)}
              onOpenMoneyRecord={(record) => h.onOpenMoneyRecord(selectedJob.id, record)}
              onQuote={() => h.onQuote(selectedJob.id)}
              onInvoice={() => h.onInvoice(selectedJob.id)}
              onPhotoReport={() => h.onPhotoReport(selectedJob.id)}
              onAddNote={(content) => h.onAddNote(selectedJob.id, content)}
              onAddPhoto={(content, imageUrl) => h.onAddPhoto(selectedJob.id, content, imageUrl)}
              onUpdateEntry={(entryId, updates) =>
                h.onUpdateEntry(selectedJob.id, entryId, updates)
              }
              onOpenDoc={(entry) => h.onOpenDoc(selectedJob.id, entry)}
              showToast={h.showToast}
              initialTab={h.initialDetailTab}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center px-8 text-center">
              <Icon icon={Briefcase} size={48} muted />
              <p className="mt-4 font-body text-[15px] text-[var(--color-text-secondary)]">
                Select a job to view details
              </p>
            </div>
          )}
        </div>
      </div>
    )
  }

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
              filter === f.id ? 'chip-active' : 'chip-inactive'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {showCreateEmpty && (
        <div className="mt-20 flex flex-col items-center text-center">
          <Icon icon={Briefcase} size={40} muted />
          <p className="mt-4 font-body text-[var(--color-text-primary)]">No jobs yet</p>
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
        className="fixed bottom-[calc(3.5rem+env(safe-area-inset-bottom)+1rem)] right-4 flex h-14 w-14 items-center justify-center rounded-full btn-primary"
        aria-label="New job"
      >
        <Plus size={28} strokeWidth={2} style={{ shapeRendering: 'geometricPrecision' }} />
      </button>
    </div>
  )
}
