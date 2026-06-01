import { AnimatePresence, motion } from 'framer-motion'

interface ToastProps {
  message: string
  visible: boolean
}

export function Toast({ message, visible }: ToastProps) {
  return (
    <AnimatePresence>
      {visible && message && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-[88px] left-1/2 z-[100] max-w-[90%] -translate-x-1/2 rounded-full border border-[var(--color-border-2)] bg-[var(--color-surface-2)] px-5 py-3"
        >
          <p className="font-body text-center text-sm text-white">{message}</p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
