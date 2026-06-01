import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useState } from 'react'
import { BottomNav } from './components/BottomNav'
import { PhotoReportGenerator } from './components/PhotoReportGenerator'
import { QuoteGenerator } from './components/QuoteGenerator'
import { SnapDrawer } from './components/SnapDrawer'
import { SplashScreen } from './components/SplashScreen'
import { Toast } from './components/Toast'
import { WeatherModal } from './components/WeatherModal'
import { useJobs } from './hooks/useJobs'
import { useProfile } from './hooks/useProfile'
import { useRecentChats } from './hooks/useRecentChats'
import { useToast } from './hooks/useToast'
import { useWeather } from './hooks/useWeather'
import { HomeScreen } from './screens/HomeScreen'
import { JobDetailScreen } from './screens/JobDetailScreen'
import { JobFormScreen } from './screens/JobFormScreen'
import { JobsScreen } from './screens/JobsScreen'
import { MeasureScreen } from './screens/MeasureScreen'
import { NudgeScreen } from './screens/NudgeScreen'
import { SettingsScreen } from './screens/SettingsScreen'
import { SnapScreen } from './screens/SnapScreen'
import { ToolboxScreen } from './screens/ToolboxScreen'
import type { GeneratedDocument, JobFilter, PhotoReport, SnapMode, TabId } from './types'

type Overlay =
  | { type: 'none' }
  | { type: 'nudge'; jobId?: string }
  | { type: 'snap'; mode: SnapMode; jobId?: string }
  | { type: 'job-detail'; jobId: string }
  | { type: 'job-form'; jobId?: string }
  | { type: 'quote'; docType: 'quote' | 'invoice'; jobId?: string }
  | { type: 'photo-report'; jobId?: string }
  | { type: 'measure' }

