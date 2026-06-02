import { useCallback, useEffect, useState } from 'react'
import { STORAGE_KEYS } from '../utils/storage'

export type Theme = 'dark' | 'light'

function applyTheme(theme: Theme) {
  if (theme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light')
  } else {
    document.documentElement.removeAttribute('data-theme')
  }
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.theme)
    return stored === 'light' ? 'light' : 'dark'
  })

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.theme) ?? 'dark'
    applyTheme(stored === 'light' ? 'light' : 'dark')
  }, [])

  const setTheme = useCallback((next: Theme) => {
    localStorage.setItem(STORAGE_KEYS.theme, next)
    applyTheme(next)
    setThemeState(next)
  }, [])

  return { theme, setTheme }
}
