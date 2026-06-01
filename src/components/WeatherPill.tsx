import { Cloud } from 'lucide-react'
import { Icon } from './Icon'

interface WeatherPillProps {
  temp: number | null
  rainChance: number
  loading: boolean
  onClick: () => void
}

export function WeatherPill({ temp, rainChance, loading, onClick }: WeatherPillProps) {
  const label = loading
    ? '…'
    : `${temp ?? '—'}° ${rainChance}% rain`

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[48px] items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
    >
      <Icon icon={Cloud} size={16} className="text-[var(--color-text-secondary)]" />
      <span className="font-body text-[13px] text-[var(--color-text-secondary)]">{label}</span>
    </button>
  )
}