export default function App() {
  const [splash, setSplash] = useState(true)
  const [tab, setTab] = useState<TabId>('home')
  const [overlay, setOverlay] = useState<Overlay>({ type: 'none' })
  const [snapDrawerOpen, setSnapDrawerOpen] = useState(false)
  const [snapJobId, setSnapJobId] = useState<string | undefined>()
  const [jobFilter, setJobFilter] = useState<JobFilter>('all')
  const [weatherOpen, setWeatherOpen] = useState(false)

  const { jobs, addJob, updateJob, addTimelineEntry, updateTimelineEntry, getJob } = useJobs()
  const { profile, payment, setProfile, setPayment } = useProfile()
  const { saveChat, clearChats } = useRecentChats()
  const { showToast, toastMessage, toastVisible } = useToast()
  const weather = useWeather()

  useEffect(() => {
    const t = window.setTimeout(() => setSplash(false), 500)
    return () => window.clearTimeout(t)
  }, [])

  const closeOverlay = useCallback(() => setOverlay({ type: 'none' }), [])

  const openSnap = (mode: SnapMode, jobId?: string) => {
    setOverlay({ type: 'snap', mode, jobId })
  }

  const handleSpeak = () => {
    showToast('Voice input coming soon.')
  }

  const handleSnapFromDrawer = (mode: SnapMode) => {
    openSnap(mode, snapJobId)
  }

  const saveQuoteToJob = (jobId: string, doc: GeneratedDocument) => {
    addTimelineEntry(jobId, {
      type: doc.type,
      content: doc.rawContent || `${doc.type} generated`,
      amount: doc.total,
    })
    showToast('Saved to job timeline.')
  }

  const renderTab = () => {
    switch (tab) {
      case 'home':
        return (
          <HomeScreen
            jobs={jobs}
            weather={weather}
            onWeatherClick={() => setWeatherOpen(true)}
            onSnap={() => {
              setSnapJobId(undefined)
              setSnapDrawerOpen(true)
            }}
            onSpeak={handleSpeak}
            onNudge={() => setOverlay({ type: 'nudge' })}
            onJob={(id) => setOverlay({ type: 'job-detail', jobId: id })}
            onNewJob={() => setOverlay({ type: 'job-form' })}
          />
        )
      case 'jobs':
        return (
          <JobsScreen
            jobs={jobs}
            filter={jobFilter}
            onFilterChange={setJobFilter}
            onJob={(id) => setOverlay({ type: 'job-detail', jobId: id })}
            onNewJob={() => setOverlay({ type: 'job-form' })}
          />
        )
      case 'toolbox':
        return (
          <ToolboxScreen
            onQuote={() => setOverlay({ type: 'quote', docType: 'quote' })}
            onInvoice={() => setOverlay({ type: 'quote', docType: 'invoice' })}
            onMeasure={() => setOverlay({ type: 'measure' })}
            onPhotoReport={() => setOverlay({ type: 'photo-report' })}
            onComingSoon={() => showToast("Coming soon — we're working on it.")}
            onSuggest={() => showToast("Thanks — we'll add it to the backlog.")}
          />
        )
      case 'settings':
        return (
          <SettingsScreen
            profile={profile}
            setProfile={setProfile}
            payment={payment}
            setPayment={setPayment}
            onClearChats={clearChats}
          />
        )
      default:
        return null
    }
  }

  const renderOverlay = () => {
    if (overlay.type === 'nudge') {
      const job = overlay.jobId ? getJob(overlay.jobId) : undefined
      return (
        <NudgeScreen
          job={job}
          profile={profile}
          onBack={closeOverlay}
          onSaveChat={saveChat}
          showToast={showToast}
        />
      )
    }
    if (overlay.type === 'snap') {
      return (
        <SnapScreen
          mode={overlay.mode}
          jobId={overlay.jobId}
          profile={profile}
          onBack={closeOverlay}
          onNavigateToNudge={() => setOverlay({ type: 'nudge', jobId: overlay.jobId })}
          onAddToJob={
            overlay.jobId
              ? (analysis, imageUrl) => {
                  addTimelineEntry(overlay.jobId!, {
                    type: 'photo',
                    content: analysis,
                    imageUrl,
                  })
                }
              : undefined
          }
        />
      )
    }
    if (overlay.type === 'job-detail') {
      const job = getJob(overlay.jobId)
      if (!job) return null
      return (
        <JobDetailScreen
          job={job}
          profile={profile}
          onBack={closeOverlay}
          onEdit={() => setOverlay({ type: 'job-form', jobId: job.id })}
          onNudge={() => setOverlay({ type: 'nudge', jobId: job.id })}
          onSnap={() => {
            setSnapJobId(job.id)
            setSnapDrawerOpen(true)
          }}
          onQuote={() => setOverlay({ type: 'quote', docType: 'quote', jobId: job.id })}
          onAddNote={(content) =>
            addTimelineEntry(job.id, { type: 'note', content })
          }
          onUpdateEntry={(entryId, updates) =>
            updateTimelineEntry(job.id, entryId, updates)
          }
          onOpenDoc={() => showToast("Coming soon — we're working on it.")}
        />
      )
    }
    if (overlay.type === 'job-form') {
      const existing = overlay.jobId ? getJob(overlay.jobId) : undefined
      return (
        <JobFormScreen
          job={existing}
          onBack={closeOverlay}
          onSave={(data) => {
            if (existing) {
              updateJob(existing.id, data)
              setOverlay({ type: 'job-detail', jobId: existing.id })
            } else {
              const created = addJob(data)
              setOverlay({ type: 'job-detail', jobId: created.id })
            }
          }}
        />
      )
    }
    if (overlay.type === 'quote') {
      const job = overlay.jobId ? getJob(overlay.jobId) : undefined
      return (
        <QuoteGenerator
          type={overlay.docType}
          job={job}
          profile={profile}
          payment={payment}
          onClose={closeOverlay}
          onSaveToJob={
            overlay.jobId
              ? (doc) => saveQuoteToJob(overlay.jobId!, doc)
              : undefined
          }
          showToast={showToast}
        />
      )
    }
    if (overlay.type === 'photo-report') {
      const job = overlay.jobId ? getJob(overlay.jobId) : undefined
      return (
        <PhotoReportGenerator
          job={job}
          profile={profile}
          onClose={closeOverlay}
          onSaveToJob={
            overlay.jobId
              ? (report: PhotoReport) => {
                  addTimelineEntry(overlay.jobId!, {
                    type: 'photo',
                    content: report.summary,
                  })
                }
              : undefined
          }
          showToast={showToast}
        />
      )
    }
    if (overlay.type === 'measure') {
      return (
        <MeasureScreen
          onBack={closeOverlay}
          onNudge={() => setOverlay({ type: 'nudge' })}
        />
      )
    }
    return null
  }

  const hasOverlay = overlay.type !== 'none'
  const showBottomNav = !hasOverlay || overlay.type === 'nudge'

  return (
    <div className="mx-auto flex h-full max-w-lg flex-col bg-[var(--color-bg)]">
      <AnimatePresence>{splash && <SplashScreen visible={splash} />}</AnimatePresence>

      {!splash && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-1 flex-col overflow-hidden"
        >
          <main className="flex-1 overflow-hidden">
            <AnimatePresence mode="wait">
              {!hasOverlay ? (
                <motion.div
                  key={tab}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15, ease: 'easeInOut' }}
                  className="h-full overflow-y-auto"
                >
                  {renderTab()}
                </motion.div>
              ) : (
                <motion.div
                  key={overlay.type + ('jobId' in overlay ? overlay.jobId : '')}
                  initial={{ x: '100%', opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: '100%', opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="h-full overflow-y-auto"
                >
                  {renderOverlay()}
                </motion.div>
              )}
            </AnimatePresence>
          </main>

          {showBottomNav && <BottomNav active={tab} onChange={setTab} />}
          <Toast message={toastMessage} visible={toastVisible} />
        </motion.div>
      )}

      <SnapDrawer
        open={snapDrawerOpen}
        onClose={() => setSnapDrawerOpen(false)}
        onSelectMode={handleSnapFromDrawer}
      />
      <WeatherModal
        open={weatherOpen}
        temp={weather.temp}
        description={weather.description}
        onClose={() => setWeatherOpen(false)}
        onRefresh={weather.refresh}
      />
    </div>
  )
}
