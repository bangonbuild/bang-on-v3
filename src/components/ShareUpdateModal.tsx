import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { sendClientUpdate } from '../services/notifyService'
import { useLoading } from '../hooks/useLoading'
import { ButtonSpinner } from './ButtonSpinner'
import type { GeneratedDocument, Job, PhotoReportResult } from '../types'
import type { ShowToastFn } from '../hooks/useToast'
import { DRAWER_HEIGHT, DRAWER_SCROLL_PB } from '../utils/layout'

interface ShareUpdateModalProps {
  job: Job | null
  isOpen: boolean
  onClose: () => void
  prefillMessage?: string
  notificationType?: 'quote' | 'invoice' | 'photo-report'
  document?: GeneratedDocument | PhotoReportResult
  showToast: ShowToastFn
  onEditJob?: () => void
  onShareSuccess?: () => void
}

export function ShareUpdateModal({
  job,
  isOpen,
  onClose,
  prefillMessage = '',
  notificationType,
  document,
  showToast,
  onEditJob,
  onShareSuccess,
}: ShareUpdateModalProps) {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const { track } = useLoading()

  useEffect(() => {
    if (!isOpen) return
    setEmail(job?.email ?? '')
    setMessage(prefillMessage)
  }, [isOpen, job?.email, prefillMessage])

  const noEmailOnJob = Boolean(job && !job.email?.trim())
  const canSend = email.trim().length > 0 && message.trim().length > 0 && !sending && Boolean(job)

  const handleSend = async () => {
    if (!canSend || !job) return

    setSending(true)
    try {
      await track(
        sendClientUpdate({
          job: { id: job.id, name: job.name, client: job.client },
          message: message.trim(),
          clientEmail: email.trim(),
          clientName: job.client,
          notificationType,
          document,
        }),
      )
      onShareSuccess?.()
      onClose()
      showToast(`Update sent to ${job.client || 'client'}.`, 'success')
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
            className={`fixed bottom-0 left-0 right-0 z-[101] flex ${DRAWER_HEIGHT} flex-col overflow-hidden rounded-t-[20px] bg-[var(--color-surface)]`}
          >
            <div className="flex shrink-0 justify-center pt-3">
              <div className="h-1 w-10 rounded-full bg-[var(--color-border-2)]" />
            </div>
            <div className="flex shrink-0 items-start justify-between px-5 pb-2 pt-1">
              <h2 className="font-display text-[20px] font-bold text-[var(--color-text-primary)]">
                Send update to client
              </h2>
              <button type="button" onClick={onClose} className="flex h-10 w-10 items-center justify-center" aria-label="Close">
                <X size={22} strokeWidth={1.5} className="text-[var(--color-text-primary)]" />
              </button>
            </div>

            <div className={`min-h-0 flex-1 overflow-y-auto px-5 ${DRAWER_SCROLL_PB}`}>
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

              <div className="mt-4">
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

              <button
                type="button"
                onClick={() => void handleSend()}
                disabled={!canSend}
                className="mt-6 flex h-12 w-full items-center justify-center rounded-full bg-[#14120a] font-body text-[15px] font-semibold text-white disabled:opacity-50"
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
