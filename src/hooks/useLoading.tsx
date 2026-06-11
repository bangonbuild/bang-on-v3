import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'
import { LoadingBar } from '../components/LoadingBar'

interface LoadingContextValue {
  track: <T>(promise: Promise<T>) => Promise<T>
  start: () => void
  stop: () => void
}

const LoadingContext = createContext<LoadingContextValue | null>(null)

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false)
  const countRef = useRef(0)
  const timerRef = useRef<number | undefined>(undefined)

  const start = useCallback(() => {
    countRef.current += 1
    if (countRef.current === 1) {
      timerRef.current = window.setTimeout(() => setVisible(true), 300)
    }
  }, [])

  const stop = useCallback(() => {
    countRef.current = Math.max(0, countRef.current - 1)
    if (countRef.current === 0) {
      window.clearTimeout(timerRef.current)
      setVisible(false)
    }
  }, [])

  const track = useCallback(
    async <T,>(promise: Promise<T>): Promise<T> => {
      start()
      try {
        return await promise
      } finally {
        stop()
      }
    },
    [start, stop],
  )

  return (
    <LoadingContext.Provider value={{ track, start, stop }}>
      <LoadingBar visible={visible} />
      {children}
    </LoadingContext.Provider>
  )
}

export function useLoading() {
  const ctx = useContext(LoadingContext)
  if (!ctx) {
    return {
      track: <T,>(p: Promise<T>) => p,
      start: () => {},
      stop: () => {},
    }
  }
  return ctx
}
