import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useState } from 'react'
import type { Job, Teammate } from '../types'
import type { ShowToastFn } from '../hooks/useToast'
import { DRAWER_HEIGHT } from '../utils/layout'
import { loadJson, STORAGE_KEYS } from '../utils/storage'

interface InviteToJobDrawerProps {
  open: boolean
  onClose: () => void
  job: Job
  onAddCrew: (name: string, phone: string) => void
  showToast: ShowToastFn
}

export function InviteToJobDrawer({
  open,
  onClose,
  job,
  onAddCrew,
  showToast,
}: InviteToJobDrawerProps) {
  const [inviteName, setInviteName] = useState('')
  const [inviteContact, setInviteContact] = useState('')
  const teammates = loadJson<Teammate[]>(STORAGE_KEYS.team, [])

  const inputClass =
    'mt-1 w-full min-h-[48px] rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] px-4 font-body text-[var(--color-text-primary)]'

  const handleSendInvite = () => {
    if (!inviteName.trim() || !inviteContact.trim()) return
    // TODO: wire to real invite/notification system
    showToast(`Invite sent to ${inviteName.trim()}.`, 'success')
    setInviteName('')
    setInviteContact('')
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Close"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-[rgba(0,0,0,0.6)]"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.35, type: 'spring', bounce: 0.15 }}
            className={`fixed bottom-0 left-0 right-0 z-[81] flex ${DRAWER_HEIGHT} flex-col overflow-hidden rounded-t-[20px] bg-[var(--color-surface)]`}
          >
            <div className="flex shrink-0 justify-center pt-3">
              <div className="h-1 w-10 rounded-full bg-[var(--color-border-2)]" />
            </div>
            <div className="flex shrink-0 items-center justify-between px-5 pb-2 pt-1">
              <div>
                <h2 className="font-display text-[20px] font-bold text-[var(--color-text-primary)]">
                  Invite to job
                </h2>
                <p className="mt-1 font-body text-[13px] text-[var(--color-text-secondary)]">
                  Add a teammate or invite someone new to {job.name}
                </p>
              </div>
              <button type="button" onClick={onClose} className="min-h-[48px] min-w-[48px]" aria-label="Close">
                <X size={22} strokeWidth={1.5} className="text-[var(--color-text-primary)]" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-6">
              <p className="font-body text-xs uppercase tracking-wide text-[var(--color-text-tertiary)]">
                Your team
              </p>
              {teammates.length === 0 ? (
                <p className="mt-3 font-body text-sm text-[var(--color-text-tertiary)]">
                  No teammates linked yet. Add someone in Settings → Team.
                </p>
              ) : (
                <div className="mt-3 flex flex-col gap-2">
                  {teammates.map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] p-4"
                    >
                      <div>
                        <p className="font-body text-[15px] text-[var(--color-text-primary)]">{t.name}</p>
                        <p className="font-body text-[13px] text-[var(--color-text-secondary)]">{t.phone}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          onAddCrew(t.name, t.phone)
                          showToast(`${t.name} added to job.`, 'success')
                        }}
                        className="min-h-[36px] rounded-lg border border-[var(--color-border)] px-3 font-body text-sm text-[var(--color-text-primary)]"
                      >
                        Add to job
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <p className="section-label mt-8">Invite someone new</p>
              <div className="mt-3 flex flex-col gap-3">
                <label className="font-body text-[13px] text-[var(--color-text-secondary)]">
                  Their name
                  <input
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    placeholder="Their name"
                    className={inputClass}
                  />
                </label>
                <label className="font-body text-[13px] text-[var(--color-text-secondary)]">
                  Their mobile or email
                  <input
                    value={inviteContact}
                    onChange={(e) => setInviteContact(e.target.value)}
                    placeholder="Their mobile or email"
                    className={inputClass}
                  />
                </label>
                <button
                  type="button"
                  onClick={handleSendInvite}
                  disabled={!inviteName.trim() || !inviteContact.trim()}
                  className="min-h-[48px] rounded-xl bg-white font-body font-medium text-black disabled:opacity-50"
                >
                  Send invite
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
