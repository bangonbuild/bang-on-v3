import type { LucideIcon } from 'lucide-react'

interface NewsCardProps {
  headline: string
  timestamp: string
  icon?: LucideIcon
}

export function NewsCard({ headline, timestamp }: NewsCardProps) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <p className="font-display text-[11px] tracking-[0.12em] text-[var(--color-text-tertiary)]">
        {timestamp}
      </p>
      <p className="mt-1 line-clamp-2 font-body text-sm font-medium text-[var(--color-text-primary)]">
        {headline}
      </p>
    </div>
  )
}
