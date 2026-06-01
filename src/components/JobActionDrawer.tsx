import { AnimatePresence, motion } from 'framer-motion'
import { Camera, ChevronRight, FileText, MessageCircle, ReceiptText, StickyNote } from 'lucide-react'
import { Icon } from './Icon'

export type JobAction = 'nudge' | 'note' | 'photo' | 'quote' | 'invoice'

interface JobActionDrawerProps {
  open: boolean
  onClose: () => void
  onSelect: (action: JobAction) => void
}

const actions: { action: JobAction; icon: typeof MessageCircle; label: string }[] = [
  { action: 'nudge', icon: MessageCircle, label: 'Ask Nudge' },
  { action: 'note', icon: StickyNote, label: 'Add note' },
  { action: 'photo', icon: Camera, label: 'Add photo' },
  { action: 'quote', icon: ReceiptText, label: 'Quote' },
  { action: 'invoice', icon: FileText, label: 'Invoice' },
]

export function JobActionDrawer({ open, onClose, onSelect }: JobActionDrawerProps) {
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
            className="fixed inset-0 z-[70] bg-black/70"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="fixed bottom-0 left-0 right-0 z-[71] rounded-t-[20px] bg-[var(--color-surface)] px-4 pb-8 pt-3"
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[var(--color-border-2)]" />
            <div className="flex flex-col gap-2">
              {actions.map(({ action, icon, label }) => (
                <button
                  key={action}
                  type="button"
                  onClick={() => {
                    onClose()
                    onSelect(action)
                  }}
                  className="flex min-h-[48px] w-full items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] px-4 text-left"
                >
                  <Icon icon={icon} size={20} className="text-white" />
                  <span className="flex-1 font-body text-[15px] text-white">{label}</span>
                  <Icon icon={ChevronRight} size={18} muted />
                </button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
