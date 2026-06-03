import { motion } from 'framer-motion'

interface SplashScreenProps {
  visible: boolean
}

export function SplashScreen({ visible }: SplashScreenProps) {
  if (!visible) return null

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#202124]"
    >
      <h1 className="font-display text-[32px] font-bold text-white">datum.ai</h1>
      <p className="font-display mt-2 text-sm text-white/50">Built for the job.</p>
    </motion.div>
  )
}
