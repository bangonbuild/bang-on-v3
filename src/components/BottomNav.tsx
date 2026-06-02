import { Briefcase, House, MessageCircle, SlidersHorizontal, Wrench } from 'lucide-react'
import { Icon } from './Icon'
import type { TabId } from '../types'

interface BottomNavProps {
  active: TabId
  onChange: (tab: TabId) => void
  onNudge: () => void
}

const leftTabs: { id: TabId; label: string; icon: typeof House }[] = [
  { id: 'home', label: 'Home', icon: House },
  { id: 'jobs', label: 'Jobs', icon: Briefcase },
]

const rightTabs: { id: TabId; label: string; icon: typeof House }[] = [
  { id: 'toolbox', label: 'Toolbox', icon: Wrench },
  { id: 'settings', label: 'Settings', icon: SlidersHorizontal },
]

function TabButton({
  id,
  label,
  icon,
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
      <Icon icon={icon} size={22} className={active ? 'text-white' : 'text-white'} muted={!active} />
      <span
        className={`font-display text-[11px] ${active ? 'text-white' : 'text-white opacity-[0.35]'}`}
      >
        {label}
      </span>
    </button>
  )
}

export function BottomNav({ active, onChange, onNudge }: BottomNavProps) {
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
            aria-label="Ask Nudge"
            className="nudge-fab flex h-14 w-14 -translate-y-3 items-center justify-center rounded-full border border-white/10 bg-white active:bg-[#F0F0F0]"
          >
            <MessageCircle size={24} strokeWidth={2} className="nudge-fab-icon text-black" style={{ shapeRendering: 'geometricPrecision' }} />
          </button>
        </div>
        {rightTabs.map((tab) => (
          <TabButton key={tab.id} {...tab} active={active === tab.id} onChange={onChange} />
        ))}
      </div>
    </nav>
  )
}
