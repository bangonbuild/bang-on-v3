import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import type { Dispatch, SetStateAction } from 'react'
import { SettingsScreen } from '../screens/SettingsScreen'
import type { PaymentDetails, Profile } from '../types'
import type { Theme } from '../hooks/useTheme'
import type { ShowToastFn } from '../hooks/useToast'
import { DRAWER_HEIGHT, DESKTOP_SIDEBAR_WIDTH } from '../utils/layout'

interface SettingsDrawerProps {
  open: boolean
  onClose: () => void
  isDesktop: boolean
  profile: Profile
  setProfile: Dispatch<SetStateAction<Profile>>
  payment: PaymentDetails
  setPayment: Dispatch<SetStateAction<PaymentDetails>>
  onClearChats: () => void
  showToast: ShowToastFn
  theme: Theme
  setTheme: (theme: Theme) => void
  onSupport: () => void
}

export function SettingsDrawer({
  open,
  onClose,
  isDesktop,
  profile,
  setProfile,
  payment,
  setPayment,
  onClearChats,
  showToast,
  theme,
  setTheme,
  onSupport,
}: SettingsDrawerProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Close settings"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[40] bg-[rgba(0,0,0,0.6)]"
            style={isDesktop ? { left: DESKTOP_SIDEBAR_WIDTH } : undefined}
            onClick={onClose}
          />
          {isDesktop ? (
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="fixed bottom-0 right-0 top-0 z-[45] flex w-[400px] flex-col overflow-hidden border-l border-[var(--color-border)] bg-[var(--color-bg)]"
            >
              <div className="flex shrink-0 items-center justify-end px-4 pt-4">
                <button type="button" onClick={onClose} className="min-h-[48px] min-w-[48px]" aria-label="Close">
                  <X size={22} strokeWidth={1.5} className="text-[var(--color-text-secondary)]" />
                </button>
              </div>
              <div className="min-h-0 flex-1 overflow-hidden">
                <SettingsScreen
                  profile={profile}
                  setProfile={setProfile}
                  payment={payment}
                  setPayment={setPayment}
                  onClearChats={onClearChats}
                  showToast={showToast}
                  theme={theme}
                  setTheme={setTheme}
                  onBack={onClose}
                  onSupport={onSupport}
                  drawer
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.35, type: 'spring', bounce: 0.15 }}
              className={`fixed bottom-0 left-0 right-0 z-[45] flex ${DRAWER_HEIGHT} flex-col overflow-hidden rounded-t-[20px] bg-[var(--color-surface)]`}
            >
              <div className="flex shrink-0 justify-center pt-3">
                <div className="h-1 w-10 rounded-full bg-[var(--color-border-2)]" />
              </div>
              <div className="flex shrink-0 items-center justify-between px-5 pb-2 pt-1">
                <h2 className="font-display text-[20px] font-bold text-[var(--color-text-primary)]">Settings</h2>
                <button type="button" onClick={onClose} className="min-h-[48px] min-w-[48px]" aria-label="Close">
                  <X size={22} strokeWidth={1.5} className="text-[var(--color-text-primary)]" />
                </button>
              </div>
              <div className="min-h-0 flex-1 overflow-hidden">
                <SettingsScreen
                  profile={profile}
                  setProfile={setProfile}
                  payment={payment}
                  setPayment={setPayment}
                  onClearChats={onClearChats}
                  showToast={showToast}
                  theme={theme}
                  setTheme={setTheme}
                  onBack={onClose}
                  onSupport={onSupport}
                  drawer
                />
              </div>
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>
  )
}
