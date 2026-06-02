import type { LucideIcon } from 'lucide-react'

interface FeaturePlaceholderProps {
  icon: LucideIcon
  title: string
  description: string
  onTap: () => void
}

export function FeaturePlaceholder({ icon: IconComp, title, description, onTap }: FeaturePlaceholderProps) {
  return (
    <button
      type="button"
      onClick={onTap}
      className="flex w-full items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-left"
    >
      <IconComp size={20} strokeWidth={2} className="shrink-0 text-[var(--color-text-secondary)]" />
      <div>
        <p className="font-body text-sm font-medium text-[var(--color-text-primary)]">{title}</p>
        <p className="font-body text-xs text-[var(--color-text-secondary)]">{description}</p>
      </div>
    </button>
  )
}
