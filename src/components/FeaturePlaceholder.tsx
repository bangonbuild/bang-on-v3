import type { LucideIcon } from 'lucide-react'

interface FeaturePlaceholderProps {
  icon: LucideIcon
  title: string
  description: string
  onTap: () => void
}

export function FeaturePlaceholder({
  icon: Icon,
  title,
  description,
  onTap,
}: FeaturePlaceholderProps) {
  return (
    <button
      type="button"
      onClick={onTap}
      className="flex w-full items-start gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-left"
    >
      <Icon size={20} className="mt-0.5 shrink-0 text-[var(--color-text-tertiary)]" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="font-body text-sm font-medium text-white">{title}</p>
          <span className="shrink-0 rounded-full bg-[var(--color-surface-2)] px-2 py-0.5 text-[11px] text-[var(--color-text-tertiary)]">
            Coming soon
          </span>
        </div>
        <p className="mt-1 font-body text-xs text-[var(--color-text-secondary)]">
          {description}
        </p>
      </div>
    </button>
  )
}
