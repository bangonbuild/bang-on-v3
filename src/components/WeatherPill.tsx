import { Cloud } from 'lucide-react'

interface WeatherPillProps {
  temp: number | null
  description: string
  loading: boolean
  onClick: () => void
}

export function WeatherPill({ temp, description, loading, onClick }: WeatherPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[48px] items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
    >
      <Cloud size={16} className="text-[var(--color-text-secondary)]" />
      <span className="font-body text-[13px] text-[var(--color-text-secondary)]">
        {loading ? '…' : `${temp ?? '—'}° · ${description}`}
      </span>
    </button>
  )
}
