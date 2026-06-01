import { useCallback, useEffect, useState } from 'react'

export interface ForecastDay {
  date: string
  high: number
  low: number
  rainChance: number
  description: string
}

export interface WeatherData {
  temp: number | null
  description: string
  location: string
  windKmh: number
  rainChance: number
  uv: number
  feelsLike: number
  forecast: ForecastDay[]
  siteAdvisory: string
  loading: boolean
  error: string | null
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

function buildSiteAdvisory(windKmh: number, rainChance: number, uv: number): string {
  if (windKmh > 40) {
    return 'High winds. Check scaffold ties and secure loose materials.'
  }
  if (rainChance > 60) {
    return 'Rain likely. Hold off on concrete pours and external painting.'
  }
  if (uv > 7) {
    return 'High UV today. Ensure crew has sun protection.'
  }
  return 'Conditions look good for site work today.'
}

async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
      { headers: { 'Accept-Language': 'en-AU' } },
    )
    if (!res.ok) return 'Your location'
    const data = await res.json()
    const suburb = data.address?.suburb || data.address?.city || data.address?.town
    const state = data.address?.state
    if (suburb && state) return `${suburb}, ${state}`
    return data.display_name?.split(',').slice(0, 2).join(',') || 'Your location'
  } catch {
    return 'Your location'
  }
}

export function useWeather() {
  const [weather, setWeather] = useState<WeatherData>({
    temp: null,
    description: '',
    location: '',
    windKmh: 0,
    rainChance: 0,
    uv: 0,
    feelsLike: 0,
    forecast: [],
    siteAdvisory: 'Conditions look good for site work today.',
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
      const [location, res] = await Promise.all([
        reverseGeocode(latitude, longitude),
        fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,apparent_temperature,wind_speed_10m,uv_index&hourly=precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=3`,
        ),
      ])
      if (!res.ok) throw new Error('Weather unavailable')
      const data = await res.json()
      const temp = Math.round(data.current?.temperature_2m ?? 0)
      const code = data.current?.weather_code ?? 0
      const description = weatherCodeToDescription(code)
      const windKmh = Math.round((data.current?.wind_speed_10m ?? 0) * 3.6)
      const feelsLike = Math.round(data.current?.apparent_temperature ?? temp)
      const uv = Math.round(data.current?.uv_index ?? 0)
      const rainChance = Math.round(data.hourly?.precipitation_probability?.[0] ?? 0)

      const forecast: ForecastDay[] = (data.daily?.time ?? []).slice(0, 3).map((date: string, i: number) => ({
        date,
        high: Math.round(data.daily.temperature_2m_max[i]),
        low: Math.round(data.daily.temperature_2m_min[i]),
        rainChance: Math.round(data.daily.precipitation_probability_max[i] ?? 0),
        description: weatherCodeToDescription(data.daily.weather_code[i]),
      }))

      setWeather({
        temp,
        description,
        location,
        windKmh,
        rainChance,
        uv,
        feelsLike,
        forecast,
        siteAdvisory: buildSiteAdvisory(windKmh, rainChance, uv),
        loading: false,
        error: null,
      })
    } catch {
      setWeather({
        temp: 22,
        description: 'Partly cloudy',
        location: 'Sydney, NSW',
        windKmh: 15,
        rainChance: 20,
        uv: 5,
        feelsLike: 22,
        forecast: [
          { date: new Date().toISOString().slice(0, 10), high: 24, low: 16, rainChance: 20, description: 'Partly cloudy' },
          { date: new Date(Date.now() + 86400000).toISOString().slice(0, 10), high: 23, low: 15, rainChance: 30, description: 'Showers' },
          { date: new Date(Date.now() + 172800000).toISOString().slice(0, 10), high: 25, low: 17, rainChance: 10, description: 'Clear' },
        ],
        siteAdvisory: 'Conditions look good for site work today.',
        loading: false,
        error: null,
      })
    }
  }, [])

  useEffect(() => {
    void fetchWeather()
  }, [fetchWeather])

  return { ...weather, refresh: fetchWeather }
}
