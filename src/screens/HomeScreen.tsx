import {
  Camera,
  ChevronRight,
  CircleUserRound,
  FileText,
  ImageIcon,
  Mic,
  Plus,
  ReceiptText,
  ScanLine,
  StickyNote,
  Upload,
} from 'lucide-react'
import { useMemo, useRef } from 'react'
import { Icon } from '../components/Icon'
import { JobCard } from '../components/JobCard'
import { NewsCard } from '../components/NewsCard'
import { WeatherDisplay } from '../components/WeatherDisplay'
import { useDesktop } from '../hooks/useDesktop'
import type { Job, Profile, TimelineEntryType } from '../types'
import { DESKTOP_PB, NAV_PB } from '../utils/layout'
import { loadJson, STORAGE_KEYS } from '../utils/storage'
import { getRecentActivity } from '../utils/recentActivity'
import { firstNameFromProfile } from '../utils/welcome'

interface HomeScreenProps {
  jobs: Job[]
  weather: {
    temp: number | null
    description: string
    rainChance: number
    loading: boolean
    available: boolean
  }
  onWeatherClick: () => void
  onSnap: () => void
  onUpload?: (file: File) => void
  onSpeak: () => void
  onJob: (id: string) => void
  onNewJob: () => void
  onOpenSettings: () => void
}

