import type { LucideIcon } from 'lucide-react'

interface ToolCardProps {
  title: string
  subtitle: string
  icon: LucideIcon
  onClick: () => void
}

export function ToolCard({ title, subtitle, icon: IconComp, onClick }: ToolCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-left"
    >
      <IconComp
        size={22}
        strokeWidth={2}
        className="text-[var(--color-text-primary)]"
        style={{ shapeRendering: 'geometricPrecision' }}
      />
      <p className="font-display mt-3 text-[15px] font-medium text-[var(--color-text-primary)]">{title}</p>
      <p className="mt-1 font-body text-[13px] text-[var(--color-text-secondary)]">{subtitle}</p>
    </button>
  )
}
