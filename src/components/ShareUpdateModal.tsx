import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { sendClientUpdate } from '../services/notifyService'
import { useLoading } from '../hooks/useLoading'
import { ButtonSpinner } from './ButtonSpinner'
import type { Job } from '../types'
import type { ShowToastFn } from '../hooks/useToast'

interface ShareUpdateModalProps {
  job: Job | null
  isOpen: boolean
  onClose: () => void
  prefillMessage?: string
  includeDocDefault?: boolean
  docEntryId?: string
  showToast: ShowToastFn
  onEditJob?: () => void
}

function buildJobSnapshot(
  job: Job,
  options: {
    includePhotos: boolean
    includeDoc: boolean
    docEntryId?: string
  },
): Job {
  const visible = job.timeline.filter((e) => e.clientVisible === true)
  const ids = new Set(visible.map((e) => e.id))
  const timeline = [...visible]

  if (options.includePhotos) {
    const photos = job.timeline
      .filter((e) => e.type === 'photo')
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 3)
    for (const photo of photos) {
      if (!ids.has(photo.id)) {
        timeline.push({ ...photo, clientVisible: true })
        ids.add(photo.id)
      }
    }
  }

  if (options.includeDoc && options.docEntryId) {
    const entry = job.timeline.find((e) => e.id === options.docEntryId)
    if (entry && !ids.has(entry.id)) {
      timeline.push({ ...entry, clientVisible: true })
    }
  }

  timeline.sort((a, b) => b.timestamp - a.timestamp)

  return { ...job, timeline }
}

export function ShareUpdateModal({
  job,
  isOpen,
  onClose,
  prefillMessage = '',
  includeDocDefault = false,
  docEntryId,
  showToast,
  onEditJob,
}: ShareUpdateModalProps) {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [includeStatus, setIncludeStatus] = useState(true)
  const [includePhotos, setIncludePhotos] = useState(true)
  const [includeDoc, setIncludeDoc] = useState(includeDocDefault)
  const [sending, setSending] = useState(false)
  const { track } = useLoading()

  useEffect(() => {
    if (!isOpen) return
    setEmail(job?.email ?? '')
    setMessage(prefillMessage)
    setIncludeStatus(true)
    setIncludePhotos(true)
    setIncludeDoc(includeDocDefault)
  }, [isOpen, job?.email, prefillMessage, includeDocDefault])

  const noEmailOnJob = Boolean(job && !job.email?.trim())
  const canSend = email.trim().length > 0 && message.trim().length > 0 && !sending

  const handleSend = async () => {
    if (!canSend) return

    const snapshotJob: Job = job
      ? buildJobSnapshot(job, { includePhotos, includeDoc, docEntryId })
      : {
          id: `portal-${Date.now()}`,
          name: 'Job update',
          client: '',
          email: email.trim(),
          phone: '',
          address: '',
          status: includeStatus ? 'active' : 'active',
          timeline: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }

    setSending(true)
    try {
      await track(
        sendClientUpdate({
          job: snapshotJob,
          message: message.trim(),
          clientEmail: email.trim(),
          clientName: job?.client,
        }),
      )
      onClose()
      showToast(`Update sent to ${job?.client || 'client'}.`, 'success')
    } catch {
      showToast('Failed to send. Check your connection.', 'error')
    } finally {
      setSending(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/50"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="fixed bottom-0 left-0 right-0 z-[101] max-h-[90vh] overflow-y-auto rounded-t-2xl bg-[var(--color-surface)] p-6"
          >
            <div className="flex items-start justify-between">
              <h2 className="font-display text-[20px] font-bold text-[var(--color-text-primary)]">
                Send update to client
              </h2>
              <button type="button" onClick={onClose} className="flex h-10 w-10 items-center justify-center" aria-label="Close">
                <X size={22} strokeWidth={1.5} className="text-[var(--color-text-primary)]" />
              </button>
            </div>

            <div className="mt-6 flex flex-col gap-4">
              <div>
                <label className="font-body text-xs uppercase tracking-wide text-[var(--color-text-tertiary)]">
                  To
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="client@email.com"
                  className="mt-1 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] px-4 py-3 font-body text-[15px] text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-tertiary)]"
                />
                {noEmailOnJob && (
                  <p className="mt-2 font-body text-sm text-[#FF9500]">
                    Add a client email to this job first.{' '}
                    {onEditJob && (
                      <button type="button" onClick={onEditJob} className="underline">
                        Edit job
                      </button>
                    )}
                  </p>
                )}
              </div>

              <div>
                <label className="font-body text-xs uppercase tracking-wide text-[var(--color-text-tertiary)]">
                  Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="What would you like to let your client know?"
                  rows={5}
                  className="mt-1 min-h-[120px] w-full resize-none rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] px-4 py-3 font-body text-[15px] text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-tertiary)]"
                />
              </div>

              <div>
                <p className="font-body text-xs uppercase tracking-wide text-[var(--color-text-tertiary)]">
                  Include in update
                </p>
                <div className="mt-2 flex flex-col gap-2">
                  <label className="flex items-center gap-3 font-body text-sm text-[var(--color-text-primary)]">
                    <input
                      type="checkbox"
                      checked={includeStatus}
                      onChange={(e) => setIncludeStatus(e.target.checked)}
                      className="h-4 w-4 rounded"
                    />
                    Latest job status
                  </label>
                  <label className="flex items-center gap-3 font-body text-sm text-[var(--color-text-primary)]">
                    <input
                      type="checkbox"
                      checked={includePhotos}
                      onChange={(e) => setIncludePhotos(e.target.checked)}
                      className="h-4 w-4 rounded"
                    />
                    Recent photos (last 3)
                  </label>
                  {includeDocDefault && (
                    <label className="flex items-center gap-3 font-body text-sm text-[var(--color-text-primary)]">
                      <input
                        type="checkbox"
                        checked={includeDoc}
                        onChange={(e) => setIncludeDoc(e.target.checked)}
                        className="h-4 w-4 rounded"
                      />
                      Quote/Invoice
                    </label>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => void handleSend()}
                disabled={!canSend}
                className="mt-2 flex h-12 w-full items-center justify-center rounded-full bg-[#14120a] font-body text-[15px] font-semibold text-white disabled:opacity-50"
              >
                {sending ? <ButtonSpinner /> : 'Send update →'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
