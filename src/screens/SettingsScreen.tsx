import { ArrowLeft, X } from 'lucide-react'
import { ScreenTitle } from '../components/ScreenTitle'
import { useRef, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { Icon } from '../components/Icon'
import { useDesktop } from '../hooks/useDesktop'
import type { PaymentDetails, Profile, Teammate } from '../types'
import type { Theme } from '../hooks/useTheme'
import type { ShowToastFn } from '../hooks/useToast'
import { DESKTOP_PB, NAV_PB } from '../utils/layout'
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
  showToast: ShowToastFn
  theme: Theme
  setTheme: (theme: Theme) => void
  onBack: () => void
  onSupport: () => void
  drawer?: boolean
}

function hasProfileData(p: Profile) {
  return Boolean(p.name.trim() || p.phone.trim() || p.email?.trim())
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
  onBack,
  onSupport,
  drawer = false,
}: SettingsScreenProps) {
  const isDesktop = useDesktop()
  const [settingsTab, setSettingsTab] = useState<'profile' | 'team' | 'app'>('profile')
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
    'mt-1 w-full min-h-[48px] rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 font-body text-[var(--color-text-primary)]'

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
    showToast('Teammate linked.', 'success')
  }

  return (
    <div className={`${drawer ? 'px-5 pb-8' : isDesktop ? 'px-10 pt-8' : 'px-4 pt-6'} ${drawer ? '' : isDesktop ? DESKTOP_PB : NAV_PB}`}>
      {!drawer && (
      <header className={`flex items-center gap-3 ${isDesktop ? 'mb-0' : ''}`}>
        {!isDesktop && (
          <button type="button" onClick={onBack} className="min-h-[48px] min-w-[48px] shrink-0">
            <ArrowLeft size={22} className="text-[var(--color-text-primary)]" />
          </button>
        )}
        <ScreenTitle>Settings</ScreenTitle>
      </header>
      )}

      <div className="mt-4 flex gap-2">
        {(['profile', 'team', 'app'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setSettingsTab(tab)}
            className={`min-h-[36px] flex-1 rounded-full px-3 font-body text-sm capitalize ${
              settingsTab === tab ? 'chip-active' : 'chip-inactive'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {settingsTab === 'profile' && (
        <>
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
          <div className={isDesktop ? 'grid grid-cols-2 gap-3' : 'flex flex-col gap-3'}>
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
          </div>
          <label className="font-body text-[13px] text-[var(--color-text-secondary)]">
            Email
            <input
              type="email"
              value={draftProfile.email ?? ''}
              onChange={(e) => setDraftProfile({ ...draftProfile, email: e.target.value })}
              placeholder="you@email.com"
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
                      ? 'chip-active'
                      : 'chip-inactive'
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
            onClick={() => {
              setDraftProfile(profile)
              setProfileEditing(false)
            }}
            className="min-h-[48px] rounded-xl border border-[var(--color-border)] font-body text-[var(--color-text-secondary)]"
          >
            Discard changes
          </button>
          <button
            type="button"
            onClick={() => {
              setProfile(draftProfile)
              setProfileEditing(false)
              showToast('Profile saved.', 'success')
            }}
            className="min-h-[48px] rounded-xl btn-primary font-body font-medium"
          >
            Save
          </button>
        </div>
      ) : (
        <ViewBlock
          rows={[
            ['Full name', profile.name || '—'],
            ['Phone', profile.phone || '—'],
            ['Email', profile.email || '—'],
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
          <label className="font-body text-[13px] text-[var(--color-text-secondary)]">
            Business name
            <input
              value={draftPayment.businessName}
              onChange={(e) => setDraftPayment({ ...draftPayment, businessName: e.target.value })}
              className={inputClass}
            />
          </label>
          <label className="font-body text-[13px] text-[var(--color-text-secondary)]">
            ABN
            <input
              value={draftPayment.abn}
              onChange={(e) => setDraftPayment({ ...draftPayment, abn: e.target.value })}
              className={inputClass}
            />
          </label>
          <div className={isDesktop ? 'grid grid-cols-2 gap-3' : 'flex flex-col gap-3'}>
            <label className="font-body text-[13px] text-[var(--color-text-secondary)]">
              BSB
              <input
                value={draftPayment.bsb}
                onChange={(e) => setDraftPayment({ ...draftPayment, bsb: e.target.value })}
                className={inputClass}
              />
            </label>
            <label className="font-body text-[13px] text-[var(--color-text-secondary)]">
              Account
              <input
                value={draftPayment.account}
                onChange={(e) => setDraftPayment({ ...draftPayment, account: e.target.value })}
                className={inputClass}
              />
            </label>
          </div>
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
            className="min-h-[48px] rounded-xl border border-[var(--color-border)] font-body text-[var(--color-text-primary)]"
          >
            Upload logo
          </button>
          {draftPayment.logo && (
            <img src={draftPayment.logo} alt="Logo" className="h-16 w-auto object-contain" />
          )}
          <button
            type="button"
            onClick={() => {
              setDraftPayment(payment)
              setPaymentEditing(false)
            }}
            className="min-h-[48px] rounded-xl border border-[var(--color-border)] font-body text-[var(--color-text-secondary)]"
          >
            Discard changes
          </button>
          <button
            type="button"
            onClick={() => {
              setPayment(draftPayment)
              setPaymentEditing(false)
              showToast('Payment details saved.', 'success')
            }}
            className="min-h-[48px] rounded-xl btn-primary font-body font-medium"
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
        </>
      )}

      {settingsTab === 'team' && (
        <>
      <p className="section-label section-gap">Team</p>
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
          className="min-h-[48px] rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] font-body text-[var(--color-text-primary)]"
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
                <p className="font-body text-[15px] font-medium text-[var(--color-text-primary)]">{t.name}</p>
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
        </>
      )}

      {settingsTab === 'app' && (
        <>
      <p className="section-label section-gap">Appearance</p>
      <div className="mt-2 flex gap-2">
        {(['dark', 'light'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTheme(t)}
            className={`min-h-[36px] flex-1 rounded-full px-3 font-body text-sm capitalize ${
              theme === t
                ? 'chip-active'
                : 'chip-inactive'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <p className="section-label section-gap">App</p>
      <button
        type="button"
        onClick={() => {
          if (window.confirm('Clear all recent chats?')) {
            onClearChats()
            showToast('Chats cleared.', 'success')
          }
        }}
        className="mt-2 min-h-[48px] w-full rounded-xl border border-[var(--color-border)] font-body text-[var(--color-text-primary)]"
      >
        Clear recent chats
      </button>
      <button
        type="button"
        onClick={onSupport}
        className="mt-2 min-h-[48px] w-full rounded-xl border border-[var(--color-border)] font-body text-[var(--color-text-primary)]"
      >
        Support
      </button>
      <p className="mt-4 font-body text-[13px] text-[var(--color-text-tertiary)]">datum.ai v0.3.10</p>
        </>
      )}
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
    <div className="section-gap flex items-center justify-between">
      <p className="section-label">{title}</p>
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
          <p className="font-body text-[15px] text-[var(--color-text-primary)]">{value}</p>
        </div>
      ))}
      {logo && <img src={logo} alt="Logo" className="h-16 w-auto object-contain" />}
      {note && <p className="font-body text-xs text-[var(--color-text-tertiary)]">{note}</p>}
    </div>
  )
}
