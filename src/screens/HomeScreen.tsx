import { AnimatePresence, motion } from 'framer-motion'
import { Mic, Plus, ScanLine, UserCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Icon } from '../components/Icon'
import { JobCard } from '../components/JobCard'
import { NewsCard } from '../components/NewsCard'
import { WeatherDisplay } from '../components/WeatherDisplay'
import type { Job } from '../types'
import { NAV_PB } from '../utils/layout'

const TAGLINES = [
  'AI-powered tradie tools.',
  'A toolbox in your pocket.',
  'Built for the job.',
  'Built to save time.',
  'The smartest tool on site.',
]

interface HomeScreenProps {
  jobs: Job[]
  weather: { temp: number | null; description: string; rainChance: number; loading: boolean }
  onWeatherClick: () => void
  onSnap: () => void
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
  onSpeak,
  onJob,
  onNewJob,
  onOpenSettings,
}: HomeScreenProps) {
  const [taglineIndex, setTaglineIndex] = useState(0)
  const activeJobs = jobs.filter((j) => j.status !== 'complete')

  useEffect(() => {
    const t = window.setInterval(() => {
      setTaglineIndex((i) => (i + 1) % TAGLINES.length)
    }, 5000)
    return () => window.clearInterval(t)
  }, [])

  return (
    <div className={`px-4 pt-6 ${NAV_PB}`}>
      <header>
        <div className="flex items-center justify-between gap-3">
          <h1 className="font-display text-[28px] font-bold leading-none text-[var(--color-text-primary)]">
            Bang On
          </h1>
          <button
            type="button"
            onClick={onOpenSettings}
            className="flex shrink-0 items-center justify-center"
            aria-label="Settings"
          >
            <UserCircle
              size={28}
              strokeWidth={2}
              className="text-[var(--color-text-primary)]"
              style={{ shapeRendering: 'geometricPrecision' }}
            />
          </button>
        </div>
        <div className="relative mt-1 h-5 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.p
              key={taglineIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="font-display text-[13px] text-[var(--color-text-secondary)]"
            >
              {TAGLINES[taglineIndex]}
            </motion.p>
          </AnimatePresence>
        </div>
        <div className="mt-2">
          <WeatherDisplay
            temp={weather.temp}
            description={weather.description}
            rainChance={weather.rainChance}
            loading={weather.loading}
            onClick={onWeatherClick}
          />
        </div>
      </header>

      <div className="mt-10 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onSnap}
          className="snap-speak-card rounded-xl p-5 text-left active:opacity-90"
        >
          <ScanLine size={24} strokeWidth={2} className="snap-speak-icon" style={{ shapeRendering: 'geometricPrecision' }} />
          <p className="snap-speak-title font-display mt-3 text-lg font-bold">SNAP</p>
          <p className="snap-speak-subtitle mt-1 font-body text-[13px] opacity-60">Photo → site advice</p>
        </button>
        <button
          type="button"
          onClick={onSpeak}
          className="snap-speak-card rounded-xl p-5 text-left active:opacity-90"
        >
          <Mic size={24} strokeWidth={2} className="snap-speak-icon" style={{ shapeRendering: 'geometricPrecision' }} />
          <p className="snap-speak-title font-display mt-3 text-lg font-bold">SPEAK</p>
          <p className="snap-speak-subtitle mt-1 font-body text-[13px] opacity-60">Ask with your voice</p>
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
            <p className="font-body font-medium text-[var(--color-text-primary)]">Start your first job</p>
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
