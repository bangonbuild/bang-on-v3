import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { Icon } from '../components/Icon'
import { Toggle } from '../components/Toggle'

interface SuggestToolScreenProps {
  onBack: () => void
  onSubmit: () => void
}

export function SuggestToolScreen({ onBack, onSubmit }: SuggestToolScreenProps) {
  const [suggestion, setSuggestion] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [newsletter, setNewsletter] = useState(false)

  const inputClass =
    'mt-1 w-full min-h-[48px] rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 font-body text-white placeholder:text-[var(--color-text-tertiary)]'

  const handleSend = () => {
    // TODO: wire to Airtable / Typeform for real backlog submissions
    onSubmit()
  }

  return (
    <div className="flex h-full flex-col px-4 pb-24 pt-6">
      <header className="flex items-center gap-3">
        <button type="button" onClick={onBack} className="min-h-[48px] min-w-[48px]">
          <Icon icon={ArrowLeft} size={22} className="text-white" />
        </button>
        <h1 className="font-display text-xl font-bold text-white">Suggest a tool</h1>
      </header>
      <p className="mt-2 font-body text-sm text-[var(--color-text-secondary)]">
        We&apos;re building Bangon with tradies. Tell us what you need.
      </p>

      <div className="mt-6 flex flex-1 flex-col gap-4 overflow-y-auto">
        <label className="font-body text-[13px] text-[var(--color-text-secondary)]">
          Suggestion
          <textarea
            value={suggestion}
            onChange={(e) => setSuggestion(e.target.value)}
            placeholder="What tool would help you most on site?"
            rows={5}
            className={`${inputClass} min-h-[120px] py-3`}
          />
        </label>
        <label className="font-body text-[13px] text-[var(--color-text-secondary)]">
          Name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className={inputClass}
          />
        </label>
        <label className="font-body text-[13px] text-[var(--color-text-secondary)]">
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email"
            className={inputClass}
          />
        </label>
        <Toggle
          checked={newsletter}
          onChange={setNewsletter}
          label="Keep me updated on new tools"
        />
      </div>

      <button
        type="button"
        onClick={handleSend}
        className="mt-4 min-h-[48px] w-full shrink-0 rounded-xl bg-white font-body font-medium text-black"
      >
        Send suggestion
      </button>
    </div>
  )
}
