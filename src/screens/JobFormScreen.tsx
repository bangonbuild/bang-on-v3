import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useState } from 'react'
import { ButtonSpinner } from '../components/ButtonSpinner'
import type { Job, JobStatus } from '../types'
import { DRAWER_HEIGHT, DRAWER_SCROLL_PB } from '../utils/layout'

interface JobFormScreenProps {
  job?: Job
  onBack: () => void
  onSave: (data: {
    name: string
    client: string
    email?: string
    phone: string
    address: string
    status: JobStatus
  }) => void
  onDelete?: () => void
  embedded?: boolean
  drawer?: boolean
  open?: boolean
}

const statuses: JobStatus[] = ['active', 'on-hold', 'complete']

function JobFormFields({
  job,
  onSave,
  onDelete,
  onBack,
  embedded,
  saving,
  setSaving,
}: {
  job?: Job
  onSave: JobFormScreenProps['onSave']
  onDelete?: () => void
  onBack: () => void
  embedded?: boolean
  saving: boolean
  setSaving: (v: boolean) => void
}) {
  const [name, setName] = useState(job?.name ?? '')
  const [client, setClient] = useState(job?.client ?? '')
  const [email, setEmail] = useState(job?.email ?? '')
  const [phone, setPhone] = useState(job?.phone ?? '')
  const [address, setAddress] = useState(job?.address ?? '')
  const [status, setStatus] = useState<JobStatus>(job?.status ?? 'active')
  const [error, setError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  const hasFilledFields = Boolean(name.trim() || client.trim() || phone.trim() || email.trim() || address.trim())

  const requestClose = () => {
    if (hasFilledFields && !window.confirm('Discard changes?')) return
    onBack()
  }

  const handleSubmit = () => {
    if (!name.trim() || !client.trim() || !phone.trim()) {
      setError('Job name, client name, and phone are required.')
      return
    }
    setSaving(true)
    onSave({
      name: name.trim(),
      client: client.trim(),
      email: email.trim() || undefined,
      phone: phone.trim(),
      address: address.trim(),
      status,
    })
    setSaving(false)
  }

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    onDelete?.()
  }

  const inputClass =
    'mt-1 w-full min-h-[48px] rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] px-4 font-body text-[var(--color-text-primary)]'

  return (
    <>
      <div className={`flex flex-col gap-4 ${embedded ? '' : 'px-5 pb-6'}`}>
        <label className="font-body text-[13px] text-[var(--color-text-secondary)]">
          Job name
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        </label>
        <label className="font-body text-[13px] text-[var(--color-text-secondary)]">
          Client name
          <input value={client} onChange={(e) => setClient(e.target.value)} className={inputClass} />
        </label>
        <label className="font-body text-[13px] text-[var(--color-text-secondary)]">
          Client email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="client@email.com"
            className={inputClass}
          />
        </label>
        <label className="font-body text-[13px] text-[var(--color-text-secondary)]">
          Client phone
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
        </label>
        <div>
          {/* TODO: address lookup integration */}
          <label className="font-body text-[13px] text-[var(--color-text-secondary)]">
            Address
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Start typing an address..."
              className={inputClass}
            />
          </label>
        </div>
        <div>
          <p className="font-body text-[13px] text-[var(--color-text-secondary)]">Status</p>
          <div className="mt-2 flex gap-2">
            {statuses.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                className={`min-h-[40px] flex-1 rounded-lg font-body text-sm capitalize ${
                  status === s ? 'chip-active' : 'chip-inactive'
                }`}
              >
                {s === 'on-hold' ? 'On hold' : s}
              </button>
            ))}
          </div>
        </div>
        {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          className="flex min-h-[48px] items-center justify-center rounded-xl bg-white font-body font-medium text-black disabled:opacity-50"
        >
          {saving ? <ButtonSpinner className="border-black/20 border-t-black" /> : job ? 'Save changes' : 'Create job'}
        </button>

        {job && onDelete && (
          <>
            {confirmDelete && (
              <p className="text-center font-body text-sm text-[var(--color-text-secondary)]">
                Are you sure? This will permanently delete the job and all its data.
              </p>
            )}
            <button
              type="button"
              onClick={handleDelete}
              className="min-h-[48px] w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] font-body text-[var(--color-danger)]"
            >
              {confirmDelete ? 'Confirm delete job' : 'Delete job'}
            </button>
          </>
        )}

        {embedded && (
          <button type="button" onClick={requestClose} className="font-body text-sm text-[var(--color-text-secondary)]">
            Cancel
          </button>
        )}
      </div>
    </>
  )
}

export function JobFormScreen({
  job,
  onBack,
  onSave,
  onDelete,
  embedded = false,
  drawer = false,
  open = true,
}: JobFormScreenProps) {
  const [saving, setSaving] = useState(false)

  const tryClose = () => {
    onBack()
  }

  if (drawer) {
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
              onClick={tryClose}
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
                <h2 className="font-display text-[20px] font-bold text-[var(--color-text-primary)]">
                  {job ? 'Edit job' : 'New job'}
                </h2>
                <button type="button" onClick={tryClose} className="min-h-[48px] min-w-[48px]" aria-label="Close">
                  <X size={22} strokeWidth={1.5} className="text-[var(--color-text-primary)]" />
                </button>
              </div>
              <div className={`min-h-0 flex-1 overflow-y-auto ${DRAWER_SCROLL_PB}`}>
                <JobFormFields
                  job={job}
                  onSave={onSave}
                  onDelete={onDelete}
                  onBack={tryClose}
                  saving={saving}
                  setSaving={setSaving}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    )
  }

  if (embedded) {
    return (
      <div className="h-full overflow-y-auto px-4 pt-6 pb-8">
        <header className="flex items-center justify-between">
          <h1 className="font-display text-xl font-bold text-[var(--color-text-primary)]">
            {job ? 'Edit job' : 'New job'}
          </h1>
        </header>
        <div className="mt-6">
          <JobFormFields
            job={job}
            onSave={onSave}
            onDelete={onDelete}
            onBack={onBack}
            embedded
            saving={saving}
            setSaving={setSaving}
          />
        </div>
      </div>
    )
  }

  return null
}
