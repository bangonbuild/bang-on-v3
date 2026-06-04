import { AnimatePresence, motion } from 'framer-motion'
import type { ChatMessage, Job, Profile } from '../types'
import type { ShowToastFn } from '../hooks/useToast'
import { NudgeScreen } from '../screens/NudgeScreen'

interface NudgeDrawerProps {
  open: boolean
  onClose: () => void
  job?: Job
  profile: Profile
  onSaveChat: (messages: ChatMessage[], jobId?: string) => void
  showToast: ShowToastFn
}

export function NudgeDrawer({ open, onClose, job, profile, onSaveChat, showToast }: NudgeDrawerProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Close Nudge"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[40] bg-[rgba(0,0,0,0.6)]"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.35, type: 'spring', bounce: 0.15 }}
            className="fixed bottom-0 left-0 right-0 z-[45] flex h-[90vh] flex-col overflow-hidden rounded-t-[20px] bg-[var(--color-bg)]"
          >
            <div className="flex shrink-0 justify-center pt-3">
              <div className="h-1 w-10 rounded-full bg-[var(--color-border-2)]" />
            </div>
            <div className="flex min-h-0 flex-1 flex-col">
              <NudgeScreen
                job={job}
                profile={profile}
                onSaveChat={onSaveChat}
                showToast={showToast}
                embedded
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
