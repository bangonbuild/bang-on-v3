import { AnimatePresence, motion } from 'framer-motion'

export function LoadingBar({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="pointer-events-none fixed left-0 top-0 z-[999] h-[3px] bg-white/60"
          initial={{ width: '0%', opacity: 1 }}
          animate={{ width: ['0%', '70%', '95%', '100%'], opacity: [1, 1, 1, 0] }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2.2, times: [0, 0.25, 0.75, 1], ease: 'easeInOut' }}
          style={{ maxWidth: '100%' }}
        />
      )}
    </AnimatePresence>
  )
}
