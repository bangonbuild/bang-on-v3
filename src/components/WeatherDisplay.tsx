import type { LucideIcon } from 'lucide-react'
import { ChevronRight, Cloud, CloudRain, CloudSnow, Sun } from 'lucide-react'

interface WeatherDisplayProps {
  temp: number | null
  description: string
  rainChance: number
  loading: boolean
  onClick: () => void
}

function getConditionMeta(
  description: string,
  rainChance: number,
): { label: string; icon: LucideIcon } {
  const d = description.toLowerCase().trim()
  if (!d) return { label: 'Check weather', icon: Cloud }
  if (d.includes('storm')) return { label: 'Storm', icon: CloudRain }
  if (d.includes('snow')) return { label: 'Snow', icon: CloudSnow }
  if (d.includes('rain') || d.includes('showers')) {
    if (rainChance >= 70) return { label: 'Heavy rain', icon: CloudRain }
    return { label: 'Rain likely', icon: CloudRain }
  }
  if (d === 'clear') return { label: 'Clear', icon: Sun }
  if (d.includes('partly')) return { label: 'Partly cloudy', icon: Cloud }
  if (d.includes('fog') || d.includes('cloudy') || d.includes('overcast')) {
    return { label: 'Overcast', icon: Cloud }
  }
  return { label: 'Check weather', icon: Cloud }
}

export function WeatherDisplay({
  temp,
  description,
  rainChance,
  loading,
  onClick,
}: WeatherDisplayProps) {
  const { label, icon: WeatherIcon } = getConditionMeta(description, rainChance)

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex min-h-[44px] items-center gap-1.5 font-display text-[14px] text-[var(--color-text-secondary)] hover:underline"
    >
      {loading ? (
        <span className="weather-shimmer" aria-hidden />
      ) : (
        <>
          <WeatherIcon size={16} strokeWidth={1.5} className="shrink-0" />
          <span>{temp ?? '—'}°</span>
          <span>{label}</span>
          <ChevronRight size={12} strokeWidth={1.5} className="text-[var(--color-text-tertiary)]" />
        </>
      )}
    </button>
  )
}
