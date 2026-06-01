import { AnimatePresence, motion } from 'framer-motion'
import { FileText, Ruler, ScanLine } from 'lucide-react'
import { Icon } from './Icon'
import type { SnapMode } from '../types'

interface SnapDrawerProps {
  open: boolean
  onClose: () => void
  onSelectMode: (mode: SnapMode) => void
}

const modes: { mode: SnapMode; icon: typeof ScanLine; label: string; desc: string }[] = [
  { mode: 'identify', icon: ScanLine, label: 'Identify', desc: 'What is this / spot issues' },
  { mode: 'scan-drawing', icon: FileText, label: 'Scan drawing', desc: 'Read a plan or detail' },
  { mode: 'measure', icon: Ruler, label: 'Measure & calculate', desc: 'Get measurements from a photo' },
]

export function SnapDrawer({ open, onClose, onSelectMode }: SnapDrawerProps) {
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
            <h2 className="font-display text-base text-white">What do you want to snap?</h2>
            <p className="mt-1 font-body text-[13px] text-[var(--color-text-secondary)]">
              Choose a mode
            </p>
            <div className="mt-4 flex flex-col gap-2">
              {modes.map(({ mode, icon, label, desc }) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => {
                    onClose()
                    onSelectMode(mode)
                  }}
                  className="flex min-h-[48px] w-full items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] px-4 py-3 text-left"
                >
                  <Icon icon={icon} size={20} className="text-white" />
                  <div>
                    <p className="font-body text-[15px] text-white">{label}</p>
                    <p className="font-body text-[13px] text-[var(--color-text-secondary)]">
                      {desc}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
