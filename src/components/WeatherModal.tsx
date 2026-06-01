import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'

interface WeatherModalProps {
  open: boolean
  temp: number | null
  description: string
  onClose: () => void
  onRefresh: () => void
}

export function WeatherModal({
  open,
  temp,
  description,
  onClose,
  onRefresh,
}: WeatherModalProps) {
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
            className="fixed inset-0 z-[80] bg-black/70"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            className="fixed bottom-0 left-0 right-0 z-[81] rounded-t-[20px] bg-[var(--color-surface)] p-6 pb-10"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-base text-white">Weather</h2>
              <button type="button" onClick={onClose} className="min-h-[48px] min-w-[48px]">
                <X size={20} className="text-[var(--color-text-secondary)]" />
              </button>
            </div>
            <p className="font-display text-4xl text-white">{temp ?? '—'}°</p>
            <p className="mt-2 font-body text-[15px] text-[var(--color-text-secondary)]">
              {description}
            </p>
            <button
              type="button"
              onClick={onRefresh}
              className="mt-6 min-h-[48px] w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] font-body text-white"
            >
              Refresh
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
