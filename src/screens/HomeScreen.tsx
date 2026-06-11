import {
  Camera,
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
import { useEffect, useMemo, useRef, useState } from 'react'
import { Icon } from '../components/Icon'
import { JobCard } from '../components/JobCard'
import { NewsCard } from '../components/NewsCard'
import { SkeletonItem } from '../components/SkeletonItem'
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
  const [initialLoading, setInitialLoading] = useState(true)
  const profile = loadJson<Profile>(STORAGE_KEYS.profile, { name: '', phone: '', trade: 'Carpenter' })
  const firstName = firstNameFromProfile(profile.name)
  const welcomeText = firstName
    ? `G'day ${firstName}, what are we tackling today?`
    : "G'day, what are we tackling today?"

  useEffect(() => {
    const t = window.setTimeout(() => setInitialLoading(false), 450)
    return () => window.clearTimeout(t)
  }, [])

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
    : `px-4 pt-[24px] ${padClass}`

  const welcomeClass = isDesktop
    ? 'font-display text-[28px] font-bold leading-snug text-[var(--color-text-primary)]'
    : 'font-display text-[26px] font-bold leading-snug text-[var(--color-text-primary)]'

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
      {initialLoading ? (
        <div className={`mt-2 flex gap-2 overflow-x-auto pb-1 ${isDesktop ? '' : '-mx-4 px-4'}`}>
          <SkeletonItem className="w-[220px] shrink-0" height={120} />
          <SkeletonItem className="w-[220px] shrink-0" height={120} />
        </div>
      ) : activeJobs.length === 0 ? (
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
      <p className="section-label section-gap">Tradie news</p>
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
      {initialLoading ? (
        <div className="mt-2 flex flex-col">
          <SkeletonItem className="w-full rounded-none" height={48} />
          <SkeletonItem className="mt-2 w-full rounded-none" height={48} />
          <SkeletonItem className="mt-2 w-full rounded-none" height={48} />
        </div>
      ) : recentActivity.length === 0 ? (
        <p className="mt-4 text-center font-body text-[13px] text-[var(--color-text-tertiary)]">
          No recent activity. Start by creating a job.
        </p>
      ) : (
        <div className="mt-2 flex flex-col">
          {recentActivity.map((item, i) => (
            <button
              key={`${item.jobId}-${item.id}`}
              type="button"
              onClick={() => onJob(item.jobId)}
              className={`flex min-h-[48px] w-full items-center gap-3 py-2 text-left ${
                i < recentActivity.length - 1 ? 'border-b border-[var(--color-border)]' : ''
              }`}
            >
              <ActivityIcon type={item.type} />
              <span className="min-w-0 flex-1 truncate font-body text-[14px] text-[var(--color-text-primary)]">
                {item.description}
              </span>
              <span className="shrink-0 font-body text-[12px] text-[var(--color-text-tertiary)]">
                {item.timeLabel}
              </span>
            </button>
          ))}
        </div>
      )}
    </>
  )

  const actionCards = (
    <div className="mt-5 grid grid-cols-2 gap-2">
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

  const welcomeBlock = (
    <>
      <p className={welcomeClass}>{welcomeText}</p>
      {actionCards}
    </>
  )

  if (isDesktop) {
    return (
      <div className={containerClass}>
        <div className="mx-auto flex max-w-[960px] gap-10">
          <div className="min-w-0 flex-[0.55]">
            {showWeather && (
              <div className="mt-2">
                <WeatherDisplay
                  temp={weather.temp}
                  description={weather.description}
                  rainChance={weather.rainChance}
                  loading={weather.loading}
                  onClick={onWeatherClick}
                />
              </div>
            )}
            <div className="mt-4">{welcomeBlock}</div>
            {jobsSection}
          </div>
          <div className="min-w-0 flex-[0.45]">
            {activitySection}
            {newsSection}
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
          <div className="mt-2">
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

      <div className="mt-8">{welcomeBlock}</div>
      {jobsSection}
      {activitySection}
      {newsSection}
    </div>
  )
}

function ActivityIcon({ type }: { type: TimelineEntryType }) {
  const iconProps = {
    size: 18 as const,
    strokeWidth: 1.5 as const,
    className: 'shrink-0 text-[var(--color-text-tertiary)]',
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
