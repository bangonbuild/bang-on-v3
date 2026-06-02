import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import type { Job, JobStatus } from '../types'
import { NAV_PB } from '../utils/layout'

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
}

const statuses: JobStatus[] = ['active', 'on-hold', 'complete']

export function JobFormScreen({ job, onBack, onSave }: JobFormScreenProps) {
  const [name, setName] = useState(job?.name ?? '')
  const [client, setClient] = useState(job?.client ?? '')
  const [email, setEmail] = useState(job?.email ?? '')
  const [phone, setPhone] = useState(job?.phone ?? '')
  const [address, setAddress] = useState(job?.address ?? '')
  const [status, setStatus] = useState<JobStatus>(job?.status ?? 'active')
  const [error, setError] = useState('')

  const handleSubmit = () => {
    if (!name.trim() || !client.trim() || !phone.trim()) {
      setError('Job name, client name, and phone are required.')
      return
    }
    onSave({
      name: name.trim(),
      client: client.trim(),
      email: email.trim() || undefined,
      phone: phone.trim(),
      address: address.trim(),
      status,
    })
  }

  const inputClass =
    'mt-1 w-full min-h-[48px] rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 font-body text-white'

  return (
    <div className={`px-4 pt-6 ${NAV_PB}`}>
      <header className="flex items-center gap-3">
        <button type="button" onClick={onBack} className="min-h-[48px] min-w-[48px]">
          <ArrowLeft size={22} className="text-white" />
        </button>
        <h1 className="font-display text-xl font-bold text-white">
          {job ? 'Edit job' : 'New job'}
        </h1>
      </header>

      <div className="mt-6 flex flex-col gap-4">
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
          {/* TODO: wire Australia Post address lookup API */}
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
                  status === s
                    ? 'bg-white text-black'
                    : 'border border-[var(--color-border)] bg-[var(--color-surface-2)] text-white'
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
          className="min-h-[48px] rounded-xl bg-white font-body font-medium text-black"
        >
          {job ? 'Save changes' : 'Create job'}
        </button>
      </div>
    </div>
  )
}
