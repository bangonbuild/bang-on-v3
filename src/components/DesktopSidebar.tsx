import { Banknote, Briefcase, CircleUserRound, House, Wrench } from 'lucide-react'
import type { Profile, TabId } from '../types'
import { firstNameFromProfile } from '../utils/welcome'

interface DesktopSidebarProps {
  active: TabId
  onChange: (tab: TabId) => void
  onNudge: () => void
  onOpenSettings: () => void
  profile: Profile
}

const navItems: { id: TabId; label: string; icon: typeof House }[] = [
  { id: 'home', label: 'Home', icon: House },
  { id: 'money', label: 'Money', icon: Banknote },
  { id: 'toolbox', label: 'Toolbox', icon: Wrench },
  { id: 'jobs', label: 'Jobs', icon: Briefcase },
]

export function DesktopSidebar({
  active,
  onChange,
  onNudge,
  onOpenSettings,
  profile,
}: DesktopSidebarProps) {
  const firstName = firstNameFromProfile(profile.name) || 'Profile'

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-full w-[240px] flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="px-5 pt-6">
        <p className="font-display text-[20px] font-bold text-[var(--color-text-primary)]">datum.ai</p>
        <p className="mt-0.5 font-sans text-[11px] text-[var(--color-text-tertiary)]">v0.3.9</p>
      </div>

      <nav className="mt-6 flex flex-col">
        {navItems.map(({ id, label, icon: NavIcon }) => {
          const isActive = active === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              className={`flex h-12 items-center gap-3 pl-5 pr-4 transition-[background-color,color] duration-150 ${
                isActive
                  ? 'border-l-[3px] border-l-white bg-[var(--color-surface-2)] text-[var(--color-text-primary)]'
                  : 'border-l-[3px] border-l-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              <NavIcon size={20} strokeWidth={1.5} className="shrink-0" />
              <span className="font-sans text-[14px]">{label}</span>
            </button>
          )
        })}
      </nav>

      <div className="mt-4 px-4">
        <button
          type="button"
          onClick={onNudge}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-white bg-transparent transition-opacity duration-150 hover:opacity-90"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
          </span>
          <span className="font-sans text-[14px] text-[var(--color-text-primary)]">Ask Nudge</span>
        </button>
      </div>

      <div className="mt-auto border-t border-[var(--color-border)] p-4">
        <button
          type="button"
          onClick={onOpenSettings}
          className="flex w-full items-center gap-3 rounded-lg px-1 py-2 text-left transition-colors duration-150 hover:bg-[var(--color-surface-2)]"
        >
          <CircleUserRound size={20} strokeWidth={1.5} className="shrink-0 text-[var(--color-text-secondary)]" />
          <span className="font-sans text-[14px] text-[var(--color-text-secondary)]">{firstName}</span>
        </button>
      </div>
    </aside>
  )
}
