import type { GeneratedDocument } from '../types'

export function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function saveJson<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value))
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export const STORAGE_KEYS = {
  jobs: 'bang-on-jobs',
  recentChats: 'bang-on-recent-chats',
  profile: 'bang-on-profile',
  payment: 'bang-on-payment',
  pendingChat: 'bang-on-pending-chat',
  team: 'bang-on-team',
  theme: 'bang-on-theme',
} as const

export function parseDocumentFromEntry(content: string): GeneratedDocument | null {
  try {
    const parsed = JSON.parse(content) as GeneratedDocument
    if (parsed?.lineItems && Array.isArray(parsed.lineItems)) return parsed
  } catch {
    /* not JSON */
  }
  return null
}

export function serializeDocument(doc: GeneratedDocument): string {
  return JSON.stringify(doc)
}

export const encodeImage = (file: File): Promise<{ base64: string; mimeType: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      const base64 = result.split(',')[1]
      if (!base64) {
        reject(new Error('Could not read image'))
        return
      }
      resolve({ base64, mimeType: file.type || 'image/jpeg' })
    }
    reader.onerror = () => reject(new Error('Could not read image'))
    reader.readAsDataURL(file)
  })
}

export const formatRelativeTime = (ts: number): string => {
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${Math.max(1, mins)}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export const formatDate = (ts: number = Date.now()): string => {
  return new Date(ts).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
