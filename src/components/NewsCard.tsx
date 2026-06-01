import { ChevronRight } from 'lucide-react'

interface NewsCardProps {
  headline: string
  timestamp: string
}

export function NewsCard({ headline, timestamp }: NewsCardProps) {
  return (
    <a
      href="https://www.tradiemagazine.com.au/"
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
    >
      <div className="min-w-0 flex-1">
        <span className="font-display text-[11px] text-[var(--color-text-tertiary)]">
          Tradie Magazine
        </span>
        <p className="mt-1 line-clamp-2 font-body text-sm font-medium text-white">{headline}</p>
        <p className="mt-1 font-body text-xs text-[var(--color-text-tertiary)]">{timestamp}</p>
      </div>
      <ChevronRight size={18} className="shrink-0 text-[var(--color-text-tertiary)]" />
    </a>
  )
}
