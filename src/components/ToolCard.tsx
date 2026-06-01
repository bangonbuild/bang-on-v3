import type { LucideIcon } from 'lucide-react'
import { Icon } from './Icon'

interface ToolCardProps {
  title: string
  subtitle: string
  icon: LucideIcon
  onClick: () => void
}

export function ToolCard({ title, subtitle, icon, onClick }: ToolCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[120px] flex-col rounded-xl border border-[var(--color-border-2)] bg-[var(--color-surface)] p-4 text-left active:bg-[var(--color-surface-2)]"
    >
      <Icon icon={icon} size={22} className="text-white" />
      <p className="font-display mt-3 text-[15px] font-medium text-white">{title}</p>
      <p className="mt-1 font-body text-[13px] text-[var(--color-text-secondary)]">{subtitle}</p>
    </button>
  )
}
