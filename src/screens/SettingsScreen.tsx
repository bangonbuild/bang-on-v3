import { X } from 'lucide-react'
import { useRef, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { Icon } from '../components/Icon'
import type { PaymentDetails, Profile, Teammate } from '../types'
import type { Theme } from '../hooks/useTheme'
import { NAV_PB } from '../utils/layout'
import { generateId, loadJson, saveJson, STORAGE_KEYS } from '../utils/storage'

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
  showToast: (msg: string) => void
  theme: Theme
  setTheme: (theme: Theme) => void
}

function hasProfileData(p: Profile) {
  return Boolean(p.name.trim() || p.phone.trim())
}

function hasPaymentData(p: PaymentDetails) {
  return Boolean(p.businessName.trim() || p.abn.trim() || p.bsb.trim() || p.account.trim() || p.logo)
}

export function SettingsScreen({
  profile,
  setProfile,
  payment,
  setPayment,
  onClearChats,
  showToast,
  theme,
  setTheme,
}: SettingsScreenProps) {
  const [profileEditing, setProfileEditing] = useState(!hasProfileData(profile))
  const [paymentEditing, setPaymentEditing] = useState(!hasPaymentData(payment))
  const [draftProfile, setDraftProfile] = useState(profile)
  const [draftPayment, setDraftPayment] = useState(payment)
  const [teammates, setTeammates] = useState<Teammate[]>(() =>
    loadJson<Teammate[]>(STORAGE_KEYS.team, []),
  )
  const [teammateName, setTeammateName] = useState('')
  const [teammatePhone, setTeammatePhone] = useState('')
  const logoRef = useRef<HTMLInputElement>(null)

  const inputClass =
    'mt-1 w-full min-h-[48px] rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 font-body text-white'

  const saveTeam = (team: Teammate[]) => {
    setTeammates(team)
    saveJson(STORAGE_KEYS.team, team)
  }

  const handleLogo = (file: File | undefined) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setDraftPayment((p) => ({ ...p, logo: reader.result as string }))
    }
    reader.readAsDataURL(file)
  }

  const linkTeammate = () => {
    if (!teammateName.trim() || !teammatePhone.trim()) return
    // TODO: wire to real-time presence, shared jobs, and in-app messaging
    saveTeam([
      ...teammates,
      { id: generateId(), name: teammateName.trim(), phone: teammatePhone.trim() },
    ])
    setTeammateName('')
    setTeammatePhone('')
    showToast("Linked — they'll show up in your team.")
  }

  return (
    <div className={`px-4 pt-6 ${NAV_PB}`}>
      <h1 className="font-display text-2xl font-bold text-white">Settings</h1>

      <SectionHeader
        title="Profile"
        editing={profileEditing}
        onEdit={() => {
          setDraftProfile(profile)
          setProfileEditing(true)
        }}
        showEdit={hasProfileData(profile)}
      />
      {profileEditing ? (
        <div className="mt-2 flex flex-col gap-3">
          <label className="font-body text-[13px] text-[var(--color-text-secondary)]">
            Full name
            <input
              value={draftProfile.name}
              onChange={(e) => setDraftProfile({ ...draftProfile, name: e.target.value })}
              className={inputClass}
            />
          </label>
          <label className="font-body text-[13px] text-[var(--color-text-secondary)]">
            Phone number
            <input
              type="tel"
              value={draftProfile.phone}
              onChange={(e) => setDraftProfile({ ...draftProfile, phone: e.target.value })}
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
                  onClick={() => setDraftProfile({ ...draftProfile, trade: t })}
                  className={`min-h-[36px] rounded-full px-3 font-body text-sm ${
                    draftProfile.trade === t
                      ? 'bg-white text-black'
                      : 'border border-[var(--color-border)] bg-[var(--color-surface-2)] text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <p className="font-body text-xs text-[var(--color-text-tertiary)]">
            Your trade helps Nudge give better answers
          </p>
          <button
            type="button"
            onClick={() => setProfileEditing(false)}
            className="font-body text-sm text-[var(--color-text-secondary)]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              setProfile(draftProfile)
              setProfileEditing(false)
            }}
            className="min-h-[48px] rounded-xl bg-white font-body font-medium text-black"
          >
            Save
          </button>
        </div>
      ) : (
        <ViewBlock
          rows={[
            ['Full name', profile.name || '—'],
            ['Phone', profile.phone || '—'],
            ['Trade', profile.trade],
          ]}
          note="Your trade helps Nudge give better answers"
        />
      )}

      <SectionHeader
        title="Payment details"
        editing={paymentEditing}
        onEdit={() => {
          setDraftPayment(payment)
          setPaymentEditing(true)
        }}
        showEdit={hasPaymentData(payment)}
      />
      <p className="font-body text-xs text-[var(--color-text-tertiary)]">
        Used automatically on quotes and invoices
      </p>
      {paymentEditing ? (
        <div className="mt-2 flex flex-col gap-3">
          {(['businessName', 'abn', 'bsb', 'account'] as const).map((key) => (
            <label key={key} className="font-body text-[13px] text-[var(--color-text-secondary)]">
              {key === 'businessName' ? 'Business name' : key.toUpperCase()}
              <input
                value={draftPayment[key]}
                onChange={(e) => setDraftPayment({ ...draftPayment, [key]: e.target.value })}
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
          {draftPayment.logo && (
            <img src={draftPayment.logo} alt="Logo" className="h-16 w-auto object-contain" />
          )}
          <button
            type="button"
            onClick={() => setPaymentEditing(false)}
            className="font-body text-sm text-[var(--color-text-secondary)]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              setPayment(draftPayment)
              setPaymentEditing(false)
            }}
            className="min-h-[48px] rounded-xl bg-white font-body font-medium text-black"
          >
            Save
          </button>
        </div>
      ) : (
        <ViewBlock
          rows={[
            ['Business name', payment.businessName || '—'],
            ['ABN', payment.abn || '—'],
            ['BSB', payment.bsb || '—'],
            ['Account', payment.account || '—'],
          ]}
          logo={payment.logo}
        />
      )}

      <p className="font-display mt-6 text-[11px] tracking-[0.12em] text-[var(--color-text-tertiary)]">
        Team
      </p>
      <p className="font-body text-[13px] text-[var(--color-text-secondary)]">
        Link to other tradies to share jobs and stay connected.
      </p>
      <div className="mt-3 flex flex-col gap-2">
        <input
          value={teammateName}
          onChange={(e) => setTeammateName(e.target.value)}
          placeholder="Their name"
          className={inputClass}
        />
        <input
          type="tel"
          value={teammatePhone}
          onChange={(e) => setTeammatePhone(e.target.value)}
          placeholder="Their mobile number"
          className={inputClass}
        />
        <button
          type="button"
          onClick={linkTeammate}
          className="min-h-[48px] rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] font-body text-white"
        >
          Link teammate
        </button>
      </div>
      {teammates.length === 0 ? (
        <p className="mt-6 text-center font-body text-[13px] text-[var(--color-text-tertiary)]">
          No teammates linked yet
          <br />
          Add someone to get started
        </p>
      ) : (
        <div className="mt-4 flex flex-col gap-2">
          {teammates.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
            >
              <div>
                <p className="font-body text-[15px] font-medium text-white">{t.name}</p>
                <p className="font-body text-[13px] text-[var(--color-text-secondary)]">{t.phone}</p>
                <span className="mt-2 inline-block rounded-full bg-[rgba(52,199,89,0.15)] px-2 py-0.5 text-[11px] text-[#34C759]">
                  Linked
                </span>
              </div>
              <button
                type="button"
                onClick={() => saveTeam(teammates.filter((x) => x.id !== t.id))}
                className="min-h-[48px] min-w-[48px]"
              >
                <Icon icon={X} size={18} muted />
              </button>
            </div>
          ))}
        </div>
      )}

      <p className="font-display mt-6 text-[11px] tracking-[0.12em] text-[var(--color-text-tertiary)]">
        Appearance
      </p>
      <div className="mt-2 flex gap-2">
        {(['dark', 'light'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTheme(t)}
            className={`min-h-[36px] flex-1 rounded-full px-3 font-body text-sm capitalize ${
              theme === t
                ? 'bg-white text-black'
                : 'border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-primary)]'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <p className="font-display mt-6 text-[11px] tracking-[0.12em] text-[var(--color-text-tertiary)]">
        App
      </p>
      <button
        type="button"
        onClick={() => {
          if (window.confirm('Clear all recent chats?')) onClearChats()
        }}
        className="mt-2 min-h-[48px] w-full rounded-xl border border-[var(--color-border)] font-body text-white"
      >
        Clear recent chats
      </button>
      <p className="mt-4 font-body text-[13px] text-[var(--color-text-tertiary)]">Bangon v0.3.0</p>
    </div>
  )
}

function SectionHeader({
  title,
  editing,
  onEdit,
  showEdit,
}: {
  title: string
  editing: boolean
  onEdit: () => void
  showEdit: boolean
}) {
  return (
    <div className="mt-6 flex items-center justify-between">
      <p className="font-display text-[11px] tracking-[0.12em] text-[var(--color-text-tertiary)]">
        {title}
      </p>
      {showEdit && !editing && (
        <button type="button" onClick={onEdit} className="font-body text-sm text-[var(--color-text-secondary)]">
          Edit
        </button>
      )}
    </div>
  )
}

function ViewBlock({
  rows,
  note,
  logo,
}: {
  rows: [string, string][]
  note?: string
  logo?: string
}) {
  return (
    <div className="mt-2 space-y-3">
      {rows.map(([label, value]) => (
        <div key={label}>
          <p className="font-display text-[11px] text-[var(--color-text-tertiary)]">{label}</p>
          <p className="font-body text-[15px] text-white">{value}</p>
        </div>
      ))}
      {logo && <img src={logo} alt="Logo" className="h-16 w-auto object-contain" />}
      {note && <p className="font-body text-xs text-[var(--color-text-tertiary)]">{note}</p>}
    </div>
  )
}
