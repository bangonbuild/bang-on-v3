import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import type { WeatherData } from '../hooks/useWeather'
import { Icon } from './Icon'

interface WeatherModalProps {
  open: boolean
  weather: WeatherData
  onClose: () => void
  onRefresh: () => void
}

function formatDay(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-AU', { weekday: 'short' })
}

export function WeatherModal({ open, weather, onClose, onRefresh }: WeatherModalProps) {
  const pills = [
    { label: 'Wind', value: `${weather.windKmh} km/h` },
    { label: 'Rain chance', value: `${weather.rainChance}%` },
    { label: 'UV', value: `${weather.uv}` },
    { label: 'Feels like', value: `${weather.feelsLike}°` },
  ]

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Close"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-black/70"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            className="fixed bottom-0 left-0 right-0 z-[81] max-h-[85vh] overflow-y-auto rounded-t-[20px] bg-[var(--color-surface)] p-6 pb-10"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-base text-white">Weather</h2>
              <button type="button" onClick={onClose} className="min-h-[48px] min-w-[48px]">
                <Icon icon={X} size={20} className="text-[var(--color-text-secondary)]" />
              </button>
            </div>
            <p className="font-display text-5xl text-white">{weather.temp ?? '—'}°</p>
            <p className="mt-1 font-body text-[15px] text-[var(--color-text-secondary)]">
              {weather.description}
            </p>
            <p className="mt-1 font-body text-[13px] text-[var(--color-text-tertiary)]">
              {weather.location}
            </p>
            <div className="mt-6 grid grid-cols-2 gap-2">
              {pills.map((p) => (
                <div
                  key={p.label}
                  className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-3"
                >
                  <p className="font-body text-xs text-[var(--color-text-tertiary)]">{p.label}</p>
                  <p className="font-body text-sm text-white">{p.value}</p>
                </div>
              ))}
            </div>
            {weather.forecast.length > 0 && (
              <div className="mt-6 flex gap-2 overflow-x-auto">
                {weather.forecast.map((day) => (
                  <div
                    key={day.date}
                    className="min-w-[100px] shrink-0 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-3 text-center"
                  >
                    <p className="font-body text-xs text-[var(--color-text-tertiary)]">
                      {formatDay(day.date)}
                    </p>
                    <p className="mt-1 font-body text-sm text-white">
                      {day.high}° / {day.low}°
                    </p>
                    <p className="font-body text-xs text-[var(--color-text-secondary)]">
                      {day.rainChance}% rain
                    </p>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] p-4">
              <p className="font-display text-[11px] tracking-wide text-[var(--color-text-tertiary)]">
                Site advisory
              </p>
              <p className="mt-2 font-body text-[15px] leading-relaxed text-white">
                {weather.siteAdvisory}
              </p>
            </div>
            <button
              type="button"
              onClick={onRefresh}
              className="mt-6 min-h-[48px] w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] font-body text-white"
            >
              Refresh
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
