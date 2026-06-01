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
import { SuggestToolScreen } from './screens/SuggestToolScreen'
import { ToolboxScreen } from './screens/ToolboxScreen'
import type { GeneratedDocument, JobFilter, PhotoReport, SnapMode, TabId } from './types'

type Overlay =
  | { type: 'none' }
  | { type: 'nudge'; jobId?: string }
  | { type: 'snap'; mode: SnapMode; jobId?: string }
  | { type: 'job-detail'; jobId: string }
  | { type: 'job-form'; jobId?: string; returnToJobId?: string }
  | { type: 'quote'; docType: 'quote' | 'invoice'; jobId?: string }
  | { type: 'photo-report'; jobId?: string }
  | { type: 'measure' }
  | { type: 'suggest-tool' }

export default function App() {
  const [splash, setSplash] = useState(true)
  const [tab, setTab] = useState<TabId>('home')
  const [overlay, setOverlay] = useState<Overlay>({ type: 'none' })
  const [snapDrawerOpen, setSnapDrawerOpen] = useState(false)
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

  const goToJobDetail = useCallback((jobId: string) => {
    setOverlay({ type: 'job-detail', jobId })
  }, [])

  const closeOverlay = useCallback(() => setOverlay({ type: 'none' }), [])

  const closeQuote = useCallback(() => {
    if (overlay.type === 'quote' && overlay.jobId) {
      goToJobDetail(overlay.jobId)
    } else {
      closeOverlay()
    }
  }, [overlay, goToJobDetail, closeOverlay])

  const closePhotoReport = useCallback(() => {
    if (overlay.type === 'photo-report' && overlay.jobId) {
      goToJobDetail(overlay.jobId)
    } else {
      closeOverlay()
    }
  }, [overlay, goToJobDetail, closeOverlay])

  const handleTabChange = useCallback(
    (newTab: TabId) => {
      if (overlay.type !== 'none') {
        setOverlay({ type: 'none' })
      }
      setTab(newTab)
    },
    [overlay.type],
  )

  const handleSnapFromDrawer = (mode: SnapMode) => {
    setOverlay({ type: 'snap', mode })
  }

  const handleSpeak = () => {
    showToast('Voice input coming soon.')
  }

  const saveQuoteToJob = (jobId: string, doc: GeneratedDocument) => {
    addTimelineEntry(jobId, {
      type: doc.type,
      content: doc.rawContent || `${doc.type} generated`,
      amount: doc.total,
    })
    showToast('Saved to job timeline.')
    goToJobDetail(jobId)
  }

  const hideNav =
    overlay.type === 'snap' ||
    overlay.type === 'job-form' ||
    overlay.type === 'quote' ||
    overlay.type === 'photo-report' ||
    overlay.type === 'measure' ||
    overlay.type === 'suggest-tool'

  const showMainContent = overlay.type === 'none' || overlay.type === 'nudge' || overlay.type === 'job-detail'

  const renderTab = () => {
    switch (tab) {
      case 'home':
        return (
          <HomeScreen
            jobs={jobs}
            weather={weather}
            onWeatherClick={() => setWeatherOpen(true)}
            onSnap={() => setSnapDrawerOpen(true)}
            onSpeak={handleSpeak}
            onJob={(id) => goToJobDetail(id)}
            onNewJob={() => setOverlay({ type: 'job-form' })}
          />
        )
      case 'jobs':
        return (
          <JobsScreen
            jobs={jobs}
            filter={jobFilter}
            onFilterChange={setJobFilter}
            onJob={(id) => goToJobDetail(id)}
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
            onSuggest={() => setOverlay({ type: 'suggest-tool' })}
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
            showToast={showToast}
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
    if (overlay.type === 'job-detail') {
      const job = getJob(overlay.jobId)
      if (!job) return null
      return (
        <JobDetailScreen
          job={job}
          profile={profile}
          onBack={closeOverlay}
          onEdit={() =>
            setOverlay({ type: 'job-form', jobId: job.id, returnToJobId: job.id })
          }
          onNudge={() => setOverlay({ type: 'nudge', jobId: job.id })}
          onQuote={() => setOverlay({ type: 'quote', docType: 'quote', jobId: job.id })}
          onInvoice={() => setOverlay({ type: 'quote', docType: 'invoice', jobId: job.id })}
          onAddNote={(content) => addTimelineEntry(job.id, { type: 'note', content })}
          onAddPhoto={(content, imageUrl) =>
            addTimelineEntry(job.id, { type: 'photo', content, imageUrl })
          }
          onUpdateEntry={(entryId, updates) =>
            updateTimelineEntry(job.id, entryId, updates)
          }
          onOpenDoc={() => showToast("Coming soon — we're working on it.")}
        />
      )
    }
    return null
  }

  const renderFullScreenOverlay = () => {
    if (overlay.type === 'snap') {
      return (
        <SnapScreen
          mode={overlay.mode}
          jobId={overlay.jobId}
          profile={profile}
          onBack={() => {
            if (overlay.jobId) goToJobDetail(overlay.jobId)
            else closeOverlay()
          }}
          onNavigateToNudge={() =>
            setOverlay({ type: 'nudge', jobId: overlay.jobId })
          }
          onAddToJob={
            overlay.jobId
              ? (analysis, imageUrl) => {
                  addTimelineEntry(overlay.jobId!, { type: 'photo', content: analysis, imageUrl })
                  goToJobDetail(overlay.jobId!)
                }
              : undefined
          }
        />
      )
    }
    if (overlay.type === 'job-form') {
      const existing = overlay.jobId ? getJob(overlay.jobId) : undefined
      return (
        <JobFormScreen
          job={existing}
          onBack={() => {
            if (overlay.returnToJobId) goToJobDetail(overlay.returnToJobId)
            else closeOverlay()
          }}
          onSave={(data) => {
            if (existing) {
              updateJob(existing.id, data)
              goToJobDetail(existing.id)
            } else {
              const created = addJob(data)
              goToJobDetail(created.id)
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
          onClose={closeQuote}
          onSaveToJob={
            overlay.jobId ? (doc) => saveQuoteToJob(overlay.jobId!, doc) : undefined
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
          onClose={closePhotoReport}
          onSaveToJob={
            overlay.jobId
              ? (report: PhotoReport) => {
                  addTimelineEntry(overlay.jobId!, { type: 'photo', content: report.summary })
                  goToJobDetail(overlay.jobId!)
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
    if (overlay.type === 'suggest-tool') {
      return (
        <SuggestToolScreen
          onBack={closeOverlay}
          onSubmit={() => {
            showToast("Thanks — we'll add it to the backlog.")
            closeOverlay()
          }}
        />
      )
    }
    return null
  }

  return (
    <div className="mx-auto flex h-full max-w-lg flex-col bg-[var(--color-bg)]">
      <AnimatePresence>{splash && <SplashScreen visible={splash} />}</AnimatePresence>

      {!splash && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <main className="min-h-0 flex-1 overflow-hidden">
            {showMainContent ? (
              <AnimatePresence mode="wait">
                {overlay.type === 'none' ? (
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
                    key={overlay.type + ('jobId' in overlay ? overlay.jobId ?? '' : '')}
                    initial={overlay.type === 'job-detail' ? { x: '100%', opacity: 0 } : { opacity: 0 }}
                    animate={overlay.type === 'job-detail' ? { x: 0, opacity: 1 } : { opacity: 1 }}
                    exit={overlay.type === 'job-detail' ? { x: '100%', opacity: 0 } : { opacity: 0 }}
                    transition={{ duration: overlay.type === 'job-detail' ? 0.25 : 0.15, ease: 'easeInOut' }}
                    className="flex h-full min-h-0 flex-col"
                  >
                    {renderOverlay()}
                  </motion.div>
                )}
              </AnimatePresence>
            ) : (
              <div className="h-full overflow-y-auto">{renderFullScreenOverlay()}</div>
            )}
          </main>

          {!hideNav && (
            <BottomNav
              active={tab}
              onChange={handleTabChange}
              onNudge={() => setOverlay({ type: 'nudge' })}
            />
          )}
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
        weather={weather}
        onClose={() => setWeatherOpen(false)}
        onRefresh={weather.refresh}
      />
    </div>
  )
}
