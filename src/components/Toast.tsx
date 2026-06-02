import { AnimatePresence, motion } from 'framer-motion'
import type { ToastType } from '../hooks/useToast'
import { NAV_BOTTOM } from '../utils/layout'

interface ToastProps {
  message: string
  type: ToastType
  visible: boolean
}

export function Toast({ message, type: _type, visible }: ToastProps) {
  return (
    <AnimatePresence>
      {visible && message && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.2 }}
          className="fixed left-1/2 z-[100] max-w-[90%] -translate-x-1/2 rounded-full border border-[var(--color-border-2)] bg-[var(--color-surface-2)] px-5 py-3"
          style={{ bottom: `calc(${NAV_BOTTOM} + 0.75rem)` }}
        >
          <p className="font-body text-[14px] text-[var(--color-text-primary)]">{message}</p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
