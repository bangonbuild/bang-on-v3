import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useState } from 'react'
import { Toggle } from './Toggle'
import type { ShowToastFn } from '../hooks/useToast'
import { DRAWER_HEIGHT, DRAWER_SCROLL_PB } from '../utils/layout'

interface SuggestToolDrawerProps {
  open: boolean
  onClose: () => void
  showToast: ShowToastFn
}

export function SuggestToolDrawer({ open, onClose, showToast }: SuggestToolDrawerProps) {
  const [suggestion, setSuggestion] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [newsletter, setNewsletter] = useState(false)

  const inputClass =
    'mt-1 w-full min-h-[48px] rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] px-4 font-body text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)]'

  const handleSend = () => {
    // TODO: wire to Airtable / Typeform for real backlog submissions
    showToast("Thanks — we'll add it to the backlog.", 'success')
    setSuggestion('')
    setName('')
    setEmail('')
    setNewsletter(false)
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
                  Suggest a tool
                </h2>
                <p className="mt-1 font-body text-[13px] text-[var(--color-text-secondary)]">
                  We&apos;re building datum.ai with tradies. Tell us what you need.
                </p>
              </div>
              <button type="button" onClick={onClose} className="min-h-[48px] min-w-[48px]" aria-label="Close">
                <X size={22} strokeWidth={1.5} className="text-[var(--color-text-primary)]" />
              </button>
            </div>
            <div className={`min-h-0 flex-1 overflow-y-auto px-5 ${DRAWER_SCROLL_PB}`}>
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
              <label className="mt-4 block font-body text-[13px] text-[var(--color-text-secondary)]">
                Name
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className={inputClass} />
              </label>
              <label className="mt-4 block font-body text-[13px] text-[var(--color-text-secondary)]">
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email"
                  className={inputClass}
                />
              </label>
              <div className="mt-4">
                <Toggle checked={newsletter} onChange={setNewsletter} label="Keep me updated on new tools" />
              </div>
              <button
                type="button"
                onClick={handleSend}
                className="mt-6 min-h-[48px] w-full rounded-xl btn-primary font-body font-medium"
              >
                Send suggestion
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
