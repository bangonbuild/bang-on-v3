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
  weatherCode: number
  description: string
  location: string
  windKmh: number
  rainChance: number
  uv: number
  feelsLike: number
  forecast: ForecastDay[]
  siteAdvisory: string
  loading: boolean
  available: boolean
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

async function reverseGeocode(latitude: number, longitude: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
      { headers: { 'Accept-Language': 'en-AU' } },
    )
    if (!res.ok) return ''
    const data = await res.json()
    const suburb = data.address?.suburb || data.address?.city || data.address?.town
    const state = data.address?.state
    if (suburb && state) return `${suburb}, ${state}`
    return data.display_name?.split(',').slice(0, 2).join(',') || ''
  } catch {
    return ''
  }
}

function getGpsPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation unavailable'))
      return
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    })
  })
}

const emptyWeather = (): WeatherData => ({
  temp: null,
  weatherCode: 0,
  description: '',
  location: '',
  windKmh: 0,
  rainChance: 0,
  uv: 0,
  feelsLike: 0,
  forecast: [],
  siteAdvisory: '',
  loading: false,
  available: false,
  error: null,
})

export function useWeather() {
  const [weather, setWeather] = useState<WeatherData>({
    ...emptyWeather(),
    loading: true,
    available: true,
  })

  const fetchWeather = useCallback(async () => {
    setWeather((w) => ({ ...w, loading: true, error: null }))

    try {
      const position = await getGpsPosition()
      const { latitude, longitude } = position.coords

      const [location, res] = await Promise.all([
        reverseGeocode(latitude, longitude),
        fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,apparent_temperature,wind_speed_10m,uv_index&hourly=precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=3`,
        ),
      ])

      if (!res.ok) throw new Error('Weather unavailable')

      const data = await res.json()
      const current = data.current ?? data.current_weather
      const temp = Math.round(current?.temperature_2m ?? current?.temperature ?? 0)
      const code = current?.weather_code ?? current?.weathercode ?? 0
      const description = weatherCodeToDescription(code)
      const windKmh = Math.round(current?.wind_speed_10m ?? current?.windspeed ?? 0)
      const feelsLike = Math.round(current?.apparent_temperature ?? temp)
      const uv = Math.round(current?.uv_index ?? 0)

      const currentHour = (current?.time as string | undefined)?.slice(0, 13)
      const hourlyTimes: string[] = data.hourly?.time ?? []
      const hourIndex = currentHour
        ? hourlyTimes.findIndex((t) => t.startsWith(currentHour))
        : -1
      const rainChance = Math.round(
        data.hourly?.precipitation_probability?.[hourIndex >= 0 ? hourIndex : 0] ?? 0,
      )

      const forecast: ForecastDay[] = (data.daily?.time ?? []).slice(0, 3).map((date: string, i: number) => ({
        date,
        high: Math.round(data.daily.temperature_2m_max[i]),
        low: Math.round(data.daily.temperature_2m_min[i]),
        rainChance: Math.round(data.daily.precipitation_probability_max[i] ?? 0),
        description: weatherCodeToDescription(data.daily.weather_code[i]),
      }))

      setWeather({
        temp,
        weatherCode: code,
        description,
        location,
        windKmh,
        rainChance,
        uv,
        feelsLike,
        forecast,
        siteAdvisory: buildSiteAdvisory(windKmh, rainChance, uv),
        loading: false,
        available: true,
        error: null,
      })
    } catch {
      setWeather(emptyWeather())
    }
  }, [])

  useEffect(() => {
    void fetchWeather()
  }, [fetchWeather])

  return { ...weather, refresh: fetchWeather }
}
