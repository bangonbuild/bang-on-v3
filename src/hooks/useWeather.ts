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
  error: string | null
}

const COORDS_CACHE_KEY = 'datum-weather-coords'
const COORDS_CACHE_MS = 30 * 60 * 1000

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

function readCachedCoords(): { latitude: number; longitude: number; location: string } | null {
  try {
    const raw = sessionStorage.getItem(COORDS_CACHE_KEY)
    if (!raw) return null
    const { latitude, longitude, location, at } = JSON.parse(raw) as {
      latitude: number
      longitude: number
      location: string
      at: number
    }
    if (Date.now() - at > COORDS_CACHE_MS) return null
    return { latitude, longitude, location }
  } catch {
    return null
  }
}

function writeCachedCoords(latitude: number, longitude: number, location: string) {
  try {
    sessionStorage.setItem(
      COORDS_CACHE_KEY,
      JSON.stringify({ latitude, longitude, location, at: Date.now() }),
    )
  } catch {
    /* ignore */
  }
}

function getGpsCoords(timeoutMs: number): Promise<{
  latitude: number
  longitude: number
  location: string
}> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('no geolocation'))
      return
    }
    const timer = window.setTimeout(() => reject(new Error('gps timeout')), timeoutMs)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        window.clearTimeout(timer)
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          location: '',
        })
      },
      () => {
        window.clearTimeout(timer)
        reject(new Error('gps denied'))
      },
      { timeout: timeoutMs, maximumAge: 600000, enableHighAccuracy: false },
    )
  })
}

async function getIpCoords(): Promise<{
  latitude: number
  longitude: number
  location: string
}> {
  const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(4000) })
  if (!res.ok) throw new Error('ip lookup failed')
  const data = await res.json()
  const city = data.city as string | undefined
  const region = data.region as string | undefined
  return {
    latitude: data.latitude as number,
    longitude: data.longitude as number,
    location: city && region ? `${city}, ${region}` : '',
  }
}

const SYDNEY = { latitude: -33.8688, longitude: 151.2093, location: 'Sydney, NSW' }

async function resolveCoordinatesFast(): Promise<{
  latitude: number
  longitude: number
  location: string
}> {
  const cached = readCachedCoords()
  if (cached) return cached

  const ipP = getIpCoords().catch(() => null)
  const gpsP = getGpsCoords(3500).catch(() => null)

  let coords = await Promise.race([ipP, gpsP])
  if (!coords) {
    const [gps, ip] = await Promise.all([gpsP, ipP])
    coords = gps ?? ip
  }
  if (!coords) coords = SYDNEY

  if (!coords.location) {
    const ip = await ipP
    coords = { ...coords, location: ip?.location || 'Your location' }
  }

  writeCachedCoords(coords.latitude, coords.longitude, coords.location)
  return coords
}

async function fetchForecast(latitude: number, longitude: number) {
  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,apparent_temperature,wind_speed_10m,uv_index&hourly=precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=3`,
    { signal: AbortSignal.timeout(8000) },
  )
  if (!res.ok) throw new Error('Weather unavailable')
  return res.json()
}

function parseForecast(data: Record<string, unknown>) {
  const temp = Math.round((data.current as { temperature_2m?: number })?.temperature_2m ?? 0)
  const code = (data.current as { weather_code?: number })?.weather_code ?? 0
  const description = weatherCodeToDescription(code)
  const windKmh = Math.round(((data.current as { wind_speed_10m?: number })?.wind_speed_10m ?? 0) * 3.6)
  const feelsLike = Math.round((data.current as { apparent_temperature?: number })?.apparent_temperature ?? temp)
  const uv = Math.round((data.current as { uv_index?: number })?.uv_index ?? 0)
  const hourly = data.hourly as { precipitation_probability?: number[] } | undefined
  const rainChance = Math.round(hourly?.precipitation_probability?.[0] ?? 0)
  const daily = data.daily as {
    time?: string[]
    temperature_2m_max?: number[]
    temperature_2m_min?: number[]
    precipitation_probability_max?: number[]
    weather_code?: number[]
  }

  const forecast: ForecastDay[] = (daily?.time ?? []).slice(0, 3).map((date: string, i: number) => ({
    date,
    high: Math.round(daily?.temperature_2m_max?.[i] ?? 0),
    low: Math.round(daily?.temperature_2m_min?.[i] ?? 0),
    rainChance: Math.round(daily?.precipitation_probability_max?.[i] ?? 0),
    description: weatherCodeToDescription(daily?.weather_code?.[i] ?? 0),
  }))

  return { temp, weatherCode: code, description, windKmh, feelsLike, uv, rainChance, forecast }
}

export function useWeather() {
  const [weather, setWeather] = useState<WeatherData>({
    temp: null,
    weatherCode: 0,
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
      const { latitude, longitude, location } = await resolveCoordinatesFast()
      const data = await fetchForecast(latitude, longitude)
      const parsed = parseForecast(data)

      setWeather({
        ...parsed,
        location,
        siteAdvisory: buildSiteAdvisory(parsed.windKmh, parsed.rainChance, parsed.uv),
        loading: false,
        error: null,
      })
    } catch {
      setWeather({
        temp: 22,
        weatherCode: 2,
        description: 'Partly cloudy',
        location: 'Location unavailable',
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
        error: 'Could not load weather',
      })
    }
  }, [])

  useEffect(() => {
    void fetchWeather()
  }, [fetchWeather])

  return { ...weather, refresh: fetchWeather }
}
