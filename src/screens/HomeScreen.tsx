import { Mic, Plus, ScanLine } from 'lucide-react'
import { Icon } from '../components/Icon'
import { JobCard } from '../components/JobCard'
import { NewsCard } from '../components/NewsCard'
import { WeatherPill } from '../components/WeatherPill'
import type { Job } from '../types'

interface HomeScreenProps {
  jobs: Job[]
  weather: { temp: number | null; rainChance: number; loading: boolean }
  onWeatherClick: () => void
  onSnap: () => void
  onSpeak: () => void
  onJob: (id: string) => void
  onNewJob: () => void
}

export function HomeScreen({
  jobs,
  weather,
  onWeatherClick,
  onSnap,
  onSpeak,
  onJob,
  onNewJob,
}: HomeScreenProps) {
  const activeJobs = jobs.filter((j) => j.status !== 'complete')

  return (
    <div className="px-4 pb-24 pt-6">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-[28px] font-bold text-white">Bangon</h1>
          <p className="mt-1 font-display text-[13px] text-[var(--color-text-secondary)]">
            Built for the job.
          </p>
        </div>
        <WeatherPill
          temp={weather.temp}
          rainChance={weather.rainChance}
          loading={weather.loading}
          onClick={onWeatherClick}
        />
      </header>

      <div className="mt-10 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onSnap}
          className="rounded-xl bg-white p-5 text-left active:bg-[#F0F0F0]"
        >
          <ScanLine size={24} strokeWidth={2} className="text-black" style={{ shapeRendering: 'geometricPrecision' }} />
          <p className="font-display mt-3 text-lg font-bold text-black">SNAP</p>
          <p className="mt-1 font-body text-[13px] text-black/60">Photo → site advice</p>
        </button>
        <button
          type="button"
          onClick={onSpeak}
          className="rounded-xl bg-white p-5 text-left active:bg-[#F0F0F0]"
        >
          <Mic size={24} strokeWidth={2} className="text-black" style={{ shapeRendering: 'geometricPrecision' }} />
          <p className="font-display mt-3 text-lg font-bold text-black">SPEAK</p>
          <p className="mt-1 font-body text-[13px] text-black/60">Ask with your voice</p>
        </button>
      </div>

      <p className="font-display mt-6 text-[11px] tracking-[0.12em] text-[var(--color-text-tertiary)]">
        Your jobs
      </p>
      {activeJobs.length === 0 ? (
        <button
          type="button"
          onClick={onNewJob}
          className="mt-2 flex w-full items-center gap-3 rounded-xl border border-dashed border-[var(--color-border-2)] bg-[var(--color-surface)] p-4"
        >
          <Icon icon={Plus} size={24} muted />
          <div className="text-left">
            <p className="font-body font-medium text-white">Start your first job</p>
            <p className="font-body text-[13px] text-[var(--color-text-secondary)]">
              Tap to create a job
            </p>
          </div>
        </button>
      ) : (
        <div className="-mx-4 mt-2 flex gap-2 overflow-x-auto px-4 pb-1">
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

      <p className="font-display mt-6 text-[11px] tracking-[0.12em] text-[var(--color-text-tertiary)]">
        Tradie news
      </p>
      <div className="mt-2 flex flex-col gap-2">
        <NewsCard
          headline="New NCC requirements for residential builds — what you need to know before July"
          timestamp="2h ago"
        />
        <NewsCard
          headline="Timber prices stabilise after 18 months of volatility, suppliers confirm"
          timestamp="5h ago"
        />
        <NewsCard
          headline="CFMEU crackdown — what site supervisors need to document from Monday"
          timestamp="1d ago"
        />
      </div>
    </div>
  )
}
