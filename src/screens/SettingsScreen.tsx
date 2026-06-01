import { useRef } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import type { PaymentDetails, Profile } from '../types'

const TRADES = [
  'Builder',
  'Carpenter',
  'Concretor',
  'Electrician',
  'Plumber',
  'Site Supervisor',
]

interface SettingsScreenProps {
  profile: Profile
  setProfile: Dispatch<SetStateAction<Profile>>
  payment: PaymentDetails
  setPayment: Dispatch<SetStateAction<PaymentDetails>>
  onClearChats: () => void
}

export function SettingsScreen({
  profile,
  setProfile,
  payment,
  setPayment,
  onClearChats,
}: SettingsScreenProps) {
  const logoRef = useRef<HTMLInputElement>(null)

  const inputClass =
    'mt-1 w-full min-h-[48px] rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 font-body text-white'

  const handleLogo = (file: File | undefined) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setPayment((p) => ({ ...p, logo: reader.result as string }))
    }
    reader.readAsDataURL(file)
  }

  const handleClearChats = () => {
    if (window.confirm('Clear all recent chats?')) {
      onClearChats()
    }
  }

  return (
    <div className="px-4 pb-24 pt-6">
      <h1 className="font-display text-2xl font-bold text-white">Settings</h1>

      <p className="font-display mt-6 text-[11px] tracking-[0.12em] text-[var(--color-text-tertiary)]">
        Profile
      </p>
      <div className="mt-2 flex flex-col gap-3">
        <label className="font-body text-[13px] text-[var(--color-text-secondary)]">
          Full name
          <input
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            className={inputClass}
          />
        </label>
        <label className="font-body text-[13px] text-[var(--color-text-secondary)]">
          Phone number
          <input
            type="tel"
            value={profile.phone}
            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            className={inputClass}
          />
        </label>
        <div>
          <p className="font-body text-[13px] text-[var(--color-text-secondary)]">Trade</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {TRADES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setProfile({ ...profile, trade: t })}
                className={`min-h-[36px] rounded-full px-3 font-body text-sm ${
                  profile.trade === t
                    ? 'bg-white text-black'
                    : 'border border-[var(--color-border)] bg-[var(--color-surface-2)] text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <p className="mt-2 font-body text-xs text-[var(--color-text-tertiary)]">
            Your trade helps Nudge give better answers
          </p>
        </div>
      </div>

      <p className="font-display mt-6 text-[11px] tracking-[0.12em] text-[var(--color-text-tertiary)]">
        Payment details
      </p>
      <p className="font-body text-xs text-[var(--color-text-tertiary)]">
        Used automatically on quotes and invoices
      </p>
      <div className="mt-2 flex flex-col gap-3">
        {(['businessName', 'abn', 'bsb', 'account'] as const).map((key) => (
          <label key={key} className="font-body text-[13px] capitalize text-[var(--color-text-secondary)]">
            {key === 'businessName' ? 'Business name' : key.toUpperCase()}
            <input
              value={payment[key]}
              onChange={(e) => setPayment({ ...payment, [key]: e.target.value })}
              className={inputClass}
            />
          </label>
        ))}
        <input
          ref={logoRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleLogo(e.target.files?.[0])}
        />
        <button
          type="button"
          onClick={() => logoRef.current?.click()}
          className="min-h-[48px] rounded-xl border border-[var(--color-border)] font-body text-white"
        >
          Upload logo
        </button>
        {payment.logo && (
          <img src={payment.logo} alt="Logo" className="h-16 w-auto object-contain" />
        )}
      </div>

      <p className="font-display mt-6 text-[11px] tracking-[0.12em] text-[var(--color-text-tertiary)]">
        App
      </p>
      <button
        type="button"
        onClick={handleClearChats}
        className="mt-2 min-h-[48px] w-full rounded-xl border border-[var(--color-border)] font-body text-white"
      >
        Clear recent chats
      </button>
      <p className="mt-4 font-body text-[13px] text-[var(--color-text-tertiary)]">Bang On v0.3.0</p>
    </div>
  )
}
