import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { ScreenTitle } from '../components/ScreenTitle'
import type { Profile } from '../types'
import type { ShowToastFn } from '../hooks/useToast'
import { NAV_PB } from '../utils/layout'

interface SupportScreenProps {
  profile: Profile
  onBack: () => void
  showToast: ShowToastFn
}

export function SupportScreen({ profile, onBack, showToast }: SupportScreenProps) {
  const [name, setName] = useState(profile.name)
  const [email, setEmail] = useState(profile.email ?? '')
  const [message, setMessage] = useState('')

  const inputClass =
    'mt-1 w-full min-h-[48px] rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 font-body text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)]'

  const handleSend = () => {
    if (!message.trim()) return
    // TODO: wire to support email or helpdesk system
    showToast("Message sent — we'll be in touch soon.", 'info')
    setMessage('')
    window.setTimeout(() => onBack(), 1500)
  }

  return (
    <div className={`px-4 pt-6 ${NAV_PB}`}>
      <header className="flex items-center gap-3">
        <button type="button" onClick={onBack} className="min-h-[48px] min-w-[48px] shrink-0">
          <ArrowLeft size={22} className="text-[var(--color-text-primary)]" />
        </button>
        <ScreenTitle>Contact support</ScreenTitle>
      </header>

      <p className="mt-4 font-body text-[14px] text-[var(--color-text-secondary)]">
        Having trouble or got a question? We&apos;d love to help.
      </p>

      <div className="mt-6 flex flex-col gap-4">
        <label className="font-body text-[13px] text-[var(--color-text-secondary)]">
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        </label>
        <label className="font-body text-[13px] text-[var(--color-text-secondary)]">
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="font-body text-[13px] text-[var(--color-text-secondary)]">
          Message
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe your issue or question..."
            rows={6}
            className={`${inputClass} min-h-[140px] py-3`}
          />
        </label>
      </div>

      <button
        type="button"
        onClick={handleSend}
        className="mt-6 min-h-[48px] w-full rounded-xl bg-white font-body font-medium text-black"
      >
        Send message
      </button>
    </div>
  )
}