export function HomeScreen({
  jobs,
  weather,
  onWeatherClick,
  onSnap,
  onUpload,
  onSpeak,
  onJob,
  onNewJob,
  onOpenSettings,
}: HomeScreenProps) {
  const isDesktop = useDesktop()
  const uploadRef = useRef<HTMLInputElement>(null)
  const profile = loadJson<Profile>(STORAGE_KEYS.profile, { name: '', phone: '', trade: 'Carpenter' })
  const firstName = firstNameFromProfile(profile.name)
  const welcomeText = firstName
    ? `G'day ${firstName}, what are we tackling today?`
    : "G'day, what are we tackling today?"

  const recentActivity = useMemo(() => getRecentActivity(jobs, 4), [jobs])

  const activeJobs = useMemo(
    () =>
      [...jobs]
        .filter((j) => j.status !== 'complete')
        .sort((a, b) => b.updatedAt - a.updatedAt),
    [jobs],
  )

  const showWeather = weather.available || weather.loading
  const padClass = isDesktop ? DESKTOP_PB : NAV_PB
  const containerClass = isDesktop
    ? `px-10 pt-8 ${padClass}`
    : `px-4 pt-6 ${padClass}`

  const welcomeClass = isDesktop
    ? 'font-display text-[28px] font-bold leading-snug text-[var(--color-text-primary)] mt-4'
    : 'font-display text-[26px] font-bold leading-snug text-[var(--color-text-primary)] mt-4'

  const handleUploadClick = () => {
    if (onUpload) {
      uploadRef.current?.click()
      return
    }
    onSnap()
  }

  const jobsSection = (
    <>
      <p className="section-label section-gap">Your jobs</p>
      {activeJobs.length === 0 ? (
        <button
          type="button"
          onClick={onNewJob}
          className="mt-2 flex w-full items-center gap-3 rounded-xl border border-dashed border-[var(--color-border-2)] bg-[var(--color-surface)] p-4"
        >
          <Icon icon={Plus} size={24} muted />
          <div className="text-left">
            <p className="font-body font-medium text-[var(--color-text-primary)]">Start your first job</p>
            <p className="font-body text-[13px] text-[var(--color-text-secondary)]">
              Tap to create a job
            </p>
          </div>
        </button>
      ) : (
        <div className={`mt-2 flex gap-2 overflow-x-auto pb-1 ${isDesktop ? '' : '-mx-4 px-4'}`}>
          {activeJobs.map((job) => (
            <JobCard key={job.id} job={job} onClick={() => onJob(job.id)} />
          ))}
          <button
            type="button"
            onClick={onNewJob}
            className="flex h-auto w-[120px] shrink-0 items-center justify-center rounded-xl border border-dashed border-[var(--color-border-2)]"
          >
            <Icon icon={Plus} size={28} muted />
          </button>
        </div>
      )}
    </>
  )

  const newsSection = (
    <>
      <p className={`section-label ${isDesktop ? 'mt-0' : 'section-gap'}`}>Tradie news</p>
      <div className="mt-2 flex flex-col gap-2">
        <NewsCard
          headline="New NCC requirements for residential builds — what you need to know before July"
          timestamp="2h ago"
        />
      </div>
    </>
  )

  const activitySection = (
    <>
      <p className="section-label section-gap">Recent activity</p>
      {recentActivity.length === 0 ? (
        <p className="mt-4 text-center font-body text-[13px] text-[var(--color-text-tertiary)]">
          No recent activity. Start by creating a job.
        </p>
      ) : (
        <div className="mt-2 flex flex-col gap-2">
          {recentActivity.map((item) => (
            <button
              key={`${item.jobId}-${item.id}`}
              type="button"
              onClick={() => onJob(item.jobId)}
              className="flex w-full items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-left"
            >
              <ActivityIcon type={item.type} />
              <div className="min-w-0 flex-1">
                <p className="font-body text-[14px] text-[var(--color-text-primary)]">{item.description}</p>
                <p className="font-body text-[12px] text-[var(--color-text-tertiary)]">{item.timeLabel}</p>
              </div>
              <ChevronRight size={18} strokeWidth={1.5} className="shrink-0 text-[var(--color-text-tertiary)]" />
            </button>
          ))}
        </div>
      )}
    </>
  )

  const actionCards = (
    <div className="section-gap grid grid-cols-2 gap-2">
      {isDesktop ? (
        <>
          <input
            ref={uploadRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file && onUpload) onUpload(file)
              e.target.value = ''
            }}
          />
          <button
            type="button"
            onClick={handleUploadClick}
            className="snap-speak-card rounded-xl p-5 text-left active:opacity-90"
          >
            <Upload size={24} strokeWidth={2} className="snap-speak-icon" />
            <p className="snap-speak-title font-display mt-3 text-lg font-bold">UPLOAD</p>
            <p className="snap-speak-subtitle mt-1 font-body text-[13px] opacity-60">
              Upload a photo for site advice
            </p>
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={onSnap}
          className="snap-speak-card rounded-xl p-5 text-left active:opacity-90"
        >
          <ScanLine size={24} strokeWidth={2} className="snap-speak-icon" />
          <p className="snap-speak-title font-display mt-3 text-lg font-bold">SNAP</p>
          <p className="snap-speak-subtitle mt-1 font-body text-[13px] opacity-60">Photo site advice</p>
        </button>
      )}
      <button
        type="button"
        onClick={onSpeak}
        className="snap-speak-card rounded-xl p-5 text-left active:opacity-90"
      >
        <Mic size={24} strokeWidth={2} className="snap-speak-icon" />
        <p className="snap-speak-title font-display mt-3 text-lg font-bold">SPEAK</p>
        <p className="snap-speak-subtitle mt-1 font-body text-[13px] opacity-60">Ask with your voice</p>
      </button>
    </div>
  )

  if (isDesktop) {
    return (
      <div className={containerClass}>
        <div className="mx-auto flex max-w-[960px] gap-10">
          <div className="min-w-0 flex-[0.55]">
            {showWeather && (
              <div className="-mt-0.5">
                <WeatherDisplay
                  temp={weather.temp}
                  description={weather.description}
                  rainChance={weather.rainChance}
                  loading={weather.loading}
                  onClick={onWeatherClick}
                />
              </div>
            )}
            <p className={welcomeClass}>{welcomeText}</p>
            {actionCards}
            {jobsSection}
          </div>
          <div className="min-w-0 flex-[0.45]">
            {newsSection}
            {activitySection}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={containerClass}>
      <header>
        <div className="flex items-center justify-between gap-3">
          <h1 className="font-display text-[20px] font-semibold leading-none text-[var(--color-text-primary)]">
            datum.ai
          </h1>
          <button
            type="button"
            onClick={onOpenSettings}
            className="flex shrink-0 items-center justify-center"
            aria-label="Settings"
          >
            <Icon icon={CircleUserRound} size={28} strokeWidth={1.5} />
          </button>
        </div>
        {showWeather && (
          <div className="-mt-0.5">
            <WeatherDisplay
              temp={weather.temp}
              description={weather.description}
              rainChance={weather.rainChance}
              loading={weather.loading}
              onClick={onWeatherClick}
            />
          </div>
        )}
      </header>

      <p className={welcomeClass}>{welcomeText}</p>
      {actionCards}
      {jobsSection}
      {newsSection}
      {activitySection}
    </div>
  )
}

function ActivityIcon({ type }: { type: TimelineEntryType }) {
  const iconProps = {
    size: 18 as const,
    strokeWidth: 1.5 as const,
    className: 'shrink-0 text-[var(--color-text-secondary)]',
    style: { display: 'block' as const },
  }

  switch (type) {
    case 'note':
      return <StickyNote {...iconProps} />
    case 'photo':
      return <Camera {...iconProps} />
    case 'quote':
      return <ReceiptText {...iconProps} />
    case 'invoice':
      return <FileText {...iconProps} />
    case 'photo-report':
      return <ImageIcon {...iconProps} />
    default:
      return <StickyNote {...iconProps} />
  }
}
