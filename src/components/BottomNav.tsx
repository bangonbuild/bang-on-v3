import { Briefcase, House, SlidersHorizontal, Wrench } from 'lucide-react'
import type { TabId } from '../types'

interface BottomNavProps {
  active: TabId
  onChange: (tab: TabId) => void
}

const tabs: { id: TabId; label: string; icon: typeof House }[] = [
  { id: 'home', label: 'Home', icon: House },
  { id: 'jobs', label: 'Jobs', icon: Briefcase },
  { id: 'toolbox', label: 'Toolbox', icon: Wrench },
  { id: 'settings', label: 'Settings', icon: SlidersHorizontal },
]

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--color-border)] bg-[var(--color-bg)] pb-[env(safe-area-inset-bottom)]">
      <div className="flex h-16 items-stretch">
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = active === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              className="flex min-h-[48px] flex-1 flex-col items-center justify-center gap-1"
            >
              <Icon
                size={22}
                className={isActive ? 'text-white' : 'text-[var(--color-text-tertiary)]'}
              />
              <span
                className={`font-display text-[11px] ${
                  isActive ? 'text-white' : 'text-[var(--color-text-tertiary)]'
                }`}
              >
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
