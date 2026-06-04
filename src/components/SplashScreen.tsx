import { motion } from 'framer-motion'

interface SplashScreenProps {
  visible: boolean
}

const easeOut = [0.22, 1, 0.36, 1] as const

export function SplashScreen({ visible }: SplashScreenProps) {
  if (!visible) return null

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#14120A]"
    >
      <div className="flex flex-col items-center">
        <div className="flex items-end gap-1">
          <motion.h1
            className="font-display text-[32px] font-bold tracking-tight text-white"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: easeOut }}
          >
            datum.ai
          </motion.h1>
          <motion.span
            className="splash-cursor mb-[5px] block h-7 w-[2px] shrink-0 rounded-sm bg-white"
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            transition={{ delay: 0.45, duration: 0.25, ease: easeOut }}
            aria-hidden
          />
        </div>
        <motion.div
          className="mt-3 h-px w-0 bg-white/25"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 120, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6, ease: easeOut }}
        />
        <motion.p
          className="font-display mt-4 text-sm text-white/50"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.5, ease: easeOut }}
        >
          Built for the job.
        </motion.p>
      </div>
    </motion.div>
  )
}
