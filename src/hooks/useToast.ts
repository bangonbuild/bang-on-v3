import { useCallback, useState } from 'react'

export type ToastType = 'success' | 'error' | 'info'
export type ShowToastFn = (message: string, type?: ToastType) => void

const DEFAULT_DURATION = 2500

export function useToast() {
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState<ToastType>('info')
  const [toastVisible, setToastVisible] = useState(false)

  const showToast = useCallback<ShowToastFn>((message, type = 'info') => {
    setToastMessage(message)
    setToastType(type)
    setToastVisible(true)
    window.setTimeout(() => setToastVisible(false), DEFAULT_DURATION)
  }, [])

  return { showToast, toastMessage, toastType, toastVisible }
}
