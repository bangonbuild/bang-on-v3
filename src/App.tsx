import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useState } from 'react'
import { BottomNav } from './components/BottomNav'
import { NudgeDrawer } from './components/NudgeDrawer'
import { PhotoReportGenerator } from './components/PhotoReportGenerator'
import { QuoteGenerator } from './components/QuoteGenerator'
import { SnapDrawer } from './components/SnapDrawer'
import { SplashScreen } from './components/SplashScreen'
import { Toast } from './components/Toast'
import { WeatherModal } from './components/WeatherModal'
import { useJobs } from './hooks/useJobs'
import { useMoney } from './hooks/useMoney'
import { usePhotoReports } from './hooks/usePhotoReports'
import { useProfile } from './hooks/useProfile'
import { useRecentChats } from './hooks/useRecentChats'
import { useToast } from './hooks/useToast'
import { useTheme } from './hooks/useTheme'
import { useWeather } from './hooks/useWeather'
import { HomeScreen } from './screens/HomeScreen'
import { JobDetailScreen } from './screens/JobDetailScreen'
import { JobFormScreen } from './screens/JobFormScreen'
import { JobsScreen } from './screens/JobsScreen'
import { MeasureScreen } from './screens/MeasureScreen'
import { MoneyScreen } from './screens/MoneyScreen'
import { SettingsScreen } from './screens/SettingsScreen'
import { SnapScreen } from './screens/SnapScreen'
import { SuggestToolScreen } from './screens/SuggestToolScreen'
import { SupportScreen } from './screens/SupportScreen'
import { ToolboxScreen } from './screens/ToolboxScreen'
import type { GeneratedDocument, JobFilter, SnapMode, TabId, TimelineEntry } from './types'
import { parseDocumentFromEntry, serializeDocument } from './utils/storage'

type Overlay =
  | { type: 'none' }
  | { type: 'snap'; mode: SnapMode; jobId?: string }
  | { type: 'job-detail'; jobId: string }
  | { type: 'job-form'; jobId?: string; returnToJobId?: string }
  | { type: 'quote'; docType: 'quote' | 'invoice'; jobId?: string; entryId?: string; moneyRecordId?: string }
  | { type: 'photo-report'; jobId?: string; reportId?: string }
  | { type: 'measure' }
  | { type: 'suggest-tool' }
  | { type: 'settings' }
  | { type: 'support' }

