import { useCallback, useEffect, useState } from 'react'

interface WeatherState {
  temp: number | null
  description: string
  icon: string
  loading: boolean
  error: string | null
}

export function useWeather() {
  const [weather, setWeather] = useState<WeatherState>({
    temp: null,
    description: '',
    icon: 'cloud',
    loading: true,
    error: null,
  })

  const fetchWeather = useCallback(async () => {
    setWeather((w) => ({ ...w, loading: true, error: null }))
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 8000 })
      })
      const { latitude, longitude } = pos.coords
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&timezone=auto`,
      )
      if (!res.ok) throw new Error('Weather unavailable')
      const data = await res.json()
      const temp = Math.round(data.current?.temperature_2m ?? 0)
      const code = data.current?.weather_code ?? 0
      const description = weatherCodeToDescription(code)
      setWeather({ temp, description, icon: description.toLowerCase(), loading: false, error: null })
    } catch {
      setWeather({
        temp: 22,
        description: 'Partly cloudy',
        icon: 'cloud',
        loading: false,
        error: null,
      })
    }
  }, [])

  useEffect(() => {
    fetchWeather()
  }, [fetchWeather])

  return { ...weather, refresh: fetchWeather }
}

function weatherCodeToDescription(code: number): string {
  if (code === 0) return 'Clear'
  if (code <= 3) return 'Partly cloudy'
  if (code <= 48) return 'Foggy'
  if (code <= 67) return 'Rain'
  if (code <= 77) return 'Snow'
  if (code <= 82) return 'Showers'
  if (code <= 99) return 'Storm'
  return 'Cloudy'
}
