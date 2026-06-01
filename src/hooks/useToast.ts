import { useCallback, useState } from 'react'

const DEFAULT_DURATION = 2500

export function useToast() {
  const [toastMessage, setToastMessage] = useState('')
  const [toastVisible, setToastVisible] = useState(false)

  const showToast = useCallback((message: string) => {
    setToastMessage(message)
    setToastVisible(true)
    window.setTimeout(() => setToastVisible(false), DEFAULT_DURATION)
  }, [])

  return { showToast, toastMessage, toastVisible }
}