export default function App() {
  const [splash, setSplash] = useState(true)
  const [tab, setTab] = useState<TabId>('home')
  const [overlay, setOverlay] = useState<Overlay>({ type: 'none' })
  const [snapDrawerOpen, setSnapDrawerOpen] = useState(false)
  const [jobFilter, setJobFilter] = useState<JobFilter>('all')
  const [weatherOpen, setWeatherOpen] = useState(false)
  const [nudgeOpen, setNudgeOpen] = useState(false)
  const [nudgeJobId, setNudgeJobId] = useState<string | undefined>()

  const { jobs, addJob, updateJob, deleteJob, addTimelineEntry, updateTimelineEntry, deleteTimelineEntry, getJob } =
    useJobs()
  const { profile, payment, setProfile, setPayment } = useProfile()
  const { saveChat, clearChats } = useRecentChats()
  const { showToast, toastMessage, toastType, toastVisible } = useToast()
  const weather = useWeather()
  const { theme, setTheme } = useTheme()
  const {
    stats,
    invoices,
    quotes,
    addFromDocument,
    updateFromDocument,
    deleteRecord,
    markPaid,
    convertQuoteToInvoice,
    getRecord,
  } = useMoney()
  const { reports: photoReports, addFromResult, deleteReport, getReport } = usePhotoReports()

  useEffect(() => {
    const t = window.setTimeout(() => setSplash(false), 500)
    return () => window.clearTimeout(t)
  }, [])

  const goToJobDetail = useCallback((jobId: string) => {
    setOverlay({ type: 'job-detail', jobId })
  }, [])

  const closeOverlay = useCallback(() => setOverlay({ type: 'none' }), [])

  const closeSettings = useCallback(() => {
    setOverlay({ type: 'none' })
    setTab('home')
  }, [])

  const closeQuote = useCallback(() => {
    if (overlay.type === 'quote' && overlay.jobId && !overlay.moneyRecordId) {
      goToJobDetail(overlay.jobId)
    } else {
      closeOverlay()
    }
  }, [overlay, goToJobDetail, closeOverlay])

  const closePhotoReport = useCallback(() => {
    if (overlay.type === 'photo-report' && overlay.jobId && !overlay.reportId) {
      goToJobDetail(overlay.jobId)
    } else {
      closeOverlay()
    }
  }, [overlay, goToJobDetail, closeOverlay])

  const openNudge = useCallback((jobId?: string) => {
    setNudgeJobId(jobId)
    setNudgeOpen(true)
  }, [])

  const closeNudge = useCallback(() => {
    setNudgeOpen(false)
    setNudgeJobId(undefined)
  }, [])

  const toggleNudge = useCallback(() => {
    if (nudgeOpen) closeNudge()
    else openNudge()
  }, [nudgeOpen, closeNudge, openNudge])

  const handleTabChange = useCallback(
    (newTab: TabId) => {
      if (overlay.type !== 'none') {
        setOverlay({ type: 'none' })
      }
      setNudgeOpen(false)
      setTab(newTab)
    },
    [overlay.type],
  )

  const handleSnapFromDrawer = (mode: SnapMode) => {
    setOverlay({ type: 'snap', mode })
  }

  const handleSpeak = () => {
    showToast('Voice input coming soon.', 'info')
  }

  const saveDocToMoney = useCallback(
    (doc: GeneratedDocument, jobId?: string) => {
      const job = jobId ? getJob(jobId) : undefined
      addFromDocument(doc, {
        jobId,
        jobName: job?.name,
        client: job?.client ?? doc.clientName,
      })
    },
    [addFromDocument, getJob],
  )

  const openDocFromTimeline = (jobId: string, entry: TimelineEntry) => {
    const parsed = parseDocumentFromEntry(entry.content)
    if (parsed && (entry.type === 'quote' || entry.type === 'invoice')) {
      setOverlay({
        type: 'quote',
        docType: entry.type,
        jobId,
        entryId: entry.id,
      })
    }
  }

  const hideNav =
    overlay.type === 'snap' ||
    overlay.type === 'job-form' ||
    overlay.type === 'quote' ||
    overlay.type === 'photo-report' ||
    overlay.type === 'measure' ||
    overlay.type === 'suggest-tool' ||
    overlay.type === 'settings' ||
    overlay.type === 'support'

  const showMainContent =
    overlay.type === 'none' ||
    overlay.type === 'job-detail' ||
    overlay.type === 'settings' ||
    overlay.type === 'support'

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
            onOpenSettings={() => setOverlay({ type: 'settings' })}
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
      case 'money':
        return (
          <MoneyScreen
            stats={stats}
            invoices={invoices}
            quotes={quotes}
            showToast={showToast}
            onOpenRecord={(record) =>
              setOverlay({
                type: 'quote',
                docType: record.type,
                moneyRecordId: record.id,
              })
            }
          />
        )
      case 'toolbox':
        return (
          <ToolboxScreen
            photoReports={photoReports}
            onQuote={() => setOverlay({ type: 'quote', docType: 'quote' })}
            onInvoice={() => setOverlay({ type: 'quote', docType: 'invoice' })}
            onMeasure={() => setOverlay({ type: 'measure' })}
            onPhotoReport={() => setOverlay({ type: 'photo-report' })}
            onOpenPhotoReport={(id) => setOverlay({ type: 'photo-report', reportId: id })}
            onComingSoon={() => showToast("Coming soon — we're working on it.", 'info')}
            onSuggest={() => setOverlay({ type: 'suggest-tool' })}
          />
        )
      default:
        return null
    }
  }

  const renderOverlay = () => {
    if (overlay.type === 'settings') {
      return (
        <motion.div
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className="h-full overflow-y-auto"
        >
          <SettingsScreen
            profile={profile}
            setProfile={setProfile}
            payment={payment}
            setPayment={setPayment}
            onClearChats={clearChats}
            showToast={showToast}
            theme={theme}
            setTheme={setTheme}
            onBack={closeSettings}
            onSupport={() => setOverlay({ type: 'support' })}
          />
        </motion.div>
      )
    }
    if (overlay.type === 'support') {
      return (
        <motion.div
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className="h-full overflow-y-auto"
        >
          <SupportScreen
            profile={profile}
            onBack={() => setOverlay({ type: 'settings' })}
            showToast={showToast}
          />
        </motion.div>
      )
    }
    if (overlay.type === 'job-detail') {
      const job = getJob(overlay.jobId)
      if (!job) return null
      return (
        <JobDetailScreen
          job={job}
          profile={profile}
          jobInvoices={invoices.filter((i) => i.jobId === job.id)}
          jobQuotes={quotes.filter((q) => q.jobId === job.id)}
          onBack={closeOverlay}
          onEdit={() =>
            setOverlay({ type: 'job-form', jobId: job.id, returnToJobId: job.id })
          }
          onNudge={() => openNudge(job.id)}
          onOpenMoneyRecord={(record) =>
            setOverlay({
              type: 'quote',
              docType: record.type,
              jobId: job.id,
              moneyRecordId: record.id,
            })
          }
          onQuote={() => setOverlay({ type: 'quote', docType: 'quote', jobId: job.id })}
          onInvoice={() => setOverlay({ type: 'quote', docType: 'invoice', jobId: job.id })}
          onPhotoReport={() => setOverlay({ type: 'photo-report', jobId: job.id })}
          onAddNote={(content) => {
            addTimelineEntry(job.id, { type: 'note', content })
            showToast('Note added.', 'success')
          }}
          onAddPhoto={(content, imageUrl) => {
            addTimelineEntry(job.id, { type: 'photo', content, imageUrl })
            showToast('Photo saved.', 'success')
          }}
          onUpdateEntry={(entryId, updates) =>
            updateTimelineEntry(job.id, entryId, updates)
          }
          onOpenDoc={(entry) => openDocFromTimeline(job.id, entry)}
          showToast={showToast}
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
          showToast={showToast}
          onBack={() => {
            if (overlay.jobId) goToJobDetail(overlay.jobId)
            else closeOverlay()
          }}
          onNavigateToNudge={() => {
            const jobId = overlay.jobId
            closeOverlay()
            openNudge(jobId)
          }}
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
              showToast('Changes saved.', 'success')
              goToJobDetail(existing.id)
            } else {
              const created = addJob(data)
              showToast('Job created.', 'success')
              goToJobDetail(created.id)
            }
          }}
          onDelete={
            existing
              ? () => {
                  deleteJob(existing.id)
                  showToast('Job deleted.', 'success')
                  closeOverlay()
                  setTab('jobs')
                }
              : undefined
          }
        />
      )
    }
    if (overlay.type === 'quote') {
      const job = overlay.jobId ? getJob(overlay.jobId) : undefined
      const entry = overlay.entryId
        ? job?.timeline.find((e) => e.id === overlay.entryId)
        : undefined
      const initialDoc = entry ? parseDocumentFromEntry(entry.content) : undefined
      const moneyRecord = overlay.moneyRecordId ? getRecord(overlay.moneyRecordId) : undefined
      return (
        <QuoteGenerator
          type={overlay.docType}
          job={job}
          profile={profile}
          payment={payment}
          onClose={closeQuote}
          onSaveToJob={
            overlay.jobId && !overlay.entryId && !overlay.moneyRecordId
              ? (doc) => {
                  addTimelineEntry(overlay.jobId!, {
                    type: doc.type,
                    content: serializeDocument(doc),
                    amount: doc.total,
                  })
                  saveDocToMoney(doc, overlay.jobId)
                  showToast(
                    doc.type === 'quote' ? 'Quote saved.' : 'Invoice saved.',
                    'success',
                  )
                  goToJobDetail(overlay.jobId!)
                }
              : undefined
          }
          showToast={showToast}
          editEntryId={overlay.entryId}
          initialDoc={initialDoc ?? undefined}
          moneyRecord={moneyRecord}
          onSaveMoney={(doc) => {
            if (moneyRecord) {
              updateFromDocument(moneyRecord.id, doc)
            } else {
              saveDocToMoney(doc, overlay.jobId)
            }
          }}
          onUpdateMoney={(id, doc) => updateFromDocument(id, doc)}
          onDeleteMoney={(id) => {
            deleteRecord(id)
            showToast('Deleted.', 'success')
            closeOverlay()
          }}
          onMarkPaid={(id) => markPaid(id)}
          onConvertToInvoice={(id) => convertQuoteToInvoice(id)}
          onUpdateEntry={
            overlay.jobId && overlay.entryId
              ? (entryId, doc) => {
                  updateTimelineEntry(overlay.jobId!, entryId, {
                    content: serializeDocument(doc),
                    amount: doc.total,
                  })
                  if (moneyRecord) updateFromDocument(moneyRecord.id, doc)
                }
              : undefined
          }
          onDeleteEntry={
            overlay.jobId && overlay.entryId
              ? (entryId) => {
                  deleteTimelineEntry(overlay.jobId!, entryId)
                  showToast('Removed from timeline.', 'success')
                  goToJobDetail(overlay.jobId!)
                }
              : undefined
          }
        />
      )
    }
    if (overlay.type === 'photo-report') {
      const job = overlay.jobId ? getJob(overlay.jobId) : undefined
      const savedReport = overlay.reportId ? getReport(overlay.reportId) : undefined
      return (
        <PhotoReportGenerator
          job={job}
          profile={profile}
          savedReport={savedReport}
          onClose={closePhotoReport}
          onSaveReport={(result, photoData) =>
            addFromResult(result, {
              jobId: overlay.jobId,
              jobName: job?.name,
              client: job?.client,
              photoData,
            })
          }
          onSaveComplete={(reportId) => {
            if (overlay.jobId) {
              addTimelineEntry(overlay.jobId, {
                type: 'photo-report',
                content: reportId,
              })
              showToast('Report saved.', 'success')
              setOverlay({ type: 'job-detail', jobId: overlay.jobId })
            } else {
              showToast('Report saved.', 'success')
              setOverlay({ type: 'none' })
              setTab('toolbox')
            }
          }}
          onDeleteReport={(id) => {
            deleteReport(id)
            showToast('Photo report deleted.', 'success')
            closeOverlay()
          }}
          showToast={showToast}
        />
      )
    }
    if (overlay.type === 'measure') {
      return (
        <MeasureScreen
          onBack={closeOverlay}
          onNudge={() => {
            closeOverlay()
            openNudge()
          }}
        />
      )
    }
    if (overlay.type === 'suggest-tool') {
      return (
        <SuggestToolScreen
          onBack={() => {
            setTab('toolbox')
            closeOverlay()
          }}
          onSubmit={() => {
            showToast("Thanks — we'll add it to the backlog.", 'success')
            setTab('toolbox')
            closeOverlay()
          }}
        />
      )
    }
    return null
  }

  const overlaySlide =
    overlay.type === 'job-detail' ||
    overlay.type === 'settings' ||
    overlay.type === 'support'

  const overlayKey =
    overlay.type +
    ('jobId' in overlay && overlay.jobId ? overlay.jobId : '') +
    ('moneyRecordId' in overlay && overlay.moneyRecordId ? overlay.moneyRecordId : '') +
    ('reportId' in overlay && overlay.reportId ? overlay.reportId : '')

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
                    key={overlayKey}
                    initial={overlaySlide ? { x: '100%', opacity: 0 } : { opacity: 0 }}
                    animate={overlaySlide ? { x: 0, opacity: 1 } : { opacity: 1 }}
                    exit={overlaySlide ? { x: '100%', opacity: 0 } : { opacity: 0 }}
                    transition={{ duration: overlaySlide ? 0.25 : 0.15, ease: 'easeInOut' }}
                    className="flex h-full min-h-0 flex-col overflow-y-auto"
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
              onNudge={toggleNudge}
              nudgeOpen={nudgeOpen}
            />
          )}
          <NudgeDrawer
            open={nudgeOpen}
            onClose={closeNudge}
            job={nudgeJobId ? getJob(nudgeJobId) : undefined}
            profile={profile}
            onSaveChat={saveChat}
            showToast={showToast}
          />
          <Toast message={toastMessage} type={toastType} visible={toastVisible} />
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
