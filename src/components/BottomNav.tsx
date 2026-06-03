import { Banknote, Briefcase, House, MessageCircle, Wrench, X } from 'lucide-react'
import type { TabId } from '../types'

interface BottomNavProps {
  active: TabId
  onChange: (tab: TabId) => void
  onNudge: () => void
  nudgeOpen?: boolean
}

const leftTabs: { id: TabId; label: string; icon: typeof House }[] = [
  { id: 'home', label: 'Home', icon: House },
  { id: 'money', label: 'Money', icon: Banknote },
]

const rightTabs: { id: TabId; label: string; icon: typeof House }[] = [
  { id: 'toolbox', label: 'Toolbox', icon: Wrench },
  { id: 'jobs', label: 'Jobs', icon: Briefcase },
]

function TabButton({
  id,
  label,
  icon: TabIcon,
  active,
  onChange,
}: {
  id: TabId
  label: string
  icon: typeof House
  active: boolean
  onChange: (tab: TabId) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(id)}
      className="flex min-h-[48px] flex-1 flex-col items-center justify-center gap-1"
    >
      {/* IMPORTANT: never use transform or filter on these icons — causes blurring */}
      <TabIcon
        size={22}
        strokeWidth={1.5}
        className={active ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-tertiary)]'}
        style={{ opacity: active ? 1 : 0.5 }}
      />
      <span
        className={`font-display text-[11px] ${
          active ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-tertiary)]'
        }`}
        style={{ opacity: active ? 1 : 0.65 }}
      >
        {label}
      </span>
    </button>
  )
}

export function BottomNav({ active, onChange, onNudge, nudgeOpen = false }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--color-border)] bg-[var(--color-bg)] pb-[env(safe-area-inset-bottom)]">
      <div className="relative flex h-14 items-stretch">
        {leftTabs.map((tab) => (
          <TabButton key={tab.id} {...tab} active={active === tab.id} onChange={onChange} />
        ))}
        <div className="flex w-[72px] shrink-0 items-center justify-center">
          <button
            type="button"
            onClick={onNudge}
            aria-label={nudgeOpen ? 'Close Nudge' : 'Ask Nudge'}
            className="nudge-fab flex h-14 w-14 items-center justify-center rounded-full border"
            style={{ marginTop: -12 }}
          >
            {/* IMPORTANT: never use transform or filter on these icons — causes blurring */}
            {nudgeOpen ? (
              <X size={24} strokeWidth={1.5} className="nudge-fab-icon" />
            ) : (
              <MessageCircle size={24} strokeWidth={1.5} className="nudge-fab-icon" />
            )}
          </button>
        </div>
        {rightTabs.map((tab) => (
          <TabButton key={tab.id} {...tab} active={active === tab.id} onChange={onChange} />
        ))}
      </div>
    </nav>
  )
}
